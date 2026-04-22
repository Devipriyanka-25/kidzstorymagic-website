/**
 * Story Generation Endpoint
 * Serverless implementation: POST /api/story/generate
 * Generates personalized children's stories using AI or templates
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for Vercel Pro

export async function POST(request) {
  try {
    console.log('[STORY] Story generation request received');

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
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
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      projectId,
      childName,
      childAge,
      theme,
      tone,
      photoIds = [],
      pageCount,
      characters,
    } = body;

    // Validate input
    if (!childName || !theme) {
      return NextResponse.json(
        { error: 'childName and theme are required' },
        { status: 400 }
      );
    }

    console.log('[STORY] Story parameters:', {
      childName,
      childAge,
      theme,
      tone,
      pageCount,
      photoCount: photoIds.length,
    });

    // Generate story using template-based approach (no external AI call needed yet)
    const storyContent = generateStoryFromTemplate({
      childName,
      childAge,
      theme,
      tone,
      characters: characters || generateCharactersFromTheme(theme),
    });

    const storyId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('[STORY] ✓ Story generated');

    return NextResponse.json(
      {
        success: true,
        story: {
          id: storyId,
          projectId,
          childName,
          childAge,
          theme,
          tone: tone || 'adventurous',
          createdAt: new Date().toISOString(),
          createdBy: decoded.id || decoded.email,
        },
        content: storyContent,
        pages: storyContent.pages,
        metadata: {
          totalPages: storyContent.pages.length,
          characters: storyContent.characters,
          wordsPerPage: storyContent.pages.map(p => p.text.split(' ').length),
          totalWords: storyContent.pages.reduce((sum, p) => sum + p.text.split(' ').length, 0),
          photos: {
            provided: photoIds.length,
            usedIn: 'pages 1, 3, 5', // Example - in production, intelligently place photos
            suggestions: [
              'Add more photos for a richer visual experience',
              'Consider uploading photos that match the theme',
            ],
          },
        },
        downloadUrls: {
          pdf: `/api/story/${storyId}/download/pdf`,
          epub: `/api/story/${storyId}/download/epub`,
          text: `/api/story/${storyId}/download/text`,
        },
        nextSteps: [
          'Review story content',
          'Download as PDF',
          'Share with child',
          'Get feedback for variations',
        ],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[STORY] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Story generation failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    {
      message: 'Story generation endpoint',
      method: 'POST',
      authentication: 'Bearer token required',
      parameters: {
        projectId: 'String - Project identifier',
        childName: 'String (required) - Child name for personalization',
        childAge: 'Number - Child age (optional)',
        theme: 'String (required) - Story theme (adventure, fantasy, educational, etc)',
        tone: 'String - Tone (adventurous, mysterious, humorous, educational)',
        photoIds: 'Array - Photo IDs to include in story',
        pageCount: 'Number - Target number of pages (default: 12)',
        characters: 'Array - Custom characters (optional, auto-generated from theme)',
      },
      themes: [
        'adventure',
        'fantasy',
        'educational',
        'mystery',
        'space',
        'jungle',
        'underwater',
        'magical',
      ],
      example: {
        method: 'POST',
        url: '/api/story/generate',
        headers: {
          'Authorization': 'Bearer <token>',
          'Content-Type': 'application/json',
        },
        body: {
          projectId: 'proj_123',
          childName: 'Emma',
          childAge: 7,
          theme: 'adventure',
          tone: 'adventurous',
          pageCount: 10,
        },
      },
    },
    { status: 200 }
  );
}

/**
 * Generate story content from template
 * In production, this could call OpenAI, Anthropic, or other AI services
 */
function generateStoryFromTemplate({ childName, childAge, theme, tone, characters }) {
  const templates = {
    adventure: {
      title: `${childName}'s Amazing Adventure`,
      pages: [
        {
          number: 1,
          title: 'The Journey Begins',
          text: `${childName} woke up excited for today. There was a mysterious treasure map under the pillow! "I must find the hidden treasure," ${childName} said with determination. The adventure was about to begin!`,
          illustration: 'starting_scene',
        },
        {
          number: 2,
          title: 'A New Friend',
          text: `While walking through the forest, ${childName} met a magical talking owl named Ollie. "I know where the treasure is hidden!" said Ollie wisely. Together, they set off on the greatest adventure ever.`,
          illustration: 'meeting_owl',
        },
        {
          number: 3,
          title: 'The Mysterious Cave',
          text: `${childName} and Ollie discovered a cave hidden behind a waterfall. It sparkled with crystals and glowed with mysterious light. "Be brave, ${childName}," encouraged Ollie. "The treasure is close!"`,
          illustration: 'mysterious_cave',
        },
        {
          number: 4,
          title: 'The Challenge',
          text: `Inside the cave was a puzzle. ${childName} had to move three golden stones to unlock the treasure chest. With each stone moved, the cave filled with magical light. "You can do it!" cheered Ollie.`,
          illustration: 'puzzle_challenge',
        },
        {
          number: 5,
          title: 'The Treasure Found',
          text: `The treasure chest opened! Inside were not gold or jewels, but something even more precious—a glowing stone that granted one wish. ${childName} wished for eternal happiness and adventures with new friends.`,
          illustration: 'treasure_found',
        },
        {
          number: 6,
          title: 'The Happy Ending',
          text: `${childName} returned home with magical memories and true friendship. The glowing stone reminded ${childName} every day that the greatest treasure is family, friends, and the courage to seek adventure. The End!`,
          illustration: 'happy_ending',
        },
      ],
    },
    fantasy: {
      title: `${childName} and the Magical Kingdom`,
      pages: [
        {
          number: 1,
          title: 'A Magical Door',
          text: `${childName} found a shimmering purple door in the garden. When opened, it revealed a magical kingdom filled with floating castles and dancing stars. "Welcome, brave one," said the Queen of Stars.`,
          illustration: 'magical_door',
        },
        {
          number: 2,
          title: 'The Enchanted Garden',
          text: `In the magical kingdom's garden, flowers sang beautiful songs. Dragons flew gracefully through the sky. ${childName} could talk to all the creatures! They welcomed ${childName} as a friend.`,
          illustration: 'enchanted_garden',
        },
        {
          number: 3,
          title: 'The Magic School',
          text: `${childName} attended a school where they learned to cast spells with kindness and wisdom. Other magical children became ${childName}'s best friends. Together, they practiced flying on broomsticks and creating rainbows.`,
          illustration: 'magic_school',
        },
        {
          number: 4,
          title: 'The Magical Celebration',
          text: `The Queen of Stars threw a grand celebration for ${childName}. Unicorns danced, fireworks lit the sky, and everyone sang songs of joy. It was the most magical night ever!`,
          illustration: 'magical_celebration',
        },
      ],
    },
  };

  const template = templates[theme] || templates.adventure;
  
  return {
    title: template.title,
    theme,
    tone,
    characters: characters || ['Ollie the Owl', 'The Queen of Stars', childName],
    pages: template.pages.map(page => ({
      ...page,
      text: page.text, // Already personalized with childName
    })),
  };
}

/**
 * Generate characters based on theme
 */
function generateCharactersFromTheme(theme) {
  const characters = {
    adventure: ['Brave Explorer', 'Wise Guide', 'Magical Companion'],
    fantasy: ['Fairy Queen', 'Enchanted Dragon', 'Wise Wizard'],
    educational: ['Professor Owl', 'Science Explorer', 'Adventure Buddy'],
    mystery: ['Detective Friend', 'Clue Finder', 'Mysterious Guide'],
    space: ['Alien Friend', 'Space Captain', 'Robot Helper'],
    jungle: ['Safari Guide', 'Jungle Monkey', 'Parrot Friend'],
    underwater: ['Friendly Dolphin', 'Wise Turtle', 'Mermaid Friend'],
  };

  return characters[theme] || characters.adventure;
}
