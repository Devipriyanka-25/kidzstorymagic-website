/**
 * Create Story Endpoint for Wizard
 * POST /api/story/create
 * Creates a new story project in the story creation wizard
 */

import { NextResponse } from 'next/server';
import { getBookThemeLabel } from '@/utils/themes';
import {
  createStoryProjectRecord,
  resolveAuthenticatedStoryUser,
} from '../../shared/storyProjects.js';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      childName,
      childAge,
      gender,
      interests,
      specialNotes,
      theme,
      tone,
      illustrationStyle,
    } = body;

    // Validate required fields
    if (!childName || !theme) {
      return NextResponse.json(
        { error: 'childName and theme are required' },
        { status: 400 }
      );
    }

    console.log('[STORY_CREATE] Creating story project:', {
      childName,
      theme,
      tone,
    });

    const selectedThemeLabel = getBookThemeLabel(theme);

    const authUser = await resolveAuthenticatedStoryUser(decoded);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      );
    }

    const storyProject = await createStoryProjectRecord(authUser.id, {
      title:
        body.title ||
        `${childName}'s ${selectedThemeLabel}`,
      age_group: body.age_group || body.ageGroup || childAge || '5-8',
      theme,
      illustration_style:
        body.illustration_style || illustrationStyle || 'cartoonish',
      page_count: body.page_count || body.pageCount || 10,
      child_name: body.child_name || childName,
      child_gender: body.child_gender || gender || null,
      child_interests:
        body.child_interests || body.childInterests || interests || null,
      child_notes:
        body.child_notes || body.childNotes || specialNotes || null,
      status: 'draft',
      current_step: 4,
    });

    const projectId = storyProject.id;

    console.log('[STORY_CREATE] ✓ Story project created:', projectId);

    return NextResponse.json(
      {
        success: true,
        projectId,
        project: storyProject,
        nextStep: 'upload_photos',
        message: 'Story project created. Ready to upload photos.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[STORY_CREATE] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to create story',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    {
      message: 'Story creation endpoint',
      method: 'POST',
      authentication: 'Bearer token required',
      body: {
        childName: 'string (required)',
        childAge: 'number (optional)',
        gender: 'string (optional): boy, girl, other',
        interests: 'array (optional): sports, art, science, etc',
        specialNotes: 'string (optional)',
        theme: 'string (required): adventure, fantasy, educational, etc',
        tone: 'string (optional): adventurous, mysterious, humorous',
        illustrationStyle: 'string (optional): cartoonish, realistic, watercolor',
      },
    },
    { status: 200 }
  );
}
