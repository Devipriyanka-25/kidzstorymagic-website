'use client';

import { useState, useEffect } from 'react';

/**
 * PDFPreviewModal - Shows PDF preview with watermark and blurred images
 * Features:
 * - Free preview with watermark "PREVIEW"
 * - Blurred illustration images
 * - Full story text visible
 * - Page navigation
 */
export default function PDFPreviewModal({ storyPages = [], isOpen = false, onClose = () => {}, theme = {} }) {
  const [currentPage, setCurrentPage] = useState(0);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !storyPages.length) return null;

  const currentPageData = storyPages[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === storyPages.length - 1;

  const handlePrevPage = () => {
    if (!isFirstPage) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (!isLastPage) setCurrentPage(currentPage + 1);
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto my-8">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📄 PDF Preview
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 text-3xl font-bold transition-colors hover:scale-110 active:scale-95"
            title="Close (ESC key)"
          >
            ✕
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 space-y-6">
          
          {/* Preview Notice */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-amber-700 font-semibold flex items-center gap-2">
              🔒 Free Preview
            </p>
            <p className="text-amber-600 text-sm mt-1">
              This preview includes a watermark and blurred images. Upgrade to remove watermark and get full resolution images.
            </p>
          </div>

          {/* Page Display */}
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200">
            
            {/* Main Page Content */}
            <div
              className="relative w-full aspect-video bg-gray-100 flex flex-col items-center justify-center p-8"
              style={{ background: theme.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="text-8xl font-black text-white/20 transform -rotate-45"
                  style={{
                    letterSpacing: '2px',
                    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  PREVIEW
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 w-full h-full flex flex-col">
                {/* Cover Page */}
                {currentPage === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white text-center">
                    <div className="text-5xl mb-4">📖</div>
                    <h1 className="text-3xl md:text-4xl font-black mb-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      Story Preview
                    </h1>
                    <p className="text-lg opacity-90" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.2)' }}>
                      Personalized Storybook
                    </p>
                  </div>
                ) : currentPage === storyPages.length - 1 ? (
                  // Last Page
                  <div className="h-full flex flex-col items-center justify-center text-white text-center">
                    <div className="text-5xl mb-4">🌟</div>
                    <h3 className="text-3xl font-black mb-4">The End</h3>
                    <p className="text-lg leading-relaxed max-w-sm">
                      Your adventure awaits! 🎉
                    </p>
                  </div>
                ) : (
                  // Story Page
                  <div className="h-full flex flex-col p-6 text-white">
                    {/* Illustration - with blur effect */}
                    <div className="flex justify-center mb-4 flex-shrink-0">
                      {currentPageData.illustrationUrl ? (
                        <div className="relative">
                          <img
                            src={currentPageData.illustrationUrl}
                            alt={`Page ${currentPage} Preview`}
                            className="w-full max-w-xs h-40 object-cover rounded-2xl shadow-2xl border-4 border-white/30"
                            style={{
                              filter: 'blur(8px)',
                              opacity: 0.7
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                            <div className="text-white font-bold text-sm bg-black/40 px-3 py-1 rounded-full">
                              🔒 Image Blurred
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full max-w-xs h-40 flex items-center justify-center bg-white/10 rounded-2xl border-4 border-white/30 backdrop-blur-md">
                          <span className="text-5xl">🖼️</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    {currentPageData.title && (
                      <h3 className="text-xl font-black mb-3 text-center flex-shrink-0">
                        {currentPageData.title}
                      </h3>
                    )}

                    {/* Story Text - Visible in preview */}
                    <div className="flex-1 overflow-y-auto text-center px-2">
                      <p className="text-base leading-loose whitespace-pre-wrap">
                        {currentPageData.page_text || currentPageData.text}
                      </p>
                    </div>

                    {/* Page Number */}
                    <div className="text-center text-xs font-bold opacity-75 mt-3 flex-shrink-0">
                      Page {currentPage + 1} / {storyPages.length}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Page Counter - Overlay */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold">
                Page {currentPage + 1} of {storyPages.length}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handlePrevPage}
              disabled={isFirstPage}
              className="px-6 py-3 rounded-full font-bold bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ◄ Previous Page
            </button>

            <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-full font-semibold">
              <span>📄 {currentPage + 1} / {storyPages.length}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={isLastPage}
              className="px-6 py-3 rounded-full font-bold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next Page ►
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-700 font-semibold flex items-center gap-2">
              ℹ️ What's Different in the Paid Version?
            </p>
            <ul className="text-blue-600 text-sm mt-3 space-y-1">
              <li>✅ No watermark on pages</li>
              <li>✅ Full-resolution images (not blurred)</li>
              <li>✅ Professional PDF formatting</li>
              <li>✅ Better print quality</li>
              <li>✅ Downloadable for offline use</li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-50 transition-all"
              title="Close preview"
            >
              ✕ Close Preview
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
              title="Continue to checkout"
            >
              Continue to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
