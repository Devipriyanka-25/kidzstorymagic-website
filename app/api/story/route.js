/**
 * Get User's Stories/Projects Endpoint
 * GET /api/story
 * Returns paginated list of the authenticated user's real projects
 */

import { NextResponse } from 'next/server';
import {
  createStoryProjectRecord,
  getStoryProjectStats,
  listStoryProjectsByUser,
  resolveAuthenticatedStoryUser,
} from '../shared/storyProjects.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

function getAuthorizedToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

async function resolveRequestUser(request) {
  const token = getAuthorizedToken(request);
  if (!token) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

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

export async function GET(request) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 100);
    const offset = Math.max(parseInt(searchParams.get('offset')) || 0, 0);

    const [{ projects, total }, stats] = await Promise.all([
      listStoryProjectsByUser(authUser.id, { limit, offset }),
      getStoryProjectStats(authUser.id),
    ]);

    console.log('[STORY] Returning user projects', {
      userId: authUser.id,
      total,
      limit,
      offset,
    });

    return NextResponse.json(
      {
        success: true,
        stories: projects,
        stats,
        pagination: {
          limit,
          offset,
          total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[STORY] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch stories',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const childName = body.child_name || body.childName;
    const theme = body.theme;

    if (!childName || !theme) {
      return NextResponse.json(
        { error: 'childName and theme are required' },
        { status: 400 }
      );
    }

    const story = await createStoryProjectRecord(authUser.id, {
      title:
        body.title ||
        `${childName}'s ${
          String(theme).charAt(0).toUpperCase() + String(theme).slice(1)
        } Story`,
      age_group: body.age_group || body.ageGroup || '5-8',
      theme,
      illustration_style: body.illustration_style || body.illustrationStyle,
      page_count: body.page_count || body.pageCount || 10,
      child_name: childName,
      child_gender: body.child_gender || body.childGender || null,
      child_interests: body.child_interests || body.childInterests || null,
      child_notes: body.child_notes || body.childNotes || null,
      status: body.status || 'draft',
      current_step: body.current_step || body.currentStep || 1,
      preview_url: body.preview_url || body.previewUrl || null,
    });

    return NextResponse.json(
      {
        success: true,
        story,
        projectId: story.id,
        nextStep: 'upload_photos',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[STORY] Error creating story:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to create story',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

