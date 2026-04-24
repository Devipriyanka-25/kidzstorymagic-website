'use client';

import React, { useState } from 'react';

/**
 * Step6FaceSwapSection - Integrated face swap UI for Step6ReviewCheckout
 * Displays uploaded images, allows selection, and triggers face swap
 */
export default function Step6FaceSwapSection({
  uploadedImages,
  storyPreview,
  currentPage,
  selectedFaceImage,
  isFaceSwapping,
  swappedPages,
  onSelectFaceImage,
  onFaceSwap,
  currentTheme
}) {
  if (!uploadedImages || uploadedImages.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2" style={{ borderColor: currentTheme.primary }}>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.primary }}>
        👤 Face Swap Magic
      </h3>

      {/* Face Image Selection - Grid Display */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">📸 Choose a face to swap:</p>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {uploadedImages.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => onSelectFaceImage(photo.preview || photo)}
              className={`aspect-square rounded-lg overflow-hidden border-3 transition-all duration-300 transform hover:scale-105 ${
                selectedFaceImage === (photo.preview || photo)
                  ? 'scale-110 ring-2 shadow-lg'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                borderColor: selectedFaceImage === (photo.preview || photo) ? currentTheme.primary : '#cbd5e1',
                ringColor: currentTheme.primary
              }}
              title={`Face ${idx + 1}`}
            >
              <img
                src={photo.preview || photo}
                alt={`Face ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Story Page Selector & Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Page Info */}
        <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: currentTheme.primary + '30' }}>
          <p className="text-xs font-semibold text-gray-600 mb-2">CURRENT PAGE</p>
          <p className="text-2xl font-bold" style={{ color: currentTheme.primary }}>
            {currentPage + 1}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {currentPage === 0
              ? '📖 Cover page'
              : currentPage === storyPreview.length - 1
              ? '🌟 End page'
              : '📖 Story page'}
          </p>
          <div className="text-xs text-gray-500 mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
            ℹ️ Face swaps work best on story pages (not cover/end pages)
          </div>
        </div>

        {/* Face Swap Button */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onFaceSwap}
            disabled={!selectedFaceImage || isFaceSwapping || currentPage === 0 || currentPage === storyPreview.length - 1}
            className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform ${
              isFaceSwapping
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : selectedFaceImage && currentPage > 0 && currentPage < storyPreview.length - 1
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:scale-105 active:scale-95 shadow-lg'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isFaceSwapping ? (
              <>
                <span className="animate-spin inline-block mr-2">⏳</span>
                Processing...
              </>
            ) : swappedPages[currentPage] ? (
              '✓ Face Swapped'
            ) : (
              '✨ Generate Face Swap'
            )}
          </button>

          {/* Swapped Page Badge */}
          {swappedPages[currentPage] && (
            <div className="mt-3 flex items-center gap-2 text-green-600 font-semibold">
              <span>✓ This page has been swapped!</span>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm border border-blue-200 text-blue-900">
        <p className="font-semibold">💡 Tips for best results:</p>
        <ul className="list-disc list-inside mt-1 text-xs">
          <li>Use a clear, well-lit face image</li>
          <li>Face should be clearly visible without obstruction</li>
          <li>Try swapping on different pages for variety</li>
        </ul>
      </div>
    </div>
  );
}
