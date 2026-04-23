/**
 * Face Swap Endpoint - Integrate face into story illustrations
 * POST /api/photos/face-swap
 * Uses DeepAI API for real face swapping (alternative to Replicate)
 * Handles both data URLs and HTTP URLs
 */

import { NextResponse } from 'next/server';
import { faceSwapWithDeepAI, detectFacesWithDeepAI, getPricingInfo } from '../../lib/deepaiService.js';
import { convertDataUrlToHttpUrl } from '../../lib/dataUrlToUrlConverter.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for face swap processing

export async function POST(request) {
  try {
    console.log('[FACE_SWAP] Starting real face swap with Replicate API...');

    const body = await request.json();
    const {
      faceImageUrl,
      illustrationImageUrl,
      storyId,
      photoId,
      pageNumber,
      childName = 'Child',
    } = body;

    // Validate required fields
    if (!faceImageUrl || !illustrationImageUrl) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['faceImageUrl', 'illustrationImageUrl'],
          optional: ['storyId', 'photoId', 'pageNumber', 'childName']
        },
        { status: 400 }
      );
    }

    console.log(`[FACE_SWAP] Processing page ${pageNumber || 'N/A'} for ${childName}`);
    console.log(`[FACE_SWAP] Face image: ${faceImageUrl.substring(0, 80)}...`);
    console.log(`[FACE_SWAP] Illustration: ${illustrationImageUrl.substring(0, 80)}...`);

    // Check if DeepAI API key is configured
    if (!process.env.DEEPAI_API_KEY) {
      console.warn('[FACE_SWAP] ⚠ DEEPAI_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'Face swap service not configured',
          message: 'DEEPAI_API_KEY environment variable is missing',
          setup: 'Get your free API key from https://deepai.org/account/profile',
          alternatives: [
            'AWS Rekognition + custom face swap implementation',
            'Azure Face API + CompreFace for face swap',
            'Run local face swap model using FastAPI'
          ]
        },
        { status: 503 }
      );
    }

    console.log('[FACE_SWAP] ✓ Configuration validated');

    // Convert data URLs to HTTP URLs if needed
    let httpFaceUrl = faceImageUrl;
    let httpIllustrationUrl = illustrationImageUrl;

    if (faceImageUrl.startsWith('data:image/')) {
      console.log('[FACE_SWAP] Converting face image data URL to HTTP URL...');
      httpFaceUrl = await convertDataUrlToHttpUrl(faceImageUrl);
    }

    if (illustrationImageUrl.startsWith('data:image/')) {
      console.log('[FACE_SWAP] Converting illustration data URL to HTTP URL...');
      httpIllustrationUrl = await convertDataUrlToHttpUrl(illustrationImageUrl);
    }

    // Perform face swap via DeepAI
    console.log('[FACE_SWAP] Calling DeepAI API for face swap...');
    const swapResult = await faceSwapWithDeepAI(httpFaceUrl, httpIllustrationUrl, {
      // DeepAI face swap options
    });

    console.log('[FACE_SWAP] ✓ Face swap completed successfully');
    console.log(`[FACE_SWAP] Result URL: ${swapResult.resultUrl.substring(0, 80)}...`);

    return NextResponse.json(
      {
        success: true,
        message: 'Face swap completed successfully',
        result: {
          storyId,
          photoId,
          pageNumber,
          childName,
          swappedImageUrl: swapResult.resultUrl,
          predictionId: swapResult.predictionId,
          processedAt: swapResult.processedAt,
          model: 'deepai-face-swap',
        },
        pricing: {
          model: getPricingInfo().model,
          estimatedCost: getPricingInfo().costPerCall,
          currency: 'USD',
          provider: 'deepai.org',
        },
        metadata: {
          faceImageUrl: faceImageUrl.substring(0, 100),
          illustrationImageUrl: illustrationImageUrl.substring(0, 100),
          source: 'deepai-api',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FACE_SWAP] Error:', error.message);
    console.error('[FACE_SWAP] Stack:', error.stack);

    // Return appropriate error response
    let statusCode = 500;
    let errorMessage = 'Face swap failed';

    if (error.message.includes('not configured')) {
      statusCode = 503;
      errorMessage = 'Face swap service not configured - get API key from deepai.org';
    } else if (error.message.includes('timed out')) {
      statusCode = 504;
      errorMessage = 'Face swap processing timed out';
    } else if (error.message.includes('not accessible')) {
      statusCode = 400;
      errorMessage = 'Invalid image URL';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        support: 'Contact support@kidzstorymagic.com if the issue persists',
      },
      { status: statusCode }
    );
  }
}
