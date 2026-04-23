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

    // Generate real story content based on theme and age group
    const themeContent = {
      adventure: {
        title: `${childName}'s Amazing Adventure`,
        storyArcs: [
          `${childName} wakes up to discover an ancient map hidden in the attic!`,
          `Following the map, ${childName} ventures into an enchanted forest full of mysteries.`,
          `${childName} befriends a wise owl who reveals secrets about the hidden treasure.`,
          `Deep in the forest, ${childName} encounters challenges but never loses courage.`,
          `${childName} discovers a hidden cave sparkling with magical crystals!`,
          `Inside the cave, ${childName} finds an ancient guardian of the treasures.`,
          `With quick thinking and bravery, ${childName} solves the guardian's riddle.`,
          `The treasures are revealed - but ${childName} discovers the real treasure is friendship!`,
          `${childName} helps other lost travelers find their way home with the map.`,
          `Heroes return home celebrated for their bravery and kindness.`
        ]
      },
      fantasy: {
        title: `${childName} in the Magical Kingdom`,
        storyArcs: [
          `${childName} finds a shimmering portal leading to the Magic Kingdom!`,
          `A friendly dragon named Sparkle greets ${childName} at the kingdom gates.`,
          `${childName} learns about the ancient magic that protects the kingdom.`,
          `The kingdom's magic is fading - only a pure heart can help!`,
          `${childName} sets out on a quest to restore the Crystal of Light.`,
          `Along the way, ${childName} makes friends with elves, fairies, and talking animals.`,
          `Together, they face magical challenges and puzzles.`,
          `${childName} discovers their inner magic is stronger than ever believed!`,
          `With friends' help, ${childName} restores the Crystal of Light.`,
          `The kingdom celebrates ${childName} as a true hero of magic!`
        ]
      },
      friends: {
        title: `${childName} and the Circle of Friends`,
        storyArcs: [
          `${childName} starts a new adventure in a sunny town full of possibilities.`,
          `${childName} meets Alex, a cheerful adventurer who loves exploring.`,
          `Soon, Jordan joins - they all share a love for helping others.`,
          `The trio discovers they work best as a team tackling challenges.`,
          `Together they organize a festival to bring the whole community together.`,
          `Each friend contributes their special talent to make it amazing.`,
          `${childName} learns that true friendship makes everything better.`,
          `Friends support each other through tough times and celebrate victories.`,
          `The bond between these friends grows stronger every day.`,
          `They promise to be friends forever, no matter what comes next!`
        ]
      },
      family: {
        title: `${childName}'s Family Adventure`,
        storyArcs: [
          `${childName}'s family plans a special adventure together!`,
          `Each family member brings unique talents to the journey.`,
          `${childName} learns that family is the greatest treasure.`,
          `Together they overcome obstacles with love and teamwork.`,
          `Grandparents share wisdom from their own adventures.`,
          `Younger siblings look up to ${childName} with admiration.`,
          `${childName} realizes how each family member is special.`,
          `Through challenges and laughter, bonds grow stronger.`,
          `${childName} discovers home is where the heart is.`,
          `The family adventure creates memories that last forever!`
        ]
      },
      motivational: {
        title: `${childName}: The Journey to Greatness`,
        storyArcs: [
          `${childName} has a big dream that seems impossible at first.`,
          `Doubts creep in, but ${childName} decides to believe in themselves.`,
          `${childName} takes the first brave step toward their dream.`,
          `Obstacles appear, but ${childName} learns to see them as chances to grow.`,
          `A mentor appears and teaches ${childName} valuable life lessons.`,
          `${childName} works hard, stays focused, and never gives up.`,
          `Progress comes slowly, but ${childName} celebrates every small win.`,
          `${childName} discovers their true strength was inside all along.`,
          `The dream becomes reality through courage and determination.`,
          `${childName} inspires others to believe in their own dreams too!`
        ]
      }
    };

    const ageGroupHint = {
      '0-2': 'very simple and gentle',
      '3-5': 'fun, colorful, and easy to follow',
      '5-8': 'exciting with good lessons',
      '8-12': 'adventurous and thought-provoking'
    };

    const selectedTheme = themeContent[theme] || themeContent.adventure;
    const storyArcs = selectedTheme.storyArcs || [];
    const pages = pageCount || 20;
    const ageHint = ageGroupHint[ageGroup] || 'engaging and meaningful';

    // Create pages array with real story content
    const pagesArray = [];
    const arcsPerPage = Math.ceil(storyArcs.length / pages);
    
    // Map themes to color schemes for placeholder images
    const themeColors = {
      adventure: 'FF6B6B-4ECDC4',
      fantasy: '9B59B6-3498DB',
      friends: 'F39C12-E74C3C',
      family: '2ECC71-27AE60',
      motivational: 'E67E22-C0392B'
    };
    
    const colorScheme = themeColors[theme] || '667EEA-764BA2';
    
    for (let i = 0; i < pages; i++) {
      const arcStart = i * arcsPerPage;
      const arcEnd = Math.min((i + 1) * arcsPerPage, storyArcs.length);
      const pageArcs = storyArcs.slice(arcStart, arcEnd);
      const pageContent = pageArcs.join(' ');
      
      // Use placeholder image service for better illustrations
      const pageIllustration = `https://via.placeholder.com/600x400/${colorScheme}?text=${encodeURIComponent(`Page ${i + 1}`)}`;
      
      pagesArray.push({
        pageNumber: i + 1,
        title: `${selectedTheme.title} - Page ${i + 1}`,
        content: pageContent || `${childName}'s story continues...`,
        text: pageContent || `${childName}'s story continues...`,
        illustrationUrl: pageIllustration,
        image: pageIllustration,
        htmlContent: `
          <div style="padding: 20px; font-family: 'Comic Sans MS', cursive; line-height: 1.8;">
            <h3 style="color: #667eea; margin-bottom: 15px;">✨ Page ${i + 1}: ${selectedTheme.title}</h3>
            <p style="color: #333; font-size: 16px;">${pageContent || `${childName}'s amazing story unfolds...`}</p>
            <div style="margin-top: 20px; text-align: center;">
              <img src="${pageIllustration}" alt="Page ${i + 1}" style="max-width: 100%; height: auto; border-radius: 10px;" />
            </div>
          </div>
        `
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
        <h2>${childName}'s ${selectedTheme.title}</h2>
        <p>Once upon a time, there was a special child named ${childName}. This is a special story created just for them.</p>
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
              ${childName}'s journey was filled with magic and wonder. With each new challenge, 
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
