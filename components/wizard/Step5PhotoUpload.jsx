'use client';

import { useEffect, useState } from 'react';
import { useWizardStore } from '@/utils/store';
import ImageUploadComponent from './ImageUploadComponent';
import { getBookThemeLabel } from '@/utils/themes';
import { validateImage } from '@/utils/ImageValidation';
import { getAuthToken, storyAPI } from '@/utils/api';

const CLEAR_FACE_UPLOAD_MESSAGE =
  'Please upload a clearer front-facing photo of your child for better personalized illustrations.';

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

  useEffect(() => {
    if (!formData.projectId || !getAuthToken()) {
      return;
    }

    storyAPI
      .updateDraft(formData.projectId, { currentStep: 5 })
      .catch((syncError) => {
        console.warn('[STEP5] Failed to sync draft step:', syncError);
      });
  }, [formData.projectId]);

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

    const validationResults = await Promise.all(
      uploadedImages.map(async (image) => {
        if (!image?.file) {
          return {
            isValid: Boolean(image?.illustrationReference || image?.preview),
          };
        }

        return validateImage(image.file, [], '');
      })
    );

    const hasClearFaceReference = validationResults.some(
      (validation) => validation?.isValid
    );

    if (!hasClearFaceReference) {
      setError(CLEAR_FACE_UPLOAD_MESSAGE);
      return;
    }

    updateFormData('uploadedImages', uploadedImages);

    setLoading(true);
    try {
      console.log('[STEP5] Starting photo upload process...');
      
      // Upload each image to the backend
      const projectId = formData.projectId;
      if (!projectId) {
        setError('Project ID not found. Please try again.');
        setLoading(false);
        return;
      }

      let uploadedCount = 0;
      let uploadErrors = [];

      for (let i = 0; i < uploadedImages.length; i++) {
        const image = uploadedImages[i];
        
        // Only upload if this is a File object (not a pre-existing URL)
        if (image?.file instanceof File) {
          try {
            console.log(`[STEP5] Uploading image ${i + 1}/${uploadedImages.length}...`);
            
            // Create FormData for direct backend upload
            const formDataToSend = new FormData();
            formDataToSend.append('photo', image.file);

            // Get auth token
            const token = getAuthToken();
            
            // Send directly to backend (bypassing Next.js proxy)
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const response = await fetch(`${backendUrl}/story/${projectId}/upload-photo`, {
              method: 'POST',
              headers: token ? {
                'Authorization': `Bearer ${token}`
              } : {},
              body: formDataToSend,
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Upload failed: ${response.status}`);
            }

            const responseData = await response.json();
            console.log(`[STEP5] Image ${i + 1} uploaded successfully:`, responseData);
            uploadedCount++;
            setError(''); // Clear error as we make progress
          } catch (uploadError) {
            console.error(`[STEP5] Error uploading image ${i + 1}:`, uploadError);
            uploadErrors.push(`Image ${i + 1}: ${uploadError.message}`);
          }
        } else {
          console.log(`[STEP5] Skipping image ${i + 1} (pre-existing URL or invalid)`);
          uploadedCount++;
        }
      }

      if (uploadErrors.length > 0) {
        setError(`Upload failed for some images: ${uploadErrors.join(', ')}`);
        console.error('[STEP5] Upload errors:', uploadErrors);
        setLoading(false);
        return;
      }

      console.log(`[STEP5] Successfully uploaded ${uploadedCount} image(s)`);
      
      // Proceed to next step after all images are uploaded
      nextStep();
    } catch (err) {
      setError('Failed to upload photos. Please try again.');
      console.error('[STEP5] Error:', err);
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
            Upload <span className="font-semibold text-blue-600">3-5 photos of your child</span>{' '}
            to create personalized story illustrations
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your {formData.childName || 'child'}&apos;s face will be incorporated into the storybook characters. 
            For best results, use clear front-facing photos with good lighting.
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
                ✓ You&apos;ve uploaded {uploadedImages.length} images. Ready to
                personalize your story with these photos!
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
                For best results, upload a clear front-facing photo. We use
                this only to preserve your child&apos;s face in the storybook
                illustration.
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
              ? 'Uploading & Processing...'
              : `Upload & Continue (${uploadedImages.length}/${MIN_IMAGES})`}
          </button>
        </div>
      </div>
    </div>
  );
}
