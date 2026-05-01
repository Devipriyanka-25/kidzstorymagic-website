import { NextResponse } from 'next/server';

import { validateMagicLinkToken } from '../../shared/magicLinks.js';
import { getSavedStoryForPreview } from '../../shared/storyDrafts.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildPreviewStory(story) {
  const pages = Array.isArray(story?.pages) ? story.pages : [];

  return {
    id: story.id,
    storyId: story.id,
    title: story.title,
    childName: story.childName || story.child_name,
    theme: story.theme,
    pageCount: story.pageCount || story.page_count || pages.length,
    totalPages: pages.length,
    isGenerated: story.isGenerated || story.is_generated,
    isPaid: story.isPaid || story.is_paid,
    pages: pages.map((page) => ({
      pageNumber: page.pageNumber || page.page_number,
      pageType: page.pageType,
      title: page.title || page.page_title,
      text: page.text || page.page_text || page.content || '',
      imageUrl:
        page.faceSwappedUrl ||
        page.illustrationUrl ||
        page.image_url ||
        page.image ||
        null,
    })),
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const validation = await validateMagicLinkToken(token);

    if (!validation.valid) {
      const status = validation.reason === 'expired' ? 410 : 404;
      return NextResponse.json(
        {
          error:
            validation.reason === 'expired'
              ? 'This link has expired. Please request a new one.'
              : 'Preview link is invalid.',
          code:
            validation.reason === 'expired'
              ? 'MAGIC_LINK_EXPIRED'
              : 'MAGIC_LINK_INVALID',
        },
        { status }
      );
    }

    const story = await getSavedStoryForPreview(
      validation.link.userId,
      validation.link.storyId
    );

    if (!story) {
      return NextResponse.json(
        { error: 'Story preview not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        story: buildPreviewStory(story),
        magicLink: {
          expiresAt: validation.link.expiresAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[MAGIC_PREVIEW] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to load story preview.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
