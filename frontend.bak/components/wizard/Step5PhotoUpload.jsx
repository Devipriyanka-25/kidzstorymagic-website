'use client';

import { useState } from 'react';
import { useWizardStore } from '@/utils/store';
import ImageUploadComponent from './ImageUploadComponent';

/**
 * Step5PhotoUpload - Image upload for story generation
 * 
 * Features:
 * - Upload 5+ images (minimum 5 required)
 * - Image validation and preview
 * - Multiple image support
 * - Ready for AI story generation
 */
export default function Step5PhotoUpload() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const [uploadedImages, setUploadedImages] = useState(formData.uploadedImages || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MIN_IMAGES = 2;
  const isReady = uploadedImages.length >= MIN_IMAGES;

  /**
   * Handle images selected from ImageUploadComponent
   */
  const handleImagesSelected = (images) => {
    if (!images || images.length === 0) {
      setError('');
      setUploadedImages([]);
      updateFormData('uploadedImages', []);
      return;
    }

    setUploadedImages(images);
    updateFormData('uploadedImages', images);
    
    // Clear error if we have enough images
    if (images.length >= MIN_IMAGES) {
      setError('');
    }
  };

  /**
   * Handle proceeding to next step
   */
  const handleContinue = async () => {
    // Validate images
    if (!uploadedImages || uploadedImages.length === 0) {
      setError('Please upload images first');
      return;
    }

    if (uploadedImages.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images (you have ${uploadedImages.length})`);
      return;
    }

    // Update form data with images
    updateFormData('uploadedImages', uploadedImages);
    
    // Move to next step (story generation/preview)
    setLoading(true);
    try {
      nextStep();
    } catch (err) {
      setError('Failed to proceed. Please try again.');
      console.error('[STEP5] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container w-full max-w-5xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-2 text-gray-900">
            📸 Upload Story Images
          </h2>
          <p className="text-xl text-gray-600">
            Upload <span className="font-semibold text-blue-600">2-5 images</span> to create {formData.childName || 'your child'}'s personalized story
          </p>
        </div>

        {/* Image Upload Component */}
        <ImageUploadComponent
          onImagesSelected={handleImagesSelected}
          maxImages={5}
        />

        {/* Status Message */}
        {uploadedImages.length > 0 && (
          <div className={`p-4 rounded-lg text-center ${
            isReady 
              ? 'bg-green-50 border-2 border-green-300' 
              : 'bg-amber-50 border-2 border-amber-300'
          }`}>
            {isReady ? (
              <p className="text-green-700 font-semibold text-lg">
                ✅ You've uploaded {uploadedImages.length} images. Ready to generate story!
              </p>
            ) : (
              <p className="text-amber-700 font-semibold text-lg">
                📤 You've uploaded {uploadedImages.length}/5 images. Please upload {2 - uploadedImages.length} more (minimum 2 required).
              </p>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-red-700 text-center font-semibold">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-blue-900 font-semibold mb-2">💡 Tips for best results:</p>
            <ul className="text-blue-800 space-y-1 text-sm list-disc list-inside">
              <li>Upload clear, well-lit images</li>
              <li>Mix of different scenes and subjects works best</li>
              <li>Images should be relevant to the theme: <span className="font-semibold">{formData.theme || 'adventure'}</span></li>
              <li>Avoid blurry or overly dark images</li>
            </ul>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={prevStep}
            disabled={loading}
            className="flex-1 px-6 py-4 bg-gray-400 text-gray-900 font-bold rounded-lg hover:bg-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            ← Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!isReady || loading}
            className={`flex-1 px-6 py-4 font-bold rounded-lg transition-all text-lg ${
              isReady && !loading
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {loading ? '⏳ Processing...' : `✨ Generate Story (${uploadedImages.length}/${MIN_IMAGES})`}
          </button>
        </div>
      </div>
    </div>
  );
}
