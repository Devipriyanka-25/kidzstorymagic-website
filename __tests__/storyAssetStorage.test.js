const {
  buildStoryIllustrationStoragePath,
  isDurableStoryAssetUrl,
  persistStoryPreviewAssets,
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

  it('keeps temporary svg preview cards out of durable asset persistence', async () => {
    const temporaryPreviewUrl =
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3C/svg%3E';
    const pages = await persistStoryPreviewAssets(51, [
      {
        pageNumber: 2,
        pageType: 'story',
        text: 'Page 2 text',
        illustrationUrl: temporaryPreviewUrl,
        image_url: temporaryPreviewUrl,
      },
    ]);

    expect(pages).toEqual([
      expect.objectContaining({
        illustrationUrl: temporaryPreviewUrl,
        image_url: temporaryPreviewUrl,
      }),
    ]);
  });

  it('prefers the completed illustration when a temporary placeholder also exists', async () => {
    const temporaryPreviewUrl =
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3C/svg%3E';
    const completedIllustrationUrl =
      'https://replicate.delivery/xezq/example-final-illustration.png';
    const pages = await persistStoryPreviewAssets(51, [
      {
        pageNumber: 2,
        pageType: 'story',
        text: 'Page 2 text',
        faceSwappedUrl: temporaryPreviewUrl,
        illustrationUrl: completedIllustrationUrl,
      },
    ]);

    expect(pages).toEqual([
      expect.objectContaining({
        illustrationUrl: completedIllustrationUrl,
        faceSwappedUrl: completedIllustrationUrl,
        image_url: completedIllustrationUrl,
        image: completedIllustrationUrl,
      }),
    ]);
  });
});
