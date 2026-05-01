/**
 * Save Photo Selection Endpoint
 * POST /api/story/[projectId]/save-photo-selection
 *
 * Persists the selected photo and illustration cache in story metadata so
 * refresh/resume flows can avoid regenerating for the same selected photo.
 */

import { NextResponse } from 'next/server';

import { resolveRequestUser } from '../../../shared/requestAuth.js';
import {
  getStoryProjectById,
  updateStoryProjectRecord,
} from '../../../shared/storyProjects.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_PHOTO_SELECTION = {
  selectedPhotoIndex: -1,
  lastGeneratedPhotoIndex: -1,
  photoIllustrationCache: {},
};

function normalizePhotoIndex(value) {
  const normalized = Number(value);
  return Number.isInteger(normalized) ? normalized : -1;
}

function normalizePhotoSelection(body = {}) {
  const uploadedImages = Array.isArray(body.uploadedImages)
    ? body.uploadedImages
    : [];

  return {
    selectedPhotoIndex: normalizePhotoIndex(body.selectedPhotoIndex),
    lastGeneratedPhotoIndex: normalizePhotoIndex(body.lastGeneratedPhotoIndex),
    photoIllustrationCache:
      body.photoIllustrationCache &&
      typeof body.photoIllustrationCache === 'object'
        ? body.photoIllustrationCache
        : {},
    uploadedImagesCount: uploadedImages.length,
    savedAt: new Date().toISOString(),
  };
}

function readPhotoSelection(project) {
  return project?.photo_metadata?.photoSelection || DEFAULT_PHOTO_SELECTION;
}

export async function POST(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const projectId = params.projectId;
    const project = await getStoryProjectById(authUser.id, projectId);

    if (!project) {
      return NextResponse.json(
        { error: 'Story project not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const photoSelection = normalizePhotoSelection(body);

    await updateStoryProjectRecord(authUser.id, projectId, {
      photo_metadata: {
        ...(project.photo_metadata || {}),
        photoSelection,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Photo selection saved',
        photoSelection,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SAVE_PHOTO_SELECTION] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save photo selection',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { error, authUser } = await resolveRequestUser(request);
    if (error) {
      return error;
    }

    const project = await getStoryProjectById(authUser.id, params.projectId);

    if (!project) {
      return NextResponse.json(
        {
          success: true,
          photoSelection: DEFAULT_PHOTO_SELECTION,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        photoSelection: readPhotoSelection(project),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[LOAD_PHOTO_SELECTION] Error:', error);
    return NextResponse.json(
      {
        success: true,
        photoSelection: DEFAULT_PHOTO_SELECTION,
      },
      { status: 200 }
    );
  }
}
