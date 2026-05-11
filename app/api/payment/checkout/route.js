/**
 * Payment Checkout Endpoint
 * POST /api/payment/checkout
 * Creates a Stripe checkout session for payment
 */

import { NextResponse } from 'next/server';
import {
  getConvertedStoryPrice,
  normalizeStoryPageCount,
} from '@/utils/pricing';
import { resolveRequestUser } from '../../shared/requestAuth.js';
import {
  getStoryProjectById,
  updateStoryProjectRecord,
} from '../../shared/storyProjects.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTIVE_CHECKOUT_WINDOW_MS = 30 * 60 * 1000;
const ALLOW_MOCK_CHECKOUT =
  process.env.NODE_ENV !== 'production' &&
  process.env.ALLOW_MOCK_STRIPE_CHECKOUT === 'true';

const STRIPE_ALLOWED_SHIPPING_COUNTRIES = [
  'US',
  'CA',
  'GB',
  'AU',
  'IN',
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
];

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

function isIndiaCheckout(country, currency) {
  return (
    String(country || '').trim().toLowerCase() === 'india' ||
    String(currency || '').trim().toUpperCase() === 'INR'
  );
}

function readCheckoutSessionState(project) {
  const checkoutSession = project?.photo_metadata?.checkoutSession;
  return checkoutSession && typeof checkoutSession === 'object'
    ? checkoutSession
    : null;
}

function buildCheckoutSessionMetadata(project, checkoutSession) {
  return {
    ...(project?.photo_metadata || {}),
    checkoutSession,
  };
}

function isReusableCheckoutSession(checkoutSession, { currency, country, pageCount }) {
  if (!checkoutSession?.sessionId) {
    return false;
  }

  const expiresAtMs = new Date(checkoutSession.expiresAt || 0).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
    return false;
  }

  return (
    String(checkoutSession.currency || '').toUpperCase() ===
      String(currency || '').toUpperCase() &&
    String(checkoutSession.country || '') === String(country || '') &&
    Number(checkoutSession.pageCount || 0) === Number(pageCount || 0) &&
    checkoutSession.status !== 'completed'
  );
}

function buildCheckoutResponse(
  sessionState,
  amount,
  currency,
  country,
  pageCount,
  { reused = false, isTestMode = false } = {}
) {
  return NextResponse.json(
    {
      success: true,
      message: reused
        ? 'Reusing existing checkout session.'
        : isTestMode
          ? 'Mock checkout session created for development.'
          : 'Checkout session created successfully',
      sessionId: sessionState.sessionId,
      checkoutUrl: sessionState.checkoutUrl,
      projectId: sessionState.projectId,
      amount,
      currency,
      country,
      pageCount,
      isTestMode,
      reused,
    },
    { status: 200 }
  );
}

function buildMockCheckoutState({
  amount,
  appBaseUrl,
  country,
  currency,
  pageCount,
  projectId,
}) {
  const sessionId = `mock_session_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;

  return {
    sessionId,
    checkoutUrl: `${appBaseUrl}/success?session_id=${encodeURIComponent(
      sessionId
    )}&project_id=${encodeURIComponent(projectId)}`,
    projectId,
    currency,
    country,
    pageCount,
    amount,
    mode: 'mock',
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ACTIVE_CHECKOUT_WINDOW_MS).toISOString(),
  };
}

export async function POST(request) {
  try {
    const appBaseUrl = resolveAppBaseUrl(request);
    const authHeader = request.headers.get('authorization');
    console.log('[CHECKOUT] Auth header:', authHeader ? 'Present' : 'Missing');

    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
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

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required field: projectId' },
        { status: 400 }
      );
    }

    if (isGift && (!giftData?.recipientName || !giftData?.recipientEmail)) {
      return NextResponse.json(
        { error: 'Gift recipient name and email are required.' },
        { status: 400 }
      );
    }

    const {
      amount: convertedPrice,
      basePriceUSD,
      currency: normalizedCurrency,
    } = getConvertedStoryPrice(normalizedPageCount, currency);
    const amount = Math.round(convertedPrice * 100);

    const project = await getStoryProjectById(authUser.id, projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Story project not found' },
        { status: 404 }
      );
    }

    if (project.status === 'published' || project.isPaid || project.is_paid) {
      return NextResponse.json(
        { error: 'This story is already unlocked.' },
        { status: 409 }
      );
    }

    const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
    const isStripeConfigured =
      Boolean(stripeSecretKey) && !stripeSecretKey.includes('sk_test_your');

    console.log('[CHECKOUT] Stripe configured:', isStripeConfigured);
    console.log('[CHECKOUT] Amount:', amount, normalizedCurrency);

    const existingCheckoutSession = readCheckoutSessionState(project);
    if (
      isReusableCheckoutSession(existingCheckoutSession, {
        currency: normalizedCurrency,
        country,
        pageCount: normalizedPageCount,
      })
    ) {
      if (existingCheckoutSession.mode === 'mock' && ALLOW_MOCK_CHECKOUT) {
        return buildCheckoutResponse(
          existingCheckoutSession,
          amount,
          normalizedCurrency,
          country,
          normalizedPageCount,
          { reused: true, isTestMode: true }
        );
      }

      if (existingCheckoutSession.mode === 'stripe' && isStripeConfigured) {
        try {
          const Stripe = require('stripe');
          const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2024-04-10',
          });
          const existingSession = await stripe.checkout.sessions.retrieve(
            existingCheckoutSession.sessionId
          );

          if (
            existingSession.payment_status === 'paid' ||
            existingSession.status === 'complete'
          ) {
            return NextResponse.json(
              { error: 'This story is already unlocked.' },
              { status: 409 }
            );
          }

          if (existingSession.status === 'open') {
            const refreshedCheckoutSession = {
              ...existingCheckoutSession,
              checkoutUrl:
                existingSession.url || existingCheckoutSession.checkoutUrl || null,
            };

            await updateStoryProjectRecord(authUser.id, projectId, {
              photo_metadata: buildCheckoutSessionMetadata(
                project,
                refreshedCheckoutSession
              ),
            });

            return buildCheckoutResponse(
              refreshedCheckoutSession,
              amount,
              normalizedCurrency,
              country,
              normalizedPageCount,
              { reused: true }
            );
          }
        } catch (existingSessionError) {
          console.warn(
            '[CHECKOUT] Existing Stripe session could not be reused:',
            existingSessionError.message
          );
        }
      }
    }

    if (!isStripeConfigured) {
      if (!ALLOW_MOCK_CHECKOUT) {
        return NextResponse.json(
          {
            error: 'Stripe checkout is unavailable.',
            details: 'STRIPE_SECRET_KEY is not configured for this environment.',
          },
          { status: 503 }
        );
      }

      const mockCheckoutSession = buildMockCheckoutState({
        amount,
        appBaseUrl,
        country,
        currency: normalizedCurrency,
        pageCount: normalizedPageCount,
        projectId,
      });

      await updateStoryProjectRecord(authUser.id, projectId, {
        photo_metadata: buildCheckoutSessionMetadata(project, mockCheckoutSession),
      });

      return buildCheckoutResponse(
        mockCheckoutSession,
        amount,
        normalizedCurrency,
        country,
        normalizedPageCount,
        { isTestMode: true }
      );
    }

    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-04-10',
      });

      console.log('[CHECKOUT] Creating Stripe checkout session...');

      const baseSessionConfig = {
        line_items: [
          {
            price_data: {
              currency: normalizedCurrency.toLowerCase(),
              product_data: {
                name: 'Kidz Story Magic - Story Book',
                description: `${normalizedPageCount}-page personalized story book for project ${projectId}`,
                images: ['https://www.kidzstorymagic.org/logo.png'],
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: STRIPE_ALLOWED_SHIPPING_COUNTRIES,
        },
        phone_number_collection: {
          enabled: true,
        },
        customer_email: authUser.email || undefined,
        success_url: `${appBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}&project_id=${encodeURIComponent(projectId)}`,
        cancel_url: `${appBaseUrl}/wizard?step=6&resume=checkout&projectId=${encodeURIComponent(projectId)}`,
        metadata: {
          projectId,
          userId: String(authUser.id),
          userEmail: authUser.email || '',
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
      };
      const indiaCheckout = isIndiaCheckout(country, normalizedCurrency);
      let session;

      try {
        session = await stripe.checkout.sessions.create({
          ...baseSessionConfig,
          payment_method_types: indiaCheckout ? ['card', 'upi'] : ['card'],
        });
      } catch (sessionCreationError) {
        if (!indiaCheckout) {
          throw sessionCreationError;
        }

        console.warn(
          '[CHECKOUT] Explicit UPI session failed, retrying with Stripe dynamic payment methods:',
          sessionCreationError.message
        );
        session = await stripe.checkout.sessions.create(baseSessionConfig);
      }

      console.log('[CHECKOUT] Stripe session created:', session.id);

      const checkoutSessionState = {
        sessionId: session.id,
        checkoutUrl: session.url || null,
        projectId,
        currency: normalizedCurrency,
        country,
        pageCount: normalizedPageCount,
        amount,
        mode: 'stripe',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: session.expires_at
          ? new Date(Number(session.expires_at) * 1000).toISOString()
          : new Date(Date.now() + ACTIVE_CHECKOUT_WINDOW_MS).toISOString(),
      };

      await updateStoryProjectRecord(authUser.id, projectId, {
        photo_metadata: buildCheckoutSessionMetadata(project, checkoutSessionState),
      });

      return buildCheckoutResponse(
        checkoutSessionState,
        amount,
        normalizedCurrency,
        country,
        normalizedPageCount
      );
    } catch (stripeError) {
      console.error('[CHECKOUT] Stripe error:', stripeError.message);
      return NextResponse.json(
        {
          error: 'Failed to create checkout session',
          details:
            'Stripe checkout is unavailable right now. Please try again once Stripe credentials are working.',
        },
        { status: 502 }
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
