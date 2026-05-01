/**
 * Face Swap Endpoint - Integrate face into story illustrations
 * POST /api/photos/face-swap
 * Uses the best available configured provider and falls back when possible.
 * Handles both data URLs and HTTP URLs.
 */

import { NextResponse } from 'next/server';
import { convertDataUrlToHttpUrl } from '../../lib/dataUrlToUrlConverter.js';
import { faceSwapWithDeepAI } from '../../lib/deepaiService.js';
import { faceSwapWithReplicate } from '../../lib/replicateService.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for face swap processing

export async function POST(request) {
  try {
    console.log('[FACE_SWAP] Starting face swap...');

    const replicateKey = process.env.REPLICATE_API_TOKEN?.trim();
    const deepaiKey = process.env.DEEPAI_API_KEY?.trim();

    if (!replicateKey && !deepaiKey) {
      console.error('[FACE_SWAP] No face swap provider configured');
      return NextResponse.json(
        {
          error: 'Face swap service not configured',
          message:
            'Configure REPLICATE_API_TOKEN or a supported fallback provider.',
          setup:
            'Add REPLICATE_API_TOKEN to your environment variables to enable story face swap.',
          docs: 'https://replicate.com/account/api-tokens',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      faceImageUrl,
      illustrationImageUrl,
      storyId,
      photoId,
      pageNumber,
      childName = 'Child',
    } = body;

    if (!faceImageUrl || !illustrationImageUrl) {
      console.error('[FACE_SWAP] Missing required fields');
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['faceImageUrl', 'illustrationImageUrl'],
          optional: ['storyId', 'photoId', 'pageNumber', 'childName'],
        },
        { status: 400 }
      );
    }

    console.log(
      `[FACE_SWAP] Processing page ${pageNumber || 'N/A'} for ${childName}`
    );
    console.log(
      `[FACE_SWAP] Face image URL: ${faceImageUrl.substring(0, 80)}...`
    );
    console.log(
      `[FACE_SWAP] Illustration URL: ${illustrationImageUrl.substring(0, 80)}...`
    );
    console.log('[FACE_SWAP] Providers:', {
      replicate: Boolean(replicateKey),
      deepai: Boolean(deepaiKey),
    });

    const host = request.headers.get('host') || 'www.kidzstorymagic.org';
    let httpFaceUrl = faceImageUrl;
    let httpIllustrationUrl = illustrationImageUrl;

    if (faceImageUrl.startsWith('data:image/')) {
      console.log('[FACE_SWAP] Converting face image data URL to HTTP URL...');
      httpFaceUrl = await convertDataUrlToHttpUrl(faceImageUrl, host);
      console.log(
        '[FACE_SWAP] Face image converted:',
        httpFaceUrl.substring(0, 60) + '...'
      );
    }

    if (illustrationImageUrl.startsWith('data:image/')) {
      console.log(
        '[FACE_SWAP] Converting illustration data URL to HTTP URL...'
      );
      httpIllustrationUrl = await convertDataUrlToHttpUrl(
        illustrationImageUrl,
        host
      );
      console.log(
        '[FACE_SWAP] Illustration converted:',
        httpIllustrationUrl.substring(0, 60) + '...'
      );
    }

    let swapResult = null;
    let lastProviderError = null;

    if (replicateKey) {
      try {
        console.log('[FACE_SWAP] Calling Replicate for face swap...');
        swapResult = await faceSwapWithReplicate(
          httpFaceUrl,
          httpIllustrationUrl
        );
      } catch (replicateError) {
        lastProviderError = replicateError;
        console.warn(
          '[FACE_SWAP] Replicate face swap failed:',
          replicateError.message
        );
      }
    }

    if (!swapResult && deepaiKey) {
      try {
        console.log('[FACE_SWAP] Calling DeepAI for face swap...');
        swapResult = await faceSwapWithDeepAI(
          httpFaceUrl,
          httpIllustrationUrl
        );
      } catch (deepaiError) {
        lastProviderError = deepaiError;
        console.warn(
          '[FACE_SWAP] DeepAI face swap failed:',
          deepaiError.message
        );
      }
    }

    if (!swapResult) {
      throw (
        lastProviderError ||
        new Error('No configured face swap provider completed successfully.')
      );
    }

    console.log('[FACE_SWAP] Face swap completed successfully');
    console.log(
      `[FACE_SWAP] Output URL: ${swapResult.resultUrl.substring(0, 80)}...`
    );

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
          provider: swapResult.provider || 'unknown',
        },
        pricing: {
          provider: swapResult.provider || 'unknown',
          model: swapResult.model || 'unknown',
        },
        metadata: {
          faceImageUrl: faceImageUrl.substring(0, 100),
          illustrationImageUrl: illustrationImageUrl.substring(0, 100),
          source: swapResult.provider || 'provider-fallback',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FACE_SWAP] Error:', error.message);
    console.error('[FACE_SWAP] Stack:', error.stack);

    let statusCode = 500;
    let errorMessage = 'Face swap failed';

    if (error.message.includes('not configured')) {
      statusCode = 503;
      errorMessage = 'Face swap service not configured';
    } else if (error.message.includes('timed out')) {
      statusCode = 504;
      errorMessage = 'Face swap processing timed out';
    } else if (error.message.includes('not accessible')) {
      statusCode = 400;
      errorMessage = 'Invalid image URL';
    } else if (error.message.includes('model not found')) {
      statusCode = 503;
      errorMessage =
        'The configured DeepAI face swap model is unavailable. Use Replicate for face swap.';
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
