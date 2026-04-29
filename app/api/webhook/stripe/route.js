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

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function upsertCompletedOrder(session) {
  if (!supabaseClient) {
    throw new Error('Supabase client not configured');
  }

  const projectId = Number(session.metadata?.projectId || session.metadata?.storyId);
  const userId = Number(session.metadata?.userId);
  const completedAt = new Date().toISOString();

  if (!Number.isFinite(projectId) || !Number.isFinite(userId)) {
    throw new Error('Missing projectId or userId in session metadata.');
  }

  const { data: existingOrder, error: existingOrderError } = await supabaseClient
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle();

  if (existingOrderError) {
    console.warn(
      '[WEBHOOK] Could not check for an existing order:',
      existingOrderError
    );
  }

  if (!existingOrder) {
    const order = {
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

    console.log('[WEBHOOK] Creating order:', order);

    const { data, error } = await supabaseClient
      .from('orders')
      .insert([order])
      .select();

    if (error) {
      throw error;
    }

    console.log('[WEBHOOK] ✓ Order created successfully:', data);
  }

  const { error: updateError } = await supabaseClient
    .from('story_projects')
    .update({
      status: 'published',
      completed_at: completedAt,
    })
    .eq('id', projectId);

  if (updateError) {
    console.warn(
      '[WEBHOOK] Warning: Could not update story project status:',
      updateError
    );
  } else {
    console.log('[WEBHOOK] ✓ Story project updated to published');
  }

  return { projectId };
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

  console.log('[WEBHOOK] ✓ Gift story email sent');
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
        const { projectId } = await upsertCompletedOrder(session);

        try {
          await maybeSendGiftEmail(session, projectId);
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
