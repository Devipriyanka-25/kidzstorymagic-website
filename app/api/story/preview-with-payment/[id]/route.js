/**
 * Story Preview API
 * GET /api/story/preview-with-payment/[id]
 * Returns either a protected 3-page preview or the full unlocked story.
 */

import { NextResponse } from 'next/server';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import { resolveOptionalRequestUser } from '../../../shared/requestAuth.js';
import {
  mapStoryContentRecord,
  mapStoryProjectRecord,
} from '../../../shared/storyProjects.js';
import { verifyGiftPreviewToken } from '@/lib/giftStory';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FREE_PREVIEW_PAGE_LIMIT = 3;

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
    const authUser = await resolveOptionalRequestUser(request);

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
