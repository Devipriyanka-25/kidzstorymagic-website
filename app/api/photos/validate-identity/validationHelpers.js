/**
 * Pure validation helpers for /api/photos/validate-identity.
 * Extracted so they can be unit-tested without importing next/server.
 */

import sharp from 'sharp';

// ─── Constants ────────────────────────────────────────────────────────────────

export const MIN_PHOTOS = 5;
export const MAX_PHOTOS = 20;
export const MIN_RESOLUTION = 768; // px on shortest side
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Minimum greyscale standard deviation before a photo is considered blurry.
 * Higher values mean a stricter sharpness requirement (lower = more permissive).
 */
export const MIN_SHARPNESS_STDDEV = 12;

/**
 * Minimum fraction of image area that the estimated face bounding box should
 * cover before we consider the face "too small".
 */
export const MIN_FACE_AREA_RATIO = 0.04; // 4 % of image

// Face coverage estimation ratios (used in estimateFaceAreaRatio)
const ESTIMATED_FACE_WIDTH_RATIO = 0.5;  // face occupies ~50% of image width
const ESTIMATED_FACE_HEIGHT_RATIO = 0.55; // face occupies ~55% of image height

export const ACCEPTED_ANGLES = [
  'front',
  'slight-left',
  'slight-right',
  'smiling',
  'neutral',
];

// ─── Validation helpers ───────────────────────────────────────────────────────

/**
 * Validate a single photo buffer using sharp for metadata + stats.
 * Returns `{ valid: true, ...metrics }` or `{ valid: false, reason, friendly }`.
 *
 * @param {Buffer} buffer
 * @param {string} [mimeType]
 */
export async function validatePhotoBuffer(buffer, mimeType = 'image/jpeg') {
  let metadata;
  let stats;

  try {
    const image = sharp(buffer);
    [metadata, stats] = await Promise.all([image.metadata(), image.stats()]);
  } catch {
    return {
      valid: false,
      reason: 'unreadable',
      friendly: 'This photo could not be read. Please upload a clear JPEG or PNG image.',
    };
  }

  // 1) Resolution check
  const shortestSide = Math.min(metadata.width || 0, metadata.height || 0);
  if (shortestSide < MIN_RESOLUTION) {
    return {
      valid: false,
      reason: 'low_resolution',
      friendly: `Photo resolution is too low (${metadata.width}×${metadata.height}). Please use a photo that is at least ${MIN_RESOLUTION}px on the shortest side.`,
    };
  }

  // 2) Sharpness / blur check (greyscale stddev as proxy)
  const greyscaleStddev = stats?.channels?.[0]?.stdev ?? 0;
  if (greyscaleStddev < MIN_SHARPNESS_STDDEV) {
    return {
      valid: false,
      reason: 'blurry',
      friendly: 'This photo looks blurry. Please upload a sharper, well-focused photo.',
    };
  }

  // 3) Brightness / lighting check
  const meanBrightness = stats?.channels?.[0]?.mean ?? 128;
  if (meanBrightness < 30) {
    return {
      valid: false,
      reason: 'too_dark',
      friendly: 'This photo is too dark. Please take a photo in better lighting.',
    };
  }
  if (meanBrightness > 230) {
    return {
      valid: false,
      reason: 'too_bright',
      friendly: 'This photo is overexposed. Please avoid harsh direct light.',
    };
  }

  return {
    valid: true,
    width: metadata.width,
    height: metadata.height,
    greyscaleStddev,
    meanBrightness,
  };
}

/**
 * Estimate face coverage as a fraction of total image area.
 * This is a heuristic; Phase 2 should replace it with a real detector.
 *
 * @param {number} width   – image width in px
 * @param {number} height  – image height in px
 * @returns {number} ratio between 0 and 1
 */
export function estimateFaceAreaRatio(width, height) {
  const estimatedFaceWidth = width * ESTIMATED_FACE_WIDTH_RATIO;
  const estimatedFaceHeight = height * ESTIMATED_FACE_HEIGHT_RATIO;
  return (estimatedFaceWidth * estimatedFaceHeight) / (width * height);
}

/**
 * Derive a child identity profile from validated photos + user metadata.
 * Visual attributes (hairstyle, etc.) are stubbed for Phase 2.
 *
 * @param {object} opts
 * @param {string}   [opts.childName]
 * @param {string|number} [opts.childAge]
 * @param {string}   [opts.childGender]
 * @param {string}   [opts.outfitPreference]
 * @param {Array}    opts.validatedPhotos  – output from per-photo validation
 * @returns {object} childIdentityProfile
 */
export function buildChildIdentityProfile({
  childName,
  childAge,
  childGender,
  outfitPreference,
  validatedPhotos,
}) {
  return {
    childName: childName || null,
    approximateAge: childAge ? Number(childAge) : null,
    gender: childGender || null,
    // Visual attributes – populated by Phase 2 vision model; stubbed here.
    hairstyle: null,
    hairColor: null,
    skinTone: null,
    faceShape: null,
    eyeColor: null,
    outfitPreference: outfitPreference || null,
    // Derived from photos
    referencePhotoCount: validatedPhotos.length,
    referencePhotoStats: validatedPhotos.map((p) => ({
      index: p.index,
      width: p.width,
      height: p.height,
      sharpness: p.greyscaleStddev,
    })),
    profileCreatedAt: new Date().toISOString(),
    // Placeholder flags for Phase 2 – will be populated once the vision model runs.
    visualAttributesExtracted: false,
    // Timestamp of when visual attribute extraction completes (null until Phase 2).
    visualAttributesExtractionTimestamp: null,
  };
}
