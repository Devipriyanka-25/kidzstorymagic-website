'use client';

import { useState, useEffect } from 'react';

/**
 * ChildSafetyForm Component
 * Handles age validation, parental consent for children under 13
 * COPPA-compliant form for child safety
 */
export default function ChildSafetyForm({
  onFormChange,
  onValidationChange,
  initialData = {},
  disabled = false
}) {
  const [formData, setFormData] = useState({
    childName: initialData.childName || '',
    childAge: initialData.childAge || '',
    parentEmail: initialData.parentEmail || '',
    parentConsent: initialData.parentConsent || false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form on change
  useEffect(() => {
    validateForm();
  }, [formData]);

  // Notify parent of validation state
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isFormValid);
    }
  }, [isFormValid, onValidationChange]);

  /**
   * Validate entire form
   */
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
        newErrors.parentConsent = 'Parent consent is required for children under 13';
      }
    } else {
      // Age 13+: consent still required but parent email optional
      if (!formData.parentConsent) {
        newErrors.parentConsent = 'I confirm I am a parent/guardian or 13+ user';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Notify parent of form data change
    if (onFormChange) {
      onFormChange({
        ...formData,
        [name]: newValue,
      });
    }
  };

  /**
   * Handle field blur
   */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
    validateForm();
  };

  const age = parseInt(formData.childAge, 10);
  const isUnder13 = age < 13 && age > 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        👶 Child Safety Information
      </h2>
      <p className="text-gray-600 mb-8">
        Help us keep your child safe with COPPA-compliant verification
      </p>

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
            placeholder="Enter child's name"
            disabled={disabled}
            className={`w-full px-4 py-3 text-lg border-2 rounded-xl transition-all focus:outline-none ${
              errors.childName && touched.childName
                ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          {errors.childName && touched.childName && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.childName}
            </p>
          )}
        </div>

        {/* Child Age */}
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
            placeholder="1 - 17"
            min="1"
            max="17"
            disabled={disabled}
            className={`w-full px-4 py-3 text-lg border-2 rounded-xl transition-all focus:outline-none ${
              errors.childAge && touched.childAge
                ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          {errors.childAge && touched.childAge && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.childAge}
            </p>
          )}
          <p className="text-gray-600 text-sm mt-2">
            This information helps us comply with child safety regulations
          </p>
        </div>

        {/* Parental Consent Warning for Under 13 */}
        {isUnder13 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <p className="text-orange-800 font-semibold flex items-start gap-2">
              <span className="text-xl">⚠️</span>
              <span>
                Parental consent is required for children under 13. Please provide parent/guardian email.
              </span>
            </p>
          </div>
        )}

        {/* Parent Email - Only for under 13 */}
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
              disabled={disabled}
              className={`w-full px-4 py-3 text-lg border-2 rounded-xl transition-all focus:outline-none ${
                errors.parentEmail && touched.parentEmail
                  ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            />
            {errors.parentEmail && touched.parentEmail && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span> {errors.parentEmail}
              </p>
            )}
            <p className="text-gray-600 text-sm mt-2">
              We will use this to verify parental consent
            </p>
          </div>
        )}

        {/* Parent/Guardian Consent Checkbox */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="parentConsent"
              name="parentConsent"
              checked={formData.parentConsent}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              className={`mt-1 w-6 h-6 cursor-pointer transition-all ${
                disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
            <label htmlFor="parentConsent" className="flex-1 text-gray-900 font-semibold cursor-pointer">
              <span className="text-lg">
                {isUnder13
                  ? 'I confirm I am the parent/guardian and give permission for this child to use this service'
                  : 'I confirm I am a parent/guardian or 13+ years old'}
              </span>
              <span className="text-red-600 ml-1">*</span>
              <p className="text-sm text-gray-600 mt-2 font-normal">
                By checking this box, you confirm you have authority to consent to this child's participation.
              </p>
            </label>
          </div>
          {errors.parentConsent && touched.parentConsent && (
            <p className="text-red-600 text-sm mt-3 flex items-center gap-1 ml-10">
              <span>⚠️</span> {errors.parentConsent}
            </p>
          )}
        </div>

        {/* Data Privacy Notice */}
        <div className="bg-green-50 border-2 border-green-400 rounded-xl p-6">
          <h3 className="font-bold text-green-900 text-lg mb-3 flex items-center gap-2">
            🛡️ Your Privacy Is Protected
          </h3>
          <ul className="space-y-2 text-green-900 text-sm font-medium">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Photos are <strong>NOT stored</strong> after checkout</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>All child data is <strong>deleted after processing</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>We do <strong>NOT share or sell</strong> any data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span><strong>COPPA-compliant</strong> verification</span>
            </li>
          </ul>
        </div>

        {/* Success Message */}
        {isFormValid && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <p className="text-green-800 font-semibold">
              Great! Your child safety information is complete. Ready to proceed!
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
