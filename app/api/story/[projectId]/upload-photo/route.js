/**
 * Photo Upload Endpoint
 * Next.js API route: POST /api/story/[projectId]/upload-photo
 * Handles photo uploads directly with Supabase storage
 */

import { NextResponse } from 'next/server';
import supabaseClient from '@/app/api/shared/supabaseClient';

const BUCKET_NAME = 'story-assets';

async function ensureBucketExists() {
  if (!supabaseClient) return false;
  
  try {
    // Try to get bucket info
    const { data, error } = await supabaseClient.storage.getBucket(BUCKET_NAME);
    
    if (error || !data) {
      console.log(`[UPLOAD_PHOTO] Bucket ${BUCKET_NAME} not found, attempting to create...`);
      
      // Try to create the bucket
      const { data: createdBucket, error: createError } = await supabaseClient.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });
      
      if (createError) {
        console.warn('[UPLOAD_PHOTO] Could not create bucket:', createError.message);
        return false;
      }
      
      console.log('[UPLOAD_PHOTO] Bucket created successfully');
      return true;
    }
    
    console.log('[UPLOAD_PHOTO] Bucket exists');
    return true;
  } catch (err) {
    console.error('[UPLOAD_PHOTO] Bucket check error:', err.message);
    return false;
  }
}

export async function POST(request, { params }) {
  try {
    const { projectId } = params;
    console.log(`[UPLOAD_PHOTO] Processing photo upload for project: ${projectId}`);

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
      console.error('[UPLOAD_PHOTO] Supabase client not initialized - missing environment variables');
      console.log('[UPLOAD_PHOTO] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
      console.log('[UPLOAD_PHOTO] SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
      return NextResponse.json(
        { error: 'Service unavailable', details: 'Supabase not configured' },
        { status: 503 }
      );
    }

    // Ensure bucket exists
    const bucketReady = await ensureBucketExists();
    if (!bucketReady) {
      console.error('[UPLOAD_PHOTO] Could not ensure bucket exists');
      return NextResponse.json(
        { error: 'Storage not available', details: 'Could not access storage bucket' },
        { status: 503 }
      );
    }

    // Upload photo to Supabase storage
    const fileName = `${projectId}/${Date.now()}_${photoFile.name}`;
    const storagePath = `child-photos/${fileName}`;

    console.log(`[UPLOAD_PHOTO] Uploading to Supabase storage: ${storagePath}`);

    try {
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from(BUCKET_NAME)
        .upload(storagePath, photoBuffer, {
          contentType: photoFile.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('[UPLOAD_PHOTO] Storage upload failed:', JSON.stringify(uploadError));
        return NextResponse.json(
          { error: 'Photo storage failed', details: uploadError.message || 'Unknown storage error' },
          { status: 500 }
        );
      }

      console.log('[UPLOAD_PHOTO] File uploaded successfully');
    } catch (storageError) {
      console.error('[UPLOAD_PHOTO] Storage exception:', storageError.message);
      return NextResponse.json(
        { error: 'Storage error', details: storageError.message },
        { status: 500 }
      );
    }

    // Get public URL
    try {
      const { data: { publicUrl } } = supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);

      console.log(`[UPLOAD_PHOTO] Public URL generated: ${publicUrl}`);

      return NextResponse.json({
        success: true,
        message: 'Photo uploaded successfully',
        photoUrl: publicUrl,
      }, { status: 200 });
    } catch (urlError) {
      console.error('[UPLOAD_PHOTO] URL generation error:', urlError.message);
      return NextResponse.json(
        { error: 'URL error', details: urlError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[UPLOAD_PHOTO] Unexpected error:', error.message, error.stack);
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
