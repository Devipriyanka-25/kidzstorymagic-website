/**
 * Generate Story Endpoint
 * POST /api/story/[projectId]/generate-story
 * Generates a story for a given project
 */

import { NextResponse } from 'next/server';
import { getTranslatedStory } from '../../../lib/storyTranslations.js';
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
      storyLanguage = 'en',
    } = body;

    console.log('[GENERATE_STORY] Story language:', storyLanguage);

    // Validate required fields
    if (!childName || !ageGroup || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields: childName, ageGroup, theme' },
        { status: 400 }
      );
    }

    // Get translated story content based on language
    console.log('[GENERATE_STORY] Getting translated story for:', { language: storyLanguage, theme, childName });
    
    // Map theme names if needed (for compatibility)
    const themeMap = {
      family: 'family',
      friends: 'friends',
      motivational: 'motivational',
      adventure: 'adventure',
      fantasy: 'fantasy',
      fairytale: 'fantasy', // Fallback fairytale to fantasy
      behavioural: 'friends', // Fallback behavioral to friends
      customizable: 'adventure' // Fallback customizable to adventure
    };
    
    const mappedTheme = themeMap[theme] || 'adventure';
    const translatedStory = getTranslatedStory(storyLanguage, mappedTheme, childName);
    
    const selectedTheme = {
      title: translatedStory.title,
      storyArcs: translatedStory.arcs
    };

    const ageGroupHint = {
      '0-2': 'very simple and gentle',
      '3-5': 'fun, colorful, and easy to follow',
      '5-8': 'exciting with good lessons',
      '8-12': 'adventurous and thought-provoking'
    };

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
      
      // Generate SVG placeholder with better reliability
      const colors = themeColors[theme] ? themeColors[theme].split('-') : ['667EEA', '764BA2'];
      const gradientSVG = `
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#${colors[0]};stop-opacity:1" />
              <stop offset="100%" style="stop-color:#${colors[1]};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="600" height="400" fill="url(#grad${i})"/>
          <text x="50%" y="50%" font-size="36" font-family="Arial" fill="white" text-anchor="middle" dominant-baseline="middle">
            📖 Page ${i + 1}
          </text>
          <text x="50%" y="70%" font-size="18" font-family="Arial" fill="rgba(255,255,255,0.8)" text-anchor="middle">
            ${childName}'s Story
          </text>
        </svg>
      `;
      const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(gradientSVG).toString('base64')}`;
      
      // Fallback to a reliable image service (DiceBear for variety)
      const reliableImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${projectId}-page${i+1}&scale=90`;
      
      pagesArray.push({
        pageNumber: i + 1,
        title: `${selectedTheme.title} - Page ${i + 1}`,
        content: pageContent || `${childName}'s story continues...`,
        text: pageContent || `${childName}'s story continues...`,
        illustrationUrl: svgDataUrl,
        image: reliableImageUrl,
        htmlContent: `
          <div style="padding: 20px; font-family: 'Comic Sans MS', cursive; line-height: 1.8;">
            <h3 style="color: #667eea; margin-bottom: 15px;">✨ Page ${i + 1}: ${selectedTheme.title}</h3>
            <p style="color: #333; font-size: 16px;">${pageContent || `${childName}'s amazing story unfolds...`}</p>
            <div style="margin-top: 20px; text-align: center;">
              <img src="${reliableImageUrl}" alt="Page ${i + 1}" style="max-width: 100%; height: auto; border-radius: 10px;" />
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
