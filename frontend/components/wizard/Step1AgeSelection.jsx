// Wizard Step Component 1: Age Selection
'use client';

import React from 'react';
import { useWizardStore } from '@/utils/store';

const AGE_GROUPS = [
  { value: '0-2', label: '0-2 Years', icon: '👶' },
  { value: '3-5', label: '3-5 Years', icon: '👶' },
  { value: '5-8', label: '5-8 Years', icon: '🧒' },
  { value: '8-12', label: '8-12 Years', icon: '👧' },
  { value: '12+', label: '12+ Years', icon: '👦' }
];

export default function Step1AgeSelection() {
  const { formData, updateFormData, nextStep } = useWizardStore();

  const handleSelect = (ageGroup) => {
    updateFormData('ageGroup', ageGroup);
  };

  const handleContinue = () => {
    if (formData.ageGroup) {
      nextStep();
    }
  };

  return (
    <div className="step-container w-full max-w-4xl mx-auto px-4 py-10 bg-white rounded-2xl shadow-2xl">
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">Step 1: Select Age Group</h2>
          <p className="text-xl text-gray-600">Who is this storybook for?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 py-8">
          {AGE_GROUPS.map((group) => (
            <button
              key={group.value}
              onClick={() => handleSelect(group.value)}
              className={`age-button flex flex-col items-center justify-center p-8 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                formData.ageGroup === group.value
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl scale-105 ring-4 ring-blue-300'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-md'
              }`}
            >
              <div className="text-6xl mb-4">{group.icon}</div>
              <div className="font-bold text-lg text-center">{group.label}</div>
            </button>
          ))}
        </div>

        <div className="pt-6 space-y-3">
          <button
            onClick={handleContinue}
            disabled={!formData.ageGroup}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300 shadow-lg disabled:shadow-none text-lg"
          >
            Continue to Next Step
          </button>
          {!formData.ageGroup && (
            <p className="text-center text-gray-500 text-sm">Please select an age group to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}
