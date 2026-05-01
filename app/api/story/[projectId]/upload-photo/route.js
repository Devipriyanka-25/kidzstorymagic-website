/**
 * Photo Upload Endpoint
 * Next.js API route: POST /api/story/[projectId]/upload-photo
 * Handles photo uploads directly with Supabase storage
 */

import { NextResponse } from 'next/server';
import supabaseClient from '@/app/api/shared/supabaseClient';

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    console.log(`[UPLOAD_PHOTO] Processing photo upload for project: ${projectId}`);

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('[UPLOAD_PHOTO] No valid authorization token');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log(`[UPLOAD_PHOTO] Token received`);

    // Parse the multipart form data
    const formData = await request.formData();

    if (!formData.has('photo')) {
      console.error('[UPLOAD_PHOTO] No photo file in request');
      return NextResponse.json(
        { error: 'No photo file provided' },
        { status: 400 }
      );
    }

    const photoFile = formData.get('photo');
    if (!photoFile) {
      return NextResponse.json({ error: 'No photo file provided' }, { status: 400 });
    }

    const buffer = await photoFile.arrayBuffer();
    const photoBuffer = Buffer.from(buffer);
    console.log(`[UPLOAD_PHOTO] Photo file: ${photoFile.name}, Size: ${photoBuffer.length} bytes`);

    // Verify Supabase client is initialized
    if (!supabaseClient) {
      console.error('[UPLOAD_PHOTO] Supabase client not initialized');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    // Upload photo to Supabase storage
    const fileName = `${projectId}/${Date.now()}_${photoFile.name}`;
    const storagePath = `child-photos/${fileName}`;

    console.log(`[UPLOAD_PHOTO] Uploading to Supabase storage: ${storagePath}`);

    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('story-assets')
      .upload(storagePath, photoBuffer, {
        contentType: photoFile.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[UPLOAD_PHOTO] Storage upload failed:', uploadError);
      return NextResponse.json(
        { error: 'Photo storage failed', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('story-assets')
      .getPublicUrl(storagePath);

    console.log(`[UPLOAD_PHOTO] Photo uploaded successfully: ${publicUrl}`);

    console.log('[UPLOAD_PHOTO] Success - photo uploaded');
    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: publicUrl,
    }, { status: 200 });

  } catch (error) {
    console.error('[UPLOAD_PHOTO] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Photo upload failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  return NextResponse.json(
    {
      message: 'Photo upload endpoint',
      method: 'POST',
      description: 'Upload a photo for a story project',
      projectId: params.projectId,
    },
    { status: 200 }
  );
}
