'use client';

import { useState, useEffect } from 'react';
import { useWizardStore, useCurrencyStore } from '@/utils/store';
import { storyAPI, paymentAPI } from '@/utils/api';
import { useLanguage } from '@/hooks/useLanguage';
import { ILLUSTRATION_THEMES, getTheme } from '@/utils/themes';
import PDFPreviewModal from './PDFPreviewModal';

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

  // Calculate price
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
    GBP: '£',
    EUR: '€',
    AUD: 'A$',
    INR: '₹',
  };

  // Get theme - prioritize illustrationStyle, fallback to story theme
  const getActiveTheme = () => {
    if (formData.illustrationStyle) {
      return getTheme(formData.illustrationStyle);
    }
    // Map story themes to illustration themes
    const themeMapping = {
      family: 'fantasy',
      friends: 'jungle',
      motivational: 'superhero',
      behavioural: 'wizard',
      fairytale: 'fairytale',
      customizable: 'fantasy'
    };
    const illustrationTheme = themeMapping[formData.theme] || 'fantasy';
    return getTheme(illustrationTheme);
  };

  const currentTheme = getActiveTheme();

  const handleGenerateStory = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the projectId that was created in Step 4
      if (!formData.projectId) {
        setError('Project ID not found. Please go back and try again.');
        setLoading(false);
        return;
      }

      console.log('[STEP6] Generating story for project:', formData.projectId);
      console.log('[STEP6] Form data:', formData);

      // Pass custom illustration prompt if custom theme selected
      const customPrompt = formData.theme === 'customizable' ? formData.customIllustrationPrompt : null;

      // Generate story with all required data
      const storyData = {
        childName: formData.childName || 'Child',
        childGender: formData.childGender || 'child',
        ageGroup: formData.ageGroup || '5-8',
        theme: formData.theme || 'fantasy',
        pageCount: formData.pageCount || 20,
      };

      const storyResponse = await storyAPI.generateStory(formData.projectId, customPrompt, currentLanguage || 'en', storyData);

      setStoryPreview(storyResponse.data.story);
      setCurrentPage(0); // Reset to first page
    } catch (err) {
      console.error('[GENERATE_STORY_ERROR]', err);
      setError(err.response?.data?.error || err.message || 'Failed to generate story preview');
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!storyPreview) return;
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'ArrowLeft') handlePrevPage();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, storyPreview]);

  // Listen for language change and regenerate story
  useEffect(() => {
    const handleLanguageChange = (event) => {
      console.log('[STEP6] Language changed to:', event.detail.language);
      // Automatically regenerate story with new language if story exists
      if (storyPreview) {
        console.log('[STEP6] Regenerating story in new language');
        handleGenerateStory();
      }
    };

    window.addEventListener('storyLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('storyLanguageChanged', handleLanguageChange);
  }, [storyPreview, currentLanguage]);

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      // Validate projectId
      if (!formData.projectId) {
        setError('Project ID not found. Please go back and try again.');
        setLoading(false);
        return;
      }

      // Create Stripe checkout session
      const response = await paymentAPI.createCheckout({
        projectId: formData.projectId,
        currency: currency,
      });

      // Redirect to Stripe checkout
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else if (response.data.sessionId) {
        // Fallback: construct URL manually
        if (response.data.sessionId.startsWith('mock_session_')) {
          alert('⚠️ Stripe is not configured in development mode. This is a test environment.');
          console.warn('[CHECKOUT] Mock session created (Stripe not configured):', response.data.sessionId);
          window.location.href = `/success?session_id=${response.data.sessionId}`;
        } else {
          window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
        }
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('[CHECKOUT_ERROR]:', err);
      setError(err.response?.data?.error || err.message || 'Failed to process checkout');
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

  // Render a single page
  const renderPageContent = (page, index) => {
    if (index === 0) {
      // Cover page
      return (
        <div
          className="w-full h-full rounded-r-3xl overflow-hidden flex flex-col items-center justify-center p-8 text-white relative"
          style={{ background: currentTheme.gradient }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/20"></div>
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10"></div>
          </div>
          
          <div className="relative z-10 text-center">
            {formData.uploadedPhoto?.watermarkedUrl && (
              <div className="mb-6 flex justify-center">
                <img
                  src={formData.uploadedPhoto.watermarkedUrl}
                  alt="Cover"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                />
              </div>
            )}
            <h1 className="text-5xl font-black mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {formData.childName}'s
            </h1>
            <h2 className="text-3xl font-bold mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {formData.theme && formData.theme.charAt(0).toUpperCase() + formData.theme.slice(1)} Adventure
            </h2>
            <p className="text-xl opacity-90" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.2)' }}>
              A personalized story just for you! ✨
            </p>
          </div>
        </div>
      );
    } else if (index === storyPreview.length - 1) {
      // Last page (The End)
      return (
        <div
          className="w-full h-full rounded-r-3xl overflow-hidden flex flex-col items-center justify-center p-8 text-white"
          style={{ background: currentTheme.gradient }}
        >
          <div className="text-center">
            <div className="text-7xl mb-6">🌟</div>
            <h3 className="text-4xl font-black mb-4">The End</h3>
            <p className="text-xl leading-relaxed max-w-sm">
              {formData.childName} discovered that imagination is the greatest superpower of all.
            </p>
            <p className="text-lg opacity-90 mt-6 italic">Your adventure awaits! 🎉</p>
          </div>
        </div>
      );
    } else {
      // Story page
      return (
        <div
          className="w-full h-full rounded-r-3xl overflow-hidden flex flex-col p-4 text-white"
          style={{ background: currentTheme.gradient }}
        >
          {/* Illustration - Full Width & Prominent (Like Image 1) */}
          <div className="w-full mb-3 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
            {page.illustrationUrl ? (
              <img
                src={page.illustrationUrl}
                alt={`Page ${index} Illustration`}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-white/10 rounded-xl border-4 border-white/30">
                <span className="text-5xl">🖼️</span>
              </div>
            )}
          </div>

          {/* Title - Fixed height */}
          {page.title && (
            <h3 className="text-base font-black mb-2 text-center flex-shrink-0 line-clamp-2">
              {page.title}
            </h3>
          )}

          {/* Story Text - Scrollable/Flexible with Visible Scrollbar */}
          <div className="flex-1 overflow-y-auto text-center px-3 scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-white/10">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {page.page_text || page.text}
            </p>
          </div>

          {/* Page Number - Fixed at bottom */}
          <div className="text-center text-xs font-bold opacity-75 mt-4 flex-shrink-0">
            Page {index + 1}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="step-container w-full min-h-screen px-4 py-10" style={{ background: currentTheme.light }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 text-gray-900">✨ Review Your Storybook</h2>
          <p className="text-xl text-gray-600">Your personalized book preview</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-6 max-w-2xl mx-auto">
            <p className="font-semibold">⚠️ Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Generate Button */}
        {!storyPreview && (
          <div className="text-center">
            <button
              onClick={handleGenerateStory}
              disabled={loading}
              className="inline-block px-12 py-4 rounded-full font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentTheme.gradient,
                boxShadow: `0 8px 20px ${currentTheme.primary}40`
              }}
            >
              {loading ? '⏳ Generating Your Story...' : '👀 Preview Story'}
            </button>
          </div>
        )}
      </div>

      {/* Story Preview - Full Screen Page View */}
      {storyPreview && (
        <div className="w-full">
          {/* Main Layout: Thumbnails on left, Page on right (desktop) or top/bottom (mobile) */}
          <div className="w-full min-h-screen flex flex-col lg:flex-row" style={{ background: currentTheme.light }}>
            
            {/* Left Sidebar - Thumbnails (hidden on mobile) */}
            <div className="hidden lg:flex lg:flex-col lg:w-32 bg-white/50 border-r border-gray-200 p-4 gap-3 overflow-y-auto max-h-screen">
              {storyPreview.map((page, index) => (
                <button
                  key={index}
                  onClick={() => goToPage(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-lg border-3 overflow-hidden transition-all duration-300 transform ${
                    currentPage === index ? 'ring-4 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    borderColor: currentPage === index ? currentTheme.primary : `${currentTheme.primary}30`,
                    ringColor: currentTheme.primary,
                    backgroundColor: currentPage === index ? `${currentTheme.primary}15` : 'transparent'
                  }}
                  title={`Page ${index + 1}`}
                >
                  {index === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: currentTheme.gradient }}>
                      📖
                    </div>
                  ) : index === storyPreview.length - 1 ? (
                    <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: currentTheme.gradient }}>
                      🌟
                    </div>
                  ) : (
                    <img
                      src={storyPreview[index].illustrationUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E`}
                      alt={`Page ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              
              {/* Page Display - Full Height */}
              <div className={`flex-1 flex flex-col items-center justify-center p-4 lg:p-8 transition-all duration-300 ${flipAnimation ? 'opacity-50' : 'opacity-100'}`}>
                {/* Page Counter - Top */}
                <div className="text-center mb-4">
                  <p className="text-lg lg:text-2xl font-bold text-gray-900">
                    Page <span style={{ color: currentTheme.primary }} className="text-2xl lg:text-3xl">{currentPage + 1}</span> of <span style={{ color: currentTheme.primary }} className="text-2xl lg:text-3xl">{storyPreview.length}</span>
                  </p>
                </div>

                {/* Main Book Page */}
                <div
                  className="w-full max-w-3xl lg:max-w-4xl aspect-video rounded-3xl shadow-2xl overflow-hidden flex-1 flex items-center justify-center"
                  style={{
                    background: 'white',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    maxHeight: '70vh'
                  }}
                >
                  {renderPageContent(storyPreview[currentPage], currentPage)}
                </div>

                {/* Navigation Buttons - Under Page */}
                <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="px-6 py-3 rounded-full border-2 font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      backgroundColor: `${currentTheme.primary}10`
                    }}
                  >
                    ◄ Previous
                  </button>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === storyPreview.length - 1}
                    className="px-6 py-3 rounded-full border-2 font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      backgroundColor: `${currentTheme.primary}10`
                    }}
                  >
                    Next ►
                  </button>
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="w-full bg-white/80 backdrop-blur-md border-t-2 border-gray-200 p-4 lg:p-6">
                <div className="max-w-6xl mx-auto">
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-300 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        background: currentTheme.gradient,
                        width: `${((currentPage + 1) / storyPreview.length) * 100}%`
                      }}
                    ></div>
                  </div>

                  {/* Mobile Thumbnail Strip */}
                  <div className="lg:hidden overflow-x-auto pb-3 mb-4">
                    <div className="flex gap-2 justify-start">
                      {storyPreview.map((page, index) => (
                        <button
                          key={index}
                          onClick={() => goToPage(index)}
                          className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                            currentPage === index ? 'ring-2 border-2' : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            borderColor: currentTheme.primary,
                            backgroundColor: currentPage === index ? `${currentTheme.primary}10` : 'transparent'
                          }}
                          title={`Page ${index + 1}`}
                        >
                          {index === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: currentTheme.gradient }}>
                              📖
                            </div>
                          ) : index === storyPreview.length - 1 ? (
                            <div className="w-full h-full flex items-center justify-center text-lg" style={{ background: currentTheme.gradient }}>
                              🌟
                            </div>
                          ) : (
                            <img
                              src={storyPreview[index].illustrationUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e7eb' width='80' height='80'/%3E%3C/svg%3E`}
                              alt={`Page ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Story Details Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                    <div className="p-2 rounded-lg" style={{ background: `${currentTheme.light}` }}>
                      <p className="text-gray-600 font-bold text-xs mb-1">Child</p>
                      <p className="font-black text-sm" style={{ color: currentTheme.primary }}>
                        {formData.childName}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg" style={{ background: `${currentTheme.light}` }}>
                      <p className="text-gray-600 font-bold text-xs mb-1">Age</p>
                      <p className="font-black text-sm" style={{ color: currentTheme.primary }}>
                        {formData.ageGroup}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg" style={{ background: `${currentTheme.light}` }}>
                      <p className="text-gray-600 font-bold text-xs mb-1">Theme</p>
                      <p className="font-black text-sm" style={{ color: currentTheme.primary }}>
                        {formData.theme?.charAt(0).toUpperCase() + formData.theme?.slice(1)}
                      </p>
                    </div>

                    <div className="p-2 rounded-lg" style={{ background: `${currentTheme.light}` }}>
                      <p className="text-gray-600 font-bold text-xs mb-1">Price</p>
                      <p className="font-black text-sm" style={{ color: currentTheme.primary }}>
                        {currencySymbols[currency]}{price}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 rounded-full font-bold text-gray-900 border-2 border-gray-900 transition-all duration-300 hover:bg-gray-100"
                    >
                      ← Back
                    </button>

                    {/* PDF Download/Preview Button */}
                    <button
                      onClick={() => setShowPDFPreview(true)}
                      className="px-6 py-3 rounded-full font-bold border-2 transition-all duration-300 hover:bg-green-50"
                      style={{
                        borderColor: '#10B981',
                        color: '#059669'
                      }}
                    >
                      📄 View PDF Preview
                    </button>

                    {/* Save as Draft Button (optional) */}
                    <button
                      onClick={() => {
                        alert('✅ This story is automatically saved as a draft! You can find it in your Dashboard under "Draft Stories". Revise it anytime before purchasing.');
                      }}
                      className="px-6 py-3 rounded-full font-bold border-2 transition-all duration-300 hover:bg-yellow-50"
                      style={{
                        borderColor: '#FCD34D',
                        color: '#E8AB1A'
                      }}
                    >
                      💾 Draft Saved
                    </button>

                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="px-8 py-3 rounded-full font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: currentTheme.gradient,
                        boxShadow: `0 8px 20px ${currentTheme.primary}40`
                      }}
                    >
                      {loading ? '⏳ Processing...' : `${currencySymbols[currency]}${price} - Checkout`}
                    </button>
                  </div>

                  {/* Keyboard Hint */}
                  <p className="text-center text-xs text-gray-500 mt-3">
                    💡 Tip: Use ← → arrow keys to navigate pages
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
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
