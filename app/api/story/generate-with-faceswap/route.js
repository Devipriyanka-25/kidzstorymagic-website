/**
 * API Endpoint: Story Generation with Face Swap Integration
 * POST /api/story/generate-with-faceswap
 * 
 * Orchestrates the complete pipeline:
 * 1. Generate story structure
 * 2. Generate illustrations with Replicate
 * 3. Apply face swap to each page
 * 4. Return completed story with face-swapped images
 */

import { NextResponse } from 'next/server';
import { generateStoryWithFaceSwap } from '@/lib/storyGenerationPipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - face swap takes time

export async function POST(request) {
  try {
    console.log('[FACESWAP_ENDPOINT] Received story generation request...');
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const forwardedHost = request.headers.get('x-forwarded-host');
    const requestOrigin =
      request.nextUrl?.origin ||
      request.headers.get('origin') ||
      (forwardedProto && forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : undefined);

    const body = await request.json();
    const {
      projectId,
      childName,
      childAge,
      theme,
      childPhotoUrl, // ⭐ Child's uploaded photo URL
      enableFaceSwap = true,
      pageCount = 12,
      userId,
      milestoneTitle,
      milestonePromptHint,
      milestoneCoverBadge,
      isSeries,
      chapterNumber,
      originalTheme,
    } = body;

    // Validate required fields
    if (!projectId || !childName || !theme) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['projectId', 'childName', 'theme'],
        },
        { status: 400 }
      );
    }

    // Validate face swap prerequisites
    if (enableFaceSwap && !childPhotoUrl) {
      console.warn('[FACESWAP_ENDPOINT] Face swap enabled but no photo URL provided');
      console.log('[FACESWAP_ENDPOINT] Proceeding with face swap disabled');
    }

    console.log('[FACESWAP_ENDPOINT] Parameters:', {
      projectId,
      childName,
      childAge,
      theme,
      pageCount,
      enableFaceSwap,
      hasPhotoUrl: !!childPhotoUrl,
    });

    // Call integrated pipeline
    const story = await generateStoryWithFaceSwap({
      baseUrl: requestOrigin,
      projectId,
      childName,
      childAge,
      theme,
      childPhotoUrl,
      enableFaceSwap: enableFaceSwap && !!childPhotoUrl, // Only if photo provided
      pageCount,
      milestoneTitle,
      milestonePromptHint,
      milestoneCoverBadge,
      isSeries,
      chapterNumber,
      originalTheme,
    });

    console.log('[FACESWAP_ENDPOINT] ✅ Story generation complete');

    return NextResponse.json(
      {
        success: true,
        message: 'Story generated successfully with face swap',
        story: {
          id: story.id,
          projectId: story.projectId,
          childName: story.childName,
          title: story.title,
          pageCount: story.pages.length,
          status: story.status,
          pages: story.pages.map((page) => ({
            pageNumber: page.pageNumber,
            title: page.title,
            content: page.content,
            illustrationUrl: page.illustrationUrl,
            faceSwappedUrl: page.faceSwappedUrl,
            pageType: page.pageType,
          })),
          createdAt: story.createdAt,
          metadata: {
            faceSwapEnabled: enableFaceSwap,
            modelUsed: 'replicate-sdxl + deepai-faceswap',
            processingTime: 'check logs',
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[FACESWAP_ENDPOINT] ❌ Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate story with face swap',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for documentation
 */
export async function GET(request) {
  return NextResponse.json(
    {
      endpoint: 'POST /api/story/generate-with-faceswap',
      description:
        'Generate a personalized story with automatic face swap integration',
      authentication: 'Optional Bearer token',
      requestBody: {
        projectId: 'string (required) - Unique project identifier',
        childName: 'string (required) - Child name for personalization',
        childAge: 'number (optional) - Child age for age-appropriate content',
        theme:
          'string (required) - Story theme (adventure, fantasy, fairy-tale, etc)',
        childPhotoUrl:
          'string (optional) - URL of uploaded child photo for face swap',
        enableFaceSwap:
          'boolean (optional, default: true) - Enable face swap processing',
        pageCount: 'number (optional, default: 12) - Number of story pages',
        userId: 'string (optional) - User identifier for tracking',
      },
      responseFormat: {
        success: 'boolean',
        message: 'string',
        story: {
          id: 'string',
          projectId: 'string',
          childName: 'string',
          title: 'string',
          pageCount: 'number',
          status: 'enum (draft, ready, failed)',
          pages: [
            {
              pageNumber: 'number',
              title: 'string',
              content: 'string (story text)',
              illustrationUrl: 'string (URL to generated cartoon)',
              faceSwappedUrl: 'string (URL to face-swapped version)',
              pageType: 'enum (cover, story, end)',
            },
          ],
          createdAt: 'ISO timestamp',
          metadata: {
            faceSwapEnabled: 'boolean',
            modelUsed: 'string',
          },
        },
      },
      exampleRequest: {
        projectId: 'story_123abc',
        childName: 'Emma',
        childAge: 6,
        theme: 'fairy-tale',
        childPhotoUrl: 'https://storage.example.com/photos/emma-photo.jpg',
        enableFaceSwap: true,
        pageCount: 12,
        userId: 'user_xyz789',
      },
      processingSteps: [
        '1. Validate input parameters',
        '2. Generate story structure and text',
        '3. Create illustration prompts for each page',
        '4. Generate cartoon illustrations with Replicate SDXL',
        '5. Apply face swap to each illustration (if enabled)',
        '6. Compose final images',
        '7. Return completed story',
      ],
      timeEstimate: '3-5 minutes for 12-page story',
      costs: {
        storyGeneration: '$0.01-0.05',
        illustrations: '12 × Replicate SDXL ≈ $0.50-1.00',
        faceSwap: '12 × DeepAI ≈ $0.06-0.12',
        totalEstimate: '$0.57-1.17 per story',
      },
    },
    { status: 200 }
  );
}
