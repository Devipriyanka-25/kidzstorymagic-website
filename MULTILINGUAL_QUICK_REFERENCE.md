/**
 * MULTILINGUAL_QUICK_REFERENCE.md
 * 
 * Quick lookup guide for multilingual feature implementation
 * Use this for fast reference while coding
 */

# Multilingual Feature - Quick Reference

## 🚀 Quick Start

### 1. Add Language Selector to Your Component
```javascript
import LanguageSelector from '@/components/i18n/LanguageSelector';

<LanguageSelector showLabel={true} size="md" />
```

### 2. Use Translations in Component
```javascript
import useLanguage from '@/hooks/useLanguage';

export function MyComponent() {
  const { translate, currentLanguage } = useLanguage();
  
  return <h1>{translate('childName')}</h1>;
}
```

### 3. Include Language in API Call
```javascript
const response = await fetch('/api/story/generate-with-language', {
  method: 'POST',
  body: JSON.stringify({
    childName: 'Anita',
    age: 8,
    storyLanguage: 'ta',  // ← Include this!
    // ... other fields
  }),
});
```

---

## 📋 Supported Languages

| Code | Language | Native | Example |
|------|----------|--------|---------|
| en | English | English | "Hello" |
| ta | Tamil | தமிழ் | "வணக்கம்" |
| hi | Hindi | हिन्दी | "नमस्ते" |
| te | Telugu | తెలుగు | "నమస్కారం" |
| kn | Kannada | ಕನ್ನಡ | "ನಮಸ್ಕಾರ" |
| ml | Malayalam | മലയാളം | "നമസ്കാരം" |
| es | Spanish | Español | "Hola" |

---

## 🔧 API Reference

### Request Body
```javascript
{
  childName: string,           // e.g., "Anita"
  age: number,                 // 1-17
  parentEmail: string,         // if age < 13
  parentConsent: boolean,      // if age < 13
  storyPrompt: string,         // optional
  storyLanguage: string,       // NEW: 'en', 'ta', 'hi', etc.
}
```

### Response Format
```javascript
{
  success: true,
  story: {
    id: string,
    childName: string,
    language: string,
    content: string,
    wordCount: number,
    metadata: {
      wordCount: number,
      estimatedReadingTime: number,
      characterSet: string,
      encoding: string,
      isValidUTF8: boolean,
    }
  }
}
```

---

## 🎯 Common Tasks

### Task 1: Change Language
```javascript
import useLanguage from '@/hooks/useLanguage';

export function MyComponent() {
  const { changeLanguage } = useLanguage();
  
  return (
    <button onClick={() => changeLanguage('ta')}>
      Switch to Tamil
    </button>
  );
}
```

### Task 2: Get All Supported Languages
```javascript
import { SUPPORTED_LANGUAGES } from '@/constants/languages';

SUPPORTED_LANGUAGES.forEach(lang => {
  console.log(`${lang.label} (${lang.nativeLabel})`);
});
// Output:
// English (English)
// Tamil (தமிழ்)
// ... etc
```

### Task 3: Get Translation for Specific Key
```javascript
import { t } from '@/utils/i18n/translations';

const english = t('en', 'childName');    // "Child's Name"
const tamil = t('ta', 'childName');      // "குழந்தையின் பெயர்"
```

### Task 4: Validate Language Code
```javascript
import { isLanguageSupported, getValidLanguage } from '@/constants/languages';

if (isLanguageSupported('ta')) {
  // Process Tamil
}

// Always get valid language (falls back to English)
const validLang = getValidLanguage('fr'); // Returns 'en' (French not supported)
```

### Task 5: Get Language Metadata
```javascript
import { getLanguageByCode } from '@/constants/languages';

const lang = getLanguageByCode('hi');
console.log(lang.label);          // "Hindi"
console.log(lang.nativeLabel);    // "हिन्दी"
console.log(lang.region);         // "India"
console.log(lang.rtl);            // false
```

### Task 6: Export Story as PDF with Language
```javascript
const response = await fetch('/api/story/export-pdf', {
  method: 'POST',
  body: JSON.stringify({
    storyId: '123',
    language: 'ta',
    childName: 'Anita',
  }),
  responseType: 'blob',
});

// Download file
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement('a');
link.href = url;
link.download = `story_ta.pdf`;
link.click();
```

---

## 🗄️ Database Schema

### Add to story_projects table
```sql
ALTER TABLE story_projects ADD COLUMN (
  language VARCHAR(5) DEFAULT 'en',
  character_set VARCHAR(50)
);
```

### Query by language
```sql
-- Get all Tamil stories
SELECT * FROM story_projects WHERE language = 'ta';

-- Count stories by language
SELECT language, COUNT(*) as total 
FROM story_projects 
GROUP BY language;
```

---

## 🛠️ Middleware Setup

### Add to routes
```javascript
const { validateLanguage } = require('../middleware/validateLanguage');

router.post('/api/story/generate', 
  validateLanguage,           // Add this middleware
  storyController.generate
);
```

### What middleware does
- Validates language code against whitelist
- Falls back to English for unsupported languages
- Attaches `req.validatedLanguage` to request
- Logs language usage

---

## 📝 Translation Keys

### Form Labels
- `childName` - "Child's Name"
- `childAge` - "Child's Age"
- `parentEmail` - "Parent/Guardian Email"
- `parentConsent` - "I confirm I am a parent/guardian"
- `storyLanguage` - "Story Language"
- `storyPrompt` - "Story Prompt (Optional)"

### Buttons
- `generateStory` - "Generate Story"
- `downloadStory` - "Download Story"
- `resetForm` - "Reset"

### Messages
- `nameRequired` - "Child's name is required"
- `ageInvalid` - "Age must be between 1 and 17"
- `errorGeneratingStory` - "Error generating story. Please try again."
- `storyGenerated` - "Story generated successfully!"

### Safety
- `safetyTitle` - "Child Safety Information"
- `photosNotStored` - "Photos are not stored after checkout"
- `childDataDeleted` - "Child details will be deleted after story"

**Full list:** See `frontend/utils/i18n/translations.js`

---

## 🔍 Debugging

### Check current language
```javascript
const { currentLanguage } = useLanguage();
console.log('Current language:', currentLanguage);
```

### Verify localStorage
```javascript
console.log(localStorage.getItem('kidz-story-language'));
```

### Check translation exists
```javascript
import { getTranslations } from '@/utils/i18n/translations';

const translationsForLanguage = getTranslations('ta');
console.log(translationsForLanguage.childName);
```

### Validate middleware execution
```javascript
// In controller, check:
console.log('Validated language:', req.validatedLanguage);
```

### Test API call
```bash
curl -X POST http://localhost:3000/api/story/generate \
  -H "Content-Type: application/json" \
  -d '{
    "childName": "Test",
    "age": 8,
    "storyLanguage": "ta"
  }'
```

---

## 🧪 Test Cases

### Test 1: Language Persistence
```javascript
// Clear storage
localStorage.clear();

// Set language to Tamil
useLanguage().changeLanguage('ta');

// Reload page
// Verify: Language is still Tamil
```

### Test 2: All Languages Generate Stories
```javascript
const languages = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'es'];

for (const lang of languages) {
  // Generate story in this language
  const story = await fetch('/api/story/generate', {
    body: JSON.stringify({ storyLanguage: lang, ... })
  });
  
  // Verify content is in correct language
  console.log(`Story in ${lang}: OK`);
}
```

### Test 3: Unicode Rendering
```javascript
// Check each Indian language script
const testStrings = {
  ta: 'தமிழ்',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
};

Object.entries(testStrings).forEach(([lang, text]) => {
  const el = document.createElement('div');
  el.textContent = text;
  console.log(`${lang}: ${el.textContent}`);
});
```

### Test 4: Fallback to English
```javascript
// Try unsupported language
const story = await fetch('/api/story/generate', {
  body: JSON.stringify({ storyLanguage: 'fr', ... })
});

// Verify: Story is in English (not French)
```

---

## ⚙️ Configuration

### Font families (in CSS)
```css
/* For Indian scripts */
body.lang-ta { font-family: 'Noto Sans Tamil', sans-serif; }
body.lang-hi { font-family: 'Noto Sans Devanagari', sans-serif; }
body.lang-te { font-family: 'Noto Sans Telugu', sans-serif; }
body.lang-kn { font-family: 'Noto Sans Kannada', sans-serif; }
body.lang-ml { font-family: 'Noto Sans Malayalam', sans-serif; }
```

### Environment variables (optional)
```bash
# .env.local
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_ENABLE_LANGUAGE_DETECTION=true
```

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `frontend/constants/languages.js` | Language definitions |
| `frontend/utils/i18n/translations.js` | Translation strings |
| `frontend/hooks/useLanguage.js` | Language state hook |
| `frontend/components/i18n/LanguageSelector.jsx` | Language selector component |
| `backend/src/middleware/validateLanguage.js` | Language validation middleware |
| `backend/src/services/languageService.js` | Multilingual logic |
| `frontend/app/story/multilingual-example/page.jsx` | Complete example page |
| `MULTILINGUAL_INTEGRATION_GUIDE.md` | Full documentation |

---

## 🚨 Common Errors

### Error: "Unsupported language"
**Fix:** Check language code matches exactly: 'ta' not 'Tamil'

### Error: "Language not persisting"
**Fix:** Check localStorage is enabled, not private browsing

### Error: "Characters showing as boxes"
**Fix:** Ensure web fonts are loaded for Indian scripts

### Error: "API returns English instead of requested language"
**Fix:** Verify storyLanguage is included in request body

### Error: "PDF exports with wrong fonts"
**Fix:** Check PDF settings have correct font-family for language

---

## 📞 Support

For issues:
1. Check this quick reference
2. Review full integration guide
3. Check example page implementation
4. Check browser console for errors
5. Verify middleware is in correct order in routes

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Ready for implementation
