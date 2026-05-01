'use client';

import React, { useState } from 'react';

/**
 * Adult User Form Modal
 * Form for users 12+ who don't need COPPA verification
 * Collects: username and age
 */
export default function AdultUserFormModal({ isOpen, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    age: '',
    gender: 'male',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    } else if (formData.username.trim().length > 50) {
      newErrors.username = 'Username must be less than 50 characters';
    }

    // Validate age
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 12 || formData.age > 120) {
      newErrors.age = 'Age must be between 12 and 120';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Form is valid, proceed
    onComplete({
      username: formData.username.trim(),
      age: parseInt(formData.age, 10),
      gender: formData.gender,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pointer-events-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md mx-auto p-8 space-y-8 pointer-events-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-5xl">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900">Create Your Story</h2>
          <p className="text-gray-600">
            Tell us a little about yourself
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Your Name or Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your name or username"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                touched.username && errors.username
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
            />
            {touched.username && errors.username && (
              <p className="text-red-500 text-sm font-semibold">{errors.username}</p>
            )}
            <p className="text-xs text-gray-500">
              We will use this as the hero's name in your story
            </p>
          </div>

          {/* Age Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Your Age *
            </label>
            <input
              type="number"
              name="age"
              min="12"
              max="120"
              value={formData.age}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your age"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all ${
                touched.age && errors.age
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              }`}
            />
            {touched.age && errors.age && (
              <p className="text-red-500 text-sm font-semibold">{errors.age}</p>
            )}
            <p className="text-xs text-gray-500">
              Helps us show age-appropriate story themes
            </p>
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Gender Preference *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <p className="text-xs text-gray-500">
              Used to customize the story character presentation
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-900">
              Your Privacy Is Protected
            </p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>Your data is never shared or sold</li>
              <li>Secure payment powered by Stripe</li>
              <li>COPPA compliant and privacy-focused</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Continue
            </button>
          </div>
        </form>

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

