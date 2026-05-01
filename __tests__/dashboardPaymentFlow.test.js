import {
  isDashboardDraftStory,
  isPaidOrPublishedStory,
  mergeUniqueStories,
} from '@/utils/storyStatus';
import { buildStoryPdfBuffer } from '@/lib/pdf/simpleStoryPdf';

describe('dashboard payment classification', () => {
  it('shows paid stories as published and keeps unpaid stories in drafts', () => {
    const stories = [
      { id: '1', status: 'draft', isPaid: true, child_name: 'Ari' },
      { id: '2', status: 'in_progress', child_name: 'Mira' },
      { id: '3', status: 'published', child_name: 'Leo' },
    ];
    const drafts = [
      { id: '1', status: 'draft', isPaid: true, child_name: 'Ari' },
      { id: '4', status: 'pending', child_name: 'Nia' },
    ];
    const merged = mergeUniqueStories(stories, drafts);

    expect(merged.filter(isPaidOrPublishedStory).map((story) => story.id)).toEqual([
      '1',
      '3',
    ]);
    expect(merged.filter(isDashboardDraftStory).map((story) => story.id)).toEqual([
      '2',
      '4',
    ]);
  });
});

describe('paid PDF generation', () => {
  it('builds an unlocked PDF without preview watermark text', () => {
    const pdf = buildStoryPdfBuffer({
      story: {
        title: "Mira's Shape Garden",
        child_name: 'Mira',
        theme: 'shape-garden',
      },
      pages: [
        {
          pageNumber: 1,
          title: 'A Bright Start',
          text: 'Mira found a circle glowing in the garden.',
          image_url: 'https://example.com/page-1.png',
        },
      ],
    }).toString('utf8');

    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf).toContain("Mira\\'s Shape Garden".replace("\\'", "'"));
    expect(pdf.toLowerCase()).not.toContain('watermark');
    expect(pdf.toLowerCase()).not.toContain('preview');
  });
});
