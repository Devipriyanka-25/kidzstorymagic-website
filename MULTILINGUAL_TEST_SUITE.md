/**
 * MULTILINGUAL_TEST_SUITE.md
 *
 * Comprehensive test scenarios for multilingual story generation feature
 * Phase 2 enhancement
 * 
 * Run these tests before deploying to production
 */

# Multilingual Feature - Test Suite

## Test Environment Setup

```bash
# Install dependencies
npm install

# Set up test database
npm run db:migrate

# Start test server
npm run dev:test

# Run tests
npm test -- --coverage
```

---

## Unit Tests

### 1. Language Constants & Configuration

#### Test 1.1: Language Definitions
```javascript
// test/constants/languages.test.js
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/constants/languages';

describe('Language Constants', () => {
  test('SUPPORTED_LANGUAGES should contain all 7 languages', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(7);
    expect(SUPPORTED_LANGUAGES.map(l => l.code)).toEqual(
      ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es']
    );
  });

  test('Each language should have required fields', () => {
    SUPPORTED_LANGUAGES.forEach(lang => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('label');
      expect(lang).toHaveProperty('nativeLabel');
      expect(lang).toHaveProperty('rtl');
      expect(lang).toHaveProperty('region');
    });
  });

  test('DEFAULT_LANGUAGE should be English', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
  });
});
```

#### Test 1.2: Language Helper Functions
```javascript
// test/constants/languages.helper.test.js
import {
  getLanguageByCode,
  isLanguageSupported,
  getValidLanguage,
} from '@/constants/languages';

describe('Language Helper Functions', () => {
  test('getLanguageByCode should return language object', () => {
    const lang = getLanguageByCode('ta');
    expect(lang).toEqual(
      expect.objectContaining({
        code: 'ta',
        label: 'Tamil',
        nativeLabel: 'தமிழ்',
      })
    );
  });

  test('isLanguageSupported should validate codes', () => {
    expect(isLanguageSupported('en')).toBe(true);
    expect(isLanguageSupported('ta')).toBe(true);
    expect(isLanguageSupported('fr')).toBe(false);  // Not supported
  });

  test('getValidLanguage should fallback to English', () => {
    expect(getValidLanguage('ta')).toBe('ta');
    expect(getValidLanguage('fr')).toBe('en');   // Unsupported -> English
    expect(getValidLanguage(null)).toBe('en');   // Null -> English
  });
});
```

---

### 2. Translations System

#### Test 2.1: Translation Keys
```javascript
// test/utils/i18n/translations.test.js
import translations, { t, getTranslations } from '@/utils/i18n/translations';

describe('Translation System', () => {
  test('All supported languages should have translations', () => {
    const languageCodes = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es'];
    
    languageCodes.forEach(lang => {
      expect(translations[lang]).toBeDefined();
      expect(typeof translations[lang]).toBe('object');
    });
  });

  test('All languages should have required keys', () => {
    const requiredKeys = [
      'childName', 'storyLanguage', 'generateStory',
      'nameRequired', 'safetyTitle', 'storyGenerated',
    ];

    Object.values(translations).forEach(langTranslations => {
      requiredKeys.forEach(key => {
        expect(langTranslations).toHaveProperty(key);
        expect(typeof langTranslations[key]).toBe('string');
        expect(langTranslations[key]).toBeTruthy();
      });
    });
  });

  test('Translation function should return correct values', () => {
    expect(t('en', 'childName')).toBe('Child\'s Name');
    expect(t('ta', 'childName')).toBe('குழந்தையின் பெயர்');
    expect(t('hi', 'childName')).toBe('बच्चे का नाम');
  });

  test('Translation function should fallback to English', () => {
    const result = t('invalid-lang', 'childName');
    expect(result).toBe('Child\'s Name');  // Falls back to English
  });

  test('getTranslations should return full object', () => {
    const taTranslations = getTranslations('ta');
    expect(Object.keys(taTranslations).length).toBeGreaterThan(20);
  });
});
```

---

### 3. Language Hook (useLanguage)

#### Test 3.1: Hook Initialization
```javascript
// test/hooks/useLanguage.test.js
import { renderHook, act } from '@testing-library/react';
import useLanguage from '@/hooks/useLanguage';

describe('useLanguage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Hook should initialize with default language', () => {
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.currentLanguage).toBe('en');
    expect(result.current.isInitialized).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  test('Hook should load saved language from localStorage', () => {
    localStorage.setItem('kidz-story-language', 'ta');
    
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.currentLanguage).toBe('ta');
  });

  test('Hook should fallback to default for invalid language', () => {
    localStorage.setItem('kidz-story-language', 'invalid');
    
    const { result } = renderHook(() => useLanguage());
    
    expect(result.current.currentLanguage).toBe('en');
  });
});
```

#### Test 3.2: Hook Methods
```javascript
describe('useLanguage Hook Methods', () => {
  test('changeLanguage should update current language', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.changeLanguage('hi');
    });
    
    expect(result.current.currentLanguage).toBe('hi');
    expect(localStorage.getItem('kidz-story-language')).toBe('hi');
  });

  test('translate should return correct translation', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.changeLanguage('ta');
    });
    
    const tamil = result.current.translate('childName');
    expect(tamil).toBe('குழந்தையின் பெயர்');
  });

  test('getAllLanguages should return all supported languages', () => {
    const { result } = renderHook(() => useLanguage());
    
    const allLangs = result.current.getAllLanguages();
    expect(allLangs).toHaveLength(7);
  });

  test('getCurrentLanguage should return current language object', () => {
    const { result } = renderHook(() => useLanguage());
    
    act(() => {
      result.current.changeLanguage('es');
    });
    
    const current = result.current.getCurrentLanguage();
    expect(current.code).toBe('es');
    expect(current.label).toBe('Spanish');
  });
});
```

---

### 4. Backend Middleware

#### Test 4.1: Language Validation Middleware
```javascript
// test/middleware/validateLanguage.test.js
const {
  validateLanguage,
  validateLanguageStrict,
  normalizeLanguage,
  isLanguageSupported,
} = require('@/middleware/validateLanguage');

describe('Language Validation Middleware', () => {
  test('normalizeLanguage should handle valid codes', () => {
    expect(normalizeLanguage('en')).toBe('en');
    expect(normalizeLanguage('TA')).toBe('ta');  // Case insensitive
    expect(normalizeLanguage('  ta  ')).toBe('ta');  // Trim
  });

  test('normalizeLanguage should fallback for invalid codes', () => {
    expect(normalizeLanguage('fr')).toBe('en');
    expect(normalizeLanguage(null)).toBe('en');
    expect(normalizeLanguage('')).toBe('en');
  });

  test('isLanguageSupported should validate codes', () => {
    expect(isLanguageSupported('en')).toBe(true);
    expect(isLanguageSupported('ta')).toBe(true);
    expect(isLanguageSupported('fr')).toBe(false);
  });

  test('validateLanguage middleware should set req.validatedLanguage', () => {
    const req = {
      body: { storyLanguage: 'ta' },
      query: {},
    };
    const res = {};
    const next = jest.fn();

    validateLanguage(req, res, next);

    expect(req.validatedLanguage).toBe('ta');
    expect(next).toHaveBeenCalled();
  });

  test('validateLanguage should fallback for unsupported language', () => {
    const req = {
      body: { storyLanguage: 'fr' },
      query: {},
    };
    const res = {};
    const next = jest.fn();

    validateLanguage(req, res, next);

    expect(req.validatedLanguage).toBe('en');
    expect(next).toHaveBeenCalled();
  });

  test('validateLanguageStrict should reject unsupported languages', () => {
    const req = {
      body: { storyLanguage: 'fr' },
      query: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    validateLanguageStrict(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
```

---

### 5. Backend Language Service

#### Test 5.1: Prompt Building
```javascript
// test/services/languageService.test.js
const {
  buildMultilingualPrompt,
  getLanguageConfig,
  processStoryByLanguage,
} = require('@/services/languageService');

describe('Language Service', () => {
  test('buildMultilingualPrompt should include language instruction', () => {
    const prompt = buildMultilingualPrompt({
      language: 'ta',
      childName: 'Anita',
      age: 8,
    });

    expect(prompt).toContain('Tamil');
    expect(prompt).toContain('Anita');
    expect(prompt).toContain('8 years old');
  });

  test('buildMultilingualPrompt should handle all languages', () => {
    const languages = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es'];

    languages.forEach(lang => {
      const prompt = buildMultilingualPrompt({
        language: lang,
        childName: 'Test',
        age: 8,
      });

      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(100);
    });
  });

  test('getLanguageConfig should return config for language', () => {
    const config = getLanguageConfig('ta');

    expect(config).toEqual(
      expect.objectContaining({
        name: 'Tamil',
        characterSet: 'tamil',
        encoding: 'utf-8',
      })
    );
  });

  test('processStoryByLanguage should include metadata', () => {
    const story = 'This is a test story about courage and friendship.';
    const processed = processStoryByLanguage(story, 'en');

    expect(processed).toHaveProperty('original');
    expect(processed).toHaveProperty('normalized');
    expect(processed).toHaveProperty('language', 'en');
    expect(processed).toHaveProperty('metadata');
    expect(processed.metadata).toHaveProperty('wordCount');
    expect(processed.metadata.wordCount).toBe(8);
  });
});
```

---

## Component Tests

### 6. Language Selector Component

#### Test 6.1: Rendering
```javascript
// test/components/i18n/LanguageSelector.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '@/components/i18n/LanguageSelector';

describe('LanguageSelector Component', () => {
  test('Should render language options', () => {
    render(<LanguageSelector />);

    expect(screen.getByText(/English/)).toBeInTheDocument();
    expect(screen.getByText(/தமிழ்/)).toBeInTheDocument();
    expect(screen.getByText(/हिन्दी/)).toBeInTheDocument();
  });

  test('Should show label when prop is true', () => {
    render(<LanguageSelector showLabel={true} />);
    expect(screen.getByText(/Story Language:/)).toBeInTheDocument();
  });

  test('Should hide label when prop is false', () => {
    render(<LanguageSelector showLabel={false} />);
    expect(screen.queryByText(/Story Language:/)).not.toBeInTheDocument();
  });

  test('Should handle language change', () => {
    const onLanguageChange = jest.fn();
    render(<LanguageSelector onLanguageChange={onLanguageChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'ta' } });

    expect(onLanguageChange).toHaveBeenCalledWith('ta');
  });
});
```

---

## Integration Tests

### 7. Full Story Generation Flow

#### Test 7.1: Language Selector to API Call
```javascript
// test/integration/multilingual-flow.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultilingualStoryPage from '@/app/story/multilingual-example/page';

describe('Multilingual Story Generation Flow', () => {
  test('Complete flow: Select Tamil -> Generate Story', async () => {
    render(<MultilingualStoryPage />);

    // 1. Select language (Tamil)
    const languageSelect = screen.getByRole('combobox');
    await userEvent.selectOption(languageSelect, 'ta');

    // 2. Fill form (safety validation already done in ChildSafetyForm)
    // 3. Submit
    const generateButton = screen.getByText(/Generate Story/i);
    fireEvent.click(generateButton);

    // 4. Wait for story
    await waitFor(() => {
      expect(screen.getByText(/தமிழ்/)).toBeInTheDocument();
    });

    // 5. Verify story is in Tamil
    // (Would check actual content here)
  });

  test('Story generated in correct language', async () => {
    // Mock API response for Tamil
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          success: true,
          story: {
            id: '123',
            language: 'ta',
            content: 'தமிழ் கதை...',
          },
        }),
      })
    );

    render(<MultilingualStoryPage />);

    // Select Tamil
    const select = screen.getByRole('combobox');
    await userEvent.selectOption(select, 'ta');

    // Generate
    const button = screen.getByText(/Generate Story/i);
    fireEvent.click(button);

    await waitFor(() => {
      // Check request body includes language
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"storyLanguage":"ta"'),
        })
      );
    });
  });
});
```

---

## End-to-End Tests

### 8. Complete User Journey

#### Test 8.1: Multilingual Story with Child Safety
```javascript
// test/e2e/multilingual-child-safety.e2e.js
describe('Multilingual Story Generation with Child Safety', () => {
  test('Complete user journey: Child Safety + Language Selection', async () => {
    // 1. Visit page
    await page.goto('http://localhost:3000/story/multilingual-example');

    // 2. Fill child safety form
    await page.fill('input[placeholder*="name"]', 'Anita');
    await page.fill('input[placeholder*="age"]', '8');
    // ... parent email if <13

    // 3. Select language (Tamil)
    await page.selectOption('select[name="storyLanguage"]', 'ta');

    // 4. Enter story prompt
    await page.fill('textarea[name="storyPrompt"]', 'About bravery');

    // 5. Generate story
    await page.click('button:has-text("Generate Story")');

    // 6. Wait for story in Tamil
    await page.waitForSelector('text=தமிழ்');

    // 7. Download PDF
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Download Story")'),
    ]);

    // Verify PDF filename includes language
    expect(download.suggestedFilename()).toContain('_ta.pdf');
  });

  test('Fallback for unsupported language', async () => {
    // Try to access with unsupported language in URL
    await page.goto('http://localhost:3000/story/multilingual-example?lang=fr');

    // Should default to English
    const select = await page.inputValue('select[name="storyLanguage"]');
    expect(select).toBe('en');
  });
});
```

---

## Performance Tests

### 9. Language Performance

#### Test 9.1: Load Time
```javascript
// test/performance/language-performance.test.js
describe('Language Feature Performance', () => {
  test('Language selector should render in <100ms', () => {
    const start = performance.now();
    render(<LanguageSelector />);
    const end = performance.now();

    expect(end - start).toBeLessThan(100);
  });

  test('Language change should trigger re-render in <50ms', async () => {
    const { rerender } = render(<LanguageSelector />);

    const start = performance.now();
    fireEvent.change(screen.getByRole('combobox'), { 
      target: { value: 'ta' } 
    });
    const end = performance.now();

    expect(end - start).toBeLessThan(50);
  });

  test('Story generation with language should not exceed 5s', async () => {
    const start = performance.now();

    const response = await fetch('/api/story/generate-with-language', {
      method: 'POST',
      body: JSON.stringify({
        childName: 'Test',
        age: 8,
        storyLanguage: 'ta',
      }),
    });

    const end = performance.now();
    expect(end - start).toBeLessThan(5000);
    expect(response.ok).toBe(true);
  });
});
```

---

## Test Data

### Sample Test Stories

```javascript
const TEST_STORIES = {
  en: 'Once upon a time, there was a brave little girl named Anita...',
  ta: 'ஒரு முறை, ஆனிதா என்ற சாகசமான சிறுமி இருந்தாள்...',
  hi: 'एक बार की बात है, आनिता नाम की एक बहादुर लड़की थी...',
  te: 'ఒకసారి, అనిత అనే ధైర్యవంతమైన చిన్న అమ్మాయి ఉండేది...',
  kn: 'ಒಂದೊಮ್ಮೆ, ಆನಿತಾ ಎಂಬ ಧೈರ್ಯವಂತ ಚಿಕ್ಕ ಹುಡುಗಿ ಇತ್ತು...',
  ml: 'ഒരു കാലത്ത്, ആനിത എന്ന ധൈര്യശാലിയായ ചെറിയ പെൺകുട്ടി ഉണ്ടായിരുന്നു...',
  es: 'Érase una vez, había una niña valiente llamada Anita...',
};

const TEST_FORMS = {
  child_under_13: {
    childName: 'Anita',
    age: 8,
    parentEmail: 'parent@example.com',
    parentConsent: true,
    storyLanguage: 'ta',
  },
  teenager: {
    childName: 'Rohan',
    age: 15,
    storyLanguage: 'hi',
  },
  english_default: {
    childName: 'Alice',
    age: 10,
    // storyLanguage not provided - should default to 'en'
  },
};
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- validateLanguage.test.js

# Run with coverage
npm test -- --coverage

# Run integration tests
npm test -- --testPathPattern=integration

# Run E2E tests
npm run test:e2e

# Watch mode
npm test -- --watch
```

---

## Test Report Template

```markdown
# Multilingual Feature - Test Report

## Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Coverage: XX%

## Test Results
- [ ] Unit Tests: PASS/FAIL
- [ ] Component Tests: PASS/FAIL
- [ ] Integration Tests: PASS/FAIL
- [ ] E2E Tests: PASS/FAIL
- [ ] Performance Tests: PASS/FAIL

## Known Issues
- None

## Ready for Production
- [ ] Yes
- [ ] No

## Date: YYYY-MM-DD
## Tested By: [Name]
```

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Ready for implementation
