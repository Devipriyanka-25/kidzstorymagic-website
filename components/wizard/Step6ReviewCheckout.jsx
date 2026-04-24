'use client';

import { useEffect, useState } from 'react';
import PDFPreviewModal from './PDFPreviewModal';
import CharacterConsistentStoryPage from '@/components/story/CharacterConsistentStoryPage';
import { useLanguage } from '@/hooks/useLanguage';
import { storyAPI, paymentAPI, faceSwapAPI } from '@/utils/api';
import { useWizardStore, useCurrencyStore } from '@/utils/store';
import { getTheme } from '@/utils/themes';

export default function Step6ReviewCheckout() {
  const { formData, prevStep } = useWizardStore();
  const { currency = 'USD', exchangeRates } = useCurrencyStore();
  const { currentLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storyPreview, setStoryPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

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
  };

  const handleGenerateStory = async (languageOverride = currentLanguage) => {
    setLoading(true);
    setError('');

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
        languageOverride || 'en',
        storyData
      );

      const pages = storyResponse.data.story.pages || [];
      setStoryPreview(pages.length > 0 ? pages : [{}]);
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

  const handleNextPage = () => {
    if (currentPage < storyPreview.length - 1) {
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
      currentPage === storyPreview.length - 1
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
    const handleKeyPress = (event) => {
      if (!storyPreview) return;
      if (event.key === 'ArrowRight') handleNextPage();
      if (event.key === 'ArrowLeft') handlePrevPage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, storyPreview]);

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

        {!storyPreview && (
          <div className="text-center">
            <button
              onClick={handleGenerateStory}
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
      </div>

      {storyPreview && (
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
                  className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
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
                  {renderPageContent(storyPreview[currentPage], currentPage)}
                </div>

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
                    disabled={currentPage === storyPreview.length - 1}
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
                          className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
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
                            currentPage === storyPreview.length - 1
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
                      onClick={() => setShowPDFPreview(true)}
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
                      disabled={loading}
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
