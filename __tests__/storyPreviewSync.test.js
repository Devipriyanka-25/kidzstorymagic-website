const {
  getStoryPreviewMetrics,
  selectBestStoryPreview,
  shouldPreferStoryPreview,
} = require('@/utils/storyPreviewSync');

describe('storyPreviewSync', () => {
  it('prefers the preview with more completed story illustrations', () => {
    const textOnlyPreview = [
      { pageNumber: 1, pageType: 'cover', text: 'Cover' },
      { pageNumber: 2, pageType: 'story', text: 'Page 2 text' },
      { pageNumber: 3, pageType: 'story', text: 'Page 3 text' },
      { pageNumber: 4, pageType: 'end', text: 'The End' },
    ];
    const illustratedPreview = [
      { pageNumber: 1, pageType: 'cover', text: 'Cover' },
      {
        pageNumber: 2,
        pageType: 'story',
        text: 'Page 2 text',
        illustrationUrl: 'https://cdn.example.com/page-2.png',
      },
      {
        pageNumber: 3,
        pageType: 'story',
        text: 'Page 3 text',
        illustrationUrl: 'https://cdn.example.com/page-3.png',
      },
      { pageNumber: 4, pageType: 'end', text: 'The End' },
    ];

    expect(
      shouldPreferStoryPreview(illustratedPreview, textOnlyPreview)
    ).toBe(true);
    expect(
      selectBestStoryPreview([textOnlyPreview, illustratedPreview])
    ).toBe(illustratedPreview);
  });

  it('keeps the existing preview when the incoming copy is less complete', () => {
    const localPreview = [
      { pageNumber: 1, pageType: 'cover', text: 'Cover' },
      {
        pageNumber: 2,
        pageType: 'story',
        text: 'Page 2 text',
        faceSwappedUrl: 'https://cdn.example.com/page-2-swapped.png',
      },
      {
        pageNumber: 3,
        pageType: 'story',
        text: 'Page 3 text',
        illustrationUrl: 'https://cdn.example.com/page-3.png',
      },
      { pageNumber: 4, pageType: 'end', text: 'The End' },
    ];
    const serverPreview = [
      { pageNumber: 1, pageType: 'cover', text: 'Cover' },
      { pageNumber: 2, pageType: 'story', text: 'Page 2 text' },
      { pageNumber: 3, pageType: 'story', text: 'Page 3 text' },
      { pageNumber: 4, pageType: 'end', text: 'The End' },
    ];

    expect(shouldPreferStoryPreview(serverPreview, localPreview)).toBe(false);
    expect(selectBestStoryPreview([serverPreview, localPreview])).toBe(
      localPreview
    );
  });

  it('counts ready story illustrations separately from text-only pages', () => {
    const preview = [
      { pageNumber: 1, pageType: 'cover', text: 'Cover' },
      {
        pageNumber: 2,
        pageType: 'story',
        text: 'Page 2 text',
        illustrationPrompt: 'A bright scene',
        illustrationUrl: 'https://cdn.example.com/page-2.png',
      },
      {
        pageNumber: 3,
        pageType: 'story',
        text: 'Page 3 text',
        illustrationPrompt: 'Another bright scene',
      },
      { pageNumber: 4, pageType: 'end', text: 'The End' },
    ];

    expect(getStoryPreviewMetrics(preview)).toEqual({
      pageCount: 4,
      storyPages: 2,
      readyIllustrations: 1,
      textPages: 4,
      promptPages: 2,
      pagesWithAnyImage: 1,
    });
  });
});
