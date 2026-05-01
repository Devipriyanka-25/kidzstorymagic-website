/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and other Stripe events.
 */

import { NextResponse } from 'next/server';
import { supabaseClient } from '../../shared/supabaseClient.js';
import {
  buildGiftPreviewUrl,
  sendGiftStoryEmail,
} from '@/lib/giftStory';
import { buildOrderContactDetails } from '@/lib/orderData';
import {
  isSmsConfigured,
  resolveConfiguredAppBaseUrl,
  sendOrderConfirmationEmail,
  sendOrderConfirmationSms,
} from '@/lib/orderNotifications';
import { markStoryProjectPaid } from '../../shared/storyProjects.js';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

function isCompatibilityColumnError(error) {
  const code = String(error?.code || '');
  const details = `${error?.message || ''} ${error?.details || ''}`.toLowerCase();

  return (
    code === 'PGRST204' ||
    code === '42703' ||
    details.includes('schema cache') ||
    details.includes('column')
  );
}

function buildOrderMetadata(session, contact) {
  return {
    customerName: contact.customerName,
    customerEmail: contact.customerEmail,
    customerPhone: contact.customerPhone,
    billingAddress: contact.billingAddress,
    shippingAddress: contact.shippingAddress,
    childName: session.metadata?.childName || '',
    theme: session.metadata?.theme || '',
    pageCount: session.metadata?.pageCount || '',
    isGift: session.metadata?.isGift === 'true',
    giftRecipientName: session.metadata?.giftRecipientName || '',
    giftRecipientEmail: session.metadata?.giftRecipientEmail || '',
  };
}

async function insertCompletedOrderRecord({
  session,
  projectId,
  userId,
  completedAt,
  contact,
}) {
  const baseOrder = {
    project_id: projectId,
    user_id: userId,
    amount: (session.amount_total || 0) / 100,
    currency: session.currency?.toUpperCase() || 'USD',
    original_amount: Number(
      session.metadata?.basePriceUSD || (session.amount_total || 0) / 100
    ),
    original_currency: 'USD',
    status: 'completed',
    stripe_payment_intent_id: session.payment_intent || null,
    stripe_session_id: session.id,
    payment_method: session.payment_method_types?.[0] || 'card',
    completed_at: completedAt,
  };
  const metadata = buildOrderMetadata(session, contact);
  const insertVariants = [
    {
      ...baseOrder,
      customer_name: contact.customerName,
      customer_email: contact.customerEmail,
      customer_phone: contact.customerPhone,
      billing_address: contact.billingAddress,
      shipping_address: contact.shippingAddress,
      metadata,
    },
    {
      ...baseOrder,
      metadata,
    },
    baseOrder,
  ];

  let lastError = null;

  for (let index = 0; index < insertVariants.length; index += 1) {
    const candidate = insertVariants[index];
    const { data, error } = await supabaseClient
      .from('orders')
      .insert([candidate])
      .select()
      .single();

    if (!error) {
      return data;
    }

    lastError = error;
    if (!isCompatibilityColumnError(error) || index === insertVariants.length - 1) {
      throw error;
    }

    console.warn(
      '[WEBHOOK] Retrying order insert with a reduced column set:',
      error.message
    );
  }

  throw lastError || new Error('Failed to insert completed order.');
}

async function upsertCompletedOrder(session) {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }

  const projectId = Number(session.metadata?.projectId || session.metadata?.storyId);
  const userId = Number(session.metadata?.userId);
  const completedAt = new Date().toISOString();
  const contact = buildOrderContactDetails(session);

  if (!Number.isFinite(projectId) || !Number.isFinite(userId)) {
    throw new Error('Missing projectId or userId in session metadata.');
  }

  const { data: existingOrder, error: existingOrderError } = await supabaseClient
    .from('orders')
    .select('*')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (existingOrderError) {
    console.warn(
      '[WEBHOOK] Could not check for an existing order:',
      existingOrderError
    );
  }

  let savedOrder = existingOrder || null;

  if (!existingOrder) {
    console.log('[WEBHOOK] Creating order for session:', session.id);
    savedOrder = await insertCompletedOrderRecord({
      session,
      projectId,
      userId,
      completedAt,
      contact,
    });
    console.log('[WEBHOOK] Order created successfully:', savedOrder?.id || savedOrder);
  }

  try {
    const updatedStory = await markStoryProjectPaid(userId, projectId, {
      completedAt,
    });

    if (!updatedStory) {
      throw new Error('Story project not found for payment fulfillment.');
    }

    console.log('[WEBHOOK] Story project marked as paid and published');
  } catch (updateError) {
    console.warn(
      '[WEBHOOK] Warning: Could not update story project status:',
      updateError
    );
  }

  return {
    projectId,
    order: savedOrder,
    wasCreated: !existingOrder,
  };
}

async function maybeSendGiftEmail(session, projectId) {
  if (session.metadata?.isGift !== 'true') {
    return;
  }

  const recipientEmail = session.metadata?.giftRecipientEmail;
  const previewUrl = buildGiftPreviewUrl({
    projectId,
    recipientEmail,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  });

  await sendGiftStoryEmail({
    recipientName: session.metadata?.giftRecipientName,
    recipientEmail,
    senderName:
      session.metadata?.buyerName ||
      session.customer_details?.name ||
      'Someone special',
    senderEmail:
      session.metadata?.userEmail ||
      session.customer_details?.email ||
      '',
    childName: session.metadata?.childName,
    giftMessage: session.metadata?.giftMessage,
    previewUrl,
  });

  console.log('[WEBHOOK] Gift story email sent');
}

async function maybeSendOrderNotifications(session, { projectId, order, wasCreated }) {
  const appBaseUrl = resolveConfiguredAppBaseUrl();
  const orderId = order?.id || session.id;

  try {
    await sendOrderConfirmationEmail({
      session,
      orderId,
      projectId,
      appBaseUrl,
    });
    console.log('[WEBHOOK] Order confirmation email sent');
  } catch (emailError) {
    console.error('[WEBHOOK] Order confirmation email failed:', emailError);
  }

  if (!wasCreated) {
    return;
  }

  if (!isSmsConfigured()) {
    console.log('[WEBHOOK] Order confirmation SMS skipped: Twilio is not configured');
    return;
  }

  try {
    await sendOrderConfirmationSms({
      session,
      orderId,
      projectId,
      appBaseUrl,
    });
    console.log('[WEBHOOK] Order confirmation SMS sent');
  } catch (smsError) {
    console.error('[WEBHOOK] Order confirmation SMS failed:', smsError);
  }
}

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!WEBHOOK_SECRET) {
      console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } catch (err) {
      console.error('[WEBHOOK] Signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('[WEBHOOK] Received Stripe event:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      console.log('[WEBHOOK] Processing checkout completion:', {
        sessionId: session.id,
        customerId: session.customer,
        metadata: session.metadata,
      });

      try {
        const fulfillment = await upsertCompletedOrder(session);

        await maybeSendOrderNotifications(session, fulfillment);

        try {
          await maybeSendGiftEmail(session, fulfillment.projectId);
        } catch (giftError) {
          console.error('[WEBHOOK] Gift email failed:', giftError);
        }
      } catch (err) {
        console.error('[WEBHOOK] Error processing payment:', err.message);
        return NextResponse.json(
          {
            received: true,
            warning: 'Error processing payment but webhook acknowledged',
          },
          { status: 200 }
        );
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;

      console.log('[WEBHOOK] Payment failed:', {
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      });
    }

    console.log('[WEBHOOK] Event processed successfully');
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('[WEBHOOK] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
