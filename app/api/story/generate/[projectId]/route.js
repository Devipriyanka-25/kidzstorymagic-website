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

    // Generate mock story content
    const themes = {
      adventure: 'an exciting adventure',
      fantasy: 'a magical fantasy tale',
      friendship: 'a story about friendship',
      family: 'a heartwarming family story',
      mystery: 'an intriguing mystery',
      motivational: 'an inspiring story',
    };

    const themeDescription = themes[theme] || 'an amazing story';
    const pages = pageCount || 20;

    // Generate story pages structure
    const storyTitles = {
      family: `${childName}'s Family Adventure`,
      friends: `${childName}'s Quest for Friendship`,
      motivational: `${childName} the Hero`,
      behavioural: `${childName} Learns & Grows`,
      fairytale: `${childName}'s Fairy Tale`,
      customizable: `${childName}'s Amazing Journey`,
      adventure: `${childName}'s Great Adventure`,
      fantasy: `${childName}'s Magical World`,
      friendship: `${childName}'s Friendship Quest`,
      mystery: `${childName}'s Mystery Adventure`,
    };

    const title = storyTitles[theme] || `${childName}'s Wonderful Story`;
    
    // Generate structured story pages
    const storyPages = [];
    
    // Cover page
    storyPages.push({
      pageNumber: 0,
      pageType: 'cover',
      title: title,
      text: `A magical story for ${childName}`,
      illustrationUrl: null, // Will use placeholder
      characterDescription: `${childName}, age ${ageGroup}, is the hero of this story!`,
    });

    // Body pages - create rich content pages
    const themeContent = {
      family: [
        {
          text: `${childName} woke up on a beautiful morning. Today was going to be special! With their family by their side, they were ready for an amazing adventure. Every moment with loved ones is magical.`,
          lesson: 'Family is always there for us',
        },
        {
          text: `Together, they discovered a hidden garden full of wonders. ${childName} learned that teamwork and love make everything better. With family, there's nothing you can't do!`,
          lesson: 'Togetherness creates magic',
        },
        {
          text: `As the sun set, ${childName} realized that the greatest treasure is having people who love you. They knew that no matter what happens, their family will always be their greatest adventure.`,
          lesson: 'Love is the greatest gift',
        }
      ],
      friends: [
        {
          text: `${childName} met some amazing friends on a sunny day. Together they decided to go on an adventure. With friends, anything is possible!`,
          lesson: 'Friendship makes life fun',
        },
        {
          text: `They faced challenges together, helped each other, and discovered that true friends make you stronger. ${childName} learned that loyalty and kindness are the foundation of true friendship.`,
          lesson: 'Friends support each other',
        },
        {
          text: `By the end of their adventure, ${childName} realized that friends are like stars - they make the sky beautiful even on the darkest nights.`,
          lesson: 'Friends light up our lives',
        }
      ],
      motivational: [
        {
          text: `${childName} discovered they had special powers within! With courage and determination, they faced every challenge with a smile. ${childName} knew they could do anything they set their mind to!`,
          lesson: 'You have incredible potential',
        },
        {
          text: `When things got tough, ${childName} didn't give up. They remembered that every superhero has struggled but never stopped believing in themselves. That belief is what made them truly super!`,
          lesson: 'Perseverance makes you strong',
        },
        {
          text: `${childName} learned that being a hero isn't about being perfect - it's about being kind, brave, and believing in yourself. And that's what made ${childName} a true hero!`,
          lesson: 'You are the hero of your story',
        }
      ],
      default: [
        {
          text: `Once upon a time, ${childName} began an incredible journey. The world was full of possibilities and ${childName} was ready for anything!`,
          lesson: 'Every adventure starts with a step',
        },
        {
          text: `Along the way, ${childName} met wonderful characters and faced exciting challenges. Each moment taught them something new and special.`,
          lesson: 'Learning happens everywhere',
        },
        {
          text: `${childName} discovered that they were braver, kinder, and more amazing than they ever imagined. This was just the beginning of their greatest adventures!`,
          lesson: 'You are amazing just as you are',
        }
      ]
    };

    const pageContent = themeContent[theme] || themeContent.default;
    
    // Add body pages
    pageContent.forEach((content, index) => {
      storyPages.push({
        pageNumber: index + 1,
        pageType: 'story',
        title: `Chapter ${index + 1}`,
        text: content.text,
        lesson: content.lesson,
        illustrationUrl: null, // Will be generated or filled from uploads
        characterQuote: `"${content.lesson}" - ${childName}`,
      });
    });

    // End page
    storyPages.push({
      pageNumber: storyPages.length,
      pageType: 'end',
      title: 'The End',
      text: `${childName}'s adventure was amazing! Every page of their story shows how special they truly are. This is a story to remember forever.`,
      illustrationUrl: null,
      message: `Written especially for ${childName}. You are loved, appreciated, and absolutely amazing!`,
    });

    const generatedStory = {
      id: projectId,
      title: title,
      childName: childName,
      childGender: childGender,
      ageGroup: ageGroup,
      theme: theme,
      pageCount: pageCount || pages,
      status: 'generated',
      pages: storyPages,
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
