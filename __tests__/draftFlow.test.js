import {
  buildDraftResponse,
  getDraftExpiresAt,
  isStoryGenerationComplete,
} from '@/app/api/shared/storyDrafts';
import {
  createMagicLinkToken,
  getMagicLinkExpiry,
  hashMagicLinkToken,
} from '@/app/api/shared/magicLinks';

describe('draft flow helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps saved Step 6 generated content resumable without regeneration', () => {
    const draftExpiresAt = '2026-05-02T12:00:00.000Z';
    const pages = [
      { pageNumber: 1, title: 'Cover', text: '', image: null },
      {
        pageNumber: 2,
        title: 'Adventure',
        text: 'Mira meets a friendly comet.',
        image: 'https://example.com/page-2.png',
      },
      { pageNumber: 3, title: 'The End', text: '', image: null },
    ];

    const response = buildDraftResponse(
      {
        id: '42',
        current_step: 6,
        page_count: 3,
        child_name: 'Mira',
        photo_metadata: {
          draftFlow: {
            isActive: true,
            isGenerated: true,
            generationStatus: 'completed',
            draftExpiresAt,
            formData: {
              childName: 'Mira',
              projectId: '42',
            },
          },
        },
      },
      pages
    );

    expect(response.currentStep).toBe(6);
    expect(response.isGenerated).toBe(true);
    expect(response.generationStatus).toBe('completed');
    expect(response.draftExpiresAt).toBe(draftExpiresAt);
    expect(response.expired).toBe(false);
    expect(response.formData.storyPreview).toBe(pages);
  });

  it('requires saved story text and story-page images before email can send', () => {
    const project = {
      pageCount: 4,
      photo_metadata: {
        draftFlow: {
          isGenerated: true,
        },
      },
    };

    const incompletePages = [
      { pageNumber: 1, text: '' },
      { pageNumber: 2, text: 'A page without an image.' },
      { pageNumber: 3, text: 'A page with an image.', image: 'https://example.com/3.png' },
      { pageNumber: 4, text: '' },
    ];

    const completePages = incompletePages.map((page) =>
      page.pageNumber === 2
        ? { ...page, faceSwappedUrl: 'https://example.com/2.png' }
        : page
    );

    expect(isStoryGenerationComplete(project, incompletePages)).toBe(false);
    expect(isStoryGenerationComplete(project, completePages)).toBe(true);
  });

  it('falls back to a 24 hour draft expiry from updated time', () => {
    expect(
      getDraftExpiresAt({
        updatedAt: '2026-05-01T08:30:00.000Z',
      })
    ).toBe('2026-05-02T08:30:00.000Z');
  });
});

describe('magic link helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates opaque tokens and stable sha256 hashes', () => {
    const token = createMagicLinkToken();
    const hash = hashMagicLinkToken('preview-token');

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(hash).toBe(
      '76dac3d27654e6d336c99ebb4e0f1bfe83c20accfb3775aed15bfd94fe1bf8b2'
    );
    expect(hashMagicLinkToken('preview-token')).toBe(hash);
  });

  it('sets preview links to expire in one hour', () => {
    expect(getMagicLinkExpiry()).toBe('2026-05-01T13:00:00.000Z');
  });
});
