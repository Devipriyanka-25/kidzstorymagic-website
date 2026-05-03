/**
 * Tests for /api/photos/validate-identity – pure helper functions.
 *
 * Network calls and sharp I/O are not made here; we test the exported
 * validation logic, profile builder, and error-shape constants.
 */

import {
  MIN_PHOTOS,
  MAX_PHOTOS,
  MIN_RESOLUTION,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MIN_SHARPNESS_STDDEV,
  MIN_FACE_AREA_RATIO,
  estimateFaceAreaRatio,
  buildChildIdentityProfile,
} from '@/app/api/photos/validate-identity/validationHelpers';

describe('validate-identity constants', () => {
  it('requires at least 5 photos', () => {
    expect(MIN_PHOTOS).toBe(5);
  });

  it('allows up to 20 photos', () => {
    expect(MAX_PHOTOS).toBe(20);
  });

  it('enforces minimum 768px resolution', () => {
    expect(MIN_RESOLUTION).toBe(768);
  });

  it('caps file size at 10 MB', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    expect(MAX_FILE_SIZE_MB).toBe(10);
  });
});

describe('estimateFaceAreaRatio', () => {
  it('returns a ratio between 0 and 1', () => {
    const ratio = estimateFaceAreaRatio(1024, 768);
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(1);
  });

  it('estimates face area as at least MIN_FACE_AREA_RATIO for a typical photo', () => {
    // 1024×768 portrait photo should always exceed the minimum
    const ratio = estimateFaceAreaRatio(1024, 768);
    expect(ratio).toBeGreaterThanOrEqual(MIN_FACE_AREA_RATIO);
  });

  it('scales correctly for different image sizes', () => {
    const small = estimateFaceAreaRatio(200, 200);
    const large = estimateFaceAreaRatio(4000, 3000);
    // The ratio should be the same regardless of absolute size
    expect(Math.abs(small - large)).toBeLessThan(0.01);
  });
});

describe('buildChildIdentityProfile', () => {
  const baseValidatedPhotos = [
    { index: 1, width: 1024, height: 768, greyscaleStddev: 45, meanBrightness: 130 },
    { index: 2, width: 1080, height: 1080, greyscaleStddev: 50, meanBrightness: 140 },
    { index: 3, width: 800, height: 800, greyscaleStddev: 40, meanBrightness: 120 },
    { index: 4, width: 900, height: 700, greyscaleStddev: 55, meanBrightness: 150 },
    { index: 5, width: 960, height: 720, greyscaleStddev: 48, meanBrightness: 135 },
  ];

  it('stores the child name and age from user-supplied metadata', () => {
    const profile = buildChildIdentityProfile({
      childName: 'Emma',
      childAge: '3',
      childGender: 'girl',
      outfitPreference: 'pastel',
      validatedPhotos: baseValidatedPhotos,
    });

    expect(profile.childName).toBe('Emma');
    expect(profile.approximateAge).toBe(3);
    expect(profile.gender).toBe('girl');
    expect(profile.outfitPreference).toBe('pastel');
  });

  it('counts the validated reference photos', () => {
    const profile = buildChildIdentityProfile({
      validatedPhotos: baseValidatedPhotos,
    });

    expect(profile.referencePhotoCount).toBe(5);
  });

  it('includes per-photo sharpness stats', () => {
    const profile = buildChildIdentityProfile({
      validatedPhotos: baseValidatedPhotos,
    });

    expect(Array.isArray(profile.referencePhotoStats)).toBe(true);
    expect(profile.referencePhotoStats).toHaveLength(5);
    expect(profile.referencePhotoStats[0]).toMatchObject({
      index: 1,
      width: 1024,
      height: 768,
      sharpness: 45,
    });
  });

  it('marks visual attributes as not yet extracted (Phase 2 placeholder)', () => {
    const profile = buildChildIdentityProfile({
      validatedPhotos: baseValidatedPhotos,
    });

    expect(profile.visualAttributesExtracted).toBe(false);
    expect(profile.hairstyle).toBeNull();
    expect(profile.hairColor).toBeNull();
    expect(profile.skinTone).toBeNull();
    expect(profile.faceShape).toBeNull();
    expect(profile.eyeColor).toBeNull();
  });

  it('handles missing optional fields gracefully', () => {
    const profile = buildChildIdentityProfile({
      validatedPhotos: baseValidatedPhotos,
    });

    expect(profile.childName).toBeNull();
    expect(profile.approximateAge).toBeNull();
    expect(profile.gender).toBeNull();
    expect(profile.outfitPreference).toBeNull();
  });

  it('sets a profileCreatedAt ISO timestamp', () => {
    const before = Date.now();
    const profile = buildChildIdentityProfile({
      validatedPhotos: baseValidatedPhotos,
    });
    const after = Date.now();

    const ts = new Date(profile.profileCreatedAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
