'use client';

import React, { useState, useEffect } from 'react';

/**
 * Child Safety Verification Modal
 * Popup window for COPPA-compliant child safety verification
 * Collects: child name, age, parent email, consent
 */
export default function ChildSafetyVerificationModal({ isOpen, onComplete, onCancel }) {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    parentEmail: '',
    parentConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
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

    // Validate child name
    if (!formData.childName.trim()) {
      newErrors.childName = 'Child\'s name is required';
    } else if (formData.childName.trim().length < 2) {
      newErrors.childName = 'Name must be at least 2 characters';
    }

    // Validate age
    if (!formData.childAge) {
      newErrors.childAge = 'Age is required';
    } else if (isNaN(formData.childAge) || formData.childAge < 1 || formData.childAge > 17) {
      newErrors.childAge = 'Age must be between 1 and 17';
    }

    // If child is under 13, require parent email and consent
    const age = parseInt(formData.childAge, 10);
    if (age < 13) {
      if (!formData.parentEmail.trim()) {
        newErrors.parentEmail = 'Parent email is required for children under 13';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        newErrors.parentEmail = 'Please enter a valid email address';
      }

      if (!formData.parentConsent) {
        newErrors.parentConsent = 'Parent must provide consent for children under 13';
      }
    } else {
      // Age 13+: consent still required
      if (!formData.parentConsent) {
        newErrors.parentConsent = 'I confirm I am a parent/guardian or 13+ user';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('[MODAL] Verify & Continue clicked');
    console.log('[MODAL] Form data:', formData);
    
    const isValid = validateForm();
    if (isValid) {
      console.log('[MODAL] Validation passed, calling onComplete');
      onComplete(formData);
    } else {
      console.log('[MODAL] Validation failed, errors:', errors);
      // Mark all fields as touched to show all errors
      setTouched({
        childName: true,
        childAge: true,
        parentEmail: true,
        parentConsent: true
      });
      // Scroll to first error
      setTimeout(() => {
        const errorElement = document.querySelector('.border-red-500');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Check if form is valid for button state
  const isFormValid = () => {
    if (!formData.childName.trim() || formData.childName.trim().length < 2) return false;
    if (!formData.childAge || isNaN(formData.childAge) || formData.childAge < 1 || formData.childAge > 17) return false;
    
    const age = parseInt(formData.childAge, 10);
    if (age < 13) {
      if (!formData.parentEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) return false;
    }
    if (!formData.parentConsent) return false;
    
    return true;
  };

  const age = parseInt(formData.childAge, 10);
  const isUnder13 = age < 13 && age > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 sticky top-0">
          <h2 className="text-3xl font-bold mb-2">🔒 Child Safety Verification</h2>
          <p className="text-blue-100">Help us keep your child safe with COPPA-compliant verification</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
            <p className="text-blue-900 font-semibold">
              🔐 We take child safety seriously. This information is used to ensure compliance with COPPA (Children's Online Privacy Protection Act).
            </p>
          </div>

          <form className="space-y-6">
            {/* Child Name */}
            <div>
              <label htmlFor="childName" className="block text-lg font-bold text-gray-900 mb-3">
                Child's Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="childName"
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your child's full name"
                className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-lg ${
                  touched.childName && errors.childName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'
                }`}
              />
              {touched.childName && errors.childName && (
                <p className="mt-2 text-red-600 font-semibold text-sm">⚠️ {errors.childName}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="childAge" className="block text-lg font-bold text-gray-900 mb-3">
                Child's Age <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="childAge"
                name="childAge"
                value={formData.childAge}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter age (1-17)"
                min="1"
                max="17"
                className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-lg ${
                  touched.childAge && errors.childAge
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-300'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'
                }`}
              />
              {touched.childAge && errors.childAge && (
                <p className="mt-2 text-red-600 font-semibold text-sm">⚠️ {errors.childAge}</p>
              )}
              <p className="mt-2 text-gray-600 text-sm">We use this to comply with child safety regulations</p>
            </div>

            {/* Parent Email (Only for under 13) */}
            {isUnder13 && (
              <div>
                <label htmlFor="parentEmail" className="block text-lg font-bold text-gray-900 mb-3">
                  Parent/Guardian Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="parentEmail"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="parent@example.com"
                  className={`w-full px-6 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-lg ${
                    touched.parentEmail && errors.parentEmail
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-300'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-300'
                  }`}
                />
                {touched.parentEmail && errors.parentEmail && (
                  <p className="mt-2 text-red-600 font-semibold text-sm">⚠️ {errors.parentEmail}</p>
                )}
                <p className="mt-2 text-gray-600 text-sm">We will send a verification email to confirm parental consent</p>
              </div>
            )}

            {/* Consent Checkbox */}
            <div>
              <label className="flex items-start gap-4 cursor-pointer p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  name="parentConsent"
                  checked={formData.parentConsent}
                  onChange={handleChange}
                  className="w-6 h-6 mt-1 cursor-pointer accent-blue-600"
                />
                <div>
                  <p className="font-bold text-gray-900">
                    {isUnder13
                      ? 'I confirm I am the parent/guardian and give permission for this child to use this service'
                      : 'I confirm I am a parent/guardian or 13+ user'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    By checking this, you agree to our Privacy Policy and Terms of Service
                  </p>
                </div>
              </label>
              {touched.parentConsent && errors.parentConsent && (
                <p className="mt-2 text-red-600 font-semibold text-sm">⚠️ {errors.parentConsent}</p>
              )}
            </div>

            {/* Privacy Info */}
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-3">✓ Your Privacy Is Protected</h3>
              <ul className="space-y-2 text-green-900 text-sm">
                <li>✓ Photos will be deleted after checkout</li>
                <li>✓ Child data will be deleted after processing</li>
                <li>✓ COPPA compliant - full parental consent</li>
                <li>✓ We never share or sell your child's data</li>
              </ul>
            </div>

            {/* Requirements Checklist */}
            {(isUnder13 || !formData.parentConsent) && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
                <h3 className="font-bold text-yellow-900 mb-3">📋 Before You Continue:</h3>
                <ul className="space-y-2 text-yellow-900 text-sm">
                  <li className={formData.childName ? '✓ text-green-600' : '○'}>
                    {formData.childName ? '✓' : '○'} Child's name ({formData.childName ? 'Filled' : 'Required'})
                  </li>
                  <li className={formData.childAge ? '✓ text-green-600' : '○'}>
                    {formData.childAge ? '✓' : '○'} Child's age ({formData.childAge ? 'Filled' : 'Required'})
                  </li>
                  {isUnder13 && (
                    <>
                      <li className={formData.parentEmail ? '✓ text-green-600' : '○'}>
                        {formData.parentEmail ? '✓' : '○'} Parent email ({formData.parentEmail ? 'Filled' : 'Required'})
                      </li>
                    </>
                  )}
                  <li className={formData.parentConsent ? '✓ text-green-600' : '○'}>
                    {formData.parentConsent ? '✓' : '○'} Parental consent ({formData.parentConsent ? 'Confirmed' : 'Required'})
                  </li>
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t-2 border-gray-200 p-8 sticky bottom-0 flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 bg-gray-300 text-gray-900 font-bold rounded-xl hover:bg-gray-400 transition-all duration-300 text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            title={isFormValid() ? 'Click to verify and continue' : 'Complete all required fields to continue'}
            className={`flex-1 px-6 py-4 font-bold rounded-xl transition-all duration-300 text-lg shadow-lg ${
              isFormValid()
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 cursor-pointer'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
            }`}
          >
            Verify & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
