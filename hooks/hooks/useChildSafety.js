/**
 * frontend/hooks/useChildSafety.js
 *
 * Custom hook for child safety form and validation
 * Handles:
 * - Age validation
 * - Parental consent tracking
 * - API integration with safety middleware
 */

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * useChildSafety Hook
 */
export const useChildSafety = () => {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    parentEmail: '',
    parentConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [isValidated, setIsValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /**
   * Check localStorage for previous acceptance
   */
  useEffect(() => {
    const hasAccepted = localStorage.getItem('child_safety_acceptance');
    if (!hasAccepted) {
      setShowModal(true);
    }
  }, []);

  /**
   * Update form data
   */
  const updateFormData = useCallback((data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  }, []);

  /**
   * Validate form data locally
   */
  const validateLocalForm = useCallback(() => {
    const newErrors = {};

    if (!formData.childName.trim()) {
      newErrors.childName = 'Child name is required';
    } else if (formData.childName.trim().length < 2) {
      newErrors.childName = 'Name must be at least 2 characters';
    }

    if (!formData.childAge) {
      newErrors.childAge = 'Age is required';
    } else if (isNaN(formData.childAge) || formData.childAge < 1 || formData.childAge > 17) {
      newErrors.childAge = 'Age must be between 1 and 17';
    }

    const age = parseInt(formData.childAge, 10);
    if (age < 13) {
      if (!formData.parentEmail.trim()) {
        newErrors.parentEmail = 'Parent email is required for children under 13';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        newErrors.parentEmail = 'Invalid email format';
      }

      if (!formData.parentConsent) {
        newErrors.parentConsent = 'Parent consent is required';
      }
    } else {
      if (!formData.parentConsent) {
        newErrors.parentConsent = 'Consent acknowledgment is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Validate child info with backend
   */
  const validateWithBackend = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE_URL}/story/validate-child-info`,
        {
          childName: formData.childName,
          childAge: parseInt(formData.childAge, 10),
          parentEmail: formData.parentEmail || null,
          parentConsent: formData.parentConsent,
        }
      );

      if (response.data.success) {
        setIsValidated(true);
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Validation failed';
      setErrors({ server: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [formData]);

  /**
   * Submit safety-compliant story generation request
   */
  const submitStoryGeneration = useCallback(
    async (additionalData = {}) => {
      // Validate locally first
      if (!validateLocalForm()) {
        return { success: false, error: 'Please fix validation errors' };
      }

      try {
        setLoading(true);

        const payload = {
          childName: formData.childName,
          childAge: parseInt(formData.childAge, 10),
          parentEmail: formData.parentEmail || null,
          parentConsent: formData.parentConsent,
          ...additionalData,
        };

        const response = await axios.post(
          `${API_BASE_URL}/story/generate-with-safety`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );

        if (response.data.success) {
          return {
            success: true,
            data: response.data.data,
            dataPolicy: response.data.dataPolicy,
          };
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Story generation failed';
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [formData, validateLocalForm]
  );

  /**
   * Clear form and reset state
   */
  const resetForm = useCallback(() => {
    setFormData({
      childName: '',
      childAge: '',
      parentEmail: '',
      parentConsent: false,
    });
    setErrors({});
    setIsValidated(false);
  }, []);

  /**
   * Get age group information
   */
  const getAgeGroupInfo = useCallback(() => {
    const age = parseInt(formData.childAge, 10);

    if (!age || age < 1 || age > 17) {
      return null;
    }

    if (age < 13) {
      return {
        group: 'UNDER_13',
        requiresParentConsent: true,
        requiresParentEmail: true,
        message: 'Parental consent is required',
      };
    }

    return {
      group: '13_PLUS',
      requiresParentConsent: false,
      requiresParentEmail: false,
      message: 'Ready to proceed',
    };
  }, [formData.childAge]);

  return {
    // State
    formData,
    errors,
    isValidated,
    loading,
    showModal,

    // Actions
    updateFormData,
    validateLocalForm,
    validateWithBackend,
    submitStoryGeneration,
    resetForm,
    setShowModal,

    // Helpers
    getAgeGroupInfo,
  };
};

/**
 * Hook to manage child safety modal
 */
export const useChildSafetyModal = () => {
  const [accepted, setAccepted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('child_safety_acceptance');
    if (!hasAccepted) {
      setShowModal(true);
    } else {
      setAccepted(true);
    }
  }, []);

  const acceptSafety = () => {
    localStorage.setItem(
      'child_safety_acceptance',
      JSON.stringify({
        accepted: true,
        timestamp: new Date().toISOString(),
      })
    );
    setAccepted(true);
    setShowModal(false);
  };

  return {
    accepted,
    showModal,
    acceptSafety,
    setShowModal,
  };
};

export default useChildSafety;
