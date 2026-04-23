/**
 * Face Swap Endpoint - Integrate face into story illustrations
 * POST /api/photos/face-swap
 * Uses Replicate API (strmoder/roop) for real face swapping
 */

import { NextResponse } from 'next/server';
import { faceSwapWithReplicate, imageUrlToBase64, validateImageUrl, getPricingInfo } from '../../lib/replicateService.js';

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

    // Validate image URLs are accessible
    console.log('[FACE_SWAP] Validating image URLs...');
    const faceValid = await validateImageUrl(faceImageUrl);
    const illustrationValid = await validateImageUrl(illustrationImageUrl);

    if (!faceValid) {
      return NextResponse.json(
        { error: 'Face image URL is not accessible' },
        { status: 400 }
      );
    }

    if (!illustrationValid) {
      return NextResponse.json(
        { error: 'Illustration image URL is not accessible' },
        { status: 400 }
      );
    }

    console.log('[FACE_SWAP] ✓ Image URLs validated');

    // Check if Replicate API token is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      console.warn('[FACE_SWAP] ⚠ REPLICATE_API_TOKEN not configured');
      return NextResponse.json(
        { 
          error: 'Face swap service not configured',
          message: 'REPLICATE_API_TOKEN environment variable is missing',
          setup: 'Get your token from https://replicate.com/account/api-tokens'
        },
        { status: 503 }
      );
    }

    // Perform face swap via Replicate
    console.log('[FACE_SWAP] Calling Replicate API for face swap...');
    const swapResult = await faceSwapWithReplicate(faceImageUrl, illustrationImageUrl, {
      onlyCenterFace: true, // Focus on center face for story illustrations
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
          model: 'strmoder/roop:v2',
        },
        pricing: {
          model: getPricingInfo().model,
          estimatedCost: getPricingInfo().costPerCall,
          currency: 'USD',
        },
        metadata: {
          faceImageUrl: faceImageUrl.substring(0, 100),
          illustrationImageUrl: illustrationImageUrl.substring(0, 100),
          source: 'replicate-api',
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
      errorMessage = 'Face swap service not configured';
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
