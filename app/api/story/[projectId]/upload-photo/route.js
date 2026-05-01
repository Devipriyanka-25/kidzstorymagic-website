/**
 * Photo Upload Endpoint
 * Next.js API route: POST /api/story/[projectId]/upload-photo
 * Handles photo uploads directly with Supabase storage
 */

import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/app/api/shared/authVerifier';
import supabaseClient from '@/app/api/shared/supabaseClient';

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    console.log(`[UPLOAD_PHOTO] Processing photo upload for project: ${projectId}`);

    // Verify auth token
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      console.error('[UPLOAD_PHOTO] Auth failed:', authResult.error);
      return NextResponse.json(
        { error: 'Unauthorized', details: authResult.error },
        { status: 401 }
      );
    }

    const userId = authResult.userId;
    console.log(`[UPLOAD_PHOTO] Authenticated user: ${userId}`);

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

    // Verify project ownership
    if (!supabaseClient) {
      console.error('[UPLOAD_PHOTO] Supabase client not initialized');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { data: project, error: projectError } = await supabaseClient
      .from('story_projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      console.error('[UPLOAD_PHOTO] Project not found or unauthorized:', projectError?.message);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
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

    // Update project with photo URL
    const { data: updated, error: updateError } = await supabaseClient
      .from('story_projects')
      .update({
        child_photo_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('[UPLOAD_PHOTO] Database update failed:', updateError);
      return NextResponse.json(
        { error: 'Photo save failed', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('[UPLOAD_PHOTO] Success - photo saved');
    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: publicUrl,
      project: updated,
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
