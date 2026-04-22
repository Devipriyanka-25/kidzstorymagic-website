/**
 * PDFSettingsModal.jsx
 * 
 * Purpose: Modal for PDF download settings and payment info
 * Features:
 * - Page size selection
 * - Image quality selection
 * - File size warning
 * - Payment status display
 * - One-click PDF generation
 */

'use client';

import { useState, useEffect } from 'react';
import { calculateFileSize, formatFileSize } from '@/utils/ImageCompressor';
import { checkIsPremium } from '@/utils/PaymentChecker';

export default function PDFSettingsModal({
  story = {},
  isOpen = false,
  isPremium = false,
  isGenerating = false,
  onGenerate = () => {},
  onClose = () => {},
  onUpgradeClick = () => {},
}) {
  const [settings, setSettings] = useState({
    pageSize: 'a4',
    imageQuality: 'high',
    compression: false
  });

  const [estimatedSize, setEstimatedSize] = useState(0);
  const [premiumStatus, setPremiumStatus] = useState(isPremium);
  const [loading, setLoading] = useState(false);

  // Calculate file size when story changes
  useEffect(() => {
    if (story.pages) {
      const images = story.pages
        .map(p => p.image)
        .filter(img => img);
      const size = calculateFileSize(images);
      setEstimatedSize(size);
    }
  }, [story.pages]);

  // Check premium status on mount
  useEffect(() => {
    const checkPremium = async () => {
      const premium = await checkIsPremium();
      setPremiumStatus(premium);
    };
    checkPremium();
  }, []);

  if (!isOpen) return null;

  const qualityOptions = [
    { value: 'high', label: 'High (No Compression)', icon: '🎨' },
    { value: 'medium', label: 'Medium (70% Quality)', icon: '📊' },
    { value: 'low', label: 'Low (40% Quality)', icon: '⚡' }
  ];

  const pageSizeOptions = [
    { value: 'a4', label: 'A4' },
    { value: 'letter', label: 'Letter' }
  ];

  const showWarning = estimatedSize > 5;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      await onGenerate(settings);
    } catch (error) {
      console.error('[PDF-MODAL] Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              📥 Download as PDF
            </h2>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-white hover:text-blue-100 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Premium Badge */}
          {premiumStatus ? (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                ✅ Premium User
              </p>
              <p className="text-green-600 text-sm mt-1">Full-quality download available</p>
            </div>
          ) : (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              <p className="text-amber-700 font-semibold flex items-center gap-2">
                🔒 Free Preview
              </p>
              <p className="text-amber-600 text-sm mt-1">PDF will include watermark and image blur</p>

              <button
                onClick={onUpgradeClick}
                className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              >
                🚀 Upgrade to Premium
              </button>
            </div>
          )}

          {/* Page Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📄 Page Size
            </label>
            <div className="flex gap-2">
              {pageSizeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, pageSize: option.value })}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all ${
                    settings.pageSize === option.value
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Quality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎨 Image Quality
            </label>
            <div className="space-y-2">
              {qualityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, imageQuality: option.value })}
                  className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg transition-all font-semibold ${
                    settings.imageQuality === option.value
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="flex-1 text-left">{option.label}</span>
                  <input
                    type="radio"
                    checked={settings.imageQuality === option.value}
                    readOnly
                    className="w-5 h-5"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* File Size Warning */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Estimated Size:</span> {formatFileSize(estimatedSize)}
            </p>
            {showWarning && (
              <p className="text-sm text-amber-700 mt-2 font-semibold">
                ⚠️ Large file size detected. Medium or Low quality recommended for faster download.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  ⏳ Generating... 
                </>
              ) : (
                <>
                  ✨ Generate PDF
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
