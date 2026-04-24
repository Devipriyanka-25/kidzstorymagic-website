'use client';

import { useEffect, useMemo, useState } from 'react';
import PDFPreviewModal from './PDFPreviewModal';
import CharacterConsistentStoryPage from '@/components/story/CharacterConsistentStoryPage';
import { useLanguage } from '@/hooks/useLanguage';
import { storyAPI, paymentAPI, faceSwapAPI } from '@/utils/api';
import { useWizardStore, useCurrencyStore } from '@/utils/store';
import { getTheme } from '@/utils/themes';

const isIllustratedStoryPage = (page) => page?.pageType === 'story';
const PREVIEW_SUPPORT_EMAIL = 'support@kidzstorymagic.com';
const PREVIEW_POLL_INTERVAL_MS = 3000;
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
        Boolean(page?.illustrationUrl)
          ? 'ready'
          : 'idle',
      message: '',
    };
    return states;
  }, {});

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

async function pollStoryPageIllustration(predictionId, signal, onPending) {
  for (let attempt = 0; ; attempt += 1) {
    if (attempt > 0) {
      await waitForDelay(PREVIEW_POLL_INTERVAL_MS, signal);
    }

    const response = await fetch(
      `/api/generate-story-page/${encodeURIComponent(predictionId)}`,
      {
        method: 'GET',
        cache: 'no-store',
        signal,
      }
    );
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        payload?.details ||
          payload?.error ||
          'Illustration generation failed for this page.'
      );
    }

    if (payload?.pending) {
      onPending?.(payload);
      continue;
    }

    if (typeof payload?.imageUrl === 'string' && payload.imageUrl) {
      return payload.imageUrl;
    }

    throw new Error('Illustration generation completed without an image.');
  }
}

async function createStoryPageIllustration({
  prompt,
  subjectImage,
  signal,
  onPending,
}) {
  const response = await fetch('/api/generate-story-page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      prompt,
      subjectImage,
    }),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload?.details ||
        payload?.error ||
        'Illustration generation failed for this page.'
    );
  }

  if (typeof payload?.imageUrl === 'string' && payload.imageUrl) {
    return payload.imageUrl;
  }

  if (payload?.pending && typeof payload?.predictionId === 'string') {
    onPending?.(payload);
    return pollStoryPageIllustration(payload.predictionId, signal, onPending);
  }

  throw new Error('Illustration generation completed without an image.');
}

export default function Step6ReviewCheckout() {
  const { formData, prevStep } = useWizardStore();
  const { currency = 'USD', exchangeRates } = useCurrencyStore();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storyPreview, setStoryPreview] = useState(null);
  const [pageGenerationStates, setPageGenerationStates] = useState({});
  const [activeGenerationPageIndex, setActiveGenerationPageIndex] =
    useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewPrepProgress, setPreviewPrepProgress] = useState(12);
  const [previewPrepTitle, setPreviewPrepTitle] = useState('Creating your book');
  const [previewPrepDetail, setPreviewPrepDetail] = useState(
    'We are writing your story and preparing the first illustrated page.'
  );
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Face swap state
  const [isFaceSwapping, setIsFaceSwapping] = useState(false);
  const [faceSwapProgress, setFaceSwapProgress] = useState(0);
  const [swappedPages, setSwappedPages] = useState({});
  const [selectedFaceImage, setSelectedFaceImage] = useState(null);

  const basePriceUSD = {
    10: 9.99,
    20: 14.99,
    30: 19.99,
  }[formData.pageCount] || 9.99;

  const exchangeRate = exchangeRates[currency] || 1;
  const price = (basePriceUSD * exchangeRate).toFixed(2);

  const currencySymbols = {
    USD: '$',
    CAD: 'C$',
    GBP: 'GBP ',
    EUR: 'EUR ',
    AUD: 'A$',
    INR: 'INR ',
  };

  const getActiveTheme = () => {
    if (formData.illustrationStyle) {
      return getTheme(formData.illustrationStyle);
    }

    const themeMapping = {
      family: 'fantasy',
      friends: 'jungle',
      motivational: 'superhero',
      behavioural: 'wizard',
      fairytale: 'fairytale',
      customizable: 'fantasy',
    };

    const illustrationTheme = themeMapping[formData.theme] || 'fantasy';
    return getTheme(illustrationTheme);
  };

  const currentTheme = getActiveTheme();
  const storySubjectImage =
    selectedFaceImage ||
    formData.uploadedImages?.[0]?.preview ||
    formData.uploadedPhoto?.watermarkedUrl ||
    null;
  const shouldGateIllustrations = Boolean(storySubjectImage);

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

  const isPageIllustrationReady = (page, pageIndex) => {
    if (!shouldGateIllustrations || !isIllustratedStoryPage(page)) {
      return true;
    }

    return (
      Boolean(page?.illustrationUrl) ||
      pageGenerationStates[pageIndex]?.status === 'ready'
    );
  };

  const canAccessPage = (targetPageIndex) => {
    if (!Array.isArray(storyPreview)) {
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
  const allIllustratedPagesReady = Array.isArray(storyPreview)
    ? storyPreview.every((page, pageIndex) =>
        isPageIllustrationReady(page, pageIndex)
      )
    : false;
  const illustrationsRemainingCount = Array.isArray(storyPreview)
    ? storyPreview.filter(
        (page, pageIndex) => !isPageIllustrationReady(page, pageIndex)
      ).length
    : 0;
  const currentQuote = PREVIEW_QUOTES[quoteIndex % PREVIEW_QUOTES.length];
  const showPreviewPreparationScreen =
    (loading && !storyPreview) || isPreparingInitialPreview;
  const supportMailtoLink = useMemo(() => {
    const requestedRecipient = formData.parentEmail || 'my login email';
    const body = [
      'Hi Kidz Story Magic team,',
      '',
      'My preview is still generating. Please email the preview when it is ready.',
      '',
      `Project ID: ${formData.projectId || 'Unavailable'}`,
      `Child name: ${formData.childName || 'Unavailable'}`,
      `Theme: ${formData.theme || 'Unavailable'}`,
      `Page count: ${formData.pageCount || 'Unavailable'}`,
      `Preferred recipient: ${requestedRecipient}`,
      '',
      'Thank you!',
    ].join('\n');

    return `mailto:${PREVIEW_SUPPORT_EMAIL}?subject=${encodeURIComponent(
      `Preview request for ${formData.childName || 'storybook'}`
    )}&body=${encodeURIComponent(body)}`;
  }, [
    formData.childName,
    formData.pageCount,
    formData.parentEmail,
    formData.projectId,
    formData.theme,
  ]);

  const handleRetryPreviewPreparation = () => {
    if (firstIllustratedPageIndex === -1) {
      return;
    }

    setError('');
    setPreviewPrepProgress(42);
    setPreviewPrepDetail(
      'Painting the first page now. Your preview will open as soon as it is ready.'
    );
    updatePageGenerationState(firstIllustratedPageIndex, {
      status: 'idle',
      message: '',
    });
    setStoryPreview((currentPages) =>
      Array.isArray(currentPages) ? [...currentPages] : currentPages
    );
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
      if (!isIllustratedStoryPage(page) || page?.illustrationUrl) {
        continue;
      }

      if (pageGenerationStates[index]?.status === 'error') {
        return -1;
      }

      return index;
    }

    return -1;
  };

  const handleGenerateStory = async (languageOverride = currentLanguage) => {
    const resolvedLanguage =
      typeof languageOverride === 'string' ? languageOverride : currentLanguage;

    setLoading(true);
    setError('');
    setStoryPreview(null);
    setPageGenerationStates({});
    setActiveGenerationPageIndex(null);
    setCurrentPage(0);
    setPreviewPrepProgress(14);
    setPreviewPrepTitle(
      `Creating ${formData.childName || 'your child'}'s book preview`
    );
    setPreviewPrepDetail(
      'We are writing the story and preparing the first illustrated page.'
    );
    setShowEmailFallback(false);

    try {
      if (!formData.projectId) {
        setError('Project ID not found. Please go back and try again.');
        setLoading(false);
        return;
      }

      const token =
        typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

      if (!token) {
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
        ageGroup: formData.ageGroup || '5-8',
        theme: formData.theme || 'fantasy',
        pageCount: formData.pageCount || 20,
      };

      const storyResponse = await storyAPI.generateStory(
        formData.projectId,
        customPrompt,
        resolvedLanguage || 'en',
        storyData
      );

      const pages = storyResponse.data.story.pages || [];
      const nextPages = pages.length > 0 ? pages : [{}];
      setStoryPreview(nextPages);
      setPageGenerationStates(
        buildInitialPageGenerationStates(nextPages, shouldGateIllustrations)
      );
      setPreviewPrepProgress(42);
      setPreviewPrepDetail(
        shouldGateIllustrations
          ? 'Painting the first page now. Your preview will open as soon as it is ready.'
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

  useEffect(() => {
    if (!Array.isArray(storyPreview) || !shouldGateIllustrations) {
      return;
    }

    if (activeGenerationPageIndex !== null) {
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

    setActiveGenerationPageIndex(nextPageIndex);
    updatePageGenerationState(nextPageIndex, {
      status: 'loading',
      message: `Painting page ${pageLabel} of your storybook.`,
    });

    if (nextPageIndex === firstIllustratedPageIndex) {
      setPreviewPrepTitle(
        `Creating ${formData.childName || 'your child'}'s book preview`
      );
      setPreviewPrepDetail(
        'Painting the first page now. Your preview will open as soon as it is ready.'
      );
    }

    createStoryPageIllustration({
      prompt,
      subjectImage: storySubjectImage,
      signal: controller.signal,
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
          setPreviewPrepDetail('Your preview is ready.');
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

        updatePageGenerationState(nextPageIndex, {
          status: 'error',
          message,
        });

        if (nextPageIndex === firstIllustratedPageIndex) {
          setError(
            'We could not finish the first preview page right now. You can try again or request the preview by email.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setActiveGenerationPageIndex(null);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    activeGenerationPageIndex,
    firstIllustratedPageIndex,
    formData.childName,
    shouldGateIllustrations,
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

  const handleFaceSwap = async () => {
    if (
      !selectedFaceImage ||
      !storyPreview ||
      currentPage === 0 ||
      currentPage === storyPreview.length - 1 ||
      !isPageIllustrationReady(storyPreview[currentPage], currentPage)
    ) {
      setError('Please select a face image and a story page.');
      return;
    }

    setIsFaceSwapping(true);
    setFaceSwapProgress(0);
    setError('');

    try {
      const page = storyPreview[currentPage];

      if (!page.illustrationUrl) {
        setError('This page does not have an illustration yet.');
        setIsFaceSwapping(false);
        return;
      }

      setFaceSwapProgress(25);

      const result = await faceSwapAPI.swapFaceDeepAI(
        selectedFaceImage,
        page.illustrationUrl,
        {
          pageNumber: currentPage,
          childName: formData.childName,
          storyId: formData.projectId,
        }
      );

      setFaceSwapProgress(100);

      const swappedUrl = result?.data?.swappedUrl || result?.swappedUrl;
      if (swappedUrl) {
        setStoryPreview((currentPages) => {
          const nextPages = [...currentPages];
          nextPages[currentPage] = {
            ...nextPages[currentPage],
            illustrationUrl: swappedUrl,
          };
          return nextPages;
        });

        setSwappedPages((prev) => ({
          ...prev,
          [currentPage]: true,
        }));
      }
    } catch (err) {
      console.error('[FACE_SWAP_ERROR]', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'Face swap failed. Please try again.'
      );
    } finally {
      setIsFaceSwapping(false);
      setFaceSwapProgress(0);
    }
  };

  const handleSelectFaceImage = (imageUrl) => {
    setSelectedFaceImage(imageUrl);
    setSwappedPages({});
  };

  useEffect(() => {
    const isPreparingStoryText = loading && !storyPreview;
    if (!isPreparingStoryText && !isPreparingInitialPreview) {
      setShowEmailFallback(false);
      return;
    }

    const maxProgress = isPreparingInitialPreview ? 88 : 34;
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
  }, [isPreparingInitialPreview, loading, storyPreview]);

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
      const nextLanguage = event?.detail?.language || currentLanguage;

      if (storyPreview) {
        handleGenerateStory(nextLanguage);
      }
    };

    window.addEventListener('storyLanguageChanged', handleLanguageChange);
    return () =>
      window.removeEventListener('storyLanguageChanged', handleLanguageChange);
  }, [storyPreview, currentLanguage]);

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

      const response = await paymentAPI.createCheckout({
        projectId: formData.projectId,
        currency,
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else if (response.data.sessionId) {
        if (response.data.sessionId.startsWith('mock_session_')) {
          alert(
            'Stripe is not configured in development mode. This is a test environment.'
          );
          window.location.href = `/success?session_id=${response.data.sessionId}`;
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
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20"></div>
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-white/10"></div>
          </div>

          <div className="relative z-10 text-center">
            {formData.uploadedPhoto?.watermarkedUrl && (
              <div className="mb-6 flex justify-center">
                <img
                  src={formData.uploadedPhoto.watermarkedUrl}
                  alt="Cover"
                  className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-2xl"
                />
              </div>
            )}
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
              {formData.theme &&
                formData.theme.charAt(0).toUpperCase() +
                  formData.theme.slice(1)}{' '}
              Adventure
            </h2>
            <p
              className="text-xl opacity-90"
              style={{ textShadow: '0 1px 5px rgba(0,0,0,0.2)' }}
            >
              A personalized story just for you.
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
            <p className="mt-6 text-lg italic opacity-90">Your adventure awaits.</p>
          </div>
        </div>
      );
    }

    return (
      <CharacterConsistentStoryPage
        page={page}
        pageIndex={index}
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
                  We&apos;ll open your email app with the project details so support can send the preview when it&apos;s ready.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = supportMailtoLink;
                  }}
                  className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Email Me The Preview Instead
                </button>
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
                      {storyPreview[index].illustrationUrl ? (
                        <img
                          src={storyPreview[index].illustrationUrl}
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
                      {swappedPages[index] && (
                        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                          S
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
                          ) : storyPreview[index].illustrationUrl ? (
                            <div className="relative h-full w-full">
                              <img
                                src={storyPreview[index].illustrationUrl}
                                alt={`Page ${index + 1}`}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.target.style.display = 'none';
                                }}
                              />
                              {swappedPages[index] && (
                                <div className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
                                  S
                                </div>
                              )}
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

                  <div className="mb-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
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
                        {formData.theme?.charAt(0).toUpperCase() +
                          formData.theme?.slice(1)}
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
                        {currencySymbols[currency]}
                        {price}
                      </p>
                    </div>
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
                        Face Swap Integration
                      </h3>

                      <div className="mb-4">
                        <p className="mb-3 text-sm font-semibold text-gray-700">
                          Select a face to swap into generated story pages:
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {formData.uploadedImages.map((photo, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectFaceImage(photo.preview)}
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
                          onClick={handleFaceSwap}
                          disabled={
                            isFaceSwapping ||
                            !selectedFaceImage ||
                            currentPage === 0 ||
                            currentPage === storyPreview.length - 1 ||
                            !isPageIllustrationReady(storyPreview[currentPage], currentPage)
                          }
                          className="flex-1 rounded-lg px-4 py-3 font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            background: isFaceSwapping
                              ? '#999'
                              : currentTheme.gradient,
                          }}
                        >
                          {isFaceSwapping
                            ? `Swapping... ${faceSwapProgress}%`
                            : swappedPages[currentPage]
                              ? 'Face Swapped'
                              : 'Swap Face on This Page'}
                        </button>
                      </div>

                      {currentPage === 0 && (
                        <p className="mt-2 text-xs text-gray-600">
                          Cover page selected. Move to a story page to swap.
                        </p>
                      )}
                      {currentPage === storyPreview.length - 1 && (
                        <p className="mt-2 text-xs text-gray-600">
                          End page selected. Move to a story page to swap.
                        </p>
                      )}
                      {selectedFaceImage &&
                        currentPage !== 0 &&
                        currentPage !== storyPreview.length - 1 && (
                          <p className="mt-2 text-xs text-green-700">
                            Ready to swap this page.
                          </p>
                        )}
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
                        if (allIllustratedPagesReady) {
                          setShowPDFPreview(true);
                        }
                      }}
                      disabled={!allIllustratedPagesReady}
                      className="rounded-full border-2 px-6 py-3 font-bold transition-all duration-300 hover:bg-green-50"
                      style={{
                        borderColor: '#10B981',
                        color: '#059669',
                      }}
                    >
                      View PDF Preview
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
                        : `${currencySymbols[currency]}${price} - Checkout`}
                    </button>
                  </div>

                  {!allIllustratedPagesReady && (
                    <p className="mt-3 text-center text-sm text-gray-600">
                      Finish generating each story page illustration in order to unlock PDF preview and checkout.
                      {illustrationsRemainingCount > 0
                        ? ` ${illustrationsRemainingCount} illustrated page${illustrationsRemainingCount === 1 ? '' : 's'} remaining.`
                        : ''}
                    </p>
                  )}

                  <p className="mt-3 text-center text-xs text-gray-500">
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
