'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WatermarkOverlay from '@/components/preview/WatermarkOverlay';
import BlurLockOverlay from '@/components/preview/BlurLockOverlay';
import FreePreview from '@/components/preview/FreePreview';

/**
 * BookPreviewPage - Professional book preview with payment protection
 * Features: Watermark, blur lock, page navigation, progress indicator
 * Route: /story/preview/[id]
 */
export default function BookPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const storyId = params?.id;
  const giftToken = searchParams.get('gift_token');

  const [story, setStory] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Fetch story preview with payment status
  useEffect(() => {
    if (!storyId) return;

    const fetchStoryPreview = async () => {
      try {
        setLoading(true);
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        const previewUrl = new URL(
          `/api/story/preview-with-payment/${storyId}`,
          window.location.origin
        );

        if (giftToken) {
          previewUrl.searchParams.set('gift_token', giftToken);
        }

        const response = await fetch(previewUrl.toString(), {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error('Failed to load story preview');
        }

        const data = await response.json();
        console.log('[PREVIEW] Story loaded:', data);

        setStory(data.story);
        setIsUnlocked(data.story.isUnlocked);
        setError('');
      } catch (err) {
        console.error('[PREVIEW_ERROR]:', err);
        setError(err.message || 'Failed to load story preview');
      } finally {
        setLoading(false);
      }
    };

    fetchStoryPreview();
  }, [giftToken, storyId]);

  const handleNextPage = () => {
    if (currentPage < story.totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleGoToCheckout = () => {
    router.push(
      `/wizard?step=6&resume=checkout&projectId=${encodeURIComponent(storyId)}`
    );
  };

  const handleDownloadPDF = async () => {
    if (!isUnlocked) {
      handleGoToCheckout();
      return;
    }

    try {
      setDownloadProgress(25);
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const downloadUrl = new URL(
        `/api/payment/pdf/${storyId}`,
        window.location.origin
      );

      if (giftToken) {
        downloadUrl.searchParams.set('gift_token', giftToken);
      }

      const response = await fetch(downloadUrl.toString(), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      setDownloadProgress(75);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setDownloadProgress(100);
      setTimeout(() => setDownloadProgress(0), 1000);
    } catch (err) {
      console.error('[DOWNLOAD_ERROR]:', err);
      setError('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">📚</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Preparing Your Story...
            </h2>
            <p className="text-gray-600">Loading your magical book preview</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: '70%' }}
            />
          </div>
          <p className="text-sm text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Preview
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="block px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return null;
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#eef2ff_0%,#fff7ed_100%)] px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <FreePreview
            pages={story.pages}
            totalPages={story.totalPages}
            childName={story.childName}
            priceLabel="Unlock the full story"
            onUnlock={handleGoToCheckout}
          />
        </div>
      </div>
    );
  }

  const currentPageData = story.pages[currentPage];
  const progress = ((currentPage + 1) / story.totalPages) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              ✨ {story.title}
            </h1>
            <p className="text-gray-600 text-lg">
              A story for {story.childName} • {story.totalPages} pages
            </p>
          </div>
          <div className="text-right">
            {isUnlocked && (
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                ✓ Unlocked
              </div>
            )}
            {!isUnlocked && (
              <div className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                🔒 Preview Mode
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Page {currentPage + 1} of {story.totalPages}
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Thumbnails Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">
                Pages
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {story.pages.map((page, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      currentPage === idx
                        ? 'ring-2 ring-indigo-500 border-indigo-500 scale-105'
                        : 'border-gray-300 hover:border-indigo-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {page.imageUrl ? (
                      <img
                        src={page.imageUrl}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center">
                        <span className="text-2xl">
                          {idx === 0 ? '📖' : idx === story.pages.length - 1 ? '🌟' : '📄'}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Page Display */}
          <div className="lg:col-span-3">
            <div
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{ aspectRatio: '9/11' }}
            >
              {/* Page Content */}
              <div className="w-full h-full flex flex-col p-8 relative">
                
                {/* Page Background Image */}
                {currentPageData.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={currentPageData.imageUrl}
                      alt={currentPageData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Page Content Overlay */}
                <div className="relative z-5 flex flex-col h-full">
                  {/* Title */}
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                      {currentPageData.title}
                    </h2>
                    <p className="text-white/90 text-sm mt-2 drop-shadow">
                      Page {currentPageData.pageNumber} of {story.totalPages}
                    </p>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 overflow-auto">
                    <p className="text-white drop-shadow-md leading-relaxed text-lg">
                      {currentPageData.text}
                    </p>

                    {/* Lesson */}
                    {currentPageData.lesson && (
                      <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/40">
                        <p className="text-white font-semibold">
                          ✨ Lesson: {currentPageData.lesson}
                        </p>
                      </div>
                    )}

                    {/* Message */}
                    {currentPageData.message && (
                      <div className="mt-6 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-lg p-4">
                        <p className="text-gray-900 font-bold text-center text-lg">
                          {currentPageData.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Page Number Badge */}
                  <div className="mt-4 text-center">
                    <span className="text-white/70 text-sm font-semibold">
                      Page {currentPageData.pageNumber}
                    </span>
                  </div>
                </div>

                {/* Watermark - if not unlocked */}
                {!isUnlocked && <WatermarkOverlay />}

                {/* Blur Lock - if not unlocked */}
                {!isUnlocked && (
                  <BlurLockOverlay onCheckout={handleGoToCheckout} blurPercentage={40} />
                )}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between gap-4 mt-8 flex-wrap">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-full border-2 border-indigo-600 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ◀ Previous
              </button>

              <div className="flex gap-2">
                {isUnlocked && (
                  <>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadProgress > 0}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {downloadProgress > 0 ? `📥 ${downloadProgress}%` : '📥 Download PDF'}
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all"
                    >
                      🖨 Print
                    </button>
                  </>
                )}
                {!isUnlocked && (
                  <button
                    onClick={handleGoToCheckout}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    💳 Unlock & Checkout
                  </button>
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === story.totalPages - 1}
                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ▶
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex justify-center gap-4 mt-6 flex-wrap">
              <Link
                href="/dashboard"
                className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition"
              >
                ← Back to Dashboard
              </Link>
              <Link
                href="/wizard"
                className="px-6 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition"
              >
                📖 Create Another Story
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {!isUnlocked && (
        <div className="max-w-5xl mx-auto mt-12 bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Story Preview Protected
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🌊</div>
              <p className="text-gray-700 font-semibold">Watermark Protection</p>
              <p className="text-sm text-gray-600">Preview is watermarked</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔲</div>
              <p className="text-gray-700 font-semibold">Blur Lock</p>
              <p className="text-sm text-gray-600">Bottom portion hidden</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💳</div>
              <p className="text-gray-700 font-semibold">Payment Required</p>
              <p className="text-sm text-gray-600">Unlock with checkout</p>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleGoToCheckout}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95"
            >
              Complete Payment to Unlock Full Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
