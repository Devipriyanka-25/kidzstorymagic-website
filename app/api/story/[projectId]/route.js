/**
 * Dynamic Story Route Handler
 * GET /api/story/[projectId] - Get story details
 * DELETE /api/story/[projectId] - Delete story
 */

import { NextResponse } from 'next/server';
import {
  deleteStoryProjectRecord,
  getStoryProjectById,
  listStoryProjectPages,
  resolveAuthenticatedStoryUser,
} from '../../shared/storyProjects.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

async function resolveRequestUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.substring(7);

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const authUser = await resolveAuthenticatedStoryUser(decoded);
  if (!authUser?.id) {
    return {
      error: NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      ),
    };
  }

  return { authUser, decoded };
}

function buildStoryContentPreview(pages) {
  return pages
    .map((page) => page.page_text || page.text || '')
    .filter(Boolean)
    .join('\n\n');
}

export async function GET(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const projectId = params.projectId;
    const [story, pages] = await Promise.all([
      getStoryProjectById(authUser.id, projectId),
      listStoryProjectPages(projectId),
    ]);

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        story: {
          ...story,
          pages,
          content: buildStoryContentPreview(pages),
          downloadUrls: story.published_pdf_url
            ? {
                pdf: story.published_pdf_url,
              }
            : {},
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[STORY_DETAIL] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch story',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const deletedStory = await deleteStoryProjectRecord(
      authUser.id,
      params.projectId
    );

    if (!deletedStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Story deleted successfully',
        projectId: deletedStory.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[STORY_DELETE] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to delete story',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

