/**
 * backend/src/utils/unicodeHelper.js
 *
 * Unicode handling utilities for backend
 * Ensures proper text encoding, normalization, and validation
 */

/**
 * Normalize text to NFC form for consistent storage
 * NFC (Canonical Composition) is preferred for storage and display
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
const normalizeToNFC = (text) => {
  if (!text || typeof text !== 'string') return text;

  try {
    return text.normalize('NFC');
  } catch (error) {
    console.warn('[Backend Unicode] NFC normalization failed:', error);
    return text;
  }
};

/**
 * Normalize text to NFD form for comparison/search
 * NFD (Canonical Decomposition) is useful for text matching
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
const normalizeToNFD = (text) => {
  if (!text || typeof text !== 'string') return text;

  try {
    return text.normalize('NFD');
  } catch (error) {
    console.warn('[Backend Unicode] NFD normalization failed:', error);
    return text;
  }
};

/**
 * Validate if text contains valid Unicode sequences
 * Ensures no corrupted or incomplete UTF-8 sequences
 * @param {string} text - Text to validate
 * @returns {object} Validation result
 */
const validateUnicodeSequences = (text) => {
  if (!text || typeof text !== 'string') {
    return { valid: true, issues: [] };
  }

  const issues = [];
  let valid = true;

  // Check for invalid UTF-16 surrogates
  const hasSurrogates = /[\uD800-\uDFFF]/.test(text);
  if (hasSurrogates) {
    issues.push('Contains invalid UTF-16 surrogates');
    valid = false;
  }

  // Check for null bytes which can cause issues in databases
  if (text.includes('\0')) {
    issues.push('Contains null bytes');
    valid = false;
  }

  // Check for zero-width characters that might be problematic
  const hasZeroWidth = /[\u200B-\u200D\uFEFF]/.test(text);
  if (hasZeroWidth) {
    issues.push('Contains zero-width characters (will be removed)');
  }

  return { valid, issues };
};

/**
 * Clean text for safe database storage
 * Removes problematic characters and normalizes encoding
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
const cleanForStorage = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Normalize to NFC first
  let cleaned = normalizeToNFC(text);

  // Remove zero-width characters
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Remove control characters (except newlines and tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  return cleaned;
};

/**
 * Prepare text for display/rendering
 * Ensures text will render properly in clients
 * @param {string} text - Text to prepare
 * @returns {string} Prepared text
 */
const prepareForDisplay = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Use NFC for display (composed form)
  let prepared = normalizeToNFC(text);

  // Keep zero-width joiners and non-joiners (they're needed for proper script rendering)
  // But remove other problematic zero-width characters
  prepared = prepared.replace(/[\u200B\u200C\u200D\uFEFF]/g, (match) => {
    // Keep ZWJ and ZWNJ for Indian scripts
    if (match === '\u200D' || match === '\u200C') return match;
    return '';
  });

  return prepared;
};

/**
 * Detect language from text content
 * Analyzes character ranges to determine likely language
 * @param {string} text - Text to analyze
 * @returns {string} Detected language code or 'en'
 */
const detectLanguageFromText = (text) => {
  if (!text || typeof text !== 'string') return 'en';

  const charCounts = {
    tamil: 0,
    devanagari: 0, // Hindi
    telugu: 0,
    kannada: 0,
    malayalam: 0,
    english: 0,
    spanish: 0,
  };

  // Count characters in each script
  for (const char of text) {
    const code = char.charCodeAt(0);

    // Tamil (0x0B80-0x0BFF)
    if (code >= 0x0b80 && code <= 0x0bff) charCounts.tamil++;
    // Devanagari (0x0900-0x097F)
    else if (code >= 0x0900 && code <= 0x097f) charCounts.devanagari++;
    // Telugu (0x0C60-0x0C7F)
    else if (code >= 0x0c60 && code <= 0x0c7f) charCounts.telugu++;
    // Kannada (0x0C80-0x0CFF)
    else if (code >= 0x0c80 && code <= 0x0cff) charCounts.kannada++;
    // Malayalam (0x0D00-0x0D7F)
    else if (code >= 0x0d00 && code <= 0x0d7f) charCounts.malayalam++;
    // ASCII Latin
    else if (code >= 0x0041 && code <= 0x007a) charCounts.english++;
    // Latin Extended
    else if (code >= 0x00c0 && code <= 0x00ff) charCounts.spanish++;
  }

  // Find the script with most characters
  let detectedScript = 'english';
  let maxCount = charCounts.english;

  for (const [script, count] of Object.entries(charCounts)) {
    if (count > maxCount) {
      maxCount = count;
      detectedScript = script;
    }
  }

  // Map to language codes
  const scriptToLanguage = {
    tamil: 'ta',
    devanagari: 'hi',
    telugu: 'te',
    kannada: 'kn',
    malayalam: 'ml',
    english: 'en',
    spanish: 'es',
  };

  return scriptToLanguage[detectedScript] || 'en';
};

/**
 * Validate that text matches expected language
 * @param {string} text - Text to validate
 * @param {string} languageCode - Expected language code
 * @returns {object} Validation result
 */
const validateLanguageMatch = (text, languageCode) => {
  if (!text || typeof text !== 'string') {
    return { valid: false, message: 'Text is empty' };
  }

  const languageScripts = {
    ta: /[\u0B80-\u0BFF]/g, // Tamil
    hi: /[\u0900-\u097F]/g, // Devanagari (Hindi)
    te: /[\u0C60-\u0C7F]/g, // Telugu
    kn: /[\u0C80-\u0CFF]/g, // Kannada
    ml: /[\u0D00-\u0D7F]/g, // Malayalam
    en: /[a-zA-Z0-9]/g, // English
    es: /[a-zA-Z0-9]/g, // Spanish (Latin)
  };

  const regex = languageScripts[languageCode];
  if (!regex) {
    return { valid: false, message: `Unknown language code: ${languageCode}` };
  }

  const matches = text.match(regex);
  const matchCount = matches ? matches.length : 0;
  const totalChars = text.replace(/[\s\n\r\t]/g, '').length;

  // For Indian languages, need at least 30% of characters in that script
  if (['ta', 'hi', 'te', 'kn', 'ml'].includes(languageCode)) {
    const percentage = (matchCount / totalChars) * 100;
    const isValid = percentage >= 30 || matchCount >= 10; // At least 30% or 10 characters

    return {
      valid: isValid,
      percentage: Math.round(percentage),
      characterCount: matchCount,
      message: isValid
        ? `Valid ${languageCode} text (${percentage.toFixed(1)}% characters)`
        : `Insufficient ${languageCode} characters (${percentage.toFixed(1)}%)`,
    };
  }

  return {
    valid: true,
    message: `Validated for ${languageCode}`,
  };
};

/**
 * Get character encoding info for debugging
 * @param {string} text - Text to analyze
 * @returns {object} Encoding information
 */
const getEncodingInfo = (text) => {
  if (!text || typeof text !== 'string') {
    return { error: 'Invalid text' };
  }

  try {
    const buffer = Buffer.from(text, 'utf-8');
    return {
      text: text.substring(0, 50),
      utf8Bytes: buffer.length,
      characterCount: text.length,
      codePointCount: Array.from(text).length,
      isValidUTF8: true,
      encoding: 'UTF-8',
    };
  } catch (error) {
    return {
      text: text.substring(0, 50),
      error: error.message,
      isValidUTF8: false,
    };
  }
};

/**
 * Sanitize filename to ensure it works across all systems
 * @param {string} filename - Filename to sanitize
 * @returns {string} Safe filename
 */
const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return 'file';

  // For non-ASCII filenames, use generic name to ensure cross-platform compatibility
  const hasNonASCII = /[^\x00-\x7F]/.test(filename);
  if (hasNonASCII) {
    return 'story'; // Use generic name for Indian language filenames
  }

  // Remove special characters that can cause issues
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 255);
};

module.exports = {
  normalizeToNFC,
  normalizeToNFD,
  validateUnicodeSequences,
  cleanForStorage,
  prepareForDisplay,
  detectLanguageFromText,
  validateLanguageMatch,
  getEncodingInfo,
  sanitizeFilename,
};
