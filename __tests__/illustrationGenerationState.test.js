const {
  buildTemporaryIllustrationGenerationState,
  DEFAULT_TEMPORARY_ILLUSTRATION_RETRY_MS,
  findNextIllustrationGenerationPageIndex,
  getNextIllustrationRetryDelay,
  isIllustrationGenerationRetryReady,
  isTemporaryIllustrationGenerationState,
  TEMPORARY_ILLUSTRATION_STATUS,
} = require('@/utils/illustrationGenerationState');

describe('illustrationGenerationState', () => {
  it('builds a retryable temporary illustration state', () => {
    const state = buildTemporaryIllustrationGenerationState(
      'Temporary preview while we retry.',
      {
        retryAfterMs: 5000,
        now: 1000,
      }
    );

    expect(state).toEqual({
      status: TEMPORARY_ILLUSTRATION_STATUS,
      message: 'Temporary preview while we retry.',
      retryAt: 6000,
    });
    expect(isTemporaryIllustrationGenerationState(state)).toBe(true);
  });

  it('waits for temporary retries before requeueing the same page', () => {
    const pages = [
      { pageType: 'cover' },
      { pageType: 'story' },
      { pageType: 'story' },
    ];
    const states = {
      1: buildTemporaryIllustrationGenerationState('retry later', {
        retryAfterMs: 10000,
        now: 1000,
      }),
      2: { status: 'idle', message: '' },
    };

    const nextIndex = findNextIllustrationGenerationPageIndex(pages, states, {
      isIllustratedStoryPage: (page) => page?.pageType === 'story',
      hasCompletedPageIllustration: () => false,
      now: 2000,
    });

    expect(nextIndex).toBe(2);
    expect(getNextIllustrationRetryDelay(states, 2000)).toBe(9000);
  });

  it('makes temporary pages eligible again once the retry time passes', () => {
    const state = buildTemporaryIllustrationGenerationState('retry later', {
      retryAfterMs: DEFAULT_TEMPORARY_ILLUSTRATION_RETRY_MS,
      now: 1000,
    });

    expect(isIllustrationGenerationRetryReady(state, 1000)).toBe(false);
    expect(
      isIllustrationGenerationRetryReady(
        state,
        1000 + DEFAULT_TEMPORARY_ILLUSTRATION_RETRY_MS + 1
      )
    ).toBe(true);
  });
});
