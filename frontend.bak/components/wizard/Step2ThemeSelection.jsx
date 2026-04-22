// Wizard Step Component 2: Theme Selection
'use client';

import React, { useState } from 'react';
import { useWizardStore } from '@/utils/store';
import { STORY_THEMES, ILLUSTRATION_THEMES } from '@/utils/themes';

export default function Step2ThemeSelection() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();
  const [customPrompt, setCustomPrompt] = useState(formData.customIllustrationPrompt || '');
  const [selectedTab, setSelectedTab] = useState('story'); // 'story' or 'style'

  const handleSelect = (theme) => {
    updateFormData('theme', theme);
    if (theme !== 'customizable') {
      updateFormData('customIllustrationPrompt', '');
      setCustomPrompt('');
    }
  };

  const handleCustomPromptChange = (e) => {
    const value = e.target.value;
    setCustomPrompt(value);
    updateFormData('customIllustrationPrompt', value);
  };

  const handleContinue = () => {
    const isValid = formData.theme && (formData.theme !== 'customizable' || customPrompt.trim());
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step-container w-full max-w-6xl mx-auto px-4 py-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-5xl">🎨✨📖</div>
          <h2 className="text-4xl font-bold text-gray-900">Step 2: Choose Your Adventure</h2>
          <p className="text-xl text-gray-700">Pick a story type and illustration style to bring your tale to life!</p>
        </div>

        {/* Tabs for Story Theme & Illustration Style */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setSelectedTab('story')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              selectedTab === 'story'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 shadow-md hover:bg-gray-100'
            }`}
          >
            📚 Story Type
          </button>
          <button
            onClick={() => setSelectedTab('style')}
            className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
              selectedTab === 'style'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 shadow-md hover:bg-gray-100'
            }`}
          >
            🎭 Illustration Style
          </button>
        </div>

        {/* Story Themes Tab */}
        {selectedTab === 'story' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700 font-semibold">What kind of story captures your imagination?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 py-4">
              {STORY_THEMES.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleSelect(theme.value)}
                  className={`relative theme-card p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 h-full ${
                    formData.theme === theme.value
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-2xl ring-4 ring-blue-300'
                      : 'bg-white text-gray-800 shadow-lg hover:shadow-2xl border-2 border-gray-200'
                  }`}
                >
                  {formData.theme === theme.value && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  )}
                  <div className="text-5xl mb-3">{theme.icon}</div>
                  <div className="font-bold text-lg">{theme.label}</div>
                  <div className="text-xs opacity-75 mt-2">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Illustration Style Tab */}
        {selectedTab === 'style' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <p className="text-lg text-gray-700 font-semibold">Choose how your illustrations should look:</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              {Object.values(ILLUSTRATION_THEMES).map((theme) => (
                <button
                  key={theme.value}
                  title={`${theme.label}: ${theme.description}`}
                  className={`relative illustration-card p-5 rounded-2xl transition-all duration-300 transform hover:scale-110 h-32 flex flex-col items-center justify-center ${
                    formData.illustrationStyle === theme.value
                      ? `shadow-2xl ring-4 scale-110`
                      : 'shadow-lg hover:shadow-2xl'
                  }`}
                  style={{
                    background: theme.gradient,
                    borderColor: theme.borderColor,
                    borderWidth: formData.illustrationStyle === theme.value ? '3px' : '2px'
                  }}
                  onClick={() => {
                    // Update illustration style (you may need to add this to store)
                    updateFormData('illustrationStyle', theme.value);
                  }}
                >
                  {formData.illustrationStyle === theme.value && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-400 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                  )}
                  <div className="text-3xl mb-2">{theme.icon}</div>
                  <div className="font-bold text-white text-center text-sm drop-shadow-md">{theme.label}</div>
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 mt-6">
              <p className="text-sm text-gray-700">
                <strong>✨ Tip:</strong> You can also customize your own illustration style!
              </p>
            </div>
          </div>
        )}

        {/* Custom Illustration Prompt Input */}
        {formData.theme === 'customizable' && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-blue-300 rounded-2xl p-8 space-y-4 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h3 className="text-2xl font-bold text-gray-900">Tell Your Story Setting</h3>
            </div>
            <p className="text-gray-700 font-medium">
              Describe the world and setting where your story takes place. This will create consistent illustrations throughout the entire book!
            </p>
            <textarea
              id="customIllustrationPrompt"
              name="customIllustrationPrompt"
              value={customPrompt}
              onChange={handleCustomPromptChange}
              placeholder="Example: A magical kingdom where a brave young hero discovers a hidden treasure in an enchanted forest filled with glowing trees, talking animals, and sparkling waterfalls..."
              className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-lg"
              rows="5"
            />
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700">
                <strong>💡 Tips for better stories:</strong>
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
                <li>Describe the setting and atmosphere in detail</li>
                <li>Include what creatures or characters might appear</li>
                <li>Mention colors, lighting, and mood</li>
                <li>The more creative, the better the illustrations!</li>
              </ul>
            </div>
          </div>
        )}

        <div className="pt-6 flex gap-4">
          <button
            onClick={prevStep}
            className="flex-1 bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl hover:bg-gray-400 transition-all duration-300 shadow-md text-lg"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!formData.theme || (formData.theme === 'customizable' && !customPrompt.trim())}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300 shadow-lg disabled:shadow-none text-lg disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
