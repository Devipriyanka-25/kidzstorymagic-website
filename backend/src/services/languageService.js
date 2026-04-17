/**
 * backend/src/services/languageService.js
 *
 * Service for handling multilingual story generation
 * Injects language instructions into AI prompts
 * Manages language-specific configurations
 */

const { getLanguageLabel } = require('../middleware/validateLanguage');
const {
  normalizeToNFC,
  validateUnicodeSequences,
  cleanForStorage,
  prepareForDisplay,
  validateLanguageMatch,
  sanitizeFilename,
} = require('../utils/unicodeHelper');

/**
 * Language-specific prompts and configurations
 * Defines how each language should be handled in story generation
 */
const LANGUAGE_CONFIG = {
  en: {
    name: 'English',
    label: 'English',
    nativeLabel: 'English',
    promptInstruction: 'Write the story in English.',
    characterSet: 'latin',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 4.7,
    },
  },
  ta: {
    name: 'Tamil',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    promptInstruction: 'Write the story in Tamil script. Ensure proper Unicode rendering for Tamil characters.',
    characterSet: 'tamil',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 3.2,
    },
  },
  hi: {
    name: 'Hindi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    promptInstruction: 'Write the story in Hindi (Devanagari script). Ensure proper Unicode rendering for Hindi characters.',
    characterSet: 'devanagari',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 3.5,
    },
  },
  te: {
    name: 'Telugu',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    promptInstruction: 'Write the story in Telugu script. Ensure proper Unicode rendering for Telugu characters.',
    characterSet: 'telugu',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 3.1,
    },
  },
  kn: {
    name: 'Kannada',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    promptInstruction: 'Write the story in Kannada script. Ensure proper Unicode rendering for Kannada characters.',
    characterSet: 'kannada',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 3.3,
    },
  },
  ml: {
    name: 'Malayalam',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    promptInstruction: 'Write the story in Malayalam script. Ensure proper Unicode rendering for Malayalam characters.',
    characterSet: 'malayalam',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 3.4,
    },
  },
  es: {
    name: 'Spanish',
    label: 'Spanish',
    nativeLabel: 'Español',
    promptInstruction: 'Write the story in Spanish. Include proper accent marks and special characters.',
    characterSet: 'latin-extended',
    encoding: 'utf-8',
    metrics: {
      wordCount: 'words',
      avgWordLength: 5.2,
    },
  },
};

/**
 * Get language configuration
 * @param {string} language - Language code
 * @returns {object} Language configuration
 */
const getLanguageConfig = (language) => {
  return LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG['en'];
};

/**
 * Build language-aware AI prompt for story generation
 * @param {object} params - Parameters
 * @param {string} params.language - Language code
 * @param {string} params.childName - Child's name
 * @param {number} params.age - Child's age
 * @param {string} params.userPrompt - User's story prompt
 * @param {object} params.imageContext - Context from uploaded images
 * @returns {string} Enhanced AI prompt
 */
const buildMultilingualPrompt = ({
  language = 'en',
  childName = 'Child',
  age = 8,
  userPrompt = '',
  imageContext = null,
}) => {
  const langConfig = getLanguageConfig(language);
  const ageAppropriateness = getAgeAppropriatenessGuidance(age);

  let prompt = `You are a creative storyteller creating personalized children's stories.

${langConfig.promptInstruction}

Story Details:
- Child's name: ${childName}
- Child's age: ${age} years old
- ${ageAppropriateness}

${
  userPrompt
    ? `Additional preferences: ${userPrompt}`
    : 'Create an engaging, age-appropriate adventure story.'
}

${
  imageContext
    ? `The story should incorporate elements or themes from the following context: ${imageContext}`
    : ''
}

Requirements:
1. Make the story engaging and age-appropriate for a ${age}-year-old
2. Include positive messages about friendship, courage, creativity, or learning
3. Use simple, clear language appropriate for the age group
4. Ensure the story is exactly 3-5 paragraphs long
5. Make ${childName} the main character in the story
6. Ensure all text is in ${langConfig.name} language with proper Unicode encoding
7. Avoid any scary, violent, or inappropriate content
8. Include a positive ending with a lesson or message

${
  language !== 'en'
    ? `Important: This story MUST be written entirely in ${langConfig.name} language. Do not mix languages.`
    : ''
}`;

  return prompt;
};

/**
 * Get age-appropriate guidance for story generation
 * @param {number} age - Child's age
 * @returns {string} Age-specific guidance
 */
const getAgeAppropriatenessGuidance = (age) => {
  if (age <= 5) {
    return 'Story level: Simple, very short sentences, basic vocabulary, lots of repetition.';
  } else if (age <= 8) {
    return 'Story level: Simple sentences, basic vocabulary, mix of repetition and new concepts.';
  } else if (age <= 12) {
    return 'Story level: More complex sentences, richer vocabulary, interesting plot twists.';
  } else {
    return 'Story level: Complex sentences, sophisticated vocabulary, deeper themes.';
  }
};

/**
 * Process story text for language-specific formatting
 * Validates, normalizes, and enriches story with metadata
 * @param {string} story - Generated story text
 * @param {string} language - Language code
 * @returns {object} Processed story with metadata
 */
const processStoryByLanguage = (story, language = 'en') => {
  const langConfig = getLanguageConfig(language);

  try {
    // Validate Unicode sequences
    const unicodeValidation = validateUnicodeSequences(story);
    if (!unicodeValidation.valid) {
      console.warn(`[Language Service] Unicode issues for ${language}:`, unicodeValidation.issues);
    }

    // Clean for storage
    const cleanedStory = cleanForStorage(story);

    // Normalize to NFC for display consistency
    const normalizedStory = normalizeToNFC(cleanedStory);

    // Prepare for display (keeps necessary formatting characters)
    const displayStory = prepareForDisplay(normalizedStory);

    // Validate language match
    const languageValidation = validateLanguageMatch(normalizedStory, language);
    if (!languageValidation.valid && language !== 'en' && language !== 'es') {
      console.warn(
        `[Language Service] Language validation warning for ${language}: ${languageValidation.message}`
      );
    }

    // Count words
    const wordCount = normalizedStory
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .length;

    return {
      original: story,
      cleaned: cleanedStory,
      normalized: normalizedStory,
      display: displayStory,
      language: language,
      languageLabel: getLanguageLabel(language),
      languageName: langConfig.name,
      metadata: {
        wordCount: Math.max(1, wordCount),
        estimatedReadingTime: Math.ceil(Math.max(1, wordCount) / 150),
        characterSet: langConfig.characterSet,
        encoding: langConfig.encoding,
        isValidUnicodeSequences: unicodeValidation.valid,
        languageValidation: languageValidation,
        hasUnicodeIssues: unicodeValidation.issues.length > 0,
      },
      issues: unicodeValidation.issues,
    };
  } catch (error) {
    console.error(`[Language Service] Error processing story for ${language}:`, error);
    
    // Fallback processing
    return {
      original: story,
      cleaned: story,
      normalized: story,
      display: story,
      language: language,
      languageLabel: getLanguageLabel(language),
      languageName: langConfig.name,
      metadata: {
        wordCount: Math.max(1, story.trim().split(/\s+/).length),
        estimatedReadingTime: Math.ceil(Math.max(1, story.trim().split(/\s+/).length) / 150),
        characterSet: langConfig.characterSet,
        encoding: langConfig.encoding,
        isValidUnicodeSequences: false,
        error: error.message,
      },
      issues: ['Processing error - check logs'],
    };
  }
};

/**
 * Normalize text for Indian scripts
 * Uses NFC form for consistent representation
 * @param {string} text - Text to normalize
 * @param {string} language - Language code
 * @returns {string} Normalized text
 */
const normalizeIndianScriptText = (text, language) => {
  try {
    // Use NFC (Composed) normalization - better for storage and display
    const normalized = normalizeToNFC(text);
    
    console.log(
      `[Language Service] Normalized ${language} text: ${text.length} chars -> ${normalized.length} chars`
    );
    
    return normalized;
  } catch (error) {
    console.error(`[Language Service] Error normalizing ${language} text:`, error);
    return text; // Return original if normalization fails
  }
};

/**
 * Validate UTF-8 encoding
 * @param {string} text - Text to validate
 * @returns {boolean}
 */
const validateUTF8 = (text) => {
  try {
    if (!text || typeof text !== 'string') return true;

    // Use Node.js Buffer to validate UTF-8
    const buffer = Buffer.from(text, 'utf8');
    const decoded = buffer.toString('utf8');
    
    // Check if round-trip encoding works
    return decoded === text || Buffer.from(decoded, 'utf8').toString('utf8') === decoded;
  } catch (error) {
    console.warn('[Language Service] UTF-8 validation error:', error);
    return false;
  }
};

/**
 * Get language-specific PDF export settings
 * Includes proper font families and encoding for each language
 * @param {string} language - Language code
 * @returns {object} PDF settings with font configuration
 */
const getPDFExportSettings = (language = 'en') => {
  const langConfig = getLanguageConfig(language);
  
  // Font settings optimized for PDF export
  // Using web-safe fonts that can be embedded in PDFs
  const fontSettings = {
    en: {
      font: "'Inter', 'Helvetica', 'Arial', sans-serif",
      fontFamily: 'Inter',
      fontSize: 12,
      lineHeight: 1.6,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700',
    },
    ta: {
      font: "'Noto Sans Tamil', 'Arial Unicode MS', sans-serif",
      fontFamily: 'Noto Sans Tamil',
      fontSize: 13, // Slightly larger for better Tamil readability
      lineHeight: 1.8,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700',
    },
    hi: {
      font: "'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif",
      fontFamily: 'Noto Sans Devanagari',
      fontSize: 13,
      lineHeight: 1.8,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700',
    },
    te: {
      font: "'Noto Sans Telugu', 'Arial Unicode MS', sans-serif",
      fontFamily: 'Noto Sans Telugu',
      fontSize: 13,
      lineHeight: 1.8,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700',
    },
    kn: {
      font: "'Noto Sans Kannada', 'Arial Unicode MS', sans-serif",
      fontFamily: 'Noto Sans Kannada',
      fontSize: 13,
      lineHeight: 1.8,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700',
    },
    ml: {
      font: "'Noto Sans Malayalam', 'Arial Unicode MS', sans-serif",
      fontFamily: 'Noto Sans Malayalam',
      fontSize: 13,
      lineHeight: 1.8,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700',
    },
    es: {
      font: "'Inter', 'Helvetica', 'Arial', sans-serif",
      fontFamily: 'Inter',
      fontSize: 12,
      lineHeight: 1.6,
      fontWeight: 400,
      webFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700',
    },
  };

  const settings = fontSettings[language] || fontSettings.en;

  return {
    language,
    languageName: langConfig.name,
    ...settings,
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
    pageSize: 'A4',
    orientation: 'portrait',
    encoding: 'UTF-8',
    lineSpacing: 1.5, // Additional spacing for Indian scripts
  };
};

/**
 * Format story for export based on language
 * Creates HTML with proper font support and encoding
 * @param {object} story - Story object with metadata
 * @param {string} childName - Child's name
 * @returns {string} Formatted HTML for export
 */
const formatStoryForExport = (story, childName = 'Child') => {
  const { normalized, language, languageName, metadata } = story;
  const pdfSettings = getPDFExportSettings(language);

  // Ensure filename is safe for all systems
  const safeFilename = sanitizeFilename(childName);

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${childName}'s Story (${languageName})</title>
        
        <!-- Google Fonts for Indian Scripts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: ${pdfSettings.font};
            font-size: ${pdfSettings.fontSize}px;
            line-height: ${pdfSettings.lineHeight};
            color: #333;
            margin: ${pdfSettings.margin.top}px ${pdfSettings.margin.right}px ${pdfSettings.margin.bottom}px ${pdfSettings.margin.left}px;
            direction: ${language === 'ar' ? 'rtl' : 'ltr'};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }
          
          h1 {
            color: #6b46c1;
            text-align: center;
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: 700;
            word-break: break-word;
          }
          
          .metadata {
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          
          .metadata p {
            margin: 5px 0;
          }
          
          .story-content {
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            font-size: ${pdfSettings.fontSize}px;
            line-height: ${pdfSettings.lineHeight};
            text-align: justify;
            margin-bottom: 30px;
            word-break: break-word;
            hyphens: auto;
          }
          
          .story-content p {
            margin-bottom: 15px;
            text-indent: 1.5em;
          }
          
          .story-content p:first-child {
            text-indent: 0;
          }
          
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          /* Language-specific adjustments */
          .lang-ta, .lang-hi, .lang-te, .lang-kn, .lang-ml {
            font-size: ${pdfSettings.fontSize + 1}px;
          }
          
          /* Prevent page breaks in middle of story */
          @media print {
            .story-content {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body lang="${language}">
        <h1>${childName}'s Story</h1>
        <div class="metadata">
          <p><strong>Language:</strong> ${languageName}</p>
          <p><strong>Words:</strong> ${metadata.wordCount} | <strong>Reading Time:</strong> ~${metadata.estimatedReadingTime} minutes</p>
        </div>
        <div class="story-content lang-${language}">
${normalized.split('\n\n').map(para => `<p>${para.replace(/\n/g, ' ')}</p>`).join('\n')}
        </div>
        <div class="footer">
          <p>Generated by Kidz Story Magic</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
          <p>All content is child-safe and personalized</p>
        </div>
      </body>
    </html>
  `;

  return html;
};

module.exports = {
  getLanguageConfig,
  buildMultilingualPrompt,
  getAgeAppropriatenessGuidance,
  processStoryByLanguage,
  normalizeIndianScriptText,
  validateUTF8,
  getPDFExportSettings,
  formatStoryForExport,
  LANGUAGE_CONFIG,
};
