/**
 * Face Detection and Extraction Endpoint
 * POST /api/photos/detect-face
 * Detects faces in uploaded images and extracts face data
 */

import { NextResponse } from 'next/server';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    console.log('[FACE_DETECT] Starting face detection...');

    const formData = await request.formData();
    const file = formData.get('photo');
    const childName = formData.get('childName') || 'Child';
    const userId = formData.get('userId');
    const storyId = formData.get('storyId');

    if (!file) {
      return NextResponse.json(
        { error: 'No photo provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    console.log(`[FACE_DETECT] Image size: ${metadata.width}x${metadata.height}`);

    // Create a processed version (normalized size for face detection)
    const processedBuffer = await sharp(buffer)
      .resize(640, 480, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toBuffer();

    // In a production app, you would use a face detection library here
    // For now, we'll create a mock detection with proper structure
    // In real implementation, integrate with:
    // - Google Cloud Vision API
    // - Amazon Rekognition
    // - Azure Computer Vision
    // - Or use face-api.js on client side

    const faceDetectionResult = {
      detected: true,
      confidence: 0.95,
      faces: [
        {
          x: Math.floor(metadata.width * 0.25),
          y: Math.floor(metadata.height * 0.15),
          width: Math.floor(metadata.width * 0.5),
          height: Math.floor(metadata.height * 0.6),
          confidence: 0.95,
          landmarks: {
            // Eye positions
            leftEye: { x: Math.floor(metadata.width * 0.35), y: Math.floor(metadata.height * 0.35) },
            rightEye: { x: Math.floor(metadata.width * 0.65), y: Math.floor(metadata.height * 0.35) },
            // Nose
            nose: { x: Math.floor(metadata.width * 0.5), y: Math.floor(metadata.height * 0.5) },
            // Mouth
            mouth: { x: Math.floor(metadata.width * 0.5), y: Math.floor(metadata.height * 0.65) },
          },
        },
      ],
    };

    // Extract face region (simplified - in production use actual face detection)
    const face = faceDetectionResult.faces[0];
    const faceWidth = Math.min(face.width, metadata.width - face.x);
    const faceHeight = Math.min(face.height, metadata.height - face.y);

    // Create a cropped version of just the face
    const faceBuffer = await sharp(buffer)
      .extract({
        left: Math.floor(face.x),
        top: Math.floor(face.y),
        width: Math.floor(faceWidth),
        height: Math.floor(faceHeight),
      })
      .resize(256, 256)
      .toBuffer();

    // Convert to base64 for storage/display
    const faceBase64 = faceBuffer.toString('base64');
    const photoBase64 = buffer.toString('base64');

    console.log('[FACE_DETECT] ✓ Face detection successful');

    return NextResponse.json(
      {
        success: true,
        message: 'Face detected and extracted',
        photo: {
          childName,
          userId,
          storyId,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: buffer.length,
          original_base64: `data:${file.type};base64,${photoBase64}`,
        },
        faceDetection: faceDetectionResult,
        faceData: {
          extracted_base64: `data:image/png;base64,${faceBase64}`,
          position: {
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height,
          },
          confidence: face.confidence,
          landmarks: face.landmarks,
        },
        source: 'mock-detection',
        note: 'In production, integrate with Google Vision API, AWS Rekognition, or Azure Computer Vision for real face detection',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FACE_DETECT] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Face detection failed',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
