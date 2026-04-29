/**
 * Payment Checkout Endpoint
 * POST /api/payment/checkout
 * Creates a Stripe checkout session or mock session for payment
 */

import { NextResponse } from 'next/server';
import { getConvertedStoryPrice, normalizeStoryPageCount } from '@/utils/pricing';
import { resolveAuthenticatedStoryUser } from '../../shared/storyProjects.js';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function normalizeBaseUrl(baseUrl = '') {
  return String(baseUrl || '').trim().replace(/\/$/, '');
}

function resolveAppBaseUrl(request) {
  const requestOrigin = normalizeBaseUrl(request.nextUrl?.origin);
  if (requestOrigin) {
    return requestOrigin;
  }

  const originHeader = normalizeBaseUrl(request.headers.get('origin'));
  if (originHeader) {
    return originHeader;
  }

  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const configuredUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);
  if (configuredUrl) {
    return configuredUrl;
  }

  const vercelUrl = normalizeBaseUrl(process.env.VERCEL_URL);
  if (vercelUrl) {
    return vercelUrl.startsWith('http') ? vercelUrl : `https://${vercelUrl}`;
  }

  return 'http://localhost:3001';
}

export async function POST(request) {
  try {
    const appBaseUrl = resolveAppBaseUrl(request);
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

    const authUser = await resolveAuthenticatedStoryUser(decoded);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      projectId,
      currency = 'USD',
      country = 'United States',
      pageCount = 10,
      buyerName = '',
      childName = '',
      theme = '',
      isGift = false,
      giftData = null,
    } = body;
    const normalizedPageCount = normalizeStoryPageCount(pageCount);

    console.log(
      '[CHECKOUT] Creating checkout session for project:',
      projectId,
      'Currency:',
      currency,
      'Country:',
      country,
      'Page count:',
      normalizedPageCount
    );

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId' },
        { status: 400 }
      );
    }

    if (isGift) {
      if (!giftData?.recipientName || !giftData?.recipientEmail) {
        return NextResponse.json(
          { error: 'Gift recipient name and email are required.' },
          { status: 400 }
        );
      }
    }

    const {
      amount: convertedPrice,
      basePriceUSD,
      currency: normalizedCurrency,
    } = getConvertedStoryPrice(normalizedPageCount, currency);
    const amount = Math.round(convertedPrice * 100);

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = stripeSecretKey && !stripeSecretKey.includes('sk_test_your');

    console.log('[CHECKOUT] Stripe configured:', isStripeConfigured);
    console.log('[CHECKOUT] Amount:', amount, normalizedCurrency);

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
          currency: normalizedCurrency,
          country,
          pageCount: normalizedPageCount,
          isGift,
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
              currency: normalizedCurrency.toLowerCase(),
              product_data: {
                name: `Kidz Story Magic - Story Book`,
                description: `${normalizedPageCount}-page personalized story book for project ${projectId}`,
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
        success_url: `${appBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}&project_id=${encodeURIComponent(projectId)}`,
        cancel_url: `${appBaseUrl}/wizard?step=6`,
        metadata: {
          projectId: projectId,
          userId: String(authUser.id),
          userEmail: authUser.email || decoded.email || '',
          buyerName: buyerName || authUser.name || authUser.email || '',
          childName: childName || '',
          theme: theme || '',
          currency: normalizedCurrency,
          country,
          pageCount: String(normalizedPageCount),
          basePriceUSD: basePriceUSD.toFixed(2),
          isGift: isGift ? 'true' : 'false',
          giftRecipientName: giftData?.recipientName || '',
          giftRecipientEmail: giftData?.recipientEmail || '',
          giftMessage: String(giftData?.giftMessage || '').slice(0, 250),
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
          amount,
          currency: normalizedCurrency,
          country,
          pageCount: normalizedPageCount,
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
          currency: normalizedCurrency,
          country,
          pageCount: normalizedPageCount,
          isGift,
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
