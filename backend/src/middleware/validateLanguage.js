/**
 * backend/src/middleware/validateLanguage.js
 *
 * Middleware for validating language codes
 * Ensures only supported languages are used in story generation
 * Follows the same pattern as validateChildSafety middleware
 */

const SUPPORTED_LANGUAGES = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es'];
const DEFAULT_LANGUAGE = 'en';

// Language name mapping for logging
const LANGUAGE_NAMES = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  es: 'Spanish',
};

/**
 * Validate and normalize language code
 * Handles case-insensitivity and whitespace trimming
 * @param {string} language - Language code to validate
 * @returns {string} Valid language code or default
 */
const normalizeLanguage = (language) => {
  if (!language) {
    console.log('[Language Validation] No language provided, using default:', DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }
  
  // Validate input type
  if (typeof language !== 'string') {
    console.warn('[Language Validation] Invalid language type:', typeof language);
    return DEFAULT_LANGUAGE;
  }
  
  // Normalize: lowercase and trim
  const normalizedLang = language.toLowerCase().trim();
  
  // Validate against whitelist
  if (SUPPORTED_LANGUAGES.includes(normalizedLang)) {
    return normalizedLang;
  }
  
  // Not supported - log and fallback
  console.warn(
    `[Language Validation] Unsupported language code "${language}" (normalized: "${normalizedLang}"), falling back to "${DEFAULT_LANGUAGE}"`
  );
  return DEFAULT_LANGUAGE;
};

/**
 * Middleware to validate language parameter
 * Validates language in request body or query params
 * Implements graceful fallback to English for unsupported languages
 * 
 * Usage:
 * router.post('/api/story/generate', validateLanguage, controller);
 * 
 * Expected request body:
 * {
 *   childName: string,
 *   age: number,
 *   parentEmail: string (if age < 13),
 *   parentConsent: boolean (if age < 13),
 *   storyPrompt: string,
 *   storyLanguage: string (optional, defaults to 'en')
 * }
 */
const validateLanguage = (req, res, next) => {
  try {
    // Get language from request body or query
    let language = req.body?.storyLanguage || req.query?.language;

    // Log request
    console.log('[Language Validation] Processing language:', language);

    // Normalize and validate language
    const normalizedLanguage = normalizeLanguage(language);
    const languageName = LANGUAGE_NAMES[normalizedLanguage] || 'Unknown';

    // Attach to request object for use in controllers
    req.validatedLanguage = normalizedLanguage;
    req.languageName = languageName;
    
    // Update request body with normalized language
    if (req.body) {
      req.body.storyLanguage = normalizedLanguage;
    }

    // Log validation result
    if (language && language.toLowerCase().trim() !== normalizedLanguage) {
      console.warn(
        `[Language Validation] Language mismatch - requested: "${language}", normalized: "${normalizedLanguage}" (${languageName})`
      );
    } else if (language) {
      console.log(
        `[Language Validation] ✓ Valid language: ${normalizedLanguage} (${languageName})`
      );
    } else {
      console.log(
        `[Language Validation] ✓ Using default language: ${normalizedLanguage} (${languageName})`
      );
    }

    next();
  } catch (error) {
    console.error('[Language Validation Error]', error);
    
    // Set default and continue (fail-safe approach)
    req.validatedLanguage = DEFAULT_LANGUAGE;
    req.languageName = LANGUAGE_NAMES[DEFAULT_LANGUAGE];
    if (req.body) {
      req.body.storyLanguage = DEFAULT_LANGUAGE;
    }
    
    next();
  }
};

/**
 * Strict language validation - rejects unsupported languages
 * Use this if you want stricter validation instead of fallback
 * Returns 400 error for unsupported languages
 */
const validateLanguageStrict = (req, res, next) => {
  try {
    const language = req.body?.storyLanguage || req.query?.language;

    console.log('[Language Validation Strict] Processing language:', language);

    if (!language) {
      // No language provided - use default silently
      req.validatedLanguage = DEFAULT_LANGUAGE;
      req.languageName = LANGUAGE_NAMES[DEFAULT_LANGUAGE];
      if (req.body) {
        req.body.storyLanguage = DEFAULT_LANGUAGE;
      }
      console.log('[Language Validation Strict] Using default language');
      return next();
    }

    const normalizedLanguage = language.toLowerCase().trim();

    if (!SUPPORTED_LANGUAGES.includes(normalizedLanguage)) {
      console.warn('[Language Validation Strict] Rejecting unsupported language:', language);
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_LANGUAGE',
          message: `Unsupported language: "${language}". Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`,
          supportedLanguages: SUPPORTED_LANGUAGES.map(code => ({
            code,
            name: LANGUAGE_NAMES[code]
          })),
        },
      });
    }

    req.validatedLanguage = normalizedLanguage;
    req.languageName = LANGUAGE_NAMES[normalizedLanguage];
    if (req.body) {
      req.body.storyLanguage = normalizedLanguage;
    }

    console.log(`[Language Validation Strict] ✓ Valid language: ${normalizedLanguage}`);
    next();
  } catch (error) {
    console.error('[Language Validation Strict Error]', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'LANGUAGE_VALIDATION_ERROR',
        message: 'Error validating language',
      },
    });
  }
};

/**
 * Get all supported languages
 * @returns {array} Array of supported language codes
 */
const getSupportedLanguages = () => SUPPORTED_LANGUAGES;

/**
 * Check if language is supported
 * @param {string} language - Language code
 * @returns {boolean}
 */
const isLanguageSupported = (language) => {
  if (!language) return false;
  return SUPPORTED_LANGUAGES.includes(language.toLowerCase().trim());
};

/**
 * Get language label (for logging/debugging)
 * Map of language codes to labels
 */
const getLanguageLabel = (code) => {
  const labels = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    es: 'Spanish',
  };

  return labels[code] || 'Unknown';
};

/**
 * Middleware to add language info to response
 * Useful for debugging/logging language used in response
 */
const attachLanguageInfo = (req, res, next) => {
  res.languageInfo = {
    requestedLanguage: req.body?.storyLanguage || req.query?.language,
    processedLanguage: req.validatedLanguage || DEFAULT_LANGUAGE,
    label: getLanguageLabel(req.validatedLanguage || DEFAULT_LANGUAGE),
  };

  next();
};

module.exports = {
  validateLanguage,
  validateLanguageStrict,
  normalizeLanguage,
  getSupportedLanguages,
  isLanguageSupported,
  getLanguageLabel,
  attachLanguageInfo,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
};
