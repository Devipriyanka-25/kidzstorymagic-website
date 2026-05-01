'use client';

import React, { useState } from 'react';

/**
 * Age Gate Modal
 * Initial modal to determine user age and route to appropriate flow
 * Shows age group buttons and direct age input
 */
export default function AgeGateModal({ isOpen, onComplete, onCancel }) {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [customAge, setCustomAge] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [errors, setErrors] = useState({});

  const AGE_GROUPS = [
    { value: 'infant', label: '👶 0-5 Years (Infant)', minAge: 0, maxAge: 5 },
    { value: 'child', label: '🧒 6-11 Years (Child)', minAge: 6, maxAge: 11 },
    { value: 'teen', label: '👦 12-17 Years (Teen)', minAge: 12, maxAge: 17 },
    { value: 'adult', label: '🧑 18+ Years (Adult)', minAge: 18, maxAge: 120 },
  ];

  const handleAgeGroupSelect = (group) => {
    setSelectedAgeGroup(group);
    setErrors({});
    setShowCustomInput(false);
    setCustomAge('');
  };

  const handleCustomAgeChange = (e) => {
    const value = e.target.value;
    setCustomAge(value);
    if (errors.customAge) {
      setErrors((prev) => ({ ...prev, customAge: '' }));
    }
  };

  const validateAndContinue = () => {
    const newErrors = {};
    let age = null;
    let ageSource = null;

    if (showCustomInput) {
      // Validate custom age input
      if (!customAge.trim()) {
        newErrors.customAge = 'Please enter your age';
      } else if (isNaN(customAge) || customAge < 1 || customAge > 120) {
        newErrors.customAge = 'Please enter a valid age (1-120)';
      } else {
        age = parseInt(customAge, 10);
        ageSource = 'custom';
      }
    } else if (selectedAgeGroup) {
      // Use age group midpoint for automatic age assignment
      const group = AGE_GROUPS.find((g) => g.value === selectedAgeGroup);
      age = Math.floor((group.minAge + group.maxAge) / 2);
      ageSource = 'group';
    } else {
      newErrors.ageSelection = 'Please select an age group or enter your age';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Determine parental consent requirement (under 13)
    const requiresParentalConsent = age < 13;

    // Proceed with the age
    onComplete({
      age,
      ageSource,
      ageGroup: selectedAgeGroup,
      requiresParentalConsent,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pointer-events-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md mx-auto p-8 space-y-8 pointer-events-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-5xl">🎂</div>
          <h2 className="text-3xl font-bold text-gray-900">How Old Are You?</h2>
          <p className="text-gray-600">
            This helps us show you the right story options
          </p>
        </div>

        {/* Age Group Buttons */}
        <div className="space-y-3">
          {AGE_GROUPS.map((group) => (
            <button
              key={group.value}
              onClick={() => handleAgeGroupSelect(group.value)}
              className={`w-full p-4 rounded-xl font-semibold transition-all duration-300 transform border-2 ${
                selectedAgeGroup === group.value
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 scale-105 shadow-lg'
                  : 'bg-gray-50 text-gray-800 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-gray-500 text-sm font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Custom Age Input */}
        <div className="space-y-3">
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="w-full p-4 rounded-xl font-semibold transition-all duration-300 border-2 border-dashed border-gray-400 hover:border-blue-400 text-gray-700 hover:bg-blue-50"
          >
            {showCustomInput ? '✕ Close' : '+ Enter Your Exact Age'}
          </button>

          {showCustomInput && (
            <div className="space-y-2">
              <input
                type="number"
                min="1"
                max="120"
                value={customAge}
                onChange={handleCustomAgeChange}
                placeholder="Enter your age"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              {errors.customAge && (
                <p className="text-red-500 text-sm font-semibold">{errors.customAge}</p>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errors.ageSelection && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 font-semibold text-sm">
            {errors.ageSelection}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={validateAndContinue}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            Continue
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          🔒 Your age helps us comply with child safety laws and show age-appropriate content.
        </p>
      </div>
    </div>
  );
}
