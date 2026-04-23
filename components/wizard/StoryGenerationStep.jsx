/**
 * StoryGenerationStep.jsx
 * 
 * Purpose: Story Generation workflow - combines image upload and story generation
 * Features:
 * - Image upload validation
 * - AI story generation from images
 * - Story preview
 * - Save as draft
 * - Regenerate functionality
 */

'use client';

import { useState, useEffect } from 'react';
import ImageUploadComponent from './ImageUploadComponent';
import StoryPreviewComponent from './StoryPreviewComponent';
import { storyAPI } from '@/utils/api';
import { useLanguage } from '@/hooks/useLanguage';

export default function StoryGenerationStep({ 
  projectId,
  theme,
  childName,
  onStoryGenerated,
}) {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload'); // 'upload' | 'generating' | 'preview'
  const [regenerateCount, setRegenerateCount] = useState(0);
  const { currentLanguage } = useLanguage();

  const MIN_IMAGES = 3;

  const normalizeGeneratedStory = (payload) => {
    const generated = payload?.data || payload || {};
    const pages = Array.isArray(generated.pages)
      ? generated.pages.map((page, index) => ({
          ...page,
          pageNumber: page.pageNumber || page.page_number || index + 1,
          title: page.title || page.page_title || `Page ${index + 1}`,
          text: page.text || page.content || page.page_text || '',
          image: page.image || page.imageUrl || page.image_url || '',
          imageUrl: page.imageUrl || page.image || page.image_url || '',
        }))
      : [];

    return {
      id: generated.id,
      title: generated.title || `${childName}'s Story`,
      pages,
      theme: generated.theme || theme,
      generatedAt: generated.generatedAt || new Date().toISOString(),
    };
  };

  /**
   * Handle image selection from upload component
   */
  const handleImagesSelected = (images) => {
    setUploadedImages(images);
    setError('');
  };

  /**
   * Generate story from uploaded images
   */
  const generateStory = async (nextRegenerateCount = regenerateCount) => {
    if (uploadedImages.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images to generate a story`);
      return;
    }

    setLoading(true);
    setError('');
    setStep('generating');

    try {
      // Prepare image data
      const imageData = uploadedImages.map(img => ({
        id: img.id,
        url: img.preview,
        name: img.name,
      }));

      // Call API to generate story
      const response = await storyAPI.generateStoryFromImages({
        projectId,
        childName,
        theme,
        images: imageData,
        regenerationCount: nextRegenerateCount,
        storyLanguage: currentLanguage || 'en',
      });

      const story = normalizeGeneratedStory(response.data);

      setGeneratedStory(story);
      setRegenerateCount(nextRegenerateCount);
      setStep('preview');

      // Notify parent component
      if (onStoryGenerated) {
        onStoryGenerated(story);
      }
    } catch (err) {
      console.error('Story generation error:', err);
      setError(
        err.response?.data?.error ||
        err.message ||
        'Failed to generate story. Please try again.'
      );
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Regenerate story with different selection of images
   */
  const regenerateStory = async () => {
    await generateStory(regenerateCount + 1);
  };

  /**
   * Save current story as draft
   */
  const saveDraft = async () => {
    try {
      setLoading(true);
      
      const response = await storyAPI.saveDraft({
        projectId,
        story: generatedStory,
        images: uploadedImages,
        status: 'draft',
      });

      // Show success message
      alert('✅ Story saved as draft successfully!');
      
      // Optionally redirect or close
      if (onStoryGenerated) {
        onStoryGenerated({
          ...generatedStory,
          draftId: response.data.id,
          status: 'draft',
        });
      }
    } catch (err) {
      console.error('Draft save error:', err);
      alert('❌ Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Go back to upload step
   */
  const backToUpload = () => {
    setStep('upload');
    setGeneratedStory(null);
  };

  /**
   * Listen for language changes and regenerate story
   */
  useEffect(() => {
    const handleLanguageChange = (event) => {
      console.log('[StoryGeneration] Language changed to:', event.detail.language);
      // If we have a generated story, regenerate it in the new language
      if (generatedStory && step === 'preview' && uploadedImages.length >= MIN_IMAGES) {
        console.log('[StoryGeneration] Regenerating story in new language');
        generateStory(regenerateCount);
      }
    };

    window.addEventListener('storyLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('storyLanguageChanged', handleLanguageChange);
  }, [generatedStory, step, uploadedImages, regenerateCount]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {/* Progress Indicator */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4">
          {/* Step 1 */}
          <div className={`flex flex-col items-center ${step === 'upload' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
              step === 'upload' ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              1
            </div>
            <p className="text-xs mt-1 font-medium">Upload Images</p>
          </div>
          
          <div className={`flex-1 h-1 ${['generating', 'preview'].includes(step) ? 'bg-blue-600' : 'bg-gray-300'}`} />
          
          {/* Step 2 */}
          <div className={`flex flex-col items-center ${step === 'generating' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
              ['generating', 'preview'].includes(step) ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              2
            </div>
            <p className="text-xs mt-1 font-medium">Generate Story</p>
          </div>
          
          <div className={`flex-1 h-1 ${step === 'preview' ? 'bg-blue-600' : 'bg-gray-300'}`} />
          
          {/* Step 3 */}
          <div className={`flex flex-col items-center ${step === 'preview' ? 'text-blue-600' : 'text-gray-500'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
              step === 'preview' ? 'bg-blue-600' : 'bg-gray-400'
            }`}>
              3
            </div>
            <p className="text-xs mt-1 font-medium">Preview</p>
          </div>
        </div>
      </div>

      {/* Step 1: Image Upload */}
      {step === 'upload' && (
        <div className="max-w-6xl mx-auto">
          <ImageUploadComponent 
            onImagesSelected={handleImagesSelected}
            maxImages={10}
          />

          {/* Error Alert */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
              <p className="text-red-700">⚠️ {error}</p>
            </div>
          )}

          {/* Generate Button */}
          {uploadedImages.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={generateStory}
                disabled={loading || uploadedImages.length < MIN_IMAGES}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 ${
                  loading || uploadedImages.length < MIN_IMAGES
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? '⏳ Generating Story...' : '✨ Generate Story'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 'generating' && (
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">✨</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Creating Your Story...
            </h2>
            <p className="text-gray-600 mb-6">
              AI is analyzing your images and crafting a magical story for {childName}
            </p>
            
            {/* Loading Animation */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Story Preview */}
      {step === 'preview' && generatedStory && (
        <StoryPreviewComponent
          story={generatedStory}
          theme={theme}
          uploadedPhoto={uploadedImages[0] ? { ...uploadedImages[0], url: uploadedImages[0].preview } : null}
          childName={childName}
          onClose={backToUpload}
          onRegenerate={regenerateStory}
          onSaveDraft={saveDraft}
        />
      )}
    </div>
  );
}
