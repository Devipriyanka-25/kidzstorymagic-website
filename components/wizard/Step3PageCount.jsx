// Wizard Step Component 3: Page Count Selection
'use client';

import React from 'react';
import { useWizardStore } from '@/utils/store';

const PAGE_OPTIONS = [
  { value: 10, label: '10 Pages', price: '$9.99', description: 'Quick story' },
  { value: 20, label: '20 Pages', price: '$12.99', description: 'Standard story' },
  { value: 30, label: '30 Pages', price: '$14.99', description: 'Extended story' }
];

export default function Step3PageCount() {
  const { formData, updateFormData, nextStep, prevStep } = useWizardStore();

  const handleSelect = (pageCount) => {
    updateFormData('pageCount', pageCount);
  };

  const handleContinue = () => {
    nextStep();
  };

  return (
    <div className="step-container w-full max-w-4xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-2xl">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Step 3: Select Page Count</h2>
          <p className="text-xl text-gray-600">How long should the story be?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          {PAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`page-option flex flex-col items-center justify-center p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 text-center ${
                formData.pageCount === option.value
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl scale-105 ring-4 ring-blue-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md'
              }`}
            >
              <div className="text-5xl font-bold mb-4">{option.label}</div>
              <div className="text-3xl font-bold mb-4 text-blue-600">{option.price}</div>
              <div className="text-sm opacity-75">{option.description}</div>
            </button>
          ))}
        </div>

        <div className="pt-6 flex gap-4">
          <button
            onClick={prevStep}
            className="flex-1 bg-gray-300 text-gray-800 font-bold py-4 px-6 rounded-xl hover:bg-gray-400 transition-all duration-300 shadow-md text-lg"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
