/**
 * POST /api/photos/validate-identity
 *
 * Phase 1 – Upload validation + child identity profile builder.
 *
 * Accepts 5–20 child photos as multipart/form-data, validates quality,
 * and returns a structured child identity profile that can be persisted
 * with the draft/project.
 *
 * Expected form fields
 *   photos          – File[] (5-20 images)
 *   childName       – string (optional)
 *   childAge        – number (optional)
 *   childGender     – string (optional)
 *   outfitPreference – string (optional)
 */

import { NextResponse } from 'next/server';
import {
  MIN_PHOTOS,
  MAX_PHOTOS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  validatePhotoBuffer,
  buildChildIdentityProfile,
} from './validationHelpers.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Re-export helpers so callers can import them from the route path if needed.
export {
  MIN_PHOTOS,
  MAX_PHOTOS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  validatePhotoBuffer,
  buildChildIdentityProfile,
} from './validationHelpers.js';

export {
  MIN_RESOLUTION,
  MIN_SHARPNESS_STDDEV,
  MIN_FACE_AREA_RATIO,
  ACCEPTED_ANGLES,
  estimateFaceAreaRatio,
} from './validationHelpers.js';

export async function POST(request) {
  console.log('[VALIDATE_IDENTITY] Received upload validation request');

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid multipart form data.' },
      { status: 400 }
    );
  }

  // Collect all uploaded photos (field name "photos" or "photo[N]")
  const photoFiles = [];
  for (const [key, value] of formData.entries()) {
    if ((key === 'photos' || key.startsWith('photo')) && value instanceof Blob) {
      photoFiles.push(value);
    }
  }

  console.log(`[VALIDATE_IDENTITY] Received ${photoFiles.length} photo(s)`);

  // ── Minimum photo count check ────────────────────────────────────────────
  if (photoFiles.length < MIN_PHOTOS) {
    return NextResponse.json(
      {
        error: 'not_enough_photos',
        message: `Please upload at least ${MIN_PHOTOS} photos of your child (front, slight left, slight right, smiling, and neutral expression).`,
        received: photoFiles.length,
        required: MIN_PHOTOS,
      },
      { status: 422 }
    );
  }

  if (photoFiles.length > MAX_PHOTOS) {
    return NextResponse.json(
      {
        error: 'too_many_photos',
        message: `Please upload no more than ${MAX_PHOTOS} photos at a time.`,
        received: photoFiles.length,
        limit: MAX_PHOTOS,
      },
      { status: 422 }
    );
  }

  // ── Per-photo validation ──────────────────────────────────────────────────
  const photoErrors = [];
  const validatedPhotos = [];

  for (let i = 0; i < photoFiles.length; i++) {
    const file = photoFiles[i];

    // File size guard
    if (file.size > MAX_FILE_SIZE_BYTES) {
      photoErrors.push({
        index: i + 1,
        reason: 'file_too_large',
        friendly: `Photo ${i + 1} is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
      });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await validatePhotoBuffer(buffer, file.type);

    if (!result.valid) {
      photoErrors.push({
        index: i + 1,
        reason: result.reason,
        friendly: `Photo ${i + 1}: ${result.friendly}`,
      });
      continue;
    }

    validatedPhotos.push({
      index: i + 1,
      width: result.width,
      height: result.height,
      greyscaleStddev: result.greyscaleStddev,
      meanBrightness: result.meanBrightness,
    });
  }

  // ── Return validation errors if not enough valid photos remain ────────────
  // If some photos failed but we still have >= MIN_PHOTOS valid ones,
  // proceed with warnings. Only hard-fail when valid count drops below MIN_PHOTOS.
  if (validatedPhotos.length < MIN_PHOTOS) {
    console.warn(
      `[VALIDATE_IDENTITY] Only ${validatedPhotos.length}/${photoFiles.length} photos passed – below minimum of ${MIN_PHOTOS}`
    );
    return NextResponse.json(
      {
        error: 'photo_validation_failed',
        message: `At least ${MIN_PHOTOS} valid photos are required, but only ${validatedPhotos.length} of ${photoFiles.length} passed quality checks. Please review the errors below and re-upload the affected photos.`,
        photoErrors,
        validCount: validatedPhotos.length,
        totalCount: photoFiles.length,
        requiredCount: MIN_PHOTOS,
      },
      { status: 422 }
    );
  }

  // ── Build child identity profile ──────────────────────────────────────────
  const childName = formData.get('childName') || '';
  const childAge = formData.get('childAge') || '';
  const childGender = formData.get('childGender') || '';
  const outfitPreference = formData.get('outfitPreference') || '';

  const childIdentityProfile = buildChildIdentityProfile({
    childName,
    childAge,
    childGender,
    outfitPreference,
    validatedPhotos,
  });

  console.log(`[VALIDATE_IDENTITY] ✓ ${validatedPhotos.length} photos passed validation (${photoErrors.length} rejected)`);
  console.log(`[REFERENCE_IMAGES_COUNT] ${validatedPhotos.length}`);

  const warnings = photoErrors.length > 0
    ? photoErrors.map((e) => e.friendly)
    : [];

  return NextResponse.json(
    {
      success: true,
      message: `${validatedPhotos.length} photos validated successfully. Child identity profile created.`,
      ...(warnings.length > 0 && {
        warnings,
        warningMessage: `${photoErrors.length} photo(s) were skipped due to quality issues. The remaining ${validatedPhotos.length} photos will be used.`,
      }),
      childIdentityProfile,
      validatedCount: validatedPhotos.length,
      skippedCount: photoErrors.length,
      skippedPhotos: photoErrors.length > 0 ? photoErrors : undefined,
      // Callers should persist this profile with their draft.
      // Use POST /api/story/save-draft with body.childIdentityProfile = childIdentityProfile.
    },
    { status: 200 }
  );
}
