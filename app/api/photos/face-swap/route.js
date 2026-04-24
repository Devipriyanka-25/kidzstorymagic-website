/**
 * Face Swap Endpoint - Integrate face into story illustrations
 * POST /api/photos/face-swap
 * Uses DeepAI API for real face swapping (alternative to Replicate)
 * Handles both data URLs and HTTP URLs
 */

import { NextResponse } from 'next/server';
import { convertDataUrlToHttpUrl } from '../../lib/dataUrlToUrlConverter.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for face swap processing

// Use DeepAI API for face swap (subscribed service)
import { faceSwapWithDeepAI } from '../../lib/deepaiService.js';

export async function POST(request) {
  try {
    console.log('[FACE_SWAP] Starting face swap with DeepAI API...');

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
      console.error('[FACE_SWAP] Missing required fields');
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
    console.log(`[FACE_SWAP] Face image URL: ${faceImageUrl.substring(0, 80)}...`);
    console.log(`[FACE_SWAP] Illustration URL: ${illustrationImageUrl.substring(0, 80)}...`);

    // Check if DeepAI API token is configured
    const deepaiKey = process.env.DEEPAI_API_KEY;
    if (!deepaiKey) {
      console.error('[FACE_SWAP] ✗ DEEPAI_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'Face swap service not configured',
          message: 'DEEPAI_API_KEY environment variable is missing',
          setup: 'Get your API token from https://deepai.org/account/profile',
          note: 'Subscribed account with generous rate limits.'
        },
        { status: 503 }
      );
    }

    console.log('[FACE_SWAP] ✓ DeepAI API token configured');

    console.log('[FACE_SWAP] ✓ Configuration validated');

    // Get host from request headers for building URLs
    const host = request.headers.get('host') || 'www.kidzstorymagic.org';

    // Convert data URLs to HTTP URLs if needed
    let httpFaceUrl = faceImageUrl;
    let httpIllustrationUrl = illustrationImageUrl;

    if (faceImageUrl.startsWith('data:image/')) {
      console.log('[FACE_SWAP] Converting face image data URL to HTTP URL...');
      httpFaceUrl = await convertDataUrlToHttpUrl(faceImageUrl, host);
      console.log('[FACE_SWAP] ✓ Face image converted:', httpFaceUrl.substring(0, 60) + '...');
    }

    if (illustrationImageUrl.startsWith('data:image/')) {
      console.log('[FACE_SWAP] Converting illustration data URL to HTTP URL...');
      httpIllustrationUrl = await convertDataUrlToHttpUrl(illustrationImageUrl, host);
      console.log('[FACE_SWAP] ✓ Illustration converted:', httpIllustrationUrl.substring(0, 60) + '...');
    }

    // Perform face swap via DeepAI
    console.log('[FACE_SWAP] Calling DeepAI API for face swap...');
    const swapResult = await faceSwapWithDeepAI(httpFaceUrl, httpIllustrationUrl);

    console.log('[FACE_SWAP] ✓ Face swap completed successfully');
    console.log(`[FACE_SWAP] Output URL: ${swapResult.resultUrl.substring(0, 80)}...`);

    return NextResponse.json(
      {
        success: true,
        message: 'Face swap completed successfully',
        swappedUrl: swapResult.resultUrl,
        result: {
          storyId,
          photoId,
          pageNumber,
          childName,
          swappedImageUrl: swapResult.resultUrl,
          predictionId: swapResult.predictionId,
          processedAt: swapResult.processedAt,
          model: swapResult.model,
        },
        pricing: {
          provider: 'deepai',
          model: 'deepai-face-swap',
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
