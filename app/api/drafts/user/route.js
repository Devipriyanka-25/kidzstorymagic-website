/**
 * Get User's Draft Stories Endpoint
 * GET /api/drafts/user
 * Returns all draft stories for the authenticated user
 */

import { NextResponse } from 'next/server';
import {
  createStoryProjectRecord,
  listStoryProjectsByUser,
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

  // Trust the JWT token directly - it has been cryptographically verified
  if (!decoded?.id) {
    return {
      error: NextResponse.json(
        { error: 'Invalid token: missing user ID' },
        { status: 401 }
      ),
    };
  }

  // Create an authUser object from the decoded JWT
  const authUser = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name || decoded.email,
  };

  return { authUser };
}

export async function GET(request) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const { projects } = await listStoryProjectsByUser(authUser.id, {
      limit: 100,
      offset: 0,
      statuses: ['draft', 'in_progress', 'pending'],
    });

    return NextResponse.json(
      {
        success: true,
        drafts: projects,
        count: projects.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DRAFTS] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch drafts',
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

    const draft = await createStoryProjectRecord(authUser.id, {
      title: body.title || `${childName}'s Story`,
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
    });

    return NextResponse.json(
      {
        success: true,
        draft,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[DRAFTS] Error creating draft:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to create draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

