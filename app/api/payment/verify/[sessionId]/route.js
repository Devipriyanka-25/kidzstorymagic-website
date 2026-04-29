import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import {
  getStoryProjectById,
  resolveAuthenticatedStoryUser,
  updateStoryProjectRecord,
} from '../../../shared/storyProjects.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

async function resolveRequestUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const token = authHeader.substring(7);

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const authUser = await resolveAuthenticatedStoryUser(decoded);
  if (!authUser?.id) {
    return {
      error: NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      ),
    };
  }

  return { authUser, decoded };
}

async function getChildStoryCount(userId, childName) {
  if (!supabaseClient || !childName) {
    return 1;
  }

  const { count } = await supabaseClient
    .from('story_projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', Number(userId))
    .eq('child_name', childName);

  return Math.max(Number(count) || 1, 1);
}

export async function GET(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const sessionId = params.sessionId;
    const projectIdFromQuery = request.nextUrl.searchParams.get('projectId');
    const isMockSession = String(sessionId || '').startsWith('mock_session_');
    let resolvedProjectId = projectIdFromQuery;
    let sessionMetadata = null;
    let sessionAmount = null;
    let sessionCurrency = null;

    if (!isMockSession && stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      sessionMetadata = session.metadata || null;
      sessionAmount = session.amount_total
        ? Number(session.amount_total) / 100
        : null;
      sessionCurrency = session.currency?.toUpperCase() || null;
      resolvedProjectId =
        resolvedProjectId ||
        session.metadata?.projectId ||
        session.metadata?.storyId ||
        null;

      if (
        session.metadata?.userId &&
        Number(session.metadata.userId) !== Number(authUser.id)
      ) {
        return NextResponse.json(
          { error: 'This checkout session does not belong to the current user.' },
          { status: 403 }
        );
      }
    }

    if (!resolvedProjectId) {
      return NextResponse.json(
        { error: 'Project ID could not be resolved for this payment.' },
        { status: 400 }
      );
    }

    if (isMockSession) {
      await updateStoryProjectRecord(authUser.id, resolvedProjectId, {
        status: 'published',
        completed_at: new Date().toISOString(),
      });
    }

    const story = await getStoryProjectById(authUser.id, resolvedProjectId);
    if (!story) {
      return NextResponse.json({ error: 'Story project not found' }, { status: 404 });
    }

    let storedOrder = null;
    if (supabaseClient) {
      const { data } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('project_id', Number(resolvedProjectId))
        .eq('user_id', Number(authUser.id))
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      storedOrder = data || null;
    }

    const storyNumber = await getChildStoryCount(authUser.id, story.child_name);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: storedOrder?.id || sessionId,
          session_id: sessionId,
          project_id: resolvedProjectId,
          child_name:
            story.child_name || sessionMetadata?.childName || story.childName,
          child_age: story.age_group || '',
          age_group: story.age_group || story.ageGroup || '',
          theme: story.theme || sessionMetadata?.theme || '',
          amount:
            storedOrder?.amount ??
            sessionAmount ??
            Number(sessionMetadata?.basePriceUSD || 0),
          currency:
            storedOrder?.currency ||
            sessionCurrency ||
            sessionMetadata?.currency ||
            'USD',
          payment_status: 'completed',
          status: story.status || 'published',
          storyNumber,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PAYMENT_VERIFY] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify payment.',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
