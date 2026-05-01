/**
 * Story Generation Endpoint
 * Serverless implementation: POST /api/story/generate
 * Generates personalized children's stories using AI or templates
 */

import { NextResponse } from 'next/server';
import { getBookTheme } from '@/utils/themes';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for Vercel Pro

export async function POST(request) {
  try {
    console.log('[STORY] Story generation request received');

    // Verify authentication (optional for internal calls)
    const authHeader = request.headers.get('authorization');
    const isInternalCall = request.headers.get('x-internal-call') === 'true';
    
    let decoded = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = process.env.JWT_SECRET || 'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345';

      try {
        decoded = jwt.verify(token, jwtSecret);
      } catch (err) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        );
      }
    } else if (!isInternalCall) {
      // Only require auth for external calls
      return NextResponse.json(
        { error: 'Unauthorized - Bearer token required' },
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
      milestoneTitle,
      milestonePromptHint,
      milestoneCoverBadge,
      isSeries,
      chapterNumber,
      originalTheme,
    } = body;

    if (projectId) {
      const persistentGenerationUrl = new URL(
        `/api/story/${encodeURIComponent(projectId)}/generate-story`,
        request.url
      );
      const response = await fetch(persistentGenerationUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));

      return NextResponse.json(data, { status: response.status });
    }

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
      milestoneTitle,
      milestonePromptHint,
      milestoneCoverBadge,
      isSeries,
      chapterNumber,
      originalTheme,
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
          createdBy: decoded ? (decoded.id || decoded.email) : 'internal-system',
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
function generateStoryFromTemplate({
  childName,
  childAge,
  theme,
  tone,
  characters,
  milestoneTitle,
  milestonePromptHint,
  milestoneCoverBadge,
  isSeries,
  chapterNumber,
  originalTheme,
}) {
  const selectedBookTheme = getBookTheme(theme);
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
    learning: {
      title: `${childName}'s Learning Adventure`,
      pages: [
        {
          number: 1,
          title: 'A Bright New Discovery',
          text: `${childName} stepped into a colorful learning world where letters, numbers, shapes, and colors were ready to play. Everything looked cheerful, welcoming, and full of wonder.`,
          illustration: 'learning_world',
        },
        {
          number: 2,
          title: 'Friendly Learning Friends',
          text: `Playful alphabet pals and happy number friends waved hello to ${childName}. They invited ${childName} to count, point, sing, and laugh along with every new discovery.`,
          illustration: 'learning_friends',
        },
        {
          number: 3,
          title: 'Shapes and Colors Everywhere',
          text: `${childName} spotted circles, squares, stars, and rainbows all around. Every shape and color became part of a magical game that made learning feel exciting and fun.`,
          illustration: 'shapes_and_colors',
        },
        {
          number: 4,
          title: 'A Proud Little Moment',
          text: `With each tiny success, ${childName} felt brighter and braver. By the end of the adventure, ${childName} knew that learning new things could feel like pure magic.`,
          illustration: 'proud_learning_moment',
        },
      ],
    },
    celebration: {
      title: `${childName}'s Special Celebration`,
      pages: [
        {
          number: 1,
          title: 'A Day to Remember',
          text: `${childName} woke up to decorations, smiling faces, and the feeling that something very special was about to happen. Today was a moment worth celebrating.`,
          illustration: 'celebration_beginning',
        },
        {
          number: 2,
          title: 'Love All Around',
          text: `Family and friends gathered to cheer for ${childName}. Warm hugs, kind words, and joyful surprises made the whole day sparkle with love.`,
          illustration: 'love_all_around',
        },
        {
          number: 3,
          title: 'The Big Happy Moment',
          text: `${childName} stood proudly in the center of the celebration, shining with confidence. It felt wonderful to be seen, supported, and celebrated.`,
          illustration: 'big_happy_moment',
        },
        {
          number: 4,
          title: 'Memories to Keep Forever',
          text: `As the celebration came to a close, ${childName} held onto the happiest part of all: the feeling of being deeply loved on such a meaningful day.`,
          illustration: 'keepsake_memory',
        },
      ],
    },
    milestone: {
      title: `${childName}'s Precious Milestone`,
      pages: [
        {
          number: 1,
          title: 'A Special Little First',
          text: `${childName} woke up to a gentle, happy day where everyone could feel that a precious little first was about to happen. The room felt warm, calm, and full of love.`,
          illustration: 'special_little_first',
        },
        {
          number: 2,
          title: 'Growing Every Day',
          text: `With encouraging smiles all around, ${childName} explored, reached, tried, and discovered something new. Every tiny effort made the moment feel even more magical.`,
          illustration: 'growing_every_day',
        },
        {
          number: 3,
          title: 'Cheers and Happy Hearts',
          text: `Then the big little milestone arrived, and everyone cheered for ${childName} with joy. It was a proud moment filled with claps, cuddles, and shining eyes.`,
          illustration: 'happy_milestone_cheer',
        },
        {
          number: 4,
          title: 'A Memory to Keep',
          text: `By the end of the day, ${childName} had a beautiful new memory. What seemed like a small first had become a treasured story the whole family would remember forever.`,
          illustration: 'memory_to_keep',
        },
      ],
    },
    confidence: {
      title: `${childName}'s Brave Little Hero Story`,
      pages: [
        {
          number: 1,
          title: 'A Small Brave Step',
          text: `${childName} felt a tiny flutter of nerves, but also a spark of courage. Today was the perfect day to try something new and believe in that brave little heart.`,
          illustration: 'small_brave_step',
        },
        {
          number: 2,
          title: 'Kindness Is a Superpower',
          text: `When someone needed help, ${childName} stepped forward with kindness. That simple caring moment made ${childName} feel stronger than ever before.`,
          illustration: 'kindness_superpower',
        },
        {
          number: 3,
          title: 'Trying Again',
          text: `Not everything happened perfectly the first time, but ${childName} kept going. Every new try turned worry into confidence and effort into pride.`,
          illustration: 'trying_again',
        },
        {
          number: 4,
          title: 'A Heroic Heart',
          text: `By the end of the day, ${childName} discovered that real heroes are brave, kind, and willing to keep growing. That made ${childName} a true little hero.`,
          illustration: 'heroic_heart',
        },
      ],
    },
  };

  const resolvedTemplateKey = (() => {
    const storyTheme = selectedBookTheme.storyTheme || theme;

    if (storyTheme === 'learning') {
      return 'learning';
    }

    if (
      storyTheme === 'milestone'
    ) {
      return 'milestone';
    }

    if (
      storyTheme === 'celebration' ||
      storyTheme === 'birthday' ||
      storyTheme === 'gathering' ||
      storyTheme === 'tribute'
    ) {
      return 'celebration';
    }

    if (storyTheme === 'confidence') {
      return 'confidence';
    }

    if (storyTheme === 'fantasy') {
      return 'fantasy';
    }

    return 'adventure';
  })();

  const template = templates[resolvedTemplateKey] || templates.adventure;
  const chapterPrefix =
    isSeries && Number(chapterNumber) > 1 ? `Chapter ${chapterNumber}: ` : '';
  const milestoneIntro = milestonePromptHint
    ? `This story celebrates ${milestonePromptHint}. `
    : '';
  const sequelIntro =
    isSeries && Number(chapterNumber) > 1
      ? `${childName} is returning for another adventure after their previous ${
          originalTheme || theme
        } story. `
      : '';
  const baseTitle =
    typeof selectedBookTheme.titleTemplate === 'function'
      ? selectedBookTheme.titleTemplate(childName)
      : template.title;
  const fullTitle = `${chapterPrefix}${baseTitle}${
    milestoneTitle ? ` - ${milestoneTitle}` : ''
  }`;
  
  return {
    title: milestoneCoverBadge ? `${fullTitle} - ${milestoneCoverBadge}` : fullTitle,
    theme,
    tone,
    characters: characters || ['Ollie the Owl', 'The Queen of Stars', childName],
    pages: template.pages.map(page => ({
      ...page,
      text:
        page.number === 1
          ? `${milestoneIntro}${sequelIntro}${page.text}`.trim()
          : page.text,
    })),
  };
}

/**
 * Generate characters based on theme
 */
function generateCharactersFromTheme(theme) {
  const resolvedTheme = getBookTheme(theme).storyTheme || theme;
  const characters = {
    adventure: ['Brave Explorer', 'Wise Guide', 'Magical Companion'],
    fantasy: ['Fairy Queen', 'Enchanted Dragon', 'Wise Wizard'],
    educational: ['Professor Owl', 'Science Explorer', 'Adventure Buddy'],
    learning: ['Alphabet Friend', 'Counting Buddy', 'Rainbow Guide'],
    milestone: ['Loving Family Cheer', 'Keepsake Star', 'Gentle Little Guide'],
    celebration: ['Joyful Helper', 'Family Friend', 'Keepsake Star'],
    confidence: ['Kind Helper', 'Brave Buddy', 'Cheerful Coach'],
    mystery: ['Detective Friend', 'Clue Finder', 'Mysterious Guide'],
    space: ['Alien Friend', 'Space Captain', 'Robot Helper'],
    jungle: ['Safari Guide', 'Jungle Monkey', 'Parrot Friend'],
    underwater: ['Friendly Dolphin', 'Wise Turtle', 'Mermaid Friend'],
  };

  return characters[resolvedTheme] || characters.adventure;
}
