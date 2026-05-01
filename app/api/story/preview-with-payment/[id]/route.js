/**
 * Story Preview API
 * GET /api/story/preview-with-payment/[id]
 * Returns either a protected 3-page preview or the full unlocked story.
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import {
  mapStoryContentRecord,
  mapStoryProjectRecord,
  resolveAuthenticatedStoryUser,
} from '../../../shared/storyProjects.js';
import { verifyGiftPreviewToken } from '@/lib/giftStory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FREE_PREVIEW_PAGE_LIMIT = 3;

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

async function resolveOptionalUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const decoded = jwt.verify(authHeader.substring(7), getJwtSecret());
    return resolveAuthenticatedStoryUser(decoded);
  } catch (error) {
    console.log('[PREVIEW] Token verification failed, continuing as public preview');
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    if (!supabaseClient) {
      return NextResponse.json(
        { error: 'Story storage is not configured.' },
        { status: 500 }
      );
    }

    const projectId = Number(params?.id);
    if (!Number.isFinite(projectId)) {
      return NextResponse.json({ error: 'Invalid story ID.' }, { status: 400 });
    }

    const giftToken = request.nextUrl.searchParams.get('gift_token');
    const giftAccess = verifyGiftPreviewToken(giftToken, projectId);
    const authUser = await resolveOptionalUser(request);

    const { data: storyRecord, error: storyError } = await supabaseClient
      .from('story_projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (storyError) {
      throw storyError;
    }

    if (!storyRecord) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const story = mapStoryProjectRecord(storyRecord);

    const { data: pageRecords, error: pagesError } = await supabaseClient
      .from('story_content')
      .select('*')
      .eq('project_id', projectId)
      .order('page_number', { ascending: true });

    if (pagesError) {
      throw pagesError;
    }

    const totalPages = pageRecords?.length || 0;
    const pages = (pageRecords || []).map((page) =>
      mapStoryContentRecord(page, totalPages)
    );

    let isUnlocked = Boolean(giftAccess);

    if (authUser?.id && Number(story.user_id) === Number(authUser.id)) {
      if (story.status === 'published' || story.isPaid || story.is_paid) {
        isUnlocked = true;
      } else {
        const { data: paidOrder } = await supabaseClient
          .from('orders')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', Number(authUser.id))
          .eq('status', 'completed')
          .limit(1)
          .maybeSingle();

        isUnlocked = Boolean(paidOrder);
      }
    }

    const previewPages = isUnlocked ? pages : pages.slice(0, FREE_PREVIEW_PAGE_LIMIT);

    return NextResponse.json(
      {
        success: true,
        story: {
          id: story.id,
          title: story.title,
          childName: story.child_name || story.childName,
          theme: story.theme,
          totalPages,
          lockedPageCount: Math.max(totalPages - previewPages.length, 0),
          pages: previewPages,
          paymentStatus: isUnlocked ? 'paid' : 'unpaid',
          isUnlocked,
          canDownload: isUnlocked,
          watermarkRequired: !isUnlocked,
          blurRequired: !isUnlocked,
          previewMessage: isUnlocked
            ? 'Full story unlocked.'
            : 'Preview mode: the first 3 pages are open to read.',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[PREVIEW_WITH_PAYMENT] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to get story preview',
      },
      { status: 500 }
    );
  }
}
