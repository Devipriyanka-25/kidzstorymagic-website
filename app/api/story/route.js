/**
 * Get User's Stories/Projects Endpoint
 * GET /api/story
 * Returns paginated list of user's stories
 * DEPLOYMENT: Trigger rebuild - 2024-04-22 21:20
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit')) || 10, 100);
    const offset = Math.max(parseInt(searchParams.get('offset')) || 0, 0);

    console.log('[STORY] Fetching stories for user:', decoded.id || decoded.email, { limit, offset });

    // Mock stories for now (in production, query database)
    const mockStories = [
      {
        id: 'story_1',
        title: "Emma's Amazing Adventure",
        childName: 'Emma',
        theme: 'adventure',
        pageCount: 12,
        status: 'published',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        previewUrl: '/api/story/preview/story_1',
      },
      {
        id: 'story_2',
        title: 'The Magic Kingdom',
        childName: 'Liam',
        theme: 'fantasy',
        pageCount: 15,
        status: 'published',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        previewUrl: '/api/story/preview/story_2',
      },
    ];

    // Filter to apply pagination
    const paginatedStories = mockStories.slice(offset, offset + limit);

    console.log('[STORY] ✓ Returning stories', paginatedStories.length);

    return NextResponse.json(
      {
        success: true,
        stories: paginatedStories,
        stats: {
          totalProjects: mockStories.length,
          completedProjects: mockStories.filter(s => s.status === 'published').length,
          draftProjects: mockStories.filter(s => s.status === 'draft').length,
        },
        pagination: {
          limit,
          offset,
          total: mockStories.length,
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
    const { title, childName, theme, pageCount } = body;

    if (!childName || !theme) {
      return NextResponse.json(
        { error: 'childName and theme are required' },
        { status: 400 }
      );
    }

    console.log('[STORY] Creating story:', { childName, theme, pageCount });

    // Create mock story
    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newStory = {
      id: storyId,
      title: title || `${childName}'s Story`,
      childName,
      theme,
      pageCount: pageCount || 10,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: decoded.id || decoded.email,
    };

    console.log('[STORY] ✓ Story created');

    return NextResponse.json(
      {
        success: true,
        story: newStory,
        projectId: storyId,
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
