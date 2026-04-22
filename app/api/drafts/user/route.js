/**
 * Get User's Draft Stories Endpoint
 * GET /api/drafts/user
 * Returns all draft stories for authenticated user
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory storage for drafts (in production, use database)
const userDrafts = new Map();

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

    console.log('[DRAFTS] Fetching drafts for user:', decoded.id || decoded.email);

    // Get user's drafts from map (in production, query database)
    const userId = decoded.id || decoded.email;
    const userDraftsList = userDrafts.get(userId) || [];

    console.log('[DRAFTS] ✓ Found', userDraftsList.length, 'drafts');

    return NextResponse.json(
      {
        success: true,
        drafts: userDraftsList,
        count: userDraftsList.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DRAFTS] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch drafts',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST /api/drafts/user - Create new draft
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
    const { childName, theme, illustrationStyle } = body;

    if (!childName || !theme) {
      return NextResponse.json(
        { error: 'childName and theme are required' },
        { status: 400 }
      );
    }

    console.log('[DRAFTS] Creating draft for:', childName, theme);

    // Create new draft
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = decoded.id || decoded.email;

    const newDraft = {
      id: draftId,
      childName,
      theme,
      illustrationStyle: illustrationStyle || 'cartoonish',
      pageCount: 10,
      status: 'draft',
      currentStep: 1,
      title: `${childName}'s Story`,
      previewUrl: null,
      completedPages: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store draft
    if (!userDrafts.has(userId)) {
      userDrafts.set(userId, []);
    }
    userDrafts.get(userId).push(newDraft);

    console.log('[DRAFTS] ✓ Draft created:', draftId);

    return NextResponse.json(
      {
        success: true,
        draft: newDraft,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[DRAFTS] Error creating draft:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to create draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
