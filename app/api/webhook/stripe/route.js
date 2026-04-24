/**
 * Stripe Webhook Handler
 * Handles checkout.session.completed and other Stripe events
 * Updates payment status in database
 */

import { NextResponse } from 'next/server';
import { supabaseClient } from '../../shared/supabaseClient.js';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('[WEBHOOK] Processing checkout completion:', {
        sessionId: session.id,
        customerId: session.customer,
        metadata: session.metadata,
      });

      try {
        // Extract metadata
        const storyId = session.metadata?.storyId;
        const userId = session.metadata?.userId;
        const amount = session.amount_total;
        const currency = session.currency?.toUpperCase();

        if (!storyId || !userId) {
          console.warn('[WEBHOOK] Missing storyId or userId in metadata');
          return NextResponse.json(
            { received: true },
            { status: 200 }
          );
        }

        // Create order record in database
        const order = {
          story_id: storyId,
          user_id: userId,
          session_id: session.id,
          amount: amount / 100, // Convert cents to dollars
          currency: currency || 'USD',
          payment_status: 'completed',
          payment_method: session.payment_method_types?.[0] || 'card',
          transaction_id: session.payment_intent,
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        };

        console.log('[WEBHOOK] Creating order:', order);

        if (!supabaseClient) {
          throw new Error('Supabase client not configured');
        }

        // Insert order using supabaseClient
        const { data, error } = await supabaseClient
          .from('orders')
          .insert([order])
          .select();

        if (error) {
          console.error('[WEBHOOK] Failed to create order:', error);
          throw error;
        }

        console.log('[WEBHOOK] ✓ Order created successfully:', data);

        // Update story status to paid
        const { error: updateError } = await supabaseClient
          .from('stories')
          .update({ payment_status: 'completed', paid_at: new Date().toISOString() })
          .eq('id', storyId);

        if (updateError) {
          console.warn('[WEBHOOK] Warning: Could not update story status:', updateError);
          // Don't fail the webhook for this
        } else {
          console.log('[WEBHOOK] ✓ Story status updated to paid');
        }

      } catch (err) {
        console.error('[WEBHOOK] Error processing payment:', err.message);
        // Still return 200 to acknowledge receipt
        return NextResponse.json(
          { received: true, warning: 'Error processing payment but webhook acknowledged' },
          { status: 200 }
        );
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Handle payment_intent.payment_failed
    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      
      console.log('[WEBHOOK] Payment failed:', {
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error?.message,
      });

      // Store failed payment for debugging
      // Could optionally store in database or send notification email
    }

    // Handle other events if needed
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
