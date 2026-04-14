# Implementation Checklist - Story Generation System

## 📋 Pre-Integration Setup

### Backend Prerequisites
- [ ] Verify `backend/src/routes/` directory exists
- [ ] Verify `backend/src/services/` directory exists
- [ ] Verify `backend/src/middleware/auth.js` has `authenticateJWT` export
- [ ] Verify PostgreSQL database connection working
- [ ] Create `.env` file with `OPENAI_API_KEY` (or leave empty for templates)

**Check Auth Middleware:**
```javascript
// backend/src/middleware/auth.js should export:
module.exports = {
  authenticateJWT: (req, res, next) => {
    // Verify JWT token from req.headers.authorization
    // Attach req.user with user data
  }
};
```

### Frontend Prerequisites
- [ ] Verify `frontend/components/wizard/` directory exists
- [ ] Verify `frontend/utils/api.js` exists with axios client
- [ ] Verify `frontend/app/` routing structure exists
- [ ] Verify Tailwind CSS configured
- [ ] Verify Next.js 14+ installed

### Database Prerequisites
- [ ] Existing tables: `users`, `story_projects`, `story_content`
- [ ] Create table for story drafts (if not exists)

**SQL to create draft stories table:**
```sql
CREATE TABLE IF NOT EXISTS story_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES story_projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  images JSONB,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_story_drafts_user_id ON story_drafts(user_id);
CREATE INDEX idx_story_drafts_project_id ON story_drafts(project_id);
CREATE INDEX idx_story_drafts_status ON story_drafts(status);
```

---

## 🔧 Backend Integration

### Step 1: Register Story Generation Routes

**File:** `backend/src/index.js` (or main app file)

```javascript
// At the top with other route imports
const storyGenerationRoutes = require('./routes/story-generation.routes');

// In the app setup section (after other routes)
app.use('/api/story', storyGenerationRoutes);

// Verify routes are registered
console.log('[ROUTES] Story generation routes registered');
```

### Step 2: Verify Service Integration

**File:** `backend/src/services/story-generation.service.js`

The service file is already created and exports all required functions:
- ✅ `generateStoryFromImages`
- ✅ `selectImagesForStory`
- ✅ `generateStoryContent`
- ✅ `saveDraft`
- ✅ `regenerateStory`

**No changes needed** - ready to use!

### Step 3: Update Environment Variables

**File:** `.env` (root directory)

```bash
# Story Generation Configuration
OPENAI_API_KEY=sk-your-key-here  # Leave empty to use templates
OPENAI_MODEL=gpt-4

# Additional configs (optional)
STORY_GENERATION_TIMEOUT=30000
MAX_STORY_PAGES=8
MAX_IMAGES_PER_PROJECT=20
```

**If OPENAI_API_KEY is empty:**
- ✅ Story generation still works with built-in templates
- ⚠️ AI image analysis skipped
- ⚠️ Image selection defaults to first N images

### Step 4: Test Backend Endpoints

```bash
# Test 1: Check if endpoint exists
curl http://localhost:5000/api/story/health

# Test 2: Try story generation (requires auth)
curl -X POST http://localhost:5000/api/story/generate-from-images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-uuid",
    "childName": "Emma",
    "theme": "adventure",
    "images": [
      {
        "id": "img-1",
        "url": "https://example.com/image1.jpg",
        "name": "image1.jpg"
      }
    ]
  }'
```

---

## 🎨 Frontend Integration

### Step 1: Verify API Utilities

**File:** `frontend/utils/api.js`

Already updated with new methods:
```javascript
storyAPI.generateStoryFromImages(payload)  ✅
storyAPI.saveDraft(payload)                ✅
storyAPI.regenerateStory(storyId, options) ✅
storyAPI.getStory(storyId)                 ✅
```

### Step 2: Create New Wizard Step (if needed)

**File:** `frontend/app/wizard/page.jsx` or equivalent

```jsx
'use client';

import { useState } from 'react';
import StoryGenerationStep from '@/components/wizard/StoryGenerationStep';

export default function WizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [project, setProject] = useState({
    id: 'project-uuid',
    childName: 'Emma',
    theme: 'adventure'
  });

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleStoryGenerated = (story) => {
    console.log('Story generated:', story);
    // Save to project state or proceed to next step
    setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Step 1: Project Setup */}
      {currentStep === 1 && (
        <ProjectSetupStep onNext={handleNextStep} />
      )}

      {/* Step 2-4: Wizard Steps */}
      {currentStep === 2 && <Step2 onNext={handleNextStep} />}
      {currentStep === 3 && <Step3 onNext={handleNextStep} />}
      {currentStep === 4 && <Step4 onNext={handleNextStep} />}

      {/* Step 5: Story Generation & Upload */}
      {currentStep === 5 && (
        <StoryGenerationStep
          projectId={project.id}
          theme={project.theme}
          childName={project.childName}
          onStoryGenerated={handleStoryGenerated}
        />
      )}

      {/* Step 6: Final Review & Checkout */}
      {currentStep === 6 && <FinalStep story={project.generatedStory} />}
    </div>
  );
}
```

### Step 3: Integration in Existing Wizard

If you have an existing wizard component:

```jsx
// In your existing wizard component
import StoryGenerationStep from '@/components/wizard/StoryGenerationStep';

// Add to your step components
const stepComponents = {
  1: ProjectSetup,
  3: DetailSelection,
  5: StoryGenerationStep,  // ← Add here
  6: ReviewCheckout,
};

// In render
{currentStep === 5 ? (
  <StoryGenerationStep 
    projectId={project.id}
    theme={selectedTheme}
    childName={childName}
    onStoryGenerated={handleStoryGenerated}
  />
) : (
  // other steps
)}
```

### Step 4: Test Frontend Components

```javascript
// In browser console
import { storyAPI } from '@/utils/api';

// Test API connection
const response = await storyAPI.generateStoryFromImages({
  projectId: 'test-uuid',
  childName: 'Emma',
  theme: 'adventure',
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/1.jpg',
      name: 'image1.jpg'
    }
  ]
});

console.log(response);
```

---

## ✅ Integration Testing Checklist

### Backend Routes Test
```bash
# Terminal 1: Start backend server
cd backend
npm start
# Expected output: ✓ Backend online on Port: 5000

# Terminal 2: Run tests
curl -X POST http://localhost:5000/api/story/generate-from-images \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "uuid",
    "childName": "Emma",
    "theme": "adventure",
    "images": [{"id": "1", "url": "http://...", "name": "img.jpg"}]
  }'

# Expected: ✅ Story object or appropriate error message
```

### Frontend Component Test
```jsx
// In your Next.js page or component
import ImageUploadComponent from '@/components/wizard/ImageUploadComponent';
import StoryPreviewComponent from '@/components/wizard/StoryPreviewComponent';
import StoryGenerationStep from '@/components/wizard/StoryGenerationStep';

// Test component renders
<ImageUploadComponent onImagesSelected={(imgs) => console.log(imgs)} />
<StoryGenerationStep projectId="test" theme="adventure" childName="Emma" />
```

### E2E Workflow Test
- [ ] Browser open to `http://localhost:3000`
- [ ] Navigate to wizard Step 5
- [ ] Click "Add Files" and select 5+ images
- [ ] Click "Generate Story"
- [ ] Wait for loading and story preview to appear
- [ ] Click through story pages
- [ ] Click "Regenerate Story"
- [ ] Click "Save as Draft"
- [ ] Verify success messages

---

## 🐛 Debugging Guide

### Backend Issues

**Problem: Route not found (404)**
```
Solution:
1. Verify route file path: backend/src/routes/story-generation.routes.js
2. Check export in index.js: app.use('/api/story', storyGenerationRoutes)
3. Restart backend server
```

**Problem: Authentication failed (401)**
```
Solution:
1. Verify JWT token in Authorization header
2. Check authenticateJWT middleware
3. Ensure token is valid and not expired
```

**Problem: OpenAI API error (429)**
```
Solution:
1. Check OPENAI_API_KEY in .env
2. Check API rate limits
3. System will fall back to template stories automatically
```

### Frontend Issues

**Problem: Images not uploading**
```
Solution:
1. Check browser console for errors
2. Verify file size < 5MB
3. Verify image format (jpg, png, webp)
4. Check CORS headers on backend

Error log:
console.error('[IMAGE-UPLOAD]', error);
```

**Problem: Story preview not showing**
```
Solution:
1. Verify story object structure
2. Check image URLs are accessible
3. Look for console errors
4. Check network tab for failed requests
```

**Problem: Slow response time**
```
Solution:
1. Check backend logs for timeouts
2. Increase STORY_GENERATION_TIMEOUT to 60000
3. Check OpenAI API response time
4. Consider adding caching
```

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'story-generation.service'` | Wrong path | Check file path matches exactly |
| `authenticateJWT is not defined` | Missing middleware | Verify middleware exists and exports |
| `OPENAI_API_KEY not configured` | Missing .env | Add OPENAI_API_KEY to .env or leave empty |
| `Minimum 3 images required` | User didn't upload enough | Show validation error in UI |
| `CORS error` | Backend not configured | Add CORS headers to Express app |

---

## 📊 Monitoring & Analytics

### Logs to Monitor

**Backend logs** in console:
```
[STORY-GENERATION] Starting story generation
[IMAGE-SELECT] Analyzing 5 images for story
[STORY-GEN] Generating story with AI
[STORY-GENERATION] ✓ Story generated successfully
[STORY-DRAFT] ✓ Draft saved successfully
```

**Frontend console logs:**
```
[API] POST /api/story/generate-from-images
[STORY-GEN] Generating story from images (6 images)
[STORY-PREVIEW] Story loaded with 5 pages
[STORY-DRAFT] Draft saved
```

### Performance Metrics

**Track these metrics:**
- Story generation time
- Average image upload size
- API response time
- User conversion rate (generated → purchased)
- Most popular themes

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Backend server tested and stable
- [ ] Frontend builds without errors

### Deployment Steps
1. **Backend**
   ```bash
   # Build backend
   npm install
   npm run build
   
   # Start
   npm start
   ```

2. **Frontend**
   ```bash
   # Build frontend
   npm install
   npm run build
   
   # Start
   npm run start
   ```

3. **Database**
   ```bash
   # Run migrations
   npm run migrate
   ```

### Post-Deployment
- [ ] Test all endpoints
- [ ] Verify database connections
- [ ] Check error logs
- [ ] Monitor API response times
- [ ] Test story generation end-to-end

---

## 📚 Additional Resources

### Files Reference
- **Routes:** `backend/src/routes/story-generation.routes.js` (290 lines)
- **Service:** `backend/src/services/story-generation.service.js` (380 lines)
- **Upload Component:** `frontend/components/wizard/ImageUploadComponent.jsx` (280 lines)
- **Preview Component:** `frontend/components/wizard/StoryPreviewComponent.jsx` (320 lines)
- **Wizard Step:** `frontend/components/wizard/StoryGenerationStep.jsx` (250 lines)
- **API Utils:** `frontend/utils/api.js` (Updates added)

### Manual Pages
- [Story Generation Guide](STORY_GENERATION_GUIDE.md)
- [API Documentation](docs/API-DOCUMENTATION.md)
- [Backend API Reference](docs/DEVELOPMENT.md)

### External References
- [OpenAI GPT-4 Documentation](https://platform.openai.com/docs/models/gpt-4)
- [Next.js File Upload](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)

---

## ✨ Next Steps After Integration

1. **Add Image Selection UI** - Let users pick specific 3 images
2. **Create Admin Dashboard** - Track story generation stats
3. **Add Story Sharing** - Generate and share story links
4. **Implement PDF Export** - Download stories as PDFs
5. **Add Voice Narration** - Text-to-speech functionality
6. **Create Template Editor** - Custom story templates
7. **Add Analytics** - Track user engagement

---

**Status:** ✅ Ready for Integration
**Last Updated:** 2024-01-15
**Backend:** Express.js + PostgreSQL
**Frontend:** Next.js 14 + React
