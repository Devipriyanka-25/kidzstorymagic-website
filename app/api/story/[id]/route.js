/**
 * Get Single Story Details Endpoint
 * GET /api/story/[id]
 * Returns details of a specific story
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const storyId = params.id;

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

    console.log('[STORY_DETAIL] Fetching story:', storyId, 'for user:', decoded.id || decoded.email);

    // Mock stories database
    const mockStoriesDB = {
      'story_1': {
        id: 'story_1',
        title: "Emma's Amazing Adventure",
        childName: 'Emma',
        child_name: 'Emma',
        child_gender: 'Girl',
        age_group: '6-8',
        theme: 'adventure',
        page_count: 12,
        pageCount: 12,
        status: 'published',
        content: `
          <h2>Emma's Amazing Adventure</h2>
          <p>Once upon a time, in a magical forest far away, there lived a curious little girl named Emma. 
          Emma loved exploring and discovering new things every day.</p>
          <p>One sunny morning, Emma found a mysterious map hidden in her grandmother's attic. 
          The map showed a path to a hidden treasure in the enchanted woods!</p>
          <p>With her best friend Tiger the cat by her side, Emma set off on an incredible journey. 
          They crossed sparkling streams, climbed tall mountains, and discovered magical creatures...</p>
          <p>After many adventures, Emma finally found the treasure - a chest full of wonderful memories and lessons. 
          She learned that the real treasure was the adventure itself and the friends she made along the way.</p>
        `,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        previewUrl: '/story/story_1',
        downloadUrls: {
          pdf: '/api/story/story_1/download/pdf',
          epub: '/api/story/story_1/download/epub',
        }
      },
      'story_2': {
        id: 'story_2',
        title: 'The Magic Kingdom',
        childName: 'Liam',
        child_name: 'Liam',
        child_gender: 'Boy',
        age_group: '8-10',
        theme: 'fantasy',
        page_count: 15,
        pageCount: 15,
        status: 'published',
        content: `
          <h2>The Magic Kingdom</h2>
          <p>In a land beyond the rainbow, there was a mystical kingdom where magic was real. 
          Young Liam discovered he possessed magical powers and was chosen to protect the kingdom.</p>
          <p>With his enchanted sword and loyal companions, Liam faced many challenges. 
          He battled dark forces, solved ancient riddles, and made friends with magical creatures.</p>
          <p>Through bravery, kindness, and determination, Liam proved himself worthy of the title 
          "Guardian of the Magic Kingdom" and brought peace to the realm.</p>
        `,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        previewUrl: '/story/story_2',
        downloadUrls: {
          pdf: '/api/story/story_2/download/pdf',
          epub: '/api/story/story_2/download/epub',
        }
      }
    };

    const story = mockStoriesDB[storyId];

    if (!story) {
      console.log('[STORY_DETAIL] Story not found:', storyId);
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    console.log('[STORY_DETAIL] ✓ Story found:', storyId);

    return NextResponse.json(
      {
        success: true,
        story: story,
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
