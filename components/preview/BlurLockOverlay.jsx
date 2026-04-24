'use client';

import React from 'react';

/**
 * BlurLockOverlay - Blur overlay and checkout CTA for unpaid previews
 * Shows blur effect on bottom portion and lock message with checkout button
 */
export default function BlurLockOverlay({ onCheckout, blurPercentage = 40 }) {
  return (
    <>
      <style>{`
        .blur-section {
          position: absolute;
          left: 0;
          right: 0;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 30%,
            rgba(255, 255, 255, 0.7) 100%
          );
          backdrop-filter: blur(8px);
          pointer-events: auto;
          z-index: 20;
        }

        @keyframes pulse-lock {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .lock-badge {
          animation: pulse-lock 2s ease-in-out infinite;
        }
      `}</style>

      {/* Blur Section - Bottom portion of preview */}
      <div
        className="blur-section"
        style={{
          height: `${blurPercentage}%`,
          bottom: 0
        }}
      />

      {/* Lock Message & CTA */}
      <div
        className="absolute inset-x-0 flex flex-col items-center justify-center gap-4 p-6 text-center"
        style={{
          top: `${100 - blurPercentage - 15}%`,
          zIndex: 25
        }}
      >
        {/* Lock Icon */}
        <div className="lock-badge inline-block">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        {/* Message */}
        <div className="max-w-xs">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unlock Full Story
          </h3>
          <p className="text-gray-700 text-sm mb-4">
            Complete checkout to see the entire magical story with all illustrations
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onCheckout}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
        >
          💳 Continue to Checkout
        </button>

        {/* Info */}
        <p className="text-xs text-gray-600 mt-3">
          ✓ Instant access after payment | ✓ Download PDF | ✓ Print-ready
        </p>
      </div>
    </>
  );
}
