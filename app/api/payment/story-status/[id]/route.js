/**
 * Payment Status API
 * GET /api/payment/story-status/[id]
 */

import { NextResponse } from 'next/server';
import { resolveRequestUser } from '../../../shared/requestAuth.js';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import {
  getStoryProjectById,
} from '../../../shared/storyProjects.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const projectId = params?.id;
    const story = await getStoryProjectById(authUser.id, projectId);

    let isPaid = Boolean(
      story?.status === 'published' || story?.isPaid || story?.is_paid
    );

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
