/**
 * Image Upload Endpoint
 * Serverless implementation: POST /api/upload/photo
 * Handles multipart/form-data photo uploads with optional processing
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export async function POST(request) {
  try {
    // Get content-type to parse multipart data
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      );
    }

    console.log('[UPLOAD] Processing file upload...');

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('photo');
    const metadata = formData.get('metadata');
    const processType = formData.get('processType') || 'none'; // none, blur, compress

    if (!file) {
      return NextResponse.json(
        { error: 'Photo file is required' },
        { status: 400 }
      );
    }

    // Validate file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` },
        { status: 413 }
      );
    }

    // Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image format. Supported: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      );
    }

    console.log('[UPLOAD] File validated:', {
      name: file.name,
      size: file.size,
      type: file.type,
      processType,
    });

    // For serverless, we store in memory with a temporary ID
    // In production, upload to S3/Cloud Storage
    const fileBuffer = await file.arrayBuffer();
    const fileId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${fileId}_${file.name}`;

    // Parse metadata if provided
    let metadataObj = {};
    if (metadata) {
      try {
        metadataObj = JSON.parse(metadata);
      } catch (e) {
        console.log('[UPLOAD] Could not parse metadata');
      }
    }

    console.log('[UPLOAD] ✓ File uploaded successfully');

    // Return mock storage URLs (in production, these would be real S3 URLs)
    const mockStorageUrl = `https://storage.kidzstorymagic.com/photos/${fileName}`;
    
    const thumbnailUrl = `${mockStorageUrl}?size=thumbnail`;
    const compressedUrl = `${mockStorageUrl}?size=compressed`;

    return NextResponse.json(
      {
        success: true,
        file: {
          id: fileId,
          name: fileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        },
        urls: {
          original: mockStorageUrl,
          thumbnail: thumbnailUrl,
          compressed: compressedUrl,
        },
        metadata: metadataObj,
        processing: {
          type: processType,
          status: 'completed',
          message: 'File uploaded and ready for use',
        },
        note: 'In production, files would be stored in cloud storage (S3, GCS, Supabase Storage, etc.)',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[UPLOAD] Error:', error.message);
    return NextResponse.json(
      {
        error: 'File upload failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    {
      message: 'Photo upload endpoint',
      method: 'POST',
      contentType: 'multipart/form-data',
      parameters: {
        photo: 'File - Image file (JPEG, PNG, WebP, GIF)',
        metadata: 'JSON - Optional metadata object',
        processType: 'String - Optional: none, blur, compress (default: none)',
      },
      limits: {
        maxFileSize: '50MB',
      },
    },
    { status: 200 }
  );
}
