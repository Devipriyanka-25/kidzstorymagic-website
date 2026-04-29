/**
 * Payment Status API
 * GET /api/payment/story-status/[id]
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import {
  getStoryProjectById,
  resolveAuthenticatedStoryUser,
} from '../../../shared/storyProjects.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const authUser = await resolveAuthenticatedStoryUser(decoded);
    if (!authUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params?.id;
    const story = await getStoryProjectById(authUser.id, projectId);

    let isPaid = story?.status === 'published';

    if (!isPaid && supabaseClient) {
      const { data: paidOrder } = await supabaseClient
        .from('orders')
        .select('id')
        .eq('project_id', Number(projectId))
        .eq('user_id', Number(authUser.id))
        .eq('status', 'completed')
        .limit(1)
        .maybeSingle();

      isPaid = Boolean(paidOrder);
    }

    return NextResponse.json(
      {
        success: true,
        storyId: projectId,
        userId: authUser.id,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        isUnlocked: isPaid,
        canDownload: isPaid,
        message: isPaid
          ? 'Story is unlocked and ready for download.'
          : 'Story preview protected - payment required for full access.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PAYMENT_STATUS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to check payment status.',
        paymentStatus: 'unknown',
        isUnlocked: false,
        canDownload: false,
      },
      { status: 500 }
    );
  }
}
