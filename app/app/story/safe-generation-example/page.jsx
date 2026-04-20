'use client';

import { useState } from 'react';
import ChildSafetyForm from '@/components/safety/ChildSafetyForm';
import ChildSafetyModal from '@/components/safety/ChildSafetyModal';
import useChildSafety from '@/hooks/useChildSafety';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * Example Story Generation Page with Child Safety
 * 
 * This page demonstrates the complete flow:
 * 1. Display safety modal on first visit
 * 2. Show child safety form with validation
 * 3. Upload images (with drag-drop support)
 * 4. Validate all requirements
 * 5. Submit with safety middleware
 * 6. Display confirmation
 */
export default function SafeStoryGenerationExample() {
  const router = useRouter();

  // Child safety hook
  const {
    formData,
    errors,
    isValidated,
    loading: formLoading,
    showModal,
    updateFormData,
    validateLocalForm,
    submitStoryGeneration,
    setShowModal,
  } = useChildSafety();

  // Local state
  const [selectedImages, setSelectedImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState('adventure');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Handle file drag events
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle file drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  /**
   * Handle file selection
   */
  const handleFileSelect = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  /**
   * Process selected files
   */
  const handleFiles = (files) => {
    setGenerationError('');

    // Filter image files only
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setGenerationError('Please select image files');
      return;
    }

    if (selectedImages.length + imageFiles.length > 10) {
      setGenerationError('Maximum 10 images allowed');
      return;
    }

    // Convert to base64 for display
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImages((prev) => [
          ...prev,
          {
            file,
            preview: e.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  /**
   * Remove an image
   */
  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Clear all images
   */
  const clearImages = () => {
    setSelectedImages([]);
  };

  /**
   * Generate story with safety validation
   */
  const handleGenerateStory = async () => {
    setGenerationError('');
    setSuccessMessage('');

    // Validate child safety form
    if (!validateLocalForm()) {
      setGenerationError('Please complete the child safety form');
      return;
    }

    // Validate images
    if (selectedImages.length < 3) {
      setGenerationError('Please upload at least 3 images');
      return;
    }

    setUploading(true);

    try {
      // Convert images to base64
      const imagePromises = selectedImages.map(
        (img) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                data: e.target.result,
                name: img.name,
                type: img.file.type,
              });
            };
            reader.readAsDataURL(img.file);
          })
      );

      const imageData = await Promise.all(imagePromises);

      // Submit with safety validation
      const result = await submitStoryGeneration({
        projectId: 'demo-project-' + Date.now(),
        images: imageData,
        theme,
        storyPrompt: storyPrompt || undefined,
      });

      if (result.success) {
        setSuccessMessage(
          `✅ Story generated successfully! ${result.dataPolicy.message}`
        );
        setShowConfirmation(true);

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          router.push(`/story/${result.data.id}`);
        }, 3000);
      } else {
        setGenerationError(result.error || 'Failed to generate story');
      }
    } catch (error) {
      setGenerationError(error.message || 'An error occurred');
      console.error('Story generation error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      {/* Safety Modal */}
      <ChildSafetyModal
        onAccept={() => setShowModal(false)}
        onClose={() => setShowModal(false)}
        forceShow={showModal}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            ✨ Create Your Child's Story
          </h1>
          <p className="text-xl text-gray-600">
            Safe, personalized, and COPPA-compliant story generation
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <p className="text-green-800 font-semibold text-lg">{successMessage}</p>
            <p className="text-green-700 text-sm mt-2">Redirecting to your story...</p>
          </div>
        )}

        {/* Error Message */}
        {generationError && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <p className="text-red-800 font-semibold text-lg">⚠️ {generationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Child Safety Form */}
            <section>
              <ChildSafetyForm onFormChange={updateFormData} />
            </section>

            {/* 2. Image Upload */}
            <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <span>📸</span> Upload Photos
                </h2>
                <p className="text-blue-100 mt-2">
                  Upload 3-10 photos of your child or their favorite things
                </p>
              </div>

              <div className="p-8">
                {/* Drag & Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-5xl mb-4">📁</div>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    Drag & drop photos here
                  </p>
                  <p className="text-gray-600 mb-6">or</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                    <span className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold cursor-pointer hover:shadow-lg transition-all inline-block">
                      Browse Files
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mt-4">
                    JPG, PNG, WebP • Max {10 - selectedImages.length} images remaining
                  </p>
                </div>

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold text-gray-900">
                        {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''}{' '}
                        selected
                      </p>
                      <button
                        onClick={clearImages}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.preview}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                          <p className="text-xs text-gray-600 mt-1 truncate">
                            {img.name}
                          </p>
                        </div>
                      ))}
                    </div>

                    {selectedImages.length < 3 && (
                      <p className="text-amber-600 font-semibold mt-4 flex items-center gap-2">
                        <span>⚠️</span> Need at least{' '}
                        {3 - selectedImages.length} more image{3 - selectedImages.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 3. Story Theme & Prompt */}
            <section className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🎨 Personalize Your Story
              </h2>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-4">
                    Story Theme
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['adventure', 'fairytale', 'mystery', 'comedy', 'courage', 'creativity'].map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`p-4 rounded-xl font-bold transition-all text-center capitalize ${
                            theme === t
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          {t}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Story Prompt */}
                <div>
                  <label htmlFor="prompt" className="block text-lg font-bold text-gray-900 mb-3">
                    Story Prompt (Optional)
                  </label>
                  <textarea
                    id="prompt"
                    value={storyPrompt}
                    onChange={(e) => setStoryPrompt(e.target.value)}
                    placeholder="e.g., 'Make the story about overcoming fears' or 'Include magical creatures'"
                    rows="4"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                  />
                  <p className="text-gray-600 text-sm mt-2">
                    Give AI hints about the story direction (optional)
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Summary */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>✓</span> Summary
                </h3>

                <div className="space-y-4">
                  {/* Child Info */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold">Child Name</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formData.childName || '—'}
                    </p>
                  </div>

                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold">Age</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formData.childAge || '—'} years old
                    </p>
                  </div>

                  {/* Images */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold">Photos</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedImages.length}/10
                    </p>
                  </div>

                  {/* Theme */}
                  <div className="pb-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 font-semibold">Theme</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{theme}</p>
                  </div>

                  {/* Validation Status */}
                  <div className="pt-4">
                    {isValidated && selectedImages.length >= 3 ? (
                      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                        <p className="text-green-800 font-bold flex items-center gap-2">
                          <span>✅</span> Ready to Generate!
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                        <p className="text-amber-800 text-sm font-semibold">
                          {!isValidated
                            ? '⚠️ Complete child safety form'
                            : selectedImages.length < 3
                            ? `⚠️ Need ${3 - selectedImages.length} more photo${3 - selectedImages.length !== 1 ? 's' : ''}`
                            : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                  <span>🔒</span> Your Data
                </h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span>✓</span> Photos deleted after use
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span> No data stored
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span> COPPA compliant
                  </li>
                </ul>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateStory}
                disabled={
                  !isValidated ||
                  selectedImages.length < 3 ||
                  uploading ||
                  showConfirmation
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isValidated &&
                  selectedImages.length >= 3 &&
                  !uploading &&
                  !showConfirmation
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                    : 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⚙️</span> Generating...
                  </span>
                ) : showConfirmation ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>✅</span> Success! Redirecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>✨</span> Generate Story
                  </span>
                )}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
