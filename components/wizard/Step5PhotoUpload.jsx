'use client';

import { useState } from 'react';
import { useWizardStore } from '@/utils/store';
import ImageUploadComponent from './ImageUploadComponent';
import { getBookThemeLabel } from '@/utils/themes';

/**
 * Step5PhotoUpload - Image upload for story generation
 *
 * Features:
 * - Upload 3-5 images (minimum 3 required)
 * - Image validation and preview
 * - Multiple image support
 * - Ready for AI story generation
 */
export default function Step5PhotoUpload() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const [uploadedImages, setUploadedImages] = useState(
    formData.uploadedImages || []
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MIN_IMAGES = 3;
  const isReady = uploadedImages.length >= MIN_IMAGES;
  const selectedThemeLabel = getBookThemeLabel(formData.theme);

  function handleImagesSelected(images) {
    if (!images || images.length === 0) {
      setError('');
      setUploadedImages([]);
      updateFormData('uploadedImages', []);
      return;
    }

    setUploadedImages(images);
    updateFormData('uploadedImages', images);

    if (images.length >= MIN_IMAGES) {
      setError('');
    }
  }

  async function handleContinue() {
    if (!uploadedImages || uploadedImages.length === 0) {
      setError('Please upload images first');
      return;
    }

    if (uploadedImages.length < MIN_IMAGES) {
      setError(
        `Please upload at least ${MIN_IMAGES} images (you have ${uploadedImages.length})`
      );
      return;
    }

    updateFormData('uploadedImages', uploadedImages);

    setLoading(true);
    try {
      nextStep();
    } catch (err) {
      setError('Failed to proceed. Please try again.');
      console.error('[STEP5] Error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="step-container mx-auto w-full max-w-5xl px-4 py-8">
      <div className="space-y-6">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-4xl font-bold text-gray-900">
            Upload Story Images
          </h2>
          <p className="text-xl text-gray-600">
            Upload <span className="font-semibold text-blue-600">3-5 images</span>{' '}
            to create {formData.childName || 'your child'}&apos;s personalized
            story
          </p>
        </div>

        <ImageUploadComponent
          onImagesSelected={handleImagesSelected}
          maxImages={5}
        />

        {uploadedImages.length > 0 && (
          <div
            className={`rounded-lg p-4 text-center ${
              isReady
                ? 'border-2 border-green-300 bg-green-50'
                : 'border-2 border-amber-300 bg-amber-50'
            }`}
          >
            {isReady ? (
              <p className="text-lg font-semibold text-green-700">
                You&apos;ve uploaded {uploadedImages.length} images. Ready to
                generate the story.
              </p>
            ) : (
              <p className="text-lg font-semibold text-amber-700">
                You&apos;ve uploaded {uploadedImages.length}/5 images. Please
                upload {Math.max(MIN_IMAGES - uploadedImages.length, 0)} more
                (minimum 3 required).
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <p className="text-center font-semibold text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="rounded border-l-4 border-blue-500 bg-blue-50 p-4">
            <p className="mb-2 font-semibold text-blue-900">
              Tips for best results:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
              <li>Upload clear, well-lit images.</li>
              <li>
                Upload the clearest front-facing smiling photo first because it
                becomes the main character reference.
              </li>
              <li>
                Use 3 to 5 photos with slightly different angles for stronger
                cartoon consistency.
              </li>
              <li>
                Images should support the selected book world:{' '}
                <span className="font-semibold">{selectedThemeLabel}</span>
              </li>
              <li>Avoid blurry or overly dark images.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            onClick={prevStep}
            disabled={loading}
            className="flex-1 rounded-lg bg-gray-400 px-6 py-4 text-lg font-bold text-gray-900 transition-all hover:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            disabled={!isReady || loading}
            className={`flex-1 rounded-lg px-6 py-4 text-lg font-bold transition-all ${
              isReady && !loading
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700'
                : 'cursor-not-allowed bg-gray-300 text-gray-600'
            }`}
          >
            {loading
              ? 'Processing...'
              : `Generate Story (${uploadedImages.length}/${MIN_IMAGES})`}
          </button>
        </div>
      </div>
    </div>
  );
}
