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

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^::1$/,
];

/**
 * Normalize provider errors to safe, plain-text messages for logs/responses.
 * This avoids returning raw error objects while still preserving actionable context.
 */
function sanitizeProviderError(error) {
  return error instanceof Error ? error.message : String(error);
}

function isDataImageUrl(value) {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function isLikelyPrivateHost(hostname) {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export function isPublicHttpUrl(value) {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    return !isLikelyPrivateHost(parsed.hostname);
  } catch (error) {
    console.warn(
      '[FACE_SWAP] Invalid URL input received:',
      sanitizeProviderError(error)
    );
    return false;
  }
}

function classifyImageInput(value) {
  if (isDataImageUrl(value)) {
    return 'data-url';
  }

  if (isPublicHttpUrl(value)) {
    return 'public-http-url';
  }

  return 'unsupported';
}

/**
 * Build DeepAI-compatible inputs.
 * DeepAI accepts only public HTTP(S) URLs, so data URLs are converted to hosted URLs
 * while unsupported/private inputs are rejected with a controlled error.
 */
async function prepareInputsForDeepAI(faceImageUrl, illustrationImageUrl, host) {
  const faceType = classifyImageInput(faceImageUrl);
  const illustrationType = classifyImageInput(illustrationImageUrl);

  if (faceType === 'unsupported' || illustrationType === 'unsupported') {
    throw new Error(
      'DeepAI requires publicly accessible image URLs or data:image URLs.'
    );
  }

  const sourceImageUrl =
    faceType === 'data-url'
      ? await convertDataUrlToHttpUrl(faceImageUrl, host)
      : faceImageUrl;
  const targetImageUrl =
    illustrationType === 'data-url'
      ? await convertDataUrlToHttpUrl(illustrationImageUrl, host)
      : illustrationImageUrl;

  return { sourceImageUrl, targetImageUrl };
}

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
    const faceInputType = classifyImageInput(faceImageUrl);
    const illustrationInputType = classifyImageInput(illustrationImageUrl);

    if (faceInputType === 'unsupported' || illustrationInputType === 'unsupported') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported image input',
          message:
            'Use either a public http(s) URL or a data:image URL for face swap inputs.',
          swappedUrl: illustrationImageUrl,
          result: {
            storyId,
            photoId,
            pageNumber,
            childName,
            swappedImageUrl: illustrationImageUrl,
            provider: 'fallback',
            fallback: true,
          },
          metadata: {
            source: 'input-validation',
            faceInputType,
            illustrationInputType,
          },
        },
        { status: 422 }
      );
    }

    let swapResult = null;
    const providerErrors = [];

    if (replicateKey) {
      try {
        console.log('[FACE_SWAP] Calling Replicate for face swap...');
        swapResult = await faceSwapWithReplicate(
          faceImageUrl,
          illustrationImageUrl
        );
      } catch (replicateError) {
        providerErrors.push({
          provider: 'replicate',
          error: sanitizeProviderError(replicateError),
        });
        console.warn(
          '[FACE_SWAP] Replicate face swap failed:',
          sanitizeProviderError(replicateError)
        );
      }
    }

    if (!swapResult && deepaiKey) {
      try {
        const { sourceImageUrl, targetImageUrl } = await prepareInputsForDeepAI(
          faceImageUrl,
          illustrationImageUrl,
          host
        );

        console.log('[FACE_SWAP] Calling DeepAI for face swap...');
        swapResult = await faceSwapWithDeepAI(sourceImageUrl, targetImageUrl);
      } catch (deepaiError) {
        providerErrors.push({
          provider: 'deepai',
          error: sanitizeProviderError(deepaiError),
        });
        console.warn(
          '[FACE_SWAP] DeepAI face swap failed:',
          sanitizeProviderError(deepaiError)
        );
      }
    }

    if (!swapResult) {
      return NextResponse.json(
        {
          success: false,
          error: 'Face swap unavailable',
          message:
            'No configured face swap provider completed successfully for the provided inputs.',
          swappedUrl: illustrationImageUrl,
          result: {
            storyId,
            photoId,
            pageNumber,
            childName,
            swappedImageUrl: illustrationImageUrl,
            provider: 'fallback',
            fallback: true,
          },
          providerErrors,
          metadata: {
            source: 'provider-fallback',
            faceInputType,
            illustrationInputType,
          },
        },
        { status: 502 }
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
