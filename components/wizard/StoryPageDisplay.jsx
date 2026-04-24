'use client';

import React from 'react';

/**
 * StoryPageDisplay - Display a single story page matching reference design
 * Shows professional layout with illustration, text, character description
 */
export default function StoryPageDisplay({ page, pageNumber, totalPages, onFaceSwap, isFaceSwapping, swappedPages }) {
  if (!page) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-xl">
        <p className="text-gray-500">No page content</p>
      </div>
    );
  }

  const isSwapped = swappedPages?.[pageNumber];

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Story Page Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
        
        {/* Illustration Side */}
        <div className="flex flex-col justify-center items-center">
          <div className="w-full aspect-square bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl overflow-hidden border-4 border-purple-300 shadow-lg relative">
            {page.illustrationUrl ? (
              <img
                src={page.illustrationUrl}
                alt={`Page ${pageNumber} - ${page.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-300 to-purple-300">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-white font-bold text-lg">Illustration Space</p>
                  <p className="text-white text-sm mt-2">{page.title}</p>
                </div>
              </div>
            )}
            {isSwapped && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                ✓ Face Swapped
              </div>
            )}
          </div>

          {/* Face Swap Button - Only for story pages */}
          {page.pageType === 'story' && pageNumber > 0 && pageNumber < totalPages - 1 && (
            <button
              onClick={onFaceSwap}
              disabled={isFaceSwapping}
              className={`mt-6 px-6 py-3 rounded-lg font-bold transition-all w-full ${
                isFaceSwapping
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : isSwapped
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {isFaceSwapping ? '🔄 Processing...' : isSwapped ? '✓ Face Swapped' : '👤 Swap Child\'s Face'}
            </button>
          )}
        </div>

        {/* Content Side */}
        <div className="flex flex-col justify-between space-y-6">
          {/* Page Header */}
          <div>
            <div className="inline-block bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
              {page.pageType === 'cover' ? 'Cover' : page.pageType === 'end' ? 'The End' : `Chapter ${page.pageNumber}`}
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{page.title}</h2>
          </div>

          {/* Character Description */}
          {page.characterDescription && (
            <div className="bg-white rounded-xl p-4 border-2 border-indigo-200">
              <p className="text-indigo-900 font-semibold text-lg">{page.characterDescription}</p>
            </div>
          )}

          {/* Main Story Text */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{page.text}</p>
          </div>

          {/* Character Quote */}
          {page.characterQuote && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 pl-6 py-4 rounded-r-lg">
              <p className="text-indigo-900 font-semibold italic text-lg">{page.characterQuote}</p>
            </div>
          )}

          {/* Lesson */}
          {page.lesson && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-purple-300">
              <p className="text-purple-900 font-bold text-base">✨ Lesson:</p>
              <p className="text-purple-900 text-lg mt-2">{page.lesson}</p>
            </div>
          )}

          {/* End Message */}
          {page.message && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border-2 border-yellow-400 text-center">
              <p className="text-yellow-900 text-lg font-semibold">{page.message}</p>
            </div>
          )}

          {/* Page Counter */}
          <div className="text-center text-gray-600 font-semibold">
            Page {pageNumber + 1} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
}
