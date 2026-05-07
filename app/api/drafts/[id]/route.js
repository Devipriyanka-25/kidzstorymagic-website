/**
 * Draft Story Detail Endpoint
 * GET /api/drafts/[id] - Get draft
 * PUT /api/drafts/[id] - Update draft
 * DELETE /api/drafts/[id] - Delete draft
 */

import { NextResponse } from 'next/server';
import {
  deleteStoryProjectRecord,
  getStoryProjectById,
  listStoryProjectPages,
  replaceStoryProjectPages,
  resolveAuthenticatedStoryUser,
  updateStoryProjectRecord,
} from '../../shared/storyProjects.js';
import {
  buildDraftResponse,
  EXPIRABLE_DRAFT_STATUSES,
  isDraftExpired,
} from '../../shared/storyDrafts.js';

const jwt = require('jsonwebtoken');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getJwtSecret() {
  return (
    process.env.JWT_SECRET ||
    'kidz-story-magic-jwt-secret-key-2024-production-secure-random-12345'
  );
}

async function resolveRequestUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.substring(7);

  let decoded;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch (error) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // Trust the JWT token directly - it has been cryptographically verified
  if (!decoded?.id) {
    return {
      error: NextResponse.json(
        { error: 'Invalid token: missing user ID' },
        { status: 401 }
      ),
    };
  }

  // Create an authUser object from the decoded JWT
  const authUser = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name || decoded.email,
  };

  return { authUser };
}

export async function GET(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const draft = await getStoryProjectById(authUser.id, params.id);

    if (!draft || draft.status === 'published') {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (
      EXPIRABLE_DRAFT_STATUSES.includes(String(draft.status || '').toLowerCase()) &&
      isDraftExpired(draft)
    ) {
      await deleteStoryProjectRecord(authUser.id, params.id);
      return NextResponse.json(
        { error: 'Draft expired and was deleted.' },
        { status: 404 }
      );
    }

    const pages = await listStoryProjectPages(params.id);

    return NextResponse.json(
      {
        success: true,
        draft: buildDraftResponse(draft, pages),
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
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const body = await request.json();
    const existingDraft = await getStoryProjectById(authUser.id, params.id);

    if (!existingDraft || existingDraft.status === 'published') {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (
      EXPIRABLE_DRAFT_STATUSES.includes(
        String(existingDraft.status || '').toLowerCase()
      ) &&
      isDraftExpired(existingDraft)
    ) {
      await deleteStoryProjectRecord(authUser.id, params.id);
      return NextResponse.json(
        { error: 'Draft expired and was deleted.' },
        { status: 404 }
      );
    }

    const updatedDraft = await updateStoryProjectRecord(authUser.id, params.id, {
      title: body.title,
      description: body.description,
      age_group: body.age_group || body.ageGroup,
      theme: body.theme,
      illustration_style: body.illustration_style || body.illustrationStyle,
      page_count: body.page_count || body.pageCount,
      child_name: body.child_name || body.childName,
      child_gender: body.child_gender || body.childGender,
      child_interests: body.child_interests || body.childInterests,
      child_notes: body.child_notes || body.childNotes,
      status: body.status,
      current_step: body.current_step || body.currentStep,
      preview_url: body.preview_url || body.previewUrl,
      published_pdf_url: body.published_pdf_url || body.publishedPdfUrl,
      photo_metadata: body.photo_metadata,
    });

    if (!updatedDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    const storyPages =
      body?.pages ||
      body?.story?.pages ||
      null;

    const pages = Array.isArray(storyPages)
      ? await replaceStoryProjectPages(params.id, storyPages)
      : await listStoryProjectPages(params.id);

    return NextResponse.json(
      {
        success: true,
        draft: buildDraftResponse(updatedDraft, pages),
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
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const deletedDraft = await deleteStoryProjectRecord(authUser.id, params.id);

    if (!deletedDraft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

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
