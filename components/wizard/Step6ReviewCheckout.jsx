'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PDFPreviewModal from './PDFPreviewModal';
import GiftStory from './GiftStory';
import CharacterConsistentStoryPage from '@/components/story/CharacterConsistentStoryPage';
import { useLanguage } from '@/hooks/useLanguage';
import { storyAPI, paymentAPI } from '@/utils/api';
import {
  useWizardStore,
  useCurrencyStore,
  useAuthStore,
} from '@/utils/store';
import { getBookThemeLabel, getBookThemePreviewArt, getTheme } from '@/utils/themes';
import {
  getIllustrationApiErrorMessage,
  prepareReferenceImagesForGeneration,
  readIllustrationApiPayload,
} from '@/utils/subjectImage';
import {
  COUNTRY_CURRENCY_OPTIONS,
  CURRENCY_SYMBOLS,
  getConvertedStoryPrice,
  getCountryCurrencyOption,
  getCountryOptionByCurrency,
} from '@/utils/pricing';

const isIllustratedStoryPage = (page) => page?.pageType === 'story';
const getSavedPageImageUrl = (page) =>
  page?.faceSwappedUrl ||
  page?.illustrationUrl ||
  page?.image_url ||
  page?.image ||
  null;
const PREVIEW_SUPPORT_EMAIL = 'support@kidzstorymagic.com';
const PREVIEW_POLL_INTERVAL_MS = 3000;
const PREVIEW_FIRST_PAGE_TIMEOUT_MS = 45000;
const PREVIEW_RESTORE_TIMEOUT_MS = 12000;
const MAX_POLL_RETRIES = 8;
const FREE_PREVIEW_PAGE_LIMIT = 3;
const PREVIEW_EMAIL_WAIT_MESSAGE =
  'Your story is still being created. Please wait until generation is complete before sending it to your email.';
const PREVIEW_QUOTES = [
  {
    quote:
      "My son was absolutely fascinated by the story and himself being the main character.",
    author: 'Teddy',
  },
  {
    quote:
      'The personalized preview felt magical and kept my daughter smiling the whole time.',
    author: 'Maya',
  },
  {
    quote:
      'Seeing the first illustrated page made us want to keep turning pages right away.',
    author: 'Arun',
  },
];

const buildInitialPageGenerationStates = (
  pages = [],
  shouldGateIllustrations = false
) =>
  pages.reduce((states, page, index) => {
    states[index] = {
      status:
        !shouldGateIllustrations ||
        !isIllustratedStoryPage(page) ||
        Boolean(getSavedPageImageUrl(page))
          ? 'ready'
          : 'idle',
      message: '',
    };
    return states;
  }, {});

function normalizeStoryPreviewPages(pages = [], cachedPages = []) {
  const totalPages = Array.isArray(pages) ? pages.length : 0;
  const cachedPagesByNumber = new Map(
    (Array.isArray(cachedPages) ? cachedPages : [])
      .map((page, index) => {
        const pageNumber = Number(page?.pageNumber || page?.page_number || index + 1);
        return pageNumber > 0 ? [pageNumber, page] : null;
      })
      .filter(Boolean)
  );

  return (Array.isArray(pages) ? pages : []).map((page, index) => {
    const pageNumber = Number(page?.pageNumber || page?.page_number || index + 1) || index + 1;
    const cachedPage = cachedPagesByNumber.get(pageNumber) || cachedPages[index] || null;
    const illustrationUrl =
      page?.illustrationUrl ||
      page?.faceSwappedUrl ||
      page?.image_url ||
      page?.image ||
      cachedPage?.illustrationUrl ||
      cachedPage?.faceSwappedUrl ||
      cachedPage?.image_url ||
      cachedPage?.image ||
      null;
    const faceSwappedUrl =
      cachedPage?.faceSwappedUrl ||
      page?.faceSwappedUrl ||
      null;

    return {
      ...page,
      pageNumber,
      page_number: pageNumber,
      pageType:
        page?.pageType ||
        (pageNumber === 1
          ? 'cover'
          : totalPages > 0 && pageNumber === totalPages
            ? 'end'
            : 'story'),
      title: page?.title || page?.page_title || `Page ${pageNumber}`,
      page_title: page?.page_title || page?.title || `Page ${pageNumber}`,
      text: page?.text || page?.page_text || page?.content || '',
      page_text: page?.page_text || page?.text || page?.content || '',
      content: page?.content || page?.page_text || page?.text || '',
      illustrationPrompt:
        page?.illustrationPrompt ||
        page?.page_illustration_prompt ||
        cachedPage?.illustrationPrompt ||
        cachedPage?.page_illustration_prompt ||
        null,
      page_illustration_prompt:
        page?.page_illustration_prompt ||
        page?.illustrationPrompt ||
        cachedPage?.page_illustration_prompt ||
        cachedPage?.illustrationPrompt ||
        null,
      illustrationUrl,
      image_url:
        page?.image_url ||
        page?.illustrationUrl ||
        page?.image ||
        illustrationUrl,
      image:
        page?.image ||
        page?.illustrationUrl ||
        page?.image_url ||
        illustrationUrl,
      faceSwappedUrl,
    };
  });
}

function waitForDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const handleAbort = () => {
      window.clearTimeout(timeoutId);
      cleanup();
      reject(new DOMException('Request aborted', 'AbortError'));
    };

    const cleanup = () => {
      signal?.removeEventListener('abort', handleAbort);
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort, { once: true });
    }
  });
}

function escapePreviewSvgText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isEmbeddablePreviewImage(value) {
  return /^(blob:|data:image\/|https?:\/\/)/i.test(String(value || '').trim());
}

function wrapPreviewLines(value, maxLength = 26, maxLines = 3) {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    if (lines.length >= maxLines) {
      return;
    }

    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length <= maxLength) {
      currentLine = nextLine;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    currentLine = word;
  });

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : ['A magical storybook scene'];
}

function createTimedFallbackIllustration({
  prompt,
  bookThemeValue,
  subjectImage,
}) {
  const theme = getTheme(bookThemeValue || 'fantasy');
  const promptLines = wrapPreviewLines(
    String(prompt || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 92),
    28,
    3
  );
  const promptLineMarkup = promptLines
    .map(
      (line, index) => `
        <text x="88" y="${946 + index * 44}" fill="#fffdf7" font-family="Verdana, Arial, sans-serif" font-size="30" font-weight="700">
          ${escapePreviewSvgText(line)}
        </text>`
    )
    .join('');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 1400" role="img" aria-label="Storybook preview illustration">
      <defs>
        <linearGradient id="sky" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="${theme.primary}" />
          <stop offset="48%" stop-color="${theme.accentColor}" />
          <stop offset="100%" stop-color="${theme.secondary}" />
        </linearGradient>
        <linearGradient id="sunGlow" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#fff7cc" stop-opacity="0.82" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="groundA" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="${theme.secondary}" stop-opacity="0.88" />
          <stop offset="100%" stop-color="${theme.accentColor}" stop-opacity="0.62" />
        </linearGradient>
        <linearGradient id="groundB" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.52" />
          <stop offset="100%" stop-color="${theme.dark}" stop-opacity="0.42" />
        </linearGradient>
      </defs>

      <rect width="1100" height="1400" fill="#fff7ed" />
      <rect x="52" y="52" width="996" height="1296" rx="44" fill="#fffaf4" />
      <rect x="82" y="82" width="936" height="886" rx="38" fill="url(#sky)" />
      <circle cx="238" cy="222" r="152" fill="url(#sunGlow)" />
      <ellipse cx="794" cy="188" rx="188" ry="88" fill="#ffffff" fill-opacity="0.18" />
      <ellipse cx="282" cy="188" rx="170" ry="82" fill="#ffffff" fill-opacity="0.12" />
      <circle cx="814" cy="256" r="24" fill="#ffffff" fill-opacity="0.22" />
      <circle cx="754" cy="302" r="16" fill="#ffffff" fill-opacity="0.16" />
      <circle cx="338" cy="314" r="18" fill="#ffffff" fill-opacity="0.18" />
      <path d="M82 714 C228 612, 360 620, 504 712 S782 834, 1018 716 L1018 968 L82 968 Z" fill="url(#groundA)" />
      <path d="M82 782 C270 666, 418 690, 604 790 S844 886, 1018 780 L1018 968 L82 968 Z" fill="url(#groundB)" />
      <path d="M82 850 C254 742, 440 760, 632 850 S846 926, 1018 846 L1018 968 L82 968 Z" fill="${theme.dark}" fill-opacity="0.22" />
      <path d="M284 684 C338 594, 444 588, 514 658 C552 702, 566 756, 544 818 C520 868, 470 894, 410 900 C348 894, 304 870, 274 822 C248 780, 244 730, 284 684 Z" fill="#fff7ed" fill-opacity="0.24" />
      <path d="M360 676 C400 646, 454 648, 486 688" fill="none" stroke="#ffffff" stroke-opacity="0.42" stroke-width="10" stroke-linecap="round" />
      <rect x="128" y="126" width="250" height="56" rx="28" fill="#fff7ed" fill-opacity="0.94" />
      <text x="160" y="162" fill="#c2410c" font-family="Verdana, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="6">
        STORYBOOK SCENE
      </text>
      <text x="126" y="612" fill="#ffffff" font-family="Verdana, Arial, sans-serif" font-size="84" font-weight="700">
        Colorful Preview
      </text>
      <text x="126" y="690" fill="#fff7ed" font-family="Verdana, Arial, sans-serif" font-size="42" font-weight="700">
        Your page opened while the full illustration finishes
      </text>
      <text x="126" y="746" fill="#ffedd5" font-family="Verdana, Arial, sans-serif" font-size="28">
        We keep the story moving with a brighter temporary scene card.
      </text>

      <rect x="82" y="892" width="936" height="82" rx="26" fill="#ffffff" fill-opacity="0.14" />
      <text x="126" y="944" fill="#fffdf7" font-family="Verdana, Arial, sans-serif" font-size="28" font-weight="700">
        Vivid palette + premium storybook energy stay active while page art finishes.
      </text>
      <rect x="82" y="1002" width="936" height="272" rx="34" fill="${theme.dark}" fill-opacity="0.86" />
      <text x="110" y="1050" fill="#fde68a" font-family="Verdana, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">
        STORY MOMENT
      </text>
      ${promptLineMarkup}
      <text x="110" y="1226" fill="#ffedd5" fill-opacity="0.94" font-family="Verdana, Arial, sans-serif" font-size="24">
        This page will swap to the finished illustration as soon as it is ready.
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function cancelStoryPageIllustration(predictionId, signal) {
  try {
    await fetch(`/api/generate-story-page/${encodeURIComponent(predictionId)}`, {
      method: 'DELETE',
      cache: 'no-store',
      signal,
    });
  } catch (cancelError) {
    if (
      cancelError instanceof DOMException &&
      cancelError.name === 'AbortError'
    ) {
      throw cancelError;
    }

    console.error('[CANCEL_ILLUSTRATION_ERROR]', {
      predictionId,
      message:
        cancelError instanceof Error
          ? cancelError.message
          : String(cancelError),
    });
  }
}

async function pollStoryPageIllustration(
  predictionId,
  signal,
  onPending,
  {
    fallbackPrompt,
    bookThemeValue,
    subjectImage,
    timeoutMs = PREVIEW_FIRST_PAGE_TIMEOUT_MS,
  } = {}
) {
  const startedAt = Date.now();
  let consecutiveRateLimitErrors = 0;
  let currentPollIntervalMs = PREVIEW_POLL_INTERVAL_MS;

  for (let attempt = 0; attempt < MAX_POLL_RETRIES; attempt += 1) {
    if (attempt > 0) {
      // Use adaptive polling interval based on rate limiting
      await waitForDelay(currentPollIntervalMs, signal);
    }

    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs >= timeoutMs && fallbackPrompt) {
      await cancelStoryPageIllustration(predictionId, signal);
      console.log('[POLL_ILLUSTRATION_TIMEOUT]', {
        predictionId,
        elapsedMs,
        timeoutMs,
        attempts: attempt,
      });
      return createTimedFallbackIllustration({
        prompt: fallbackPrompt,
        bookThemeValue,
        subjectImage,
      });
    }

    try {
      const response = await fetch(
        `/api/generate-story-page/${encodeURIComponent(predictionId)}`,
        {
          method: 'GET',
          cache: 'no-store',
          signal,
        }
      );
      const payload = await readIllustrationApiPayload(response);

      // Reset rate limit counter on successful response
      consecutiveRateLimitErrors = 0;
      currentPollIntervalMs = PREVIEW_POLL_INTERVAL_MS;

      if (!response.ok) {
        // If it's a fallback response due to billing error, use the fallback image
        if (
          response.status === 200 &&
          payload?.status === 'fallback' &&
          typeof payload?.imageUrl === 'string' &&
          payload.imageUrl
        ) {
          console.log('[POLL_ILLUSTRATION_FALLBACK]', {
            predictionId,
            reason: payload.warning,
          });
          return payload.imageUrl;
        }

        // Check for rate limiting (429)
        if (response.status === 429) {
          consecutiveRateLimitErrors += 1;
          // Increase poll interval exponentially on rate limit (max 15 seconds)
          currentPollIntervalMs = Math.min(
            PREVIEW_POLL_INTERVAL_MS * Math.pow(1.5, consecutiveRateLimitErrors),
            15000
          );
          
          console.warn('[POLL_ILLUSTRATION_RATE_LIMITED]', {
            predictionId,
            attempt,
            consecutiveErrors: consecutiveRateLimitErrors,
            nextPollMs: currentPollIntervalMs,
          });
          
          // Continue polling with increased interval instead of failing
          continue;
        }

        throw new Error(getIllustrationApiErrorMessage(response, payload));
      }

      if (payload?.pending) {
        onPending?.(payload);
        continue;
      }

      if (typeof payload?.imageUrl === 'string' && payload.imageUrl) {
        console.log('[POLL_ILLUSTRATION_SUCCESS]', {
          predictionId,
          attempt,
          elapsedMs,
          rateLimitErrors: consecutiveRateLimitErrors,
        });
        return payload.imageUrl;
      }

      throw new Error('Illustration generation completed without an image.');
    } catch (pollError) {
      // If it's an abort error from signal, re-throw
      if (
        pollError instanceof DOMException &&
        pollError.name === 'AbortError'
      ) {
        throw pollError;
      }

      // Log the error and check if we should use fallback
      console.error('[POLL_ILLUSTRATION_ERROR]', {
        predictionId,
        attempt,
        message: pollError instanceof Error ? pollError.message : String(pollError),
        rateLimitErrors: consecutiveRateLimitErrors,
      });

      // If we have more retries left, continue
      if (attempt < MAX_POLL_RETRIES - 1 && elapsedMs < timeoutMs) {
        continue;
      }

      // Otherwise use fallback if available
      if (fallbackPrompt) {
        await cancelStoryPageIllustration(predictionId, signal);
        console.log('[POLL_ILLUSTRATION_ERROR_FALLBACK]', {
          predictionId,
          elapsedMs,
          timeoutMs,
          attempts: attempt,
        });
        return createTimedFallbackIllustration({
          prompt: fallbackPrompt,
          bookThemeValue,
          subjectImage,
        });
      }

      // No fallback available, re-throw the error
      throw pollError;
    }
  }

  // Max retries exceeded
  if (fallbackPrompt) {
    await cancelStoryPageIllustration(predictionId, signal);
    console.log('[POLL_ILLUSTRATION_MAX_RETRIES]', {
      predictionId,
      maxRetries: MAX_POLL_RETRIES,
    });
    return createTimedFallbackIllustration({
      prompt: fallbackPrompt,
      bookThemeValue,
      subjectImage,
    });
  }

  throw new Error(`Failed to generate illustration after ${MAX_POLL_RETRIES} attempts. Please try again.`);
}
async function createStoryPageIllustration({
  prompt,
  subjectImage,
  referenceImages,
  bookThemeValue,
  signal,
  onPending,
  onFaceSwapRequested,
  timeoutMs,
}) {
  const preparedReferenceImages = await prepareReferenceImagesForGeneration(
    Array.isArray(referenceImages) && referenceImages.length > 0
      ? referenceImages
      : [subjectImage]
  );
  const preparedSubjectImage =
    preparedReferenceImages[0] || String(subjectImage || '').trim();
  const response = await fetch('/api/generate-story-page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      prompt,
      subjectImage: preparedSubjectImage,
      referenceImages: preparedReferenceImages,
    }),
  });
  const payload = await readIllustrationApiPayload(response);

  if (!response.ok) {
    throw new Error(getIllustrationApiErrorMessage(response, payload));
  }

  if (typeof payload?.imageUrl === 'string' && payload.imageUrl) {
    onFaceSwapRequested?.({
      faceImageUrl: preparedSubjectImage,
      illustrationImageUrl: payload.imageUrl,
    });
    return payload.imageUrl;
  }

  if (payload?.pending && typeof payload?.predictionId === 'string') {
    onPending?.(payload);
    const generatedIllustrationUrl = await pollStoryPageIllustration(
      payload.predictionId,
      signal,
      onPending,
      {
        fallbackPrompt: prompt,
        bookThemeValue,
        subjectImage: preparedSubjectImage,
        timeoutMs,
      }
    );

    onFaceSwapRequested?.({
      faceImageUrl: preparedSubjectImage,
      illustrationImageUrl: generatedIllustrationUrl,
    });
    return generatedIllustrationUrl;
  }

  throw new Error('Illustration generation completed without an image.');
}

async function applyOptionalFaceSwap({
  faceImageUrl,
  illustrationImageUrl,
  signal,
}) {
  if (
    !faceImageUrl ||
    !illustrationImageUrl ||
    illustrationImageUrl.startsWith('data:image/svg+xml')
  ) {
    return illustrationImageUrl;
  }

  try {
    const response = await fetch('/api/photos/face-swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      body: JSON.stringify({
        faceImageUrl,
        illustrationImageUrl,
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      console.warn('[FACE_SWAP_PREVIEW_FALLBACK]', {
        status: response.status,
        error: payload?.error || payload?.message || 'Face swap unavailable',
      });
      return illustrationImageUrl;
    }

    return (
      payload?.swappedUrl ||
      payload?.result?.swappedImageUrl ||
      illustrationImageUrl
    );
  } catch (faceSwapError) {
    if (
      faceSwapError instanceof DOMException &&
      faceSwapError.name === 'AbortError'
    ) {
      throw faceSwapError;
    }

    console.warn('[FACE_SWAP_PREVIEW_ERROR]', {
      message:
        faceSwapError instanceof Error
          ? faceSwapError.message
          : String(faceSwapError),
    });
    return illustrationImageUrl;
  }
}

export default function Step6ReviewCheckout() {
  const { formData, prevStep, updateFormData } = useWizardStore();
  const {
    selectedCountry = 'United States',
    selectedCurrency = 'USD',
    exchangeRates,
    setCountry,
    setCurrency,
  } = useCurrencyStore();
  const authUser = useAuthStore((state) => state.user);
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Initialize from saved preview if it exists, otherwise null
  const [storyPreview, setStoryPreview] = useState(() => {
    return formData?.storyPreview && Array.isArray(formData.storyPreview) 
      ? normalizeStoryPreviewPages(formData.storyPreview)
      : null;
  });
  const [isRestoringSavedPreview, setIsRestoringSavedPreview] = useState(false);
  const [pageGenerationStates, setPageGenerationStates] = useState({});
  const activeGenerationPageIndexRef = useRef(null);
  const [generationQueueVersion, setGenerationQueueVersion] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewPrepProgress, setPreviewPrepProgress] = useState(12);
  const [previewPrepTitle, setPreviewPrepTitle] = useState('Creating your book');
  const [previewPrepDetail, setPreviewPrepDetail] = useState(
    'We are writing your story and preparing the first illustrated page.'
  );
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [previewEmailStatus, setPreviewEmailStatus] = useState('idle');
  const [previewEmailFeedback, setPreviewEmailFeedback] = useState('');
  const [previewEmailSentTo, setPreviewEmailSentTo] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const isMountedRef = useRef(true);
  const generationSessionRef = useRef(0);
  const [previewRestoreRetryNonce, setPreviewRestoreRetryNonce] = useState(0);
  const completedPreviewRestoreProjectsRef = useRef(new Set());
  const activePreviewRestoreProjectIdRef = useRef(null);
  const pendingFaceSwapQueueRef = useRef([]);
  const activeFaceSwapTaskRef = useRef(null);
  const hasOpenedFirstIllustratedPageRef = useRef(false);
  const [giftData, setGiftData] = useState({
    isGift: false,
    recipientName: '',
    recipientEmail: '',
    giftMessage: '',
    isValidEmail: false,
    isComplete: true,
  });

  const [selectedFaceImage, setSelectedFaceImage] = useState(null);
  const [selectedFaceReferenceImage, setSelectedFaceReferenceImage] = useState(null);

  const {
    amount: convertedPrice,
    currency,
  } = getConvertedStoryPrice(formData.pageCount, selectedCurrency, exchangeRates);
  const price = convertedPrice.toFixed(2);
  const selectedCountryOption =
    getCountryCurrencyOption(selectedCountry) ||
    getCountryOptionByCurrency(currency) ||
    COUNTRY_CURRENCY_OPTIONS[0];

  const getActiveTheme = () =>
    getTheme(formData.illustrationStyle || formData.theme || 'fantasy');

  const currentTheme = getActiveTheme();
  const selectedThemeLabel = getBookThemeLabel(formData.theme);
  const primaryStoryReferenceImage = useMemo(() => {
    if (selectedFaceReferenceImage) {
      return String(selectedFaceReferenceImage || '').trim();
    }

    if (formData.uploadedPhoto?.watermarkedUrl) {
      return String(formData.uploadedPhoto.watermarkedUrl || '').trim();
    }

    if (Array.isArray(formData.uploadedImages)) {
      const firstPhoto = formData.uploadedImages.find(
        (photo) => photo?.illustrationReference || photo?.preview
      );

      if (firstPhoto) {
        return String(
          firstPhoto.illustrationReference || firstPhoto.preview || ''
        ).trim();
      }
    }

    return '';
  }, [
    formData.uploadedImages,
    formData.uploadedPhoto?.watermarkedUrl,
    selectedFaceReferenceImage,
  ]);
  const storyReferenceImages = useMemo(() => {
    const supportingReferenceImages = Array.isArray(formData.uploadedImages)
      ? formData.uploadedImages
          .map((photo) => photo?.illustrationReference || photo?.preview || '')
          .map((value) => String(value || '').trim())
          .filter(Boolean)
      : [];

    const orderedReferenceImages = [
      primaryStoryReferenceImage,
      ...supportingReferenceImages,
      formData.uploadedPhoto?.watermarkedUrl || '',
    ]
      .map((value) => String(value || '').trim())
      .filter(Boolean);

    return Array.from(new Set(orderedReferenceImages)).slice(0, 4);
  }, [
    formData.uploadedImages,
    formData.uploadedPhoto?.watermarkedUrl,
    primaryStoryReferenceImage,
  ]);
  const storySubjectImage = storyReferenceImages[0] || null;
  const shouldGateIllustrations = Boolean(storySubjectImage);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      generationSessionRef.current += 1;
      pendingFaceSwapQueueRef.current = [];
      activeFaceSwapTaskRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (storyPreview) {
      return;
    }

    if (!Array.isArray(formData?.storyPreview) || formData.storyPreview.length === 0) {
      return;
    }

    setStoryPreview(normalizeStoryPreviewPages(formData.storyPreview));
  }, [formData?.storyPreview, storyPreview]);

  useEffect(() => {
    const projectId = String(formData.projectId || '').trim();

    if (!projectId || storyPreview || isRestoringSavedPreview) {
      return;
    }

    if (
      completedPreviewRestoreProjectsRef.current.has(projectId) ||
      activePreviewRestoreProjectIdRef.current === projectId
    ) {
      return;
    }

    if (
      typeof window === 'undefined' ||
      !window.localStorage?.getItem('authToken')
    ) {
      return;
    }

    let cancelled = false;
    let restoreTimedOut = false;
    activePreviewRestoreProjectIdRef.current = projectId;
    setIsRestoringSavedPreview(true);
    setError('');
    setPreviewPrepProgress(22);
    setPreviewPrepTitle('Reopening your saved book preview');
    setPreviewPrepDetail(
      'We are restoring your saved preview so you can continue without using another generation credit.'
    );
    setShowEmailFallback(false);
    setPreviewEmailStatus('idle');
    setPreviewEmailFeedback('');
    setPreviewEmailSentTo('');
    const restoreTimeoutId = window.setTimeout(() => {
      restoreTimedOut = true;
      completedPreviewRestoreProjectsRef.current.add(projectId);

      if (activePreviewRestoreProjectIdRef.current === projectId) {
        activePreviewRestoreProjectIdRef.current = null;
      }

      if (!cancelled) {
        setIsRestoringSavedPreview(false);
        setError(
          'Reopening the saved preview is taking longer than usual. You can try reopening it again or tap Preview Story to continue.'
        );
      }
    }, PREVIEW_RESTORE_TIMEOUT_MS);

    const restoreSavedPreview = async () => {
      try {
        const response = await storyAPI.getProject(projectId);
        const savedStory = response?.data?.story;
        const savedPages = Array.isArray(savedStory?.pages) ? savedStory.pages : [];

        if (cancelled || restoreTimedOut) {
          return;
        }

        if (savedPages.length === 0) {
          completedPreviewRestoreProjectsRef.current.add(projectId);
          return;
        }

        const cachedPreview = Array.isArray(formData?.storyPreview)
          ? formData.storyPreview
          : [];
        const restoredPages = normalizeStoryPreviewPages(savedPages, cachedPreview);

        setStoryPreview(restoredPages);
        setCurrentPage(0);
        setPageGenerationStates(
          buildInitialPageGenerationStates(restoredPages, shouldGateIllustrations)
        );

        useWizardStore.setState((state) => ({
          formData: {
            ...state.formData,
            projectId: savedStory?.id || state.formData.projectId,
            ageGroup: savedStory?.ageGroup || state.formData.ageGroup,
            theme: savedStory?.theme || state.formData.theme,
            illustrationStyle:
              savedStory?.illustrationStyle || state.formData.illustrationStyle,
            customIllustrationPrompt:
              savedStory?.customIllustrationPrompt ||
              savedStory?.custom_illustration_prompt ||
              state.formData.customIllustrationPrompt,
            pageCount:
              Number(savedStory?.pageCount || savedStory?.page_count) ||
              state.formData.pageCount,
            childName: savedStory?.childName || state.formData.childName,
            childGender:
              savedStory?.childGender || state.formData.childGender,
            childInterests:
              savedStory?.childInterests || state.formData.childInterests,
            childNotes: savedStory?.childNotes || state.formData.childNotes,
            storyPreview: restoredPages,
          },
        }));
        useWizardStore.getState().saveDraft();
        completedPreviewRestoreProjectsRef.current.add(projectId);
      } catch (restoreError) {
        if (!cancelled && !restoreTimedOut) {
          completedPreviewRestoreProjectsRef.current.add(projectId);
          setError(
            'We could not reopen the saved preview right now. You can try reopening it again or tap Preview Story to continue.'
          );
        }

        console.warn('[PREVIEW_RESTORE_ERROR]', {
          projectId,
          message:
            restoreError instanceof Error
              ? restoreError.message
              : String(restoreError),
        });
      } finally {
        window.clearTimeout(restoreTimeoutId);

        if (activePreviewRestoreProjectIdRef.current === projectId) {
          activePreviewRestoreProjectIdRef.current = null;
        }

        if (!cancelled && !restoreTimedOut) {
          setIsRestoringSavedPreview(false);
        }
      }
    };

    restoreSavedPreview();

    return () => {
      cancelled = true;
      window.clearTimeout(restoreTimeoutId);
      if (activePreviewRestoreProjectIdRef.current === projectId) {
        activePreviewRestoreProjectIdRef.current = null;
      }
    };
  }, [
    formData?.storyPreview,
    formData.childGender,
    formData.childInterests,
    formData.childName,
    formData.childNotes,
    formData.customIllustrationPrompt,
    formData.illustrationStyle,
    formData.pageCount,
    formData.projectId,
    formData.theme,
    formData.ageGroup,
    isRestoringSavedPreview,
    previewRestoreRetryNonce,
    shouldGateIllustrations,
    storyPreview,
  ]);

  // Initialize page generation states when story preview loads or when coming back from payment
  useEffect(() => {
    if (!storyPreview) {
      return;
    }

    const hasInitialized = Object.keys(pageGenerationStates).length > 0;
    if (hasInitialized) {
      return;
    }

    // Initialize page states for already-loaded preview
    setPageGenerationStates(
      buildInitialPageGenerationStates(storyPreview, shouldGateIllustrations)
    );
  }, [storyPreview, shouldGateIllustrations]);

  // Save story preview to store whenever it changes
  useEffect(() => {
    if (!storyPreview || !updateFormData) {
      return;
    }

    updateFormData('storyPreview', storyPreview);
  }, [storyPreview, updateFormData]);

  const updatePageGenerationState = (pageIndex, nextState) => {
    setPageGenerationStates((currentStates) => {
      const previousState = currentStates[pageIndex] || {
        status: 'idle',
        message: '',
      };
      const mergedState = {
        ...previousState,
        ...nextState,
      };

      if (
        previousState.status === mergedState.status &&
        previousState.message === mergedState.message
      ) {
        return currentStates;
      }

      return {
        ...currentStates,
        [pageIndex]: mergedState,
      };
    });
  };

  const runNextFaceSwapTask = () => {
    if (activeFaceSwapTaskRef.current) {
      return;
    }

    const [nextTask, ...remainingTasks] = pendingFaceSwapQueueRef.current;
    if (!nextTask) {
      return;
    }

    pendingFaceSwapQueueRef.current = remainingTasks;
    activeFaceSwapTaskRef.current = nextTask;

    applyOptionalFaceSwap({
      faceImageUrl: nextTask.faceImageUrl,
      illustrationImageUrl: nextTask.illustrationImageUrl,
    })
      .then((swappedUrl) => {
        if (!isMountedRef.current) {
          return;
        }

        if (generationSessionRef.current !== nextTask.generationSessionId) {
          return;
        }

        if (
          typeof swappedUrl !== 'string' ||
          !swappedUrl ||
          swappedUrl === nextTask.illustrationImageUrl
        ) {
          return;
        }

        setStoryPreview((currentPages) => {
          if (!Array.isArray(currentPages)) {
            return currentPages;
          }

          const page = currentPages[nextTask.pageIndex];
          if (!page || page.faceSwappedUrl === swappedUrl) {
            return currentPages;
          }

          const nextPages = [...currentPages];
          nextPages[nextTask.pageIndex] = {
            ...page,
            faceSwappedUrl: swappedUrl,
          };
          
          return nextPages;
        });
      })
      .catch((faceSwapError) => {
        console.warn('[FACE_SWAP_QUEUE_ERROR]', {
          pageIndex: nextTask.pageIndex,
          message:
            faceSwapError instanceof Error
              ? faceSwapError.message
              : String(faceSwapError),
        });
      })
      .finally(() => {
        if (activeFaceSwapTaskRef.current?.taskId === nextTask.taskId) {
          activeFaceSwapTaskRef.current = null;
        }

        runNextFaceSwapTask();
      });
  };

  const resetFaceSwapQueue = () => {
    pendingFaceSwapQueueRef.current = [];
    activeFaceSwapTaskRef.current = null;
  };

  const queueFaceSwapTask = ({
    generationSessionId,
    pageIndex,
    faceImageUrl,
    illustrationImageUrl,
  }) => {
    if (
      !faceImageUrl ||
      !illustrationImageUrl ||
      illustrationImageUrl.startsWith('data:image/svg+xml')
    ) {
      return;
    }

    const taskId = `${generationSessionId}:${pageIndex}`;
    const isActiveTask = activeFaceSwapTaskRef.current?.taskId === taskId;
    const isQueuedTask = pendingFaceSwapQueueRef.current.some(
      (task) => task.taskId === taskId
    );

    if (isActiveTask || isQueuedTask) {
      return;
    }

    pendingFaceSwapQueueRef.current = [
      ...pendingFaceSwapQueueRef.current,
      {
        taskId,
        generationSessionId,
        pageIndex,
        faceImageUrl,
        illustrationImageUrl,
      },
    ];

    runNextFaceSwapTask();
  };

  const isPageIllustrationReady = (page, pageIndex) => {
    if (!shouldGateIllustrations || !isIllustratedStoryPage(page)) {
      return true;
    }

    return (
      Boolean(getSavedPageImageUrl(page)) ||
      pageGenerationStates[pageIndex]?.status === 'ready'
    );
  };

  const canAccessPage = (targetPageIndex) => {
    if (!Array.isArray(storyPreview)) {
      return false;
    }

    if (targetPageIndex >= FREE_PREVIEW_PAGE_LIMIT) {
      return false;
    }

    for (let pageIndex = 0; pageIndex <= targetPageIndex; pageIndex += 1) {
      if (!isPageIllustrationReady(storyPreview[pageIndex], pageIndex)) {
        return false;
      }
    }

    return true;
  };

  const currentPageData = Array.isArray(storyPreview)
    ? storyPreview[currentPage]
    : null;
  const firstIllustratedPageIndex = Array.isArray(storyPreview)
    ? storyPreview.findIndex((page) => isIllustratedStoryPage(page))
    : -1;
  const firstIllustratedPageReady =
    !Array.isArray(storyPreview) ||
    firstIllustratedPageIndex === -1 ||
    isPageIllustrationReady(
      storyPreview[firstIllustratedPageIndex],
      firstIllustratedPageIndex
    );
  const currentPageState = currentPageData
    ? pageGenerationStates[currentPage]
    : null;
  const currentPageRequiresIllustration =
    shouldGateIllustrations && isIllustratedStoryPage(currentPageData);
  const isPreparingInitialPreview =
    Array.isArray(storyPreview) &&
    shouldGateIllustrations &&
    firstIllustratedPageIndex !== -1 &&
    !firstIllustratedPageReady;
  const shouldShowStoryPreview =
    Array.isArray(storyPreview) &&
    (!shouldGateIllustrations || firstIllustratedPageReady);
  const canMoveToNextPage =
    shouldShowStoryPreview &&
    currentPage < storyPreview.length - 1 &&
    canAccessPage(currentPage + 1);
  const lockedPreviewPageCount = Array.isArray(storyPreview)
    ? Math.max(storyPreview.length - FREE_PREVIEW_PAGE_LIMIT, 0)
    : 0;
  const isFreePreviewLocked = lockedPreviewPageCount > 0;
  const allIllustratedPagesReady = Array.isArray(storyPreview)
    ? storyPreview.every((page, pageIndex) =>
        isPageIllustrationReady(page, pageIndex)
      )
    : false;
  const isPreviewEmailReady =
    Boolean(formData.projectId) &&
    Array.isArray(storyPreview) &&
    allIllustratedPagesReady &&
    !loading &&
    !isRestoringSavedPreview;
  const coverPreviewArt = useMemo(() => {
    if (Array.isArray(storyPreview)) {
      const firstReadyStoryPage = storyPreview.find(
        (page, index) =>
          index > 0 &&
          index < storyPreview.length - 1 &&
          isIllustratedStoryPage(page) &&
          Boolean(getSavedPageImageUrl(page))
      );
      const firstReadyStoryPageImage = getSavedPageImageUrl(firstReadyStoryPage);

      if (firstReadyStoryPageImage) {
        return firstReadyStoryPageImage;
      }
    }

    return getBookThemePreviewArt(formData.theme, '');
  }, [formData.theme, storyPreview, storySubjectImage]);
  const illustrationsRemainingCount = Array.isArray(storyPreview)
    ? storyPreview.filter(
        (page, pageIndex) => !isPageIllustrationReady(page, pageIndex)
      ).length
    : 0;
  const currentQuote = PREVIEW_QUOTES[quoteIndex % PREVIEW_QUOTES.length];
  const showPreviewPreparationScreen =
    ((loading || isRestoringSavedPreview) && !storyPreview) ||
    isPreparingInitialPreview;
  const previewEmailRecipient = useMemo(() => {
    const candidate = formData.parentEmail || authUser?.email || '';
    return String(candidate || '').trim();
  }, [authUser?.email, formData.parentEmail]);

  useEffect(() => {
    if (
      hasOpenedFirstIllustratedPageRef.current ||
      !shouldShowStoryPreview ||
      firstIllustratedPageIndex <= 0 ||
      !firstIllustratedPageReady ||
      currentPage !== 0
    ) {
      return;
    }

    hasOpenedFirstIllustratedPageRef.current = true;
    setCurrentPage(firstIllustratedPageIndex);
  }, [
    currentPage,
    firstIllustratedPageIndex,
    firstIllustratedPageReady,
    shouldShowStoryPreview,
  ]);
  const supportMailtoLink = useMemo(() => {
    const body = [
      'Hi Kidz Story Magic team,',
      '',
      'My preview is still generating. Please email the preview when it is ready.',
        '',
        `Project ID: ${formData.projectId || 'Unavailable'}`,
        `Child name: ${formData.childName || 'Unavailable'}`,
        `Theme: ${selectedThemeLabel || 'Unavailable'}`,
        `Page count: ${formData.pageCount || 'Unavailable'}`,
        `Preferred recipient: ${previewEmailRecipient || 'Unavailable'}`,
      '',
      'Thank you!',
    ].join('\n');

    return `mailto:${PREVIEW_SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `Preview request for ${formData.childName || 'storybook'}`
    )}&body=${encodeURIComponent(body)}`;
  }, [
    formData.childName,
    formData.pageCount,
    formData.projectId,
    previewEmailRecipient,
    selectedThemeLabel,
  ]);
  const previewEmailHelpAvailable =
    previewEmailStatus === 'error' &&
    ['not configured', 'test mode', 'verify a domain', 'testing emails'].some(
      (needle) => previewEmailFeedback.toLowerCase().includes(needle)
    );
  const handleCountryChange = (event) => {
    const nextCountry = String(event?.target?.value || '');
    const nextOption = getCountryCurrencyOption(nextCountry);

    if (!nextOption) {
      return;
    }

    setCountry(nextOption.country);
    setCurrency(nextOption.currency);
  };

  useEffect(() => {
    if (selectedFaceImage || selectedFaceReferenceImage) {
      return;
    }

    if (Array.isArray(formData.uploadedImages) && formData.uploadedImages.length > 0) {
      const defaultPhoto = formData.uploadedImages[0];
      setSelectedFaceImage(defaultPhoto?.preview || null);
      setSelectedFaceReferenceImage(
        defaultPhoto?.illustrationReference || defaultPhoto?.preview || null
      );
      return;
    }

    if (formData.uploadedPhoto?.watermarkedUrl) {
      setSelectedFaceImage(formData.uploadedPhoto.watermarkedUrl);
      setSelectedFaceReferenceImage(formData.uploadedPhoto.watermarkedUrl);
    }
  }, [
    formData.uploadedImages,
    formData.uploadedPhoto?.watermarkedUrl,
    selectedFaceImage,
    selectedFaceReferenceImage,
  ]);

  useEffect(() => {
    if (selectedCountry !== 'United States' || selectedCurrency !== 'USD') {
      return;
    }

    const preferredCurrency = String(authUser?.preferredCurrency || '').trim().toUpperCase();
    if (!preferredCurrency) {
      return;
    }

    const preferredOption = getCountryOptionByCurrency(preferredCurrency);

    if (preferredOption) {
      setCountry(preferredOption.country);
      setCurrency(preferredOption.currency);
    }
  }, [
    authUser?.preferredCurrency,
    selectedCountry,
    selectedCurrency,
    setCountry,
    setCurrency,
  ]);

  const handleRetryPreviewPreparation = () => {
    if (firstIllustratedPageIndex === -1) {
      return;
    }

    generationSessionRef.current += 1;
    resetFaceSwapQueue();
    setError('');
    setPreviewPrepProgress(42);
    setPreviewPrepDetail(
      'Painting the first page now. If artwork takes too long, we will open the preview with your child photo first so you can keep going.'
    );
    setPreviewEmailStatus('idle');
    setPreviewEmailFeedback('');
    activeGenerationPageIndexRef.current = null;
    setGenerationQueueVersion((currentVersion) => currentVersion + 1);
    updatePageGenerationState(firstIllustratedPageIndex, {
      status: 'idle',
      message: '',
    });
    setStoryPreview((currentPages) =>
      Array.isArray(currentPages) ? [...currentPages] : currentPages
    );
  };

  const handleRetrySavedPreviewRestore = () => {
    const projectId = String(formData.projectId || '').trim();
    if (!projectId) {
      return;
    }

    completedPreviewRestoreProjectsRef.current.delete(projectId);
    activePreviewRestoreProjectIdRef.current = null;
    setError('');
    setShowEmailFallback(false);
    setPreviewEmailStatus('idle');
    setPreviewEmailFeedback('');
    setPreviewEmailSentTo('');
    setPreviewPrepProgress(22);
    setPreviewPrepTitle('Reopening your saved book preview');
    setPreviewPrepDetail(
      'We are restoring your saved preview so you can continue without using another generation credit.'
    );
    setPreviewRestoreRetryNonce((currentValue) => currentValue + 1);
  };

  const handleIllustrationReady = (pageIndex, imageUrl) => {
    setStoryPreview((currentPages) => {
      if (!Array.isArray(currentPages)) {
        return currentPages;
      }

      const page = currentPages[pageIndex];
      if (!page || page.illustrationUrl === imageUrl) {
        return currentPages;
      }

      const nextPages = [...currentPages];
      nextPages[pageIndex] = {
        ...page,
        illustrationUrl: imageUrl,
        faceSwappedUrl:
          page.faceSwappedUrl === imageUrl ? imageUrl : page.faceSwappedUrl,
      };
      
      return nextPages;
    });

    updatePageGenerationState(pageIndex, {
      status: 'ready',
      message: '',
    });
  };

  const handleIllustrationStateChange = (pageIndex, nextState) => {
    updatePageGenerationState(pageIndex, nextState);
  };

  const getNextPendingIllustrationPageIndex = () => {
    if (!Array.isArray(storyPreview)) {
      return -1;
    }

    for (let index = 0; index < storyPreview.length; index += 1) {
      const page = storyPreview[index];
      if (!isIllustratedStoryPage(page) || getSavedPageImageUrl(page)) {
        continue;
      }

      if (pageGenerationStates[index]?.status === 'error') {
        continue;
      }

      return index;
    }

    return -1;
  };

  const handleGenerateStory = async (
    languageOverride = currentLanguage,
    { forceRegenerate = false } = {}
  ) => {
    const resolvedLanguage =
      typeof languageOverride === 'string' ? languageOverride : currentLanguage;

    if (storyPreview && !forceRegenerate) {
      setPreviewEmailFeedback('');
      return;
    }

    generationSessionRef.current += 1;

    setLoading(true);
    setError('');
    setStoryPreview(null);
    setPageGenerationStates({});
    resetFaceSwapQueue();
    activeGenerationPageIndexRef.current = null;
    setGenerationQueueVersion((currentVersion) => currentVersion + 1);
    setCurrentPage(0);
    setPreviewPrepProgress(14);
    setPreviewPrepTitle(
      `Creating ${formData.childName || 'your child'}'s book preview`
    );
    setPreviewPrepDetail(
      'We are writing the story and preparing the first illustrated page.'
    );
    setShowEmailFallback(false);
    setPreviewEmailStatus('idle');
    setPreviewEmailFeedback('');
    setPreviewEmailSentTo('');

    try {
      if (!formData.projectId) {
        setError('Project ID not found. Please go back and try again.');
        setLoading(false);
        return;
      }

      if (
        typeof window === 'undefined' ||
        !localStorage.getItem('authToken')
      ) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const customPrompt =
        formData.theme === 'customizable'
          ? formData.customIllustrationPrompt
          : null;

      const storyData = {
        childName: formData.childName || 'Child',
        childGender: formData.childGender || 'child',
        childInterests: formData.childInterests || '',
        childNotes: formData.childNotes || '',
        ageGroup: formData.ageGroup || '5-8',
        theme: formData.theme || 'animal-adventure',
        pageCount: formData.pageCount || 20,
        milestoneTitle: formData.milestoneTitle || '',
        milestonePromptHint: formData.milestonePromptHint || '',
        milestoneCoverBadge: formData.milestoneCoverBadge || '',
        isSeries: Boolean(formData.isSeries),
        chapterNumber: Number(formData.seriesChapterNumber) || 1,
        originalTheme: formData.seriesOriginalTheme || formData.theme || '',
        bundleSelected: Boolean(formData.seriesBundleSelected),
      };

      const storyResponse = await storyAPI.generateStory(
        formData.projectId,
        customPrompt,
        resolvedLanguage || formData.storyLanguage || 'en',
        storyData,
        { forceRegenerate }
      );

      const pages =
        storyResponse?.data?.story?.pages ||
        storyResponse?.data?.pages ||
        [];
      const nextPages = pages.length > 0 ? pages : [{}];
      setStoryPreview(nextPages);
      setPageGenerationStates(
        buildInitialPageGenerationStates(nextPages, shouldGateIllustrations)
      );

      setPreviewPrepProgress(42);
      setPreviewPrepDetail(
        shouldGateIllustrations
          ? 'Painting the first page now and applying your selected child photo while the rest of the preview keeps moving.'
          : 'Your preview is almost ready.'
      );
      setCurrentPage(0);
    } catch (err) {
      console.error('[GENERATE_STORY_ERROR]', err);
      console.error('[GENERATE_STORY_ERROR] Response:', err.response?.data);
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to generate story preview'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendPreviewEmail = async () => {
    if (!isPreviewEmailReady) {
      setPreviewEmailStatus('error');
      setPreviewEmailFeedback(PREVIEW_EMAIL_WAIT_MESSAGE);
      return;
    }

    if (!previewEmailRecipient) {
      setPreviewEmailStatus('error');
      setPreviewEmailFeedback(
        'Add a valid parent or account email before requesting the preview by email.'
      );
      return;
    }

    setPreviewEmailStatus('sending');
    setPreviewEmailFeedback('');

    try {
      useWizardStore.getState().saveDraft();
      await storyAPI.saveDraft({
        projectId: formData.projectId,
        step: 6,
        formData: {
          ...formData,
          storyPreview,
        },
      });

      const response = await storyAPI.sendPreviewEmail({
        childName: formData.childName,
        pageCount: formData.pageCount,
        projectId: formData.projectId,
        recipientEmail: previewEmailRecipient,
        theme: selectedThemeLabel,
      });

      const sentRecipient =
        response?.data?.recipientEmail || previewEmailRecipient;
      const isQueued = Boolean(response?.data?.queued);
      setPreviewEmailSentTo(sentRecipient);
      setPreviewEmailStatus(isQueued ? 'queued' : 'sent');
      setPreviewEmailFeedback(
        response?.data?.message ||
          (isQueued
            ? `We are still finishing the story. We will email ${sentRecipient} as soon as the saved preview is ready.`
            : `We emailed the secure preview link to ${sentRecipient}. You can reopen this project later from that email.`)
      );
    } catch (requestError) {
      const message =
        requestError?.response?.data?.details ||
        requestError?.response?.data?.error ||
        requestError?.message ||
        'Failed to send the preview email right now.';

      setPreviewEmailStatus('error');
      setPreviewEmailFeedback(message);
    }
  };

  useEffect(() => {
    if (!Array.isArray(storyPreview) || !shouldGateIllustrations) {
      return;
    }

    if (activeGenerationPageIndexRef.current !== null) {
      return;
    }

    const nextPageIndex = getNextPendingIllustrationPageIndex();
    if (nextPageIndex === -1) {
      return;
    }

    const page = storyPreview[nextPageIndex];
    const prompt =
      page?.illustrationPrompt ||
      [page?.title, page?.page_text || page?.text].filter(Boolean).join('. ');

    if (!prompt || !storySubjectImage) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const pageLabel = page?.pageNumber || nextPageIndex + 1;
    const generationSessionId = generationSessionRef.current;

    activeGenerationPageIndexRef.current = nextPageIndex;
    updatePageGenerationState(nextPageIndex, {
      status: 'loading',
      message: `Painting page ${pageLabel} of your storybook.`,
    });

    if (nextPageIndex === firstIllustratedPageIndex) {
      setPreviewPrepTitle(
        `Creating ${formData.childName || 'your child'}'s book preview`
      );
      setPreviewPrepDetail(
        'Painting the first page now. If artwork takes too long, we will open the preview with your child photo first so you can keep going.'
      );
    }

    createStoryPageIllustration({
      prompt,
      subjectImage: storySubjectImage,
      referenceImages: storyReferenceImages,
      bookThemeValue: formData.theme,
      signal: controller.signal,
      timeoutMs: PREVIEW_FIRST_PAGE_TIMEOUT_MS,
      onFaceSwapRequested: ({ faceImageUrl, illustrationImageUrl }) => {
        queueFaceSwapTask({
          generationSessionId,
          pageIndex: nextPageIndex,
          faceImageUrl,
          illustrationImageUrl,
        });
      },
      onPending: () => {
        if (cancelled) {
          return;
        }

        updatePageGenerationState(nextPageIndex, {
          status: 'loading',
          message:
            nextPageIndex === firstIllustratedPageIndex
              ? 'The first page is taking a little longer than usual, but it is still processing.'
              : `Page ${pageLabel} is still processing in the background.`,
        });

        if (nextPageIndex === firstIllustratedPageIndex) {
          setPreviewPrepDetail(
            'The first page is taking a little longer than usual, but it is still processing.'
          );
        }
      },
    })
      .then((imageUrl) => {
        if (cancelled) {
          return;
        }

        handleIllustrationReady(nextPageIndex, imageUrl);

        if (nextPageIndex === firstIllustratedPageIndex) {
          setPreviewPrepProgress(100);
          setPreviewPrepDetail(
            imageUrl === storySubjectImage ||
            imageUrl.startsWith('data:image/svg+xml')
              ? 'Your preview is ready with a temporary personalized image so you can keep reading while the AI artwork continues later.'
              : 'Your preview is ready.'
          );
        }
      })
      .catch((generationError) => {
        if (
          generationError instanceof DOMException &&
          generationError.name === 'AbortError'
        ) {
          return;
        }

        if (cancelled) {
          return;
        }

        const message =
          generationError instanceof Error
            ? generationError.message
            : 'Illustration generation failed for this page.';
        const fallbackImageUrl = createTimedFallbackIllustration({
          prompt,
          bookThemeValue: formData.theme,
          subjectImage: storySubjectImage,
        });

        console.error('[ILLUSTRATION_GENERATION_ERROR]', {
          pageIndex: nextPageIndex,
          message,
        });

        handleIllustrationReady(nextPageIndex, fallbackImageUrl);
        updatePageGenerationState(nextPageIndex, {
          status: 'ready',
          message:
            'We opened this page with a vibrant temporary scene while the final illustration is retried later.',
        });

        if (nextPageIndex === firstIllustratedPageIndex) {
          setPreviewPrepProgress(100);
          setPreviewPrepDetail(
            'The first page opened with a bright temporary scene so you can keep previewing while we continue improving the artwork.'
          );
        }
      })
      .finally(() => {
        activeGenerationPageIndexRef.current = null;

        if (!cancelled) {
          setGenerationQueueVersion((currentVersion) => currentVersion + 1);
        }
      });

    return () => {
      cancelled = true;
      activeGenerationPageIndexRef.current = null;
      controller.abort();
    };
  }, [
    firstIllustratedPageIndex,
    formData.childName,
    generationQueueVersion,
    shouldGateIllustrations,
    storyReferenceImages,
    storyPreview,
    storySubjectImage,
  ]);

  const handleNextPage = () => {
    if (canMoveToNextPage) {
      setFlipAnimation(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setFlipAnimation(false);
      }, 200);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setFlipAnimation(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setFlipAnimation(false);
      }, 200);
    }
  };

  const handleSelectFaceImage = (photo) => {
    setSelectedFaceImage(photo?.preview || null);
    setSelectedFaceReferenceImage(
      photo?.illustrationReference || photo?.preview || null
    );
  };

  useEffect(() => {
    const isPreparingStoryText = (loading || isRestoringSavedPreview) && !storyPreview;
    if (!isPreparingStoryText && !isPreparingInitialPreview) {
      setShowEmailFallback(false);
      return;
    }

    const maxProgress = isPreparingInitialPreview ? 88 : 64;
    const progressInterval = window.setInterval(() => {
      setPreviewPrepProgress((currentProgress) =>
        Math.min(maxProgress, currentProgress + 2)
      );
    }, 1200);
    const quoteInterval = window.setInterval(() => {
      setQuoteIndex((currentIndex) => currentIndex + 1);
    }, 5000);
    const emailTimeout = window.setTimeout(() => {
      setShowEmailFallback(true);
    }, 12000);

    return () => {
      window.clearInterval(progressInterval);
      window.clearInterval(quoteInterval);
      window.clearTimeout(emailTimeout);
    };
  }, [isPreparingInitialPreview, isRestoringSavedPreview, loading, storyPreview]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!storyPreview) return;
      if (event.key === 'ArrowRight' && canMoveToNextPage) handleNextPage();
      if (event.key === 'ArrowLeft') handlePrevPage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canMoveToNextPage, currentPage, storyPreview]);

  useEffect(() => {
    const handleLanguageChange = (event) => {
      const nextLanguage =
        event?.detail?.language || formData.storyLanguage || currentLanguage;

      if (storyPreview) {
        setPreviewEmailStatus('idle');
        setPreviewEmailFeedback(
          'Language updated for future edits. Use Regenerate Preview if you want to rebuild this saved story in the new language.'
        );
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('storyLanguageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storyLanguageChanged', handleLanguageChange);
    };
  }, [storyPreview, currentLanguage, formData.storyLanguage]);

  const handleCheckout = async () => {
    if (!allIllustratedPagesReady) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!formData.projectId) {
        setError('Project ID not found. Please go back and try again.');
        setLoading(false);
        return;
      }

      if (giftData.isGift && !giftData.isComplete) {
        setError(
          'Please complete the gift recipient name and a valid email before checkout.'
        );
        setLoading(false);
        return;
      }

      const response = await paymentAPI.createCheckout({
        projectId: formData.projectId,
        currency,
        country: selectedCountryOption.country,
        pageCount: formData.pageCount,
        buyerName:
          authUser?.name ||
          authUser?.email ||
          formData.parentEmail ||
          formData.childName,
        childName: formData.childName,
        theme: formData.theme,
        isGift: Boolean(giftData.isGift),
        giftData: giftData.isGift
          ? {
              recipientName: giftData.recipientName,
              recipientEmail: giftData.recipientEmail,
              giftMessage: giftData.giftMessage,
            }
          : null,
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else if (response.data.sessionId) {
        if (response.data.sessionId.startsWith('mock_session_')) {
          alert(
            'Stripe is not configured in development mode. This is a test environment.'
          );
          window.location.href = `/success?session_id=${response.data.sessionId}&project_id=${formData.projectId}`;
        } else {
          window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
        }
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('[CHECKOUT_ERROR]:', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'Failed to process checkout'
      );
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (index) => {
    if (!canAccessPage(index)) {
      return;
    }

    if (index !== currentPage) {
      setFlipAnimation(true);
      setTimeout(() => {
        setCurrentPage(index);
        setFlipAnimation(false);
      }, 200);
    }
  };

  const renderPageContent = (page, index) => {
    if (index === 0) {
      return (
        <div
          className="relative flex min-h-[620px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl p-8 text-white sm:min-h-[700px] lg:min-h-[760px]"
          style={{ background: currentTheme.gradient }}
        >
          <img
            src={coverPreviewArt}
            alt={selectedThemeLabel}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.16)_38%,rgba(15,23,42,0.66)_100%)]" />

          <div className="relative z-10 text-center">
            <h1
              className="mb-2 text-5xl font-black"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              {formData.childName}'s
            </h1>
            <h2
              className="mb-2 text-3xl font-bold"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
            >
              {selectedThemeLabel}
            </h2>
            <p
              className="text-xl opacity-90"
              style={{ textShadow: '0 1px 5px rgba(0,0,0,0.2)' }}
            >
              A premium personalized storybook preview.
            </p>
          </div>
        </div>
      );
    }

    if (index === storyPreview.length - 1) {
      return (
        <div
          className="flex min-h-[620px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl p-8 text-white sm:min-h-[700px] lg:min-h-[760px]"
          style={{ background: currentTheme.gradient }}
        >
          <div className="text-center">
            <div className="mb-6 text-7xl">*</div>
            <h3 className="mb-4 text-4xl font-black">The End</h3>
            <p className="mx-auto max-w-sm text-xl leading-relaxed">
              {formData.childName} discovered that imagination is the greatest
              superpower of all.
            </p>
            <p className="mt-6 text-lg italic opacity-90">Your book world awaits.</p>
          </div>
        </div>
      );
    }

    return (
      <CharacterConsistentStoryPage
        autoGenerateIllustration={false}
        bookThemeValue={formData.theme}
        generationState={pageGenerationStates[index] || null}
        page={page}
        pageIndex={index}
        referenceImages={storyReferenceImages}
        subjectImage={storySubjectImage}
        onIllustrationReady={(imageUrl) => handleIllustrationReady(index, imageUrl)}
        onIllustrationStateChange={(nextState) =>
          handleIllustrationStateChange(index, nextState)
        }
      />
    );
  };

  return (
    <div
      className="step-container min-h-screen w-full px-4 py-10"
      style={{ background: currentTheme.light }}
    >
      <div className="mx-auto mb-10 max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-gray-900">
            Review Your Storybook
          </h2>
          <p className="text-xl text-gray-600">Your personalized book preview</p>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-2xl rounded-2xl border-2 border-red-300 bg-red-100 px-6 py-4 text-red-800">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {!storyPreview && !showPreviewPreparationScreen && (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-3">
              {formData.projectId ? (
                <button
                  type="button"
                  onClick={handleRetrySavedPreviewRestore}
                  disabled={loading}
                  className="inline-block rounded-full border-2 border-slate-900 px-8 py-4 text-lg font-bold text-slate-900 transition-all duration-300 hover:scale-105 hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reopen Saved Preview
                </button>
              ) : null}

              <button
                onClick={() => handleGenerateStory()}
                disabled={loading}
                className="inline-block rounded-full px-12 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: currentTheme.gradient,
                  boxShadow: `0 8px 20px ${currentTheme.primary}40`,
                }}
              >
                {loading ? 'Generating your story...' : 'Preview Story'}
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Saved previews load automatically when you return from payment without regenerating.
            </p>
          </div>
        )}

        {showPreviewPreparationScreen && (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-10">
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-900 sm:text-4xl">
                {formData.childName || 'Your Child'}&apos;s Book Preview
              </h3>
              <div className="mt-6 space-y-3 text-sm font-semibold text-slate-600 sm:text-lg">
                <p>Pages unlock one by one as each illustration is ready.</p>
                <p>Swipe and stop on any finished page when you like it best.</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${currentTheme.primary} ${
                    Math.max(8, Math.min(100, previewPrepProgress)) * 3.6
                  }deg, rgba(148,163,184,0.18) 0deg)`,
                }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-700">
                  {Math.max(8, Math.min(100, Math.round(previewPrepProgress)))}%
                </div>
              </div>

              <p className="mt-8 text-2xl font-semibold text-slate-800">
                {previewPrepTitle}
              </p>
              <p className="mt-3 max-w-xl text-center text-base leading-7 text-slate-600">
                {pageGenerationStates[firstIllustratedPageIndex]?.status === 'error'
                  ? pageGenerationStates[firstIllustratedPageIndex]?.message ||
                    'The first preview page could not be generated right now.'
                  : previewPrepDetail}
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-md rounded-[28px] bg-slate-900 px-6 py-8 text-center text-white shadow-xl">
              <p className="text-xl font-semibold italic leading-9">
                &ldquo;{currentQuote.quote}&rdquo;
              </p>
              <p className="mt-4 text-base font-bold text-amber-300">
                {currentQuote.author}
              </p>
            </div>

            {pageGenerationStates[firstIllustratedPageIndex]?.status === 'error' && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetryPreviewPreparation}
                  className="rounded-full border-2 border-slate-900 px-6 py-3 font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  Retry First Page
                </button>
              </div>
            )}

            {showEmailFallback && (
              <div className="mx-auto mt-8 max-w-md rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-6 text-center shadow-sm">
                <p className="text-2xl font-semibold text-slate-900">
                  Don&apos;t have time to wait?
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  We&apos;ll email the preview link to{' '}
                  <span className="font-semibold text-slate-900">
                    {previewEmailRecipient || 'your saved email'}
                  </span>{' '}
                  so you can reopen this project later without losing your place.
                </p>
                <button
                  type="button"
                  onClick={handleSendPreviewEmail}
                  disabled={
                    previewEmailStatus === 'sending' ||
                    !previewEmailRecipient ||
                    !isPreviewEmailReady
                  }
                  className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {previewEmailStatus === 'sending'
                    ? 'Sending Preview Email...'
                    : previewEmailStatus === 'queued'
                      ? 'Preview Email Scheduled'
                    : previewEmailStatus === 'sent'
                      ? 'Preview Email Sent'
                      : 'Email Me The Preview Instead'}
                </button>
                {!isPreviewEmailReady && (
                  <p className="mt-3 text-sm text-amber-700">
                    {PREVIEW_EMAIL_WAIT_MESSAGE}
                  </p>
                )}
                {previewEmailFeedback && (
                  <p
                    className={`mt-3 text-sm ${
                      previewEmailStatus === 'error'
                        ? 'text-red-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {previewEmailFeedback}
                  </p>
                )}
                {(previewEmailStatus === 'sent' ||
                  previewEmailStatus === 'queued') &&
                  previewEmailSentTo && (
                  <p className="mt-2 text-xs text-slate-500">
                    {previewEmailStatus === 'queued'
                      ? `We will send it to ${previewEmailSentTo}`
                      : `Delivery sent to ${previewEmailSentTo}`}
                  </p>
                )}
                {previewEmailHelpAvailable && (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = supportMailtoLink;
                      }}
                      className="mt-3 text-sm font-semibold text-blue-700 underline underline-offset-4"
                    >
                      Open Support Email Instead
                    </button>
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      {shouldShowStoryPreview && (
        <div className="w-full">
          <div
            className="flex min-h-screen w-full flex-col lg:flex-row"
            style={{ background: currentTheme.light }}
          >
            <div className="hidden max-h-screen overflow-y-auto border-r border-gray-200 bg-white/50 p-4 lg:flex lg:w-32 lg:flex-col lg:gap-3">
              {storyPreview.map((page, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  disabled={!canAccessPage(index)}
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${
                    currentPage === index
                      ? 'scale-105 ring-4'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor:
                      currentPage === index
                        ? currentTheme.primary
                        : `${currentTheme.primary}30`,
                    ringColor: currentTheme.primary,
                    backgroundColor:
                      currentPage === index
                        ? `${currentTheme.primary}15`
                        : 'transparent',
                  }}
                  title={`Page ${index + 1}`}
                >
                  {index === 0 ? (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl"
                      style={{ background: currentTheme.gradient }}
                    >
                      C
                    </div>
                  ) : index === storyPreview.length - 1 ? (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl"
                      style={{ background: currentTheme.gradient }}
                    >
                      E
                    </div>
                  ) : (
                    <>
                      {storyPreview[index].faceSwappedUrl || storyPreview[index].illustrationUrl ? (
                        <img
                          src={storyPreview[index].faceSwappedUrl || storyPreview[index].illustrationUrl}
                          alt={`Page ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100 text-xs font-bold text-slate-600">
                          Scene
                        </div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col">
              <div
                className={`flex flex-1 flex-col items-center justify-start p-4 transition-all duration-300 lg:justify-center lg:p-8 ${
                  flipAnimation ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <div className="mb-4 text-center">
                  <p className="text-lg font-bold text-gray-900 lg:text-2xl">
                    Page{' '}
                    <span
                      className="text-2xl lg:text-3xl"
                      style={{ color: currentTheme.primary }}
                    >
                      {currentPage + 1}
                    </span>{' '}
                    of{' '}
                    <span
                      className="text-2xl lg:text-3xl"
                      style={{ color: currentTheme.primary }}
                    >
                      {storyPreview.length}
                    </span>
                  </p>
                </div>

                <div
                  className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:max-w-4xl"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                >
                  {renderPageContent(currentPageData, currentPage)}
                </div>

                {currentPageRequiresIllustration && !isPageIllustrationReady(currentPageData, currentPage) && (
                  <div className="mt-4 max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-center text-amber-900">
                    <p className="font-semibold">
                      Page {currentPage + 1} illustration is still being generated.
                    </p>
                    <p className="mt-1 text-sm text-amber-800">
                      {currentPageState?.message ||
                        'Please wait on this page until the artwork is ready before moving ahead.'}
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="rounded-full border-2 px-6 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      backgroundColor: `${currentTheme.primary}10`,
                    }}
                  >
                    Previous
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={!canMoveToNextPage}
                    className="rounded-full border-2 px-6 py-3 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                    style={{
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      backgroundColor: `${currentTheme.primary}10`,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="w-full border-t-2 border-gray-200 bg-white/80 p-4 backdrop-blur-md lg:p-6">
                <div className="mx-auto max-w-6xl">
                  <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-300">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        background: currentTheme.gradient,
                        width: `${((currentPage + 1) / storyPreview.length) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="mb-4 overflow-x-auto pb-3 lg:hidden">
                    <div className="flex justify-start gap-2">
                      {storyPreview.map((page, index) => (
                        <button
                          key={index}
                          onClick={() => goToPage(index)}
                          disabled={!canAccessPage(index)}
                          className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 ${
                            currentPage === index
                              ? 'ring-2'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            borderColor: currentTheme.primary,
                            backgroundColor:
                              currentPage === index
                                ? `${currentTheme.primary}10`
                                : 'transparent',
                          }}
                          title={`Page ${index + 1}`}
                        >
                          {index === 0 ? (
                            <div
                              className="flex h-full w-full items-center justify-center text-lg"
                              style={{ background: currentTheme.gradient }}
                            >
                              C
                            </div>
                          ) : index === storyPreview.length - 1 ? (
                            <div
                              className="flex h-full w-full items-center justify-center text-lg"
                              style={{ background: currentTheme.gradient }}
                            >
                              E
                            </div>
                          ) : storyPreview[index].faceSwappedUrl || storyPreview[index].illustrationUrl ? (
                            <div className="relative h-full w-full">
                              <img
                                src={storyPreview[index].faceSwappedUrl || storyPreview[index].illustrationUrl}
                                alt={`Page ${index + 1}`}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-rose-100 text-[10px] font-bold text-slate-600">
                              Scene
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mb-4 rounded-2xl border bg-white/90 p-4 shadow-sm"
                    style={{ borderColor: `${currentTheme.primary}25` }}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p
                          className="text-xs font-black uppercase tracking-[0.24em]"
                          style={{ color: currentTheme.primary }}
                        >
                          Pricing Region
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          Choose the checkout country and we will update the
                          currency and preview price instantly.
                        </p>
                      </div>

                      <div className="w-full md:max-w-sm">
                        <label
                          htmlFor="checkout-country"
                          className="mb-2 block text-xs font-bold text-gray-600"
                        >
                          Country
                        </label>
                        <select
                          id="checkout-country"
                          value={selectedCountryOption.country}
                          onChange={handleCountryChange}
                          className="w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm outline-none transition-all focus:ring-2"
                          style={{
                            borderColor: `${currentTheme.primary}40`,
                            boxShadow: `0 0 0 0 ${currentTheme.primary}`,
                          }}
                        >
                          {COUNTRY_CURRENCY_OPTIONS.map((option) => (
                            <option key={option.country} value={option.country}>
                              {option.country} ({option.currency})
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500">
                          Billing preview: {CURRENCY_SYMBOLS[currency]}
                          {price} for {formData.pageCount} pages
                        </p>
                        {selectedCountryOption.country === 'India' ? (
                          <p className="mt-1 text-xs font-semibold text-emerald-700">
                            India checkout will prioritize UPI when it is available on your Stripe account.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
                    <div
                      className="rounded-lg p-2"
                      style={{ background: currentTheme.light }}
                    >
                      <p className="mb-1 text-xs font-bold text-gray-600">Child</p>
                      <p
                        className="text-sm font-black"
                        style={{ color: currentTheme.primary }}
                      >
                        {formData.childName}
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-2"
                      style={{ background: currentTheme.light }}
                    >
                      <p className="mb-1 text-xs font-bold text-gray-600">Age</p>
                      <p
                        className="text-sm font-black"
                        style={{ color: currentTheme.primary }}
                      >
                        {formData.ageGroup}
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-2"
                      style={{ background: currentTheme.light }}
                    >
                      <p className="mb-1 text-xs font-bold text-gray-600">Theme</p>
                      <p
                        className="text-sm font-black"
                        style={{ color: currentTheme.primary }}
                      >
                        {selectedThemeLabel}
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-2"
                      style={{ background: currentTheme.light }}
                    >
                      <p className="mb-1 text-xs font-bold text-gray-600">Country</p>
                      <p
                        className="text-sm font-black"
                        style={{ color: currentTheme.primary }}
                      >
                        {selectedCountryOption.country}
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-2"
                      style={{ background: currentTheme.light }}
                    >
                      <p className="mb-1 text-xs font-bold text-gray-600">Price</p>
                      <p
                        className="text-sm font-black"
                        style={{ color: currentTheme.primary }}
                      >
                        {CURRENCY_SYMBOLS[currency]}
                        {price}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{currency}</p>
                    </div>
                  </div>

                  {(formData.milestoneTitle || formData.isSeries) && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {formData.milestoneTitle ? (
                        <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900">
                          Milestone: {formData.milestoneTitle}
                        </div>
                      ) : null}
                      {formData.isSeries ? (
                        <div className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-bold text-sky-900">
                          Chapter {formData.seriesChapterNumber || 2} sequel
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className="mb-6">
                    <GiftStory value={giftData} onChange={setGiftData} />
                  </div>

                  {formData.uploadedImages && formData.uploadedImages.length > 0 && (
                    <div
                      className="mb-6 rounded-2xl border-2 bg-gradient-to-r from-purple-50 to-pink-50 p-6"
                      style={{ borderColor: currentTheme.primary }}
                    >
                      <h3
                        className="mb-4 text-xl font-bold"
                        style={{ color: currentTheme.primary }}
                      >
                        Main Character Reference
                      </h3>

                      <div className="mb-4">
                        <p className="mb-3 text-sm font-semibold text-gray-700">
                          Select the clearest front-facing child photo. We use
                          this selected photo as the primary identity
                          reference and prioritize it over the outfit,
                          background, and story theme:
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {formData.uploadedImages.map((photo, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectFaceImage(photo)}
                              className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                                selectedFaceImage === photo.preview
                                  ? 'scale-110 ring-2'
                                  : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{
                                borderColor:
                                  selectedFaceImage === photo.preview
                                    ? currentTheme.primary
                                    : '#ccc',
                                ringColor: currentTheme.primary,
                              }}
                              title={`Face ${idx + 1}`}
                            >
                              <img
                                src={photo.preview}
                                alt={`Face ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateStory(currentLanguage, {
                              forceRegenerate: true,
                            })
                          }
                          disabled={loading || !selectedFaceReferenceImage}
                          className="flex-1 rounded-lg px-4 py-3 font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            background: currentTheme.gradient,
                          }}
                        >
                          {loading
                            ? 'Regenerating...'
                            : 'Regenerate Preview With Selected Photo'}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        This rebuilds the preview using the selected photo as
                        the main identity reference so the illustrated face
                        stays closer to your child.
                      </p>
                    </div>
                  )}

                  {isFreePreviewLocked && (
                    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-5 text-center text-amber-950">
                      <p className="text-lg font-black">
                        Free preview is limited to the first {FREE_PREVIEW_PAGE_LIMIT} pages
                      </p>
                      <p className="mt-2 text-sm leading-7 text-amber-900">
                        {lockedPreviewPageCount} more page
                        {lockedPreviewPageCount === 1 ? '' : 's'} are waiting
                        behind checkout. Families can sample the story first,
                        then unlock the full book and PDF.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={prevStep}
                      className="rounded-full border-2 border-gray-900 px-6 py-3 font-bold text-gray-900 transition-all duration-300 hover:bg-gray-100"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => {
                        if (!isFreePreviewLocked && allIllustratedPagesReady) {
                          setShowPDFPreview(true);
                        }
                      }}
                      disabled={!allIllustratedPagesReady || isFreePreviewLocked}
                      className="rounded-full border-2 px-6 py-3 font-bold transition-all duration-300 hover:bg-green-50"
                      style={{
                        borderColor: '#10B981',
                        color: '#059669',
                      }}
                    >
                      {isFreePreviewLocked
                        ? 'Unlock PDF After Checkout'
                        : 'View PDF Preview'}
                    </button>

                    <button
                      onClick={() => {
                        alert(
                          'This story is automatically saved as a draft. You can find it in your Dashboard under Draft Stories.'
                        );
                      }}
                      className="rounded-full border-2 px-6 py-3 font-bold transition-all duration-300 hover:bg-yellow-50"
                      style={{
                        borderColor: '#FCD34D',
                        color: '#E8AB1A',
                      }}
                    >
                      Draft Saved
                    </button>

                    <button
                      type="button"
                      onClick={handleSendPreviewEmail}
                      disabled={
                        previewEmailStatus === 'sending' ||
                        !previewEmailRecipient ||
                        !isPreviewEmailReady
                      }
                      className="rounded-full border-2 px-6 py-3 font-bold transition-all duration-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        borderColor: '#2563EB',
                        color: '#1D4ED8',
                      }}
                    >
                      {previewEmailStatus === 'sending'
                        ? 'Sending Email...'
                        : previewEmailStatus === 'sent'
                          ? 'Email Sent'
                          : 'Send to Email'}
                    </button>

                    <button
                      onClick={handleCheckout}
                      disabled={loading || !allIllustratedPagesReady}
                      className="rounded-full px-8 py-3 font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        background: currentTheme.gradient,
                        boxShadow: `0 8px 20px ${currentTheme.primary}40`,
                      }}
                    >
                      {loading
                        ? 'Processing...'
                        : `${CURRENCY_SYMBOLS[currency]}${price} - Checkout`}
                    </button>
                  </div>

                  {!allIllustratedPagesReady && (
                    <p className="mt-3 text-center text-sm text-gray-600">
                      Finish generating each story page illustration in order to unlock checkout.
                      {illustrationsRemainingCount > 0
                        ? ` ${illustrationsRemainingCount} illustrated page${illustrationsRemainingCount === 1 ? '' : 's'} remaining.`
                        : ''}
                    </p>
                  )}

                  {!isPreviewEmailReady && (
                    <p className="mt-3 text-center text-sm text-amber-700">
                      {PREVIEW_EMAIL_WAIT_MESSAGE}
                    </p>
                  )}

                  {previewEmailFeedback && !showPreviewPreparationScreen && (
                    <p
                      className={`mt-3 text-center text-sm ${
                        previewEmailStatus === 'error'
                          ? 'text-red-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {previewEmailFeedback}
                    </p>
                  )}

                  <p className="mt-3 text-center text-xs text-gray-500">
                    Stripe checkout will securely collect the billing address,
                    shipping address, and mobile number for this order.
                  </p>

                  <p className="mt-2 text-center text-xs text-gray-500">
                    Tip: Use the left and right arrow keys to navigate pages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {storyPreview && (
        <PDFPreviewModal
          storyPages={storyPreview}
          isOpen={showPDFPreview}
          onClose={() => setShowPDFPreview(false)}
          theme={currentTheme}
        />
      )}
    </div>
  );
}
