/**
 * Payment Checkout Endpoint
 * POST /api/payment/checkout
 * Creates a Stripe checkout session or mock session for payment
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('[CHECKOUT] Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[CHECKOUT] Missing or invalid auth header format');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('[CHECKOUT] Token verified for user:', decoded.id || decoded.email);
    } catch (err) {
      console.log('[CHECKOUT] Token verification failed:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, currency = 'USD' } = body;

    console.log('[CHECKOUT] Creating checkout session for project:', projectId, 'Currency:', currency);

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId' },
        { status: 400 }
      );
    }

    // Base prices in USD
    const basePrice = 14.99; // Default price

    // Currency exchange rates (fallback if API unavailable)
    const exchangeRates = {
      USD: 1,
      CAD: 1.35,
      GBP: 0.79,
      EUR: 0.92,
      AUD: 1.52,
      INR: 83.12,
    };

    const exchangeRate = exchangeRates[currency] || 1;
    const amount = Math.round(basePrice * exchangeRate * 100); // Convert to cents

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes('sk_test_your');

    console.log('[CHECKOUT] Stripe configured:', isStripeConfigured);
    console.log('[CHECKOUT] Amount:', amount, currency);

    // If Stripe is not configured, create a mock session
    if (!isStripeConfigured) {
      console.log('[CHECKOUT] ⚠️ Stripe not configured, creating mock session');
      
      const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return NextResponse.json(
        {
          success: true,
          message: 'Mock checkout session created (Stripe not configured)',
          sessionId: mockSessionId,
          projectId: projectId,
          amount: amount,
          currency: currency,
          isTestMode: true,
        },
        { status: 200 }
      );
    }

    // Use real Stripe
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-04-10',
      });

      console.log('[CHECKOUT] Creating Stripe checkout session...');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: `Kidz Story Magic - Story Book`,
                description: `Personalized story book for project ${projectId}`,
                images: [
                  'https://www.kidzstorymagic.org/logo.png'
                ],
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/wizard?step=6`,
        metadata: {
          projectId: projectId,
          userId: decoded.id || decoded.email,
          currency: currency,
        },
      });

      console.log('[CHECKOUT] ✅ Stripe session created:', session.id);

      return NextResponse.json(
        {
          success: true,
          message: 'Checkout session created successfully',
          sessionId: session.id,
          checkoutUrl: session.url,
          projectId: projectId,
        },
        { status: 200 }
      );
    } catch (stripeError) {
      console.error('[CHECKOUT] Stripe error:', stripeError.message);
      
      // Fallback to mock session if Stripe fails
      const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      return NextResponse.json(
        {
          success: true,
          message: 'Mock checkout session created (Stripe unavailable)',
          sessionId: mockSessionId,
          projectId: projectId,
          amount: amount,
          currency: currency,
          isTestMode: true,
          warning: 'Stripe is configured but unavailable, using test mode',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[CHECKOUT] Fatal error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
