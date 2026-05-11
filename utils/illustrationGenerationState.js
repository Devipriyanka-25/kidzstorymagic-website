export const TEMPORARY_ILLUSTRATION_STATUS = 'temporary';
export const DEFAULT_TEMPORARY_ILLUSTRATION_RETRY_MS = 45000;

export function isTemporaryIllustrationGenerationState(state) {
  return state?.status === TEMPORARY_ILLUSTRATION_STATUS;
}

export function buildTemporaryIllustrationGenerationState(
  message,
  {
    retryAfterMs = DEFAULT_TEMPORARY_ILLUSTRATION_RETRY_MS,
    now = Date.now(),
  } = {}
) {
  const normalizedRetryAfterMs = Math.max(0, Number(retryAfterMs) || 0);

  return {
    status: TEMPORARY_ILLUSTRATION_STATUS,
    message: String(message || '').trim(),
    retryAt: now + normalizedRetryAfterMs,
  };
}

export function isIllustrationGenerationRetryReady(
  state,
  now = Date.now()
) {
  if (!isTemporaryIllustrationGenerationState(state)) {
    return state?.status !== 'error';
  }

  const retryAt = Number(state?.retryAt);
  return !Number.isFinite(retryAt) || retryAt <= now;
}

export function findNextIllustrationGenerationPageIndex(
  pages,
  pageGenerationStates,
  {
    isIllustratedStoryPage,
    hasCompletedPageIllustration,
    now = Date.now(),
  } = {}
) {
  if (!Array.isArray(pages)) {
    return -1;
  }

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    if (
      !isIllustratedStoryPage?.(page) ||
      hasCompletedPageIllustration?.(page)
    ) {
      continue;
    }

    const pageState = pageGenerationStates?.[index];
    if (pageState?.status === 'error') {
      continue;
    }

    if (
      isTemporaryIllustrationGenerationState(pageState) &&
      !isIllustrationGenerationRetryReady(pageState, now)
    ) {
      continue;
    }

    return index;
  }

  return -1;
}

export function getNextIllustrationRetryDelay(
  pageGenerationStates,
  now = Date.now()
) {
  const retryDelays = Object.values(pageGenerationStates || {})
    .filter((state) => isTemporaryIllustrationGenerationState(state))
    .map((state) => Number(state?.retryAt) - now)
    .filter((delay) => Number.isFinite(delay) && delay > 0);

  if (retryDelays.length === 0) {
    return null;
  }

  return Math.min(...retryDelays);
}
