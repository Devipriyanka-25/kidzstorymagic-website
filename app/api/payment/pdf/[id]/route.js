/**
 * Protected PDF Download Route
 * GET /api/payment/pdf/[id]
 * Allows the purchaser or a valid gift recipient to download the story PDF.
 */

import { NextResponse } from 'next/server';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import { resolveOptionalRequestUser } from '../../../shared/requestAuth.js';
import { verifyGiftPreviewToken } from '@/lib/giftStory';
import {
  listStoryProjectPages,
  mapStoryProjectRecord,
} from '../../../shared/storyProjects.js';
import {
  buildStoryPdfBufferWithImages,
  sanitizePdfFilename,
} from '@/lib/pdf/simpleStoryPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      return NextResponse.json({ error: 'Story not found.' }, { status: 404 });
    }

    const story = mapStoryProjectRecord(storyRecord);
    let hasAccess = Boolean(giftAccess);

    if (authUser?.id && Number(storyRecord.user_id) === Number(authUser.id)) {
      if (story.status === 'published' || story.isPaid || story.is_paid) {
        hasAccess = true;
      } else {
        const { data: paidOrder } = await supabaseClient
          .from('orders')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', Number(authUser.id))
          .eq('status', 'completed')
          .limit(1)
          .maybeSingle();

        hasAccess = Boolean(paidOrder);
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Payment not verified - Please complete checkout first.' },
        { status: 403 }
      );
    }

    const pages = await listStoryProjectPages(projectId);
    const pdfBuffer = await buildStoryPdfBufferWithImages({ story, pages });
    const filename = `${sanitizePdfFilename(story.title || story.child_name)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[PDF_DOWNLOAD] Error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to download PDF.',
      },
      { status: 500 }
    );
  }
}
