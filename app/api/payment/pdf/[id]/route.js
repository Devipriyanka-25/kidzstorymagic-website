/**
 * Protected PDF Download Route
 * GET /api/payment/pdf/[id]
 * Allows the purchaser or a valid gift recipient to download the story PDF.
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import { verifyGiftPreviewToken } from '@/lib/giftStory';
import {
  listStoryProjectPages,
  mapStoryProjectRecord,
  resolveAuthenticatedStoryUser,
} from '../../../shared/storyProjects.js';
import {
  buildStoryPdfBufferWithImages,
  sanitizePdfFilename,
} from '@/lib/pdf/simpleStoryPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
