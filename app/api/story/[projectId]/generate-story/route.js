/**
 * Generate Story Endpoint
 * POST /api/story/[projectId]/generate-story
 * Generates a story for a given project
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  try {
    const projectId = params.projectId;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('[GENERATE_STORY] Auth header:', authHeader ? 'Present' : 'Missing');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[GENERATE_STORY] Missing or invalid auth header format');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('[GENERATE_STORY] Token length:', token.length);
    const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
      console.log('[GENERATE_STORY] Token verified successfully');
    } catch (err) {
      console.log('[GENERATE_STORY] Token verification failed:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[GENERATE_STORY] Generating story for project:', projectId, 'by user:', decoded.id || decoded.email);
    console.log('[GENERATE_STORY] Request body:', body);

    // Extract story parameters
    const {
      childName,
      childGender,
      ageGroup,
      theme,
      pageCount,
      storyPrompt,
    } = body;

    // Validate required fields
    if (!childName || !ageGroup || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields: childName, ageGroup, theme' },
        { status: 400 }
      );
    }

    // Generate mock story content with pages array
    const themes = {
      adventure: 'an exciting adventure',
      fantasy: 'a magical fantasy tale',
      friendship: 'a story about friendship',
      family: 'a heartwarming family story',
      mystery: 'an intriguing mystery',
      motivational: 'an inspiring story',
      friends: 'a story about friendship',
    };

    const themeDescription = themes[theme] || 'an amazing story';
    const pages = pageCount || 20;

    // Create pages array for the component to iterate over
    const pagesArray = [];
    for (let i = 0; i < pages; i++) {
      pagesArray.push({
        pageNumber: i + 1,
        title: `Page ${i + 1}`,
        content: `This is page ${i + 1} of ${childName}'s story.`,
        illustrationUrl: `/images/placeholder-${(i % 10) + 1}.png`,
        htmlContent: `<h3>Page ${i + 1}</h3><p>${childName}'s adventure continues...</p>`
      });
    }

    // Mock story generation
    const generatedStory = {
      id: projectId,
      title: `${childName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Story`,
      childName: childName,
      childGender: childGender,
      ageGroup: ageGroup,
      theme: theme,
      pageCount: pages,
      pages: pagesArray,  // Pages array for iteration
      status: 'draft',
      content: `
        <h2>${childName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Story</h2>
        <p>Once upon a time, there was a special child named ${childName}. This is ${themeDescription} created just for them.</p>
        <p>In this wonderful journey, ${childName} experiences amazing things and learns valuable lessons. 
        Every page brings new excitement, new friends, and new discoveries.</p>
        <p>${childName} shows remarkable courage, kindness, and determination throughout this tale. 
        From the beginning to the end, this story celebrates what makes ${childName} unique and special.</p>
        <p>With beautiful illustrations and heartwarming moments, this story is designed to inspire, 
        entertain, and create lasting memories for ${childName}.</p>
      `,
      htmlContent: `
        <div style="font-family: 'Comic Sans MS', cursive; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
          <h1 style="color: white; text-align: center; font-size: 48px; margin-bottom: 30px;">✨ ${childName}'s ${theme.charAt(0).toUpperCase() + theme.slice(1)} Story ✨</h1>
          <div style="background: white; border-radius: 20px; padding: 40px; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <h2 style="color: #667eea; font-size: 28px;">Chapter 1: The Beginning</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              Once upon a time, in a magical place, there lived an amazing child named ${childName}. 
              ${childName} had a special gift - the ability to see wonder in the world around them.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              One day, something extraordinary happened. A magical adventure was about to begin, 
              and ${childName} was chosen to be the hero of this incredible story.
            </p>
            <h2 style="color: #667eea; font-size: 28px; margin-top: 30px;">The Adventure Unfolds</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              ${childName}'s journey was filled with ${themeDescription}. With each new challenge, 
              ${childName} discovered inner strength and made wonderful discoveries.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.8;">
              Friends were made, lessons were learned, and ${childName} proved to be brave, kind, and wise beyond measure.
            </p>
            <h2 style="color: #667eea; font-size: 28px; margin-top: 30px; text-align: center;">The Happy Ending</h2>
            <p style="color: #333; font-size: 16px; line-height: 1.8; text-align: center;">
              And so, ${childName}'s story came to a wonderful conclusion. The world was forever changed by their kindness and courage.
            </p>
            <p style="color: #667eea; font-size: 18px; font-weight: bold; text-align: center; margin-top: 20px;">
              The End 🌟
            </p>
          </div>
        </div>
      `,
      illustrations: [
        { pageNumber: 1, url: '/images/placeholder-1.png', description: 'Opening scene with ' + childName },
        { pageNumber: 2, url: '/images/placeholder-2.png', description: 'Adventure begins' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewUrl: `/api/story/preview/${projectId}`,
      downloadUrls: {
        pdf: `/api/story/${projectId}/download/pdf`,
        epub: `/api/story/${projectId}/download/epub`,
      },
    };

    console.log('[GENERATE_STORY] ✓ Story generated successfully:', projectId);

    return NextResponse.json(
      {
        success: true,
        message: 'Story generated successfully',
        story: generatedStory,
        projectId: projectId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GENERATE_STORY] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to generate story',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
