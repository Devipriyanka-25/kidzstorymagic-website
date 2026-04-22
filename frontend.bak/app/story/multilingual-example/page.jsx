/**
 * frontend/app/story/multilingual-example/page.jsx
 *
 * Complete example page demonstrating multilingual story generation
 * Combines child safety (Phase 1) with multilingual support (Phase 2)
 * 
 * Shows:
 * - Language selector integration
 * - Multilingual form with translations
 * - Story generation with language parameter
 * - Language-aware preview
 * - PDF export in selected language
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChildSafetyForm from '@/components/safety/ChildSafetyForm';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import useLanguage from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '@/constants/languages';
import { getFontFamily, prepareTextForDisplay } from '@/utils/i18n/unicodeUtils';
import axios from 'axios';

export default function MultilingualStoryGenerationPage() {
  const router = useRouter();
  const { translate, currentLanguage, changeLanguage } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    parentEmail: '',
    parentConsent: false,
    storyPrompt: '',
    storyLanguage: currentLanguage || 'en',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [safetyCompleted, setSafetyCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Update language in form when it changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      storyLanguage: currentLanguage || 'en',
    }));
  }, [currentLanguage]);

  /**
   * Handle child safety form completion
   */
  const handleSafetyComplete = (safetyData) => {
    setFormData((prev) => ({
      ...prev,
      childName: safetyData.childName,
      age: safetyData.age,
      parentEmail: safetyData.parentEmail,
      parentConsent: safetyData.parentConsent,
    }));
    setSafetyCompleted(true);
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handle language change
   */
  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = [];

    if (!formData.childName?.trim()) {
      errors.push(translate('nameRequired'));
    }

    if (!formData.age) {
      errors.push(translate('ageRequired'));
    }

    const ageNum = parseInt(formData.age);
    if (ageNum < 1 || ageNum > 17) {
      errors.push(translate('ageInvalid'));
    }

    if (ageNum < 13) {
      if (!formData.parentEmail?.trim()) {
        errors.push(translate('emailRequired'));
      }
      if (!formData.parentConsent) {
        errors.push(translate('consentRequired'));
      }
    }

    if (!formData.storyLanguage) {
      errors.push(translate('languageRequired'));
    }

    return errors;
  };

  /**
   * Generate story with language
   */
  const handleGenerateStory = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API with language parameter
      const response = await axios.post('/api/story/generate-with-language', {
        childName: formData.childName,
        age: parseInt(formData.age),
        parentEmail: formData.parentEmail,
        parentConsent: formData.parentConsent,
        storyPrompt: formData.storyPrompt || 'Create an engaging adventure story',
        storyLanguage: formData.storyLanguage,
      });

      if (response.data.success) {
        setGeneratedStory({
          ...response.data.story,
          generatedAt: new Date(),
          language: formData.storyLanguage,
        });
        setShowPreview(true);
      } else {
        setError(response.data.error?.message || translate('errorGeneratingStory'));
      }
    } catch (err) {
      console.error('Error generating story:', err);
      setError(
        err.response?.data?.error?.message || 
        err.message || 
        translate('errorGeneratingStory')
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Export story as PDF
   */
  const handleExportPDF = async () => {
    if (!generatedStory) return;

    try {
      setLoading(true);
      const response = await axios.post(
        '/api/story/export-pdf',
        {
          storyId: generatedStory.id,
          language: generatedStory.language,
          childName: generatedStory.childName,
        },
        {
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${formData.childName}_story_${formData.storyLanguage}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError(translate('errorExportingStory'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setFormData({
      childName: '',
      age: '',
      parentEmail: '',
      parentConsent: false,
      storyPrompt: '',
      storyLanguage: currentLanguage || 'en',
    });
    setSafetyCompleted(false);
    setGeneratedStory(null);
    setShowPreview(false);
    setError(null);
  };

  /**
   * Get language metadata
   */
  const getLanguageLabel = (code) => {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code);
    return lang ? `${lang.label} / ${lang.nativeLabel}` : 'English';
  };

  // Show preview if story is generated
  if (showPreview && generatedStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with language selector */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-purple-900">
                {generatedStory.childName}'s {translate('storyPreviewTitle')}
              </h1>
              <button
                onClick={() => window.history.back()}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Language Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600">{translate('languageSelected')}:</span>
              <span className="inline-block bg-purple-100 text-purple-900 px-4 py-2 rounded-full font-medium">
                {getLanguageLabel(generatedStory.language)}
              </span>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>Age:</strong> {generatedStory.age} years old
              </p>
              <p>
                <strong>Words:</strong> {generatedStory.wordCount || 'N/A'}
              </p>
              <p>
                <strong>Generated:</strong> {generatedStory.generatedAt.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Story Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div
              className="prose max-w-none"
              style={{
                fontSize: '16px',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                fontFamily: getFontFamily(generatedStory.language),
                direction: 'ltr',
              }}
              lang={generatedStory.language}
            >
              {prepareTextForDisplay(generatedStory.content, generatedStory.language)}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">{translate('safetyTitle')}</p>
                <ul className="space-y-1 text-xs">
                  <li>• {translate('photosDeleted')}</li>
                  <li>• {translate('childDataDeleted')}</li>
                  <li>• {translate('noDataSharing')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {loading ? 'Exporting...' : translate('downloadStory')}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              {translate('resetForm')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Language Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-purple-900">
              {translate('storyPreviewTitle')} Generator
            </h1>
            <LanguageSelector
              showLabel={false}
              size="sm"
              onLanguageChange={handleLanguageChange}
            />
          </div>
          <p className="text-gray-600">{translate('languageHelpText')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">{translate('errorGeneratingStory')}</p>
            <p className="text-red-700 text-sm mt-1 whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleGenerateStory} className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Child Safety Section - Phase 1 */}
          {!safetyCompleted && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <ChildSafetyForm onComplete={handleSafetyComplete} />
            </div>
          )}

          {/* Language Selection - Phase 2 */}
          {safetyCompleted && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-800">{formData.childName}</p>
                  <p className="text-sm text-gray-600">Age: {formData.age}</p>
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {translate('storyLanguage')}
                </label>
                <select
                  name="storyLanguage"
                  value={formData.storyLanguage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label} / {lang.nativeLabel}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">{translate('languageHelpText')}</p>
              </div>

              {/* Story Prompt */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700">
                  {translate('storyPrompt')}
                </label>
                <textarea
                  name="storyPrompt"
                  value={formData.storyPrompt}
                  onChange={handleInputChange}
                  placeholder={translate('storyPromptPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                />
                <p className="text-xs text-gray-500">
                  Optional: Describe what kind of story you'd like (theme, characters, lesson, etc.)
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {loading ? 'Generating Story...' : translate('generateStory')}
              </button>
            </div>
          )}
        </form>

        {/* Safety Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-green-900 font-medium mb-2">{translate('safetyTitle')}</p>
          <ul className="text-xs text-green-800 space-y-1">
            <li>✓ {translate('photosNotStored')}</li>
            <li>✓ {translate('childDataDeleted')}</li>
            <li>✓ {translate('noDataSharing')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
