/**
 * Protected PDF Download Route
 * GET /api/payment/pdf/[id]
 * Allows the purchaser or a valid gift recipient to download the story PDF.
 */

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseClient } from '../../../shared/supabaseClient.js';
import { verifyGiftPreviewToken } from '@/lib/giftStory';
import { resolveAuthenticatedStoryUser } from '../../../shared/storyProjects.js';

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

    let hasAccess = Boolean(giftAccess);

    if (authUser?.id && Number(storyRecord.user_id) === Number(authUser.id)) {
      if (storyRecord.status === 'published') {
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

    const mockPDF = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n trailer<</Size 4/Root 1 0 R>>startxref 190 %%EOF'
    );

    return new NextResponse(mockPDF, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${projectId}.pdf"`,
        'Content-Length': mockPDF.length,
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
