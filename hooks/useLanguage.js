/**
 * frontend/hooks/useLanguage.js
 *
 * Custom hook for managing language selection and preference
 * Follows the same pattern as useChildSafety hook
 * Handles language state, localStorage persistence, and translation access
 */

import { useState, useEffect, useCallback } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  getLanguageByCode,
  isLanguageSupported,
  getValidLanguage,
} from '@/constants/languages';
import { t, getTranslations } from '@/utils/i18n/translations';

const LANGUAGE_STORAGE_KEY = 'kidz-story-language';

/**
 * useLanguage - Custom hook for language management
 * @returns {object} Language state and methods
 */
export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize language from localStorage or browser preference
   */
  useEffect(() => {
    const initializeLanguage = () => {
      try {
        // Try to get from localStorage first
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (savedLanguage && isLanguageSupported(savedLanguage)) {
          setCurrentLanguage(savedLanguage);
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        // Try to detect browser language
        const browserLanguage = navigator?.language?.split('-')[0] || DEFAULT_LANGUAGE;
        const detectedLanguage = isLanguageSupported(browserLanguage) 
          ? browserLanguage 
          : DEFAULT_LANGUAGE;

        setCurrentLanguage(detectedLanguage);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing language:', error);
        setCurrentLanguage(DEFAULT_LANGUAGE);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      initializeLanguage();
    }
  }, []);

  /**
   * Keep all hook consumers in sync when another component changes language.
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncLanguageState = (languageCode) => {
      const validLanguage = getValidLanguage(languageCode);

      setCurrentLanguage((previousLanguage) =>
        previousLanguage === validLanguage ? previousLanguage : validLanguage
      );
      setIsInitialized(true);
      setIsLoading(false);
    };

    const handleLanguageChanged = (event) => {
      const nextLanguage = event?.detail?.language;

      if (nextLanguage) {
        syncLanguageState(nextLanguage);
      }
    };

    const handleStorageChange = (event) => {
      if (event.key === LANGUAGE_STORAGE_KEY && event.newValue) {
        syncLanguageState(event.newValue);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChanged);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChanged);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Change current language
   * @param {string} languageCode - Language code
   */
  const changeLanguage = useCallback((languageCode) => {
    const validLanguage = getValidLanguage(languageCode);
    
    if (validLanguage !== currentLanguage) {
      setCurrentLanguage(validLanguage);
      
      // Persist to localStorage
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, validLanguage);
      } catch (error) {
        console.error('Error saving language preference:', error);
      }

      // Dispatch custom event for other components to react
      window.dispatchEvent(
        new CustomEvent('languageChanged', { 
          detail: { language: validLanguage } 
        })
      );
    }
  }, [currentLanguage]);

  /**
   * Get translation for current language
   * @param {string} key - Translation key
   * @param {string} defaultValue - Default value if key not found
   * @returns {string} Translated text
   */
  const translate = useCallback((key, defaultValue = key) => {
    return t(currentLanguage, key, defaultValue);
  }, [currentLanguage]);

  /**
   * Get all translations for current language
   * @returns {object} Translation object
   */
  const translations = useCallback(() => {
    return getTranslations(currentLanguage);
  }, [currentLanguage]);

  /**
   * Get language metadata by code
   * @param {string} code - Language code
   * @returns {object} Language object
   */
  const getLanguage = useCallback((code) => {
    return getLanguageByCode(code);
  }, []);

  /**
   * Get current language metadata
   * @returns {object} Current language object
   */
  const getCurrentLanguage = useCallback(() => {
    return getLanguageByCode(currentLanguage);
  }, [currentLanguage]);

  /**
   * Get all supported languages
   * @returns {array} Array of supported languages
   */
  const getAllLanguages = useCallback(() => {
    return SUPPORTED_LANGUAGES;
  }, []);

  /**
   * Reset to default language
   */
  const resetLanguage = useCallback(() => {
    changeLanguage(DEFAULT_LANGUAGE);
  }, [changeLanguage]);

  return {
    // State
    currentLanguage,
    isLoading,
    isInitialized,

    // Methods
    changeLanguage,
    translate,
    translations,
    getLanguage,
    getCurrentLanguage,
    getAllLanguages,
    resetLanguage,

    // Constants
    supportedLanguages: SUPPORTED_LANGUAGES,
    defaultLanguage: DEFAULT_LANGUAGE,
  };
};

export default useLanguage;
