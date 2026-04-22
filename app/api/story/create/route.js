/**
 * Create Story Endpoint for Wizard
 * POST /api/story/create
 * Creates a new story project in the story creation wizard
 */

import { NextResponse } from 'next/server';
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

    // Create story project
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const storyProject = {
      id: projectId,
      childName,
      childAge: childAge || null,
      gender: gender || null,
      interests: interests || [],
      specialNotes: specialNotes || '',
      theme,
      tone: tone || 'adventurous',
      illustrationStyle: illustrationStyle || 'cartoonish',
      status: 'in_progress',
      currentStep: 4, // Story creation form
      title: `${childName}'s Story`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: decoded.id || decoded.email,
      photos: [],
      storyContent: null,
      pages: [],
    };

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
