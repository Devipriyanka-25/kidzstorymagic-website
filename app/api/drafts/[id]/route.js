/**
 * Draft Story Detail Endpoint
 * GET /api/drafts/[id] - Get draft
 * PUT /api/drafts/[id] - Update draft
 * DELETE /api/drafts/[id] - Delete draft
 */

import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory storage (shared with user drafts)
const userDrafts = new Map();

export async function GET(request, { params }) {
  try {
    const { id } = params;

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

    console.log('[DRAFT] Getting draft:', id);

    // Find draft
    const userId = decoded.id || decoded.email;
    const userDraftsList = userDrafts.get(userId) || [];
    const draft = userDraftsList.find(d => d.id === id);

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    console.log('[DRAFT] ✓ Draft found');

    return NextResponse.json(
      {
        success: true,
        draft,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DRAFT] Error:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to get draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

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
    console.log('[DRAFT] Updating draft:', id, body);

    // Find and update draft
    const userId = decoded.id || decoded.email;
    const userDraftsList = userDrafts.get(userId) || [];
    const draftIndex = userDraftsList.findIndex(d => d.id === id);

    if (draftIndex === -1) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Update draft properties
    userDraftsList[draftIndex] = {
      ...userDraftsList[draftIndex],
      ...body,
      id, // Prevent ID change
      updatedAt: new Date().toISOString(),
    };

    console.log('[DRAFT] ✓ Draft updated');

    return NextResponse.json(
      {
        success: true,
        draft: userDraftsList[draftIndex],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DRAFT] Error updating:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to update draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

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

    console.log('[DRAFT] Deleting draft:', id);

    // Find and delete draft
    const userId = decoded.id || decoded.email;
    const userDraftsList = userDrafts.get(userId) || [];
    const draftIndex = userDraftsList.findIndex(d => d.id === id);

    if (draftIndex === -1) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    // Remove draft
    const deletedDraft = userDraftsList.splice(draftIndex, 1)[0];

    console.log('[DRAFT] ✓ Draft deleted');

    return NextResponse.json(
      {
        success: true,
        message: 'Draft deleted',
        draft: deletedDraft,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DRAFT] Error deleting:', error.message);
    return NextResponse.json(
      {
        error: 'Failed to delete draft',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
