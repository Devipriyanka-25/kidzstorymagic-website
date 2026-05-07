const {
  buildStoryIllustrationStoragePath,
  isDurableStoryAssetUrl,
} = require('@/app/api/shared/storyAssetStorage.js');

describe('storyAssetStorage', () => {
  it('detects durable story asset URLs from the public bucket', () => {
    expect(
      isDurableStoryAssetUrl(
        'https://wwninqezevmxlvtjhruo.supabase.co/storage/v1/object/public/story-assets/story-illustrations/51/page-2-abc123.png'
      )
    ).toBe(true);
    expect(
      isDurableStoryAssetUrl(
        'https://replicate.delivery/xezq/example-temporary-image.png'
      )
    ).toBe(false);
  });

  it('builds stable illustration storage paths per project and page', () => {
    const firstPath = buildStoryIllustrationStoragePath({
      projectId: 51,
      pageNumber: 2,
      sourceValue: 'https://replicate.delivery/xezq/example-image.png',
      extension: 'png',
    });
    const secondPath = buildStoryIllustrationStoragePath({
      projectId: 51,
      pageNumber: 2,
      sourceValue: 'https://replicate.delivery/xezq/example-image.png',
      extension: 'png',
    });

    expect(firstPath).toBe(secondPath);
    expect(firstPath).toContain('story-illustrations/51/page-2-');
    expect(firstPath.endsWith('.png')).toBe(true);
  });
});
