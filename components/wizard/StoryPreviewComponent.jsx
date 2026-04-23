/**
 * StoryPreviewComponent.jsx
 * 
 * Purpose: Display generated story in a book-like preview format
 * Features:
 * - Book-like pagination
 * - Navigation between pages
 * - Image + text display per page
 * - Page counter
 * - Animated page transitions
 * - Full-screen option
 * - Face swap integration with DeepAI
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import PDFSettingsModal from '@/components/story/PDFSettingsModal';
import usePDFGenerator from '@/hooks/usePDFGenerator';
import { faceSwapAPI } from '@/utils/faceSwapAPI';

export default function StoryPreviewComponent({ 
  story = {
    title: 'Sample Story',
    coverImage: '/sample-cover.jpg',
    pages: [
      {
        image: '/sample-page.jpg',
        text: 'Once upon a time...',
        title: 'Chapter 1'
      }
    ]
  },
  theme = {},
  onClose = () => {},
  onRegenerate = () => {},
  onSaveDraft = () => {},
  uploadedPhoto = null,
  childName = 'Child',
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flipAnimation, setFlipAnimation] = useState(false);
  const [swappedPages, setSwappedPages] = useState({});
  const [isFaceSwapping, setIsFaceSwapping] = useState(false);
  const [faceSwapError, setFaceSwapError] = useState('');
  const [faceSwapProgress, setFaceSwapProgress] = useState(0);
  
  // PDF Generation states
  const [showPDFModal, setShowPDFModal] = useState(false);
  const { isGenerating, error, isPremium, generatePDF, checkPremiumStatus } = usePDFGenerator();

  // Check premium status on mount
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  // Get theme colors or defaults
  const themeColors = {
    primary: theme?.primary || '#3B82F6',
    secondary: theme?.secondary || '#1E40AF',
    gradient: theme?.gradient || 'from-blue-400 to-blue-600',
    light: theme?.light || '#F0F9FF',
  };

  /**
   * Handle PDF generation
   */
  const handleGeneratePDF = async (settings) => {
    try {
      const result = await generatePDF(story, settings);
      setShowPDFModal(false);
      
      // Show success message
      if (result.success) {
        alert(result.message);
      }
    } catch (err) {
      console.error('[PDF] Generation error:', err);
      alert('❌ Failed to generate PDF. ' + (err.message || ''));
    }
  };

  /**
   * Handle face swap for all story pages
   */
  const handleFaceSwap = async () => {
    if (!uploadedPhoto?.watermarkedUrl && !uploadedPhoto?.url) {
      setFaceSwapError('❌ No photo uploaded. Please upload a photo first.');
      return;
    }

    setIsFaceSwapping(true);
    setFaceSwapError('');
    setFaceSwapProgress(0);

    try {
      const faceImageUrl = uploadedPhoto.watermarkedUrl || uploadedPhoto.url;
      
      // Use batch processing for all pages
      const result = await faceSwapAPI.swapFaceForStoryPages(
        faceImageUrl,
        story.pages,
        {
          childName,
          onProgress: (current, total) => {
            setFaceSwapProgress(Math.round((current / total) * 100));
          }
        }
      );

      // Store swapped images
      const newSwappedPages = {};
      result.pages.forEach((page, index) => {
        if (page.swappedImageUrl) {
          newSwappedPages[index] = page.swappedImageUrl;
        }
      });

      setSwappedPages(newSwappedPages);
      
      if (result.successCount > 0) {
        setFaceSwapError(`✅ Successfully swapped ${result.successCount}/${result.totalPages} pages`);
      }
      if (result.errorCount > 0) {
        setFaceSwapError(`⚠️ ${result.errorCount} pages failed to swap. Showing originals.`);
      }
    } catch (err) {
      console.error('[FaceSwap] Error:', err);
      setFaceSwapError(`❌ Face swap failed: ${err.message}`);
    } finally {
      setIsFaceSwapping(false);
      setFaceSwapProgress(0);
    }
  };

  /**
   * Navigate to next page with animation
   */
  const handleNextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setFlipAnimation(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setFlipAnimation(false);
      }, 300);
    }
  };

  /**
   * Navigate to previous page with animation
   */
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setFlipAnimation(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setFlipAnimation(false);
      }, 300);
    }
  };

  /**
   * Jump to a specific page
   */
  const goToPage = (pageIndex) => {
    if (pageIndex !== currentPage && pageIndex >= 0 && pageIndex < story.pages.length) {
      setFlipAnimation(true);
      setTimeout(() => {
        setCurrentPage(pageIndex);
        setFlipAnimation(false);
      }, 300);
    }
  };

  const totalPages = story.pages.length;
  const currentPageData = story.pages[currentPage];
  const progress = ((currentPage + 1) / totalPages) * 100;

  return (
    <div className={`${isFullscreen ? 'fixed inset-0' : 'relative'} z-50 bg-gray-900 ${isFullscreen ? 'p-4' : 'p-6'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{story.title}</h2>
          <p className="text-gray-400 text-sm">Page {currentPage + 1} of {totalPages}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPDFModal(true)}
            disabled={isGenerating}
            className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as PDF"
          >
            📥 PDF
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
            title="Toggle fullscreen"
          >
            {isFullscreen ? '⛔ Exit' : '🔍 Fullscreen'}
          </button>
          
          <button
            onClick={onClose}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Close preview"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-700 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Story Display Area */}
      <div className={`flex gap-4 mb-6 ${isFullscreen ? 'flex-col lg:flex-row' : 'flex-col'}`}>
        {/* Book-like Page Display */}
        <div className={`flex-1 flex items-center justify-center ${isFullscreen ? 'min-h-screen lg:min-h-full' : 'max-h-96 sm:max-h-full'} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 shadow-2xl overflow-y-auto`}>
          <div className={`w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-opacity duration-300 ${flipAnimation ? 'opacity-50' : 'opacity-100'}`}>
            {/* Page Image Section */}
            <div className="flex-shrink-0 w-full h-56 sm:h-64 md:h-80 relative bg-gradient-to-br from-blue-200 to-purple-200 overflow-hidden flex items-center justify-center">
              {swappedPages[currentPage] ? (
                <img
                  src={swappedPages[currentPage]}
                  alt={`Page ${currentPage + 1} - Swapped`}
                  className="w-full h-full object-cover"
                  title="Face-swapped illustration"
                />
              ) : currentPageData?.illustrationUrl ? (
                <img
                  src={currentPageData.illustrationUrl}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient placeholder if image fails
                    e.target.style.display = 'none';
                  }}
                />
              ) : currentPageData?.image ? (
                <img
                  src={currentPageData.image}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient placeholder if image fails
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 text-gray-600 text-4xl font-bold">
                  📖
                </div>
              )}
            </div>

            {/* Page Content Section */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between min-h-48">
              {/* Page Title */}
              {currentPageData?.title && (
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                  {currentPageData.title}
                </h3>
              )}

              {/* Page Text */}
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base flex-1 mb-4">
                {currentPageData?.text || currentPageData?.content || 'No content for this page'}
              </p>

              {/* Page Number - Bottom */}
              <div className="text-right text-xs font-semibold text-gray-400 pt-4 border-t border-gray-200">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Thumbnails & Controls */}
        <div className={`${isFullscreen ? 'lg:w-48' : 'w-full sm:w-48'} flex flex-col gap-4`}>
          {/* Page Thumbnails */}
          <div className={`bg-gray-800 rounded-lg p-4 ${isFullscreen ? 'flex lg:flex-col overflow-x-auto lg:overflow-y-auto' : 'flex gap-2 overflow-x-auto'} gap-2 max-h-32 lg:max-h-96`}>
            {story.pages.map((page, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`flex-shrink-0 relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                  currentPage === index
                    ? 'ring-2 ring-blue-500 scale-105'
                    : 'hover:opacity-80'
                } ${isFullscreen ? 'lg:w-full lg:h-24' : 'w-16 h-16 sm:w-12 sm:h-12'}`}
                title={`Go to page ${index + 1}`}
              >
                {page.image ? (
                  <img
                    src={page.image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                )}
                
                {currentPage === index && (
                  <div className="absolute inset-0 bg-blue-500 opacity-20" />
                )}
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
            >
              ← Previous
            </button>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
            >
              Next →
            </button>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            {uploadedPhoto && (
              <>
                <button
                  onClick={handleFaceSwap}
                  disabled={isFaceSwapping}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  {isFaceSwapping ? '⏳ Swapping...' : '✨ Swap Face'}
                </button>
                
                {isFaceSwapping && (
                  <div className="w-full bg-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className="bg-purple-600 h-2 transition-all duration-300"
                      style={{ width: `${faceSwapProgress}%` }}
                    />
                    <p className="text-xs text-center text-gray-300 mt-1">{faceSwapProgress}% Complete</p>
                  </div>
                )}
                
                {swappedPages[currentPage] && (
                  <p className="text-xs text-purple-300 text-center">✨ Face-swapped version</p>
                )}
              </>
            )}
            
            <button
              onClick={onRegenerate}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              🔄 Regenerate
            </button>
            
            <button
              onClick={onSaveDraft}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              💾 Save as Draft
            </button>
          </div>

          {/* Story Info */}
          <div className="bg-gray-800 rounded-lg p-4 text-xs text-gray-300">
            <p className="font-semibold mb-2">📊 Story Details</p>
            <ul className="space-y-1">
              <li>Total Pages: <span className="text-white font-bold">{totalPages}</span></li>
              <li>Current: <span className="text-white font-bold">{currentPage + 1}/{totalPages}</span></li>
              <li>Progress: <span className="text-white font-bold">{Math.round(progress)}%</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {isFullscreen && (
        <div className="text-center text-xs text-gray-400 mt-4">
          Use Arrow Keys or Page Up/Down to navigate
        </div>
      )}

      {/* PDF Settings Modal */}
      <PDFSettingsModal
        story={story}
        isOpen={showPDFModal}
        isPremium={isPremium}
        isGenerating={isGenerating}
        onGenerate={handleGeneratePDF}
        onClose={() => setShowPDFModal(false)}
        onUpgradeClick={() => {
          setShowPDFModal(false);
          // Open stripe checkout or upgrade page
          window.location.href = '/checkout?upgrade=true';
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <p className="font-semibold">❌ {error}</p>
        </div>
      )}

      {faceSwapError && (
        <div className={`fixed bottom-4 right-4 ${faceSwapError.includes('✅') ? 'bg-green-500' : faceSwapError.includes('⚠️') ? 'bg-yellow-500' : 'bg-red-500'} text-white p-4 rounded-lg shadow-lg max-w-xs`}>
          <p className="font-semibold text-sm">{faceSwapError}</p>
        </div>
      )}
    </div>
  );
}
