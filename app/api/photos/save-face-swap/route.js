/**
 * Save Face Swap Result to Database
 * POST /api/photos/save-face-swap
 * Stores the face swap result in Supabase
 */

import { NextResponse } from 'next/server';

import { resolveRequestUser } from '../../shared/requestAuth.js';
import { getStoryProjectById } from '../../shared/storyProjects.js';
import { supabaseClient } from '../../shared/supabaseClient.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ALLOW_DEMO_FACE_SWAP_SAVE =
  process.env.NODE_ENV !== 'production' &&
  String(process.env.ALLOW_DEMO_FACE_SWAP_SAVE || '').toLowerCase() === 'true';

function buildDemoSaveResult({
  storyId,
  photoId,
  pageNumber,
  swappedIllustrationUrl,
}) {
  return NextResponse.json(
    {
      success: true,
      message: 'Face swap result saved (demo mode)',
      result: {
        id: Math.random().toString(36).slice(2, 11),
        storyId,
        photoId,
        pageNumber,
        swappedIllustrationUrl,
        createdAt: new Date().toISOString(),
      },
      source: 'demo',
    },
    { status: 201 }
  );
}

export async function POST(request) {
  try {
    console.log('[SAVE_FACE_SWAP] Saving face swap result...');

    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const {
      storyId,
      photoId,
      pageNumber,
      originalIllustrationUrl,
      swappedIllustrationUrl,
      faceSwapData,
    } = body || {};

    const normalizedStoryId = Number(storyId);
    const normalizedPageNumber = Number(pageNumber);
    const normalizedSwappedIllustrationUrl = String(swappedIllustrationUrl || '').trim();

    if (
      !Number.isInteger(normalizedStoryId) ||
      normalizedStoryId <= 0 ||
      !Number.isInteger(normalizedPageNumber) ||
      normalizedPageNumber <= 0 ||
      !normalizedSwappedIllustrationUrl
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const storyProject = await getStoryProjectById(authUser.id, normalizedStoryId);
    if (!storyProject) {
      return NextResponse.json(
        { error: 'Story project not found' },
        { status: 404 }
      );
    }

    console.log(
      `[SAVE_FACE_SWAP] Saving result for story ${normalizedStoryId}, page ${normalizedPageNumber}`
    );

    if (!supabaseClient) {
      if (ALLOW_DEMO_FACE_SWAP_SAVE) {
        return buildDemoSaveResult({
          storyId: normalizedStoryId,
          photoId: photoId || null,
          pageNumber: normalizedPageNumber,
          swappedIllustrationUrl: normalizedSwappedIllustrationUrl,
        });
      }

      return NextResponse.json(
        { error: 'Face swap storage is not configured.' },
        { status: 503 }
      );
    }

    const { data, error: insertError } = await supabaseClient
      .from('face_swapped_illustrations')
      .insert({
        story_id: normalizedStoryId,
        photo_id: photoId || null,
        page_number: normalizedPageNumber,
        original_illustration_url: originalIllustrationUrl || null,
        swapped_illustration_url: normalizedSwappedIllustrationUrl,
        face_swap_data: faceSwapData || null,
      })
      .select('*')
      .maybeSingle();

    if (insertError) {
      console.log('[SAVE_FACE_SWAP] Supabase failed:', insertError.message);

      if (ALLOW_DEMO_FACE_SWAP_SAVE) {
        return buildDemoSaveResult({
          storyId: normalizedStoryId,
          photoId: photoId || null,
          pageNumber: normalizedPageNumber,
          swappedIllustrationUrl: normalizedSwappedIllustrationUrl,
        });
      }

      return NextResponse.json(
        {
          error: 'Failed to save face swap result',
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    console.log('[SAVE_FACE_SWAP] Saved to Supabase');

    return NextResponse.json(
      {
        success: true,
        message: 'Face swap result saved',
        result: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SAVE_FACE_SWAP] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to save face swap result',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
