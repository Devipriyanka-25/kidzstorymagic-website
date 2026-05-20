/**
 * Tests for Phase 1 story-level consistency lock helpers in storyDrafts.js.
 */

import {
  buildConsistencyLock,
  getConsistencyLock,
  getChildIdentityProfile,
  mergeIdentityMetadata,
} from '@/app/api/shared/storyDrafts';

describe('buildConsistencyLock', () => {
  it('creates a lock with required fields', () => {
    const lock = buildConsistencyLock();

    expect(lock).toHaveProperty('characterProfile');
    expect(lock).toHaveProperty('illustrationStyle');
    expect(lock).toHaveProperty('outfitPalette');
    expect(lock).toHaveProperty('referenceImageIds');
    expect(lock).toHaveProperty('seed');
    expect(lock).toHaveProperty('modelProvider');
    expect(lock).toHaveProperty('modelVersion');
    expect(lock).toHaveProperty('createdAt');
  });

  it('defaults illustrationStyle to a soft magical storybook value', () => {
    const lock = buildConsistencyLock();
    expect(lock.illustrationStyle).toBe('soft magical storybook');
  });

  it('stores provided characterProfile, outfitPalette and referenceImageIds', () => {
    const profile = { childName: 'Lily', approximateAge: 4 };
    const lock = buildConsistencyLock({
      characterProfile: profile,
      outfitPalette: ['#FFD700'],
      referenceImageIds: ['img-1', 'img-2'],
      seed: 42,
      modelProvider: 'REPLICATE_IDENTITY',
      modelVersion: 'photomaker',
    });

    expect(lock.characterProfile).toEqual(profile);
    expect(lock.outfitPalette).toEqual(['#FFD700']);
    expect(lock.referenceImageIds).toEqual(['img-1', 'img-2']);
    expect(lock.seed).toBe(42);
    expect(lock.modelProvider).toBe('REPLICATE_IDENTITY');
    expect(lock.modelVersion).toBe('photomaker');
  });

  it('coerces non-array outfitPalette and referenceImageIds to empty arrays', () => {
    const lock = buildConsistencyLock({
      outfitPalette: null,
      referenceImageIds: 'not-an-array',
    });

    expect(lock.outfitPalette).toEqual([]);
    expect(lock.referenceImageIds).toEqual([]);
  });

  it('sets createdAt to an ISO string close to now', () => {
    const before = Date.now();
    const lock = buildConsistencyLock();
    const after = Date.now();

    const ts = new Date(lock.createdAt).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('getConsistencyLock', () => {
  it('returns null when photo_metadata is absent', () => {
    expect(getConsistencyLock({})).toBeNull();
    expect(getConsistencyLock({ photo_metadata: {} })).toBeNull();
  });

  it('returns the lock when present', () => {
    const lock = buildConsistencyLock({ modelVersion: 'instantid' });
    const project = { photo_metadata: { consistencyLock: lock } };
    expect(getConsistencyLock(project)).toEqual(lock);
  });

  it('returns null for non-object consistencyLock values', () => {
    const project = { photo_metadata: { consistencyLock: 'invalid' } };
    expect(getConsistencyLock(project)).toBeNull();
  });
});

describe('getChildIdentityProfile', () => {
  it('returns null when not present', () => {
    expect(getChildIdentityProfile({})).toBeNull();
  });

  it('returns the profile when stored', () => {
    const profile = { childName: 'Ava', approximateAge: 5 };
    const project = { photo_metadata: { childIdentityProfile: profile } };
    expect(getChildIdentityProfile(project)).toEqual(profile);
  });
});

describe('mergeIdentityMetadata', () => {
  it('does not overwrite unrelated metadata keys', () => {
    const project = {
      photo_metadata: { draftFlow: { isActive: true }, someOtherKey: 'value' },
    };
    const result = mergeIdentityMetadata(project, {
      consistencyLock: buildConsistencyLock(),
    });

    expect(result.draftFlow).toEqual({ isActive: true });
    expect(result.someOtherKey).toBe('value');
    expect(result.consistencyLock).toBeDefined();
  });

  it('stores both consistencyLock and childIdentityProfile when both provided', () => {
    const project = { photo_metadata: {} };
    const lock = buildConsistencyLock();
    const profile = { childName: 'Leo', approximateAge: 3 };

    const result = mergeIdentityMetadata(project, {
      consistencyLock: lock,
      childIdentityProfile: profile,
    });

    expect(result.consistencyLock).toEqual(lock);
    expect(result.childIdentityProfile).toEqual(profile);
  });

  it('skips null fields without writing them', () => {
    const project = {
      photo_metadata: { consistencyLock: buildConsistencyLock() },
    };

    const result = mergeIdentityMetadata(project, {
      consistencyLock: null,
      childIdentityProfile: null,
    });

    // Existing lock should survive; no null write
    expect(result.consistencyLock).toBeDefined();
    expect(result.childIdentityProfile).toBeUndefined();
  });
});
