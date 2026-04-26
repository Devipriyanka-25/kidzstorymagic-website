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

  const authUser = await resolveAuthenticatedStoryUser(decoded);
  if (!authUser?.id) {
    return {
      error: NextResponse.json(
        { error: 'Authenticated user could not be resolved.' },
        { status: 401 }
      ),
    };
  }

  return { authUser };
}

function buildDraftResponse(draft, pages = []) {
  return {
    ...draft,
    pages,
    formData: {
      projectId: draft.id,
      childName: draft.child_name || draft.childName || '',
      childGender: draft.child_gender || draft.childGender || '',
      ageGroup: draft.age_group || draft.ageGroup || '',
      theme: draft.theme || '',
      illustrationStyle:
        draft.illustration_style || draft.illustrationStyle || '',
      pageCount: draft.page_count || draft.pageCount || 10,
      childInterests: draft.child_interests || draft.childInterests || '',
      childNotes: draft.child_notes || draft.childNotes || '',
    },
  };
}

export async function GET(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const [draft, pages] = await Promise.all([
      getStoryProjectById(authUser.id, params.id),
      listStoryProjectPages(params.id),
    ]);

    if (!draft || draft.status === 'published') {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

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

