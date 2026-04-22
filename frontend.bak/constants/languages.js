/**
 * frontend/constants/languages.js
 *
 * Supported languages configuration
 * Centralized language definitions for the app
 * Easy to extend with new languages
 */

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    rtl: false,
    region: 'Global',
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    rtl: false,
    region: 'India',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    rtl: false,
    region: 'India',
  },
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    rtl: false,
    region: 'India',
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    rtl: false,
    region: 'India',
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    rtl: false,
    region: 'India',
  },
  {
    code: 'es',
    label: 'Spanish',
    nativeLabel: 'Español',
    rtl: false,
    region: 'Global',
  },
];

// Default language
export const DEFAULT_LANGUAGE = 'en';

// Language codes only (for validation)
export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((lang) => lang.code);

/**
 * Get language by code
 * @param {string} code - Language code
 * @returns {object} Language object or null
 */
export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code) || null;
};

/**
 * Get language label by code
 * @param {string} code - Language code
 * @returns {string} Language label
 */
export const getLanguageLabel = (code) => {
  const lang = getLanguageByCode(code);
  return lang ? `${lang.label} / ${lang.nativeLabel}` : 'English';
};

/**
 * Validate if language is supported
 * @param {string} code - Language code
 * @returns {boolean}
 */
export const isLanguageSupported = (code) => {
  return LANGUAGE_CODES.includes(code);
};

/**
 * Get default language or fallback to English
 * @param {string} code - Language code
 * @returns {string} Valid language code
 */
export const getValidLanguage = (code) => {
  return isLanguageSupported(code) ? code : DEFAULT_LANGUAGE;
};

/**
 * Get all language options for select/dropdown
 * @returns {array} Array of language options
 */
export const getLanguageOptions = () => {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    value: lang.code,
    label: `${lang.label} / ${lang.nativeLabel}`,
    nativeLabel: lang.nativeLabel,
  }));
};

export default SUPPORTED_LANGUAGES;
