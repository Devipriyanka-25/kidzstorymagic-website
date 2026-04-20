/**
 * frontend/utils/i18n/unicodeUtils.js
 *
 * Unicode handling utilities for Indian language support
 * Handles normalization, validation, and character handling
 */

/**
 * Normalize text to NFC form (composed form)
 * Better than NFD for display and storage
 * Ensures consistent representation across platforms
 */
export const normalizeToNFC = (text) => {
  if (!text) return text;
  try {
    return text.normalize('NFC');
  } catch (error) {
    console.warn('[Unicode] NFC normalization failed:', error);
    return text;
  }
};

/**
 * Normalize text to NFD form (decomposed)
 * Useful for comparison and search
 */
export const normalizeToNFD = (text) => {
  if (!text) return text;
  try {
    return text.normalize('NFD');
  } catch (error) {
    console.warn('[Unicode] NFD normalization failed:', error);
    return text;
  }
};

/**
 * Validate if text contains characters from specific script
 * @param {string} text - Text to validate
 * @param {string} language - Language code (ta, hi, te, kn, ml)
 * @returns {boolean}
 */
export const validateLanguageCharacters = (text, language) => {
  if (!text) return false;

  const scriptRanges = {
    ta: /[\u0B80-\u0BFF]/g, // Tamil Unicode block
    hi: /[\u0900-\u097F]/g, // Devanagari (Hindi)
    te: /[\u0C60-\u0C7F]/g, // Telugu Unicode block
    kn: /[\u0C80-\u0CFF]/g, // Kannada Unicode block
    ml: /[\u0D00-\u0D7F]/g, // Malayalam Unicode block
  };

  const regex = scriptRanges[language];
  if (!regex) return true; // Return true for non-Indian languages

  const matches = text.match(regex);
  return matches && matches.length > 0;
};

/**
 * Get character details for debugging
 * @param {string} text - Text to analyze
 * @returns {object} Character information
 */
export const getCharacterDetails = (text) => {
  if (!text) return null;

  const details = {
    text,
    length: text.length,
    codePoints: Array.from(text).map((char) => ({
      char,
      code: char.charCodeAt(0),
      hex: char.charCodeAt(0).toString(16).toUpperCase(),
      name: getUnicodeCharName(char),
    })),
  };

  return details;
};

/**
 * Get Unicode character name/description
 * @param {string} char - Single character
 * @returns {string} Character description
 */
export const getUnicodeCharName = (char) => {
  const code = char.charCodeAt(0);

  // Tamil range
  if (code >= 0x0b80 && code <= 0x0bff) return 'Tamil';
  // Devanagari range
  if (code >= 0x0900 && code <= 0x097f) return 'Devanagari (Hindi)';
  // Telugu range
  if (code >= 0x0c60 && code <= 0x0c7f) return 'Telugu';
  // Kannada range
  if (code >= 0x0c80 && code <= 0x0cff) return 'Kannada';
  // Malayalam range
  if (code >= 0x0d00 && code <= 0x0d7f) return 'Malayalam';
  // Latin range
  if (code >= 0x0041 && code <= 0x005a) return 'Latin Uppercase';
  if (code >= 0x0061 && code <= 0x007a) return 'Latin Lowercase';
  // Numbers
  if (code >= 0x0030 && code <= 0x0039) return 'Digit';
  // Common punctuation
  if (code === 32) return 'Space';
  if (code === 10) return 'Line Feed';
  if (code === 13) return 'Carriage Return';

  return `Unknown (U+${code.toString(16).toUpperCase()})`;
};

/**
 * Validate UTF-8 encoding
 * @param {string} text - Text to validate
 * @returns {boolean}
 */
export const isValidUTF8 = (text) => {
  if (!text) return true;

  try {
    const encoded = new TextEncoder().encode(text);
    const decoded = new TextDecoder('utf-8').decode(encoded);
    return decoded === text;
  } catch (error) {
    console.warn('[Unicode] UTF-8 validation failed:', error);
    return false;
  }
};

/**
 * Ensure text is properly encoded for storage
 * Converts to NFC and validates encoding
 * @param {string} text - Text to prepare
 * @returns {string} Safe text for storage
 */
export const prepareTextForStorage = (text) => {
  if (!text) return text;

  // Normalize to NFC (composed form)
  let normalized = normalizeToNFC(text);

  // Remove zero-width characters that might cause issues
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Ensure valid UTF-8
  if (!isValidUTF8(normalized)) {
    console.warn('[Unicode] Invalid UTF-8 detected, attempting recovery');
    // Try to recover by encoding and decoding
    try {
      const encoded = new TextEncoder().encode(normalized);
      normalized = new TextDecoder('utf-8', { fatal: false }).decode(encoded);
    } catch (error) {
      console.error('[Unicode] Recovery failed:', error);
    }
  }

  return normalized;
};

/**
 * Prepare text for display in UI
 * Handles special formatting requirements per language
 * @param {string} text - Text to display
 * @param {string} language - Language code
 * @returns {string} Text ready for display
 */
export const prepareTextForDisplay = (text, language = 'en') => {
  if (!text) return text;

  // Normalize to NFC for display
  let normalized = normalizeToNFC(text);

  // Language-specific adjustments
  if (language === 'ta' || language === 'hi' || language === 'te' || language === 'kn' || language === 'ml') {
    // For Indian scripts, ensure proper spacing around line breaks
    normalized = normalized.replace(/\n\n+/g, '\n\n');
  }

  return normalized;
};

/**
 * Get recommended font for language
 * @param {string} language - Language code
 * @returns {string} Font family CSS
 */
export const getFontFamily = (language) => {
  const fonts = {
    en: "'Inter', 'system-ui', sans-serif",
    ta: "'Noto Sans Tamil', 'system-ui', sans-serif",
    hi: "'Noto Sans Devanagari', 'system-ui', sans-serif",
    te: "'Noto Sans Telugu', 'system-ui', sans-serif",
    kn: "'Noto Sans Kannada', 'system-ui', sans-serif",
    ml: "'Noto Sans Malayalam', 'system-ui', sans-serif",
    es: "'Inter', 'system-ui', sans-serif",
  };

  return fonts[language] || fonts.en;
};

/**
 * Get font weights available for language
 * Some fonts have limited weight support
 * @param {string} language - Language code
 * @returns {array} Available weights
 */
export const getAvailableFontWeights = (language) => {
  // Noto Sans fonts support 100-900
  if (language === 'ta' || language === 'hi' || language === 'te' || language === 'kn' || language === 'ml') {
    return [400, 500, 600, 700];
  }
  return [300, 400, 500, 600, 700, 800];
};

/**
 * Test if character can be rendered with available fonts
 * @param {string} char - Single character
 * @param {string} language - Language code
 * @returns {boolean}
 */
export const canRenderCharacter = (char, language) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const font = `16px ${getFontFamily(language)}`;

    ctx.font = font;
    ctx.textBaseline = 'top';

    // Measure text with the specific font
    const metrics = ctx.measureText(char);
    return metrics.width > 0;
  } catch (error) {
    console.warn('[Unicode] Character rendering test failed:', error);
    return true; // Assume it can render if test fails
  }
};

/**
 * Sanitize text for use in URLs or filenames
 * Preserves readability while removing problematic characters
 * @param {string} text - Text to sanitize
 * @returns {string} Safe text for URLs/filenames
 */
export const sanitizeForFilename = (text) => {
  if (!text) return 'story';

  // For non-Latin scripts, use transliteration or fallback
  const code = text.charCodeAt(0);
  if (code > 127) {
    // Non-ASCII detected, use generic name
    return 'story';
  }

  // Remove special characters
  return text
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 50);
};

export default {
  normalizeToNFC,
  normalizeToNFD,
  validateLanguageCharacters,
  getCharacterDetails,
  getUnicodeCharName,
  isValidUTF8,
  prepareTextForStorage,
  prepareTextForDisplay,
  getFontFamily,
  getAvailableFontWeights,
  canRenderCharacter,
  sanitizeForFilename,
};
