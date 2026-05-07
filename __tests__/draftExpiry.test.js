const { DRAFT_TTL_MS, isLocalDraftExpired } = require('@/utils/draftExpiry');

describe('draftExpiry', () => {
  it('expires local drafts after 24 hours', () => {
    const now = Date.now();

    expect(
      isLocalDraftExpired(
        {
          savedAt: new Date(now - DRAFT_TTL_MS - 1000).toISOString(),
        },
        now
      )
    ).toBe(true);
  });

  it('keeps recent local drafts available', () => {
    const now = Date.now();

    expect(
      isLocalDraftExpired(
        {
          savedAt: new Date(now - 60 * 60 * 1000).toISOString(),
        },
        now
      )
    ).toBe(false);
  });
});
