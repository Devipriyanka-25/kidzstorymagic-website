function isIllustratedStoryPage(page) {
  return page?.pageType === 'story';
}

export function isTemporaryPreviewIllustrationUrl(value) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return false;
  }

  return (
    /^data:image\/svg\+xml/i.test(normalizedValue) ||
    /\/storage\/v1\/object\/public\/story-assets\/story-illustrations\/.+\.svg(?:\?|$)/i.test(
      normalizedValue
    )
  );
}

export function getSavedPageImageUrl(page) {
  return (
    page?.illustrationUrl ||
    page?.faceSwappedUrl ||
    page?.image_url ||
    page?.image ||
    null
  );
}

export function hasCompletedPageIllustration(page) {
  const imageUrl = getSavedPageImageUrl(page);
  return Boolean(imageUrl) && !isTemporaryPreviewIllustrationUrl(imageUrl);
}

function getPageText(page) {
  return String(page?.text || page?.page_text || page?.content || '').trim();
}

function getIllustrationPrompt(page) {
  return String(
    page?.illustrationPrompt || page?.page_illustration_prompt || ''
  ).trim();
}

export function getStoryPreviewMetrics(pages = []) {
  return (Array.isArray(pages) ? pages : []).reduce(
    (metrics, page) => {
      const imageUrl = getSavedPageImageUrl(page);

      if (getPageText(page)) {
        metrics.textPages += 1;
      }

      if (getIllustrationPrompt(page)) {
        metrics.promptPages += 1;
      }

      if (isIllustratedStoryPage(page)) {
        metrics.storyPages += 1;

        if (hasCompletedPageIllustration(page)) {
          metrics.readyIllustrations += 1;
        }
      }

      if (imageUrl) {
        metrics.pagesWithAnyImage += 1;
      }

      return metrics;
    },
    {
      pageCount: Array.isArray(pages) ? pages.length : 0,
      storyPages: 0,
      readyIllustrations: 0,
      textPages: 0,
      promptPages: 0,
      pagesWithAnyImage: 0,
    }
  );
}

export function shouldPreferStoryPreview(candidatePages = [], currentPages = []) {
  const candidate = getStoryPreviewMetrics(candidatePages);
  const current = getStoryPreviewMetrics(currentPages);

  if (candidate.pageCount === 0) {
    return false;
  }

  if (current.pageCount === 0) {
    return true;
  }

  if (candidate.readyIllustrations !== current.readyIllustrations) {
    return candidate.readyIllustrations > current.readyIllustrations;
  }

  if (candidate.pagesWithAnyImage !== current.pagesWithAnyImage) {
    return candidate.pagesWithAnyImage > current.pagesWithAnyImage;
  }

  if (candidate.textPages !== current.textPages) {
    return candidate.textPages > current.textPages;
  }

  if (candidate.pageCount !== current.pageCount) {
    return candidate.pageCount > current.pageCount;
  }

  if (candidate.promptPages !== current.promptPages) {
    return candidate.promptPages > current.promptPages;
  }

  return false;
}

export function selectBestStoryPreview(candidates = []) {
  let bestCandidate = null;

  for (const candidate of candidates) {
    if (!Array.isArray(candidate) || candidate.length === 0) {
      continue;
    }

    if (!bestCandidate || shouldPreferStoryPreview(candidate, bestCandidate)) {
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}
