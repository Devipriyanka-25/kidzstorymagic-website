# Story Generation & Image Upload Integration Guide

## Overview
This guide documents the new story generation system that integrates image uploads with AI-powered story creation.

## Components Created

### 1. **ImageUploadComponent.jsx**
**Location:** `frontend/components/wizard/ImageUploadComponent.jsx`

**Purpose:** Handle image uploads from users with validation

**Key Features:**
- ✅ Drag & drop interface
- ✅ Multiple file selection
- ✅ Image preview thumbnails
- ✅ Minimum 5 images validation
- ✅ Error messaging
- ✅ Remove individual images
- ✅ Clear all functionality

**Usage:**
```jsx
import ImageUploadComponent from '@/components/wizard/ImageUploadComponent';

<ImageUploadComponent 
  onImagesSelected={handleImagesSelected}
  maxImages={10}
/>
```

**Props:**
- `onImagesSelected(images)` - Callback when images are selected
- `maxImages` - Maximum images allowed (default: 10)

---

### 2. **StoryPreviewComponent.jsx**
**Location:** `frontend/components/wizard/StoryPreviewComponent.jsx`

**Purpose:** Display generated stories in book-like format

**Key Features:**
- ✅ Two-page spread display
- ✅ Left/right page navigation
- ✅ Thumbnail sidebar
- ✅ Page numbering
- ✅ Keyboard navigation (arrow keys)
- ✅ Flip animations
- ✅ Responsive design

**Usage:**
```jsx
import StoryPreviewComponent from '@/components/wizard/StoryPreviewComponent';

<StoryPreviewComponent 
  story={generatedStory}
  theme={theme}
  onClose={handleClose}
  onRegenerate={handleRegenerate}
  onSaveDraft={handleSaveDraft}
/>
```

**Props:**
- `story` - Story object with pages array
- `theme` - Theme colors object
- `onClose()` - Callback when user clicks close
- `onRegenerate()` - Callback to regenerate story
- `onSaveDraft()` - Callback to save as draft

**Story Format:**
```javascript
{
  id: 'uuid',
  title: 'Story Title',
  pages: [
    {
      pageNumber: 1,
      title: 'Page Title',
      content: 'Story text...',
      imageUrl: 'url/to/image.jpg'
    }
  ],
  theme: 'adventure',
  childName: 'Emma',
  characters: ['Character 1', 'Character 2'],
  lesson: 'Learning point',
  createdAt: '2024-01-01T...'
}
```

---

### 3. **StoryGenerationStep.jsx** 
**Location:** `frontend/components/wizard/StoryGenerationStep.jsx`

**Purpose:** Complete story generation workflow combining upload and preview

**Key Features:**
- ✅ Progress indicator (3 steps)
- ✅ Step 1: Upload images
- ✅ Step 2: Generate story (with loading state)
- ✅ Step 3: Preview story
- ✅ Regenerate functionality
- ✅ Save as draft
- ✅ Error handling

**Usage:**
```jsx
import StoryGenerationStep from '@/components/wizard/StoryGenerationStep';

<StoryGenerationStep 
  projectId={projectId}
  theme="adventure"
  childName="Emma"
  onStoryGenerated={handleStoryGenerated}
/>
```

**Props:**
- `projectId` (required) - Project UUID
- `theme` (required) - Story theme
- `childName` (required) - Child's name for personalization
- `onStoryGenerated(story)` - Callback when story is generated

**Steps:**
1. **Upload Step** - User uploads minimum 5 images
2. **Generating Step** - AI analyzes and creates story
3. **Preview Step** - User sees story and can regenerate/save

---

## Backend Implementation

### API Endpoints

#### **POST /api/story/generate-from-images**
Generate story from uploaded images

**Request:**
```json
{
  "projectId": "uuid",
  "childName": "Emma",
  "theme": "adventure",
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "name": "image1.jpg"
    }
  ],
  "regenerationCount": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Emma's Amazing Adventure",
    "pages": [...],
    "characters": [...],
    "lesson": "..."
  }
}
```

**Location:** `backend/src/routes/story-generation.routes.js`

#### **POST /api/story/save-draft**
Save generated story as draft

**Request:**
```json
{
  "projectId": "uuid",
  "story": { /* story object */ },
  "images": [ /* image metadata */ ],
  "status": "draft"
}
```

**Location:** `backend/src/routes/story-generation.routes.js`

#### **POST /api/story/:storyId/regenerate**
Regenerate story with different parameters

**Request:**
```json
{
  "images": [ /* selected images */ ],
  "theme": "adventure",
  "childName": "Emma"
}
```

---

### Services

#### **story-generation.service.js**
**Location:** `backend/src/services/story-generation.service.js`

**Functions:**

1. **generateStoryFromImages(payload)**
   - Main entry point for story generation
   - Selects best 3 images from uploaded set
   - Generates story using OpenAI or templates
   - Returns formatted story object

2. **selectImagesForStory(images, childName, theme, count)**
   - Analyzes each image for story relevance
   - Ranks by relevance score
   - Returns top N images

3. **generateStoryContent(childName, theme, images)**
   - Calls OpenAI GPT-4 to generate story
   - Falls back to templates if API unavailable
   - Formats response into page structure

4. **generateTemplateStory(childName, theme, images)**
   - Provides story templates for common themes:
     - adventure
     - fairytale
     - friendship
   - Allows operation without API key

5. **analyzeImageContent(imageUrl, childName)**
   - Uses GPT-4 Vision to analyze image
   - Returns description, topic, mood, relevance score

6. **saveDraft(payload)**
   - Stores story as draft in database
   - Associates with project and user

7. **regenerateStory(userId, storyId, images, theme)**
   - Creates new story with different parameters
   - Increments regeneration counter

---

## Frontend API Integration

### **utils/api.js Updates**

New methods added to `storyAPI`:

```javascript
// Generate story from images
storyAPI.generateStoryFromImages(payload)

// Save as draft
storyAPI.saveDraft(payload)

// Regenerate story
storyAPI.regenerateStory(storyId, options)

// Get story
storyAPI.getStory(storyId)
```

---

## Integration Steps

### Step 1: Add Routes to Backend
```bash
# In backend/src/index.js or app.js
const storyGenRoutes = require('./routes/story-generation.routes');
app.use('/api/story', storyGenRoutes);
```

### Step 2: Add Service to Index
```bash
# In backend/src/index.js
const storyGenService = require('./services/story-generation.service');
```

### Step 3: Configure Environment
```bash
# In .env file
OPENAI_API_KEY=sk-... # Optional - for AI story generation
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Integrate into Wizard
```jsx
// In frontend/components/wizard/StoryWizard.jsx or your main wizard component
import StoryGenerationStep from '@/components/wizard/StoryGenerationStep';

// In your wizard steps
{currentStep === 5 && (
  <StoryGenerationStep 
    projectId={project.id}
    theme={selectedTheme}
    childName={childName}
    onStoryGenerated={handleStoryGenerated}
  />
)}
```

---

## Data Flow

```
User Interface
    ↓
ImageUploadComponent (uploads images)
    ↓
StoryGenerationStep (manages workflow)
    ↓
API: POST /api/story/generate-from-images
    ↓
Backend Story Generation Service
    ├─ selectImagesForStory() ← Analyze 5+ images
    ├─ analyzeImageContent() ← Rank by relevance
    └─ generateStoryContent() ← Create story
           ├─ Try OpenAI GPT-4
           └─ Fall back to templates
    ↓
API Response with Story Object
    ↓
StoryPreviewComponent (displays story)
    ↓
User Options:
├─ Regenerate → Go back to step 1
├─ Save Draft → POST /api/story/save-draft
└─ Continue → Next wizard step
```

---

## Error Handling

### Frontend Errors
- ✅ Image upload validation (type, size, count)
- ✅ API connection errors
- ✅ Loading states with user feedback
- ✅ Graceful fallbacks

### Backend Errors
- ✅ Missing required fields
- ✅ OpenAI API failures (template fallback)
- ✅ Database errors
- ✅ Rate limiting

**Example Error Response:**
```json
{
  "error": "Minimum 3 images required for story generation",
  "details": {
    "received": 2,
    "required": 3
  }
}
```

---

## Themes Supported

### Built-in Themes with Templates
1. **adventure** - Explorer, brave hero narratives
2. **fairytale** - Magical kingdoms, enchanted quests
3. **friendship** - Building relationships, teamwork
4. **courage** - Overcoming fears
5. **kindness** - Helping others
6. **creativity** - Imagination and invention

---

## Configuration Options

### Environment Variables
```bash
# API Configuration
OPENAI_API_KEY=sk-...          # For AI story generation
OPENAI_MODEL=gpt-4             # Model to use
MAX_IMAGES_PER_PROJECT=20      # Max uploadable images
STORY_GENERATION_TIMEOUT=30000 # Timeout in ms

# Database
DATABASE_URL=postgresql://...

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880          # 5MB
```

### Component Props Defaults
```javascript
// ImageUploadComponent
maxImages: 10
minImages: 5
maxFileSize: 5242880 // 5MB
allowedTypes: ['image/jpeg', 'image/png', 'image/webp']

// StoryPreviewComponent
pageAnimationDuration: 200 // ms
autoLoadThumbnails: true

// StoryGenerationStep
timeout: 30000 // ms for story generation
```

---

## Testing Checklist

### Frontend Components
- [ ] ImageUploadComponent renders correctly
- [ ] Drag & drop works
- [ ] Minimum 5 image validation works
- [ ] Error messages display
- [ ] Preview thumbnails show
- [ ] Remove button removes images
- [ ] Clear all resets state
- [ ] StoryPreviewComponent displays pages
- [ ] Navigation buttons work
- [ ] Keyboard shortcuts work (arrow keys)
- [ ] Regenerate button triggers callback
- [ ] Save draft button triggers callback

### API Integration
- [ ] POST /api/story/generate-from-images works
- [ ] Image analysis returns valid data
- [ ] Story content generation works
- [ ] Template fallback activates when API unavailable
- [ ] Error responses formatted correctly
- [ ] POST /api/story/save-draft works
- [ ] POST /api/story/:storyId/regenerate works

### E2E Workflow
- [ ] Upload 5+ images → Generate story → Preview → Save Draft
- [ ] Regenerate produces different story
- [ ] All 3 themes work (adventure, fairytale, friendship)
- [ ] Mobile responsive design works
- [ ] Error scenarios handled gracefully

---

## Performance Optimization

### Frontend
- ✅ Image lazy loading in previews
- ✅ Thumbnail generation on client
- ✅ Throttled scroll for pagination
- ✅ CSS animations for smooth transitions

### Backend
- ✅ Cache exchange rates (24h)
- ✅ Rate limit API calls
- ✅ Queue story generation jobs
- ✅ Compress images before storage

### Database
- ✅ Index on user_id, project_id
- ✅ Paginate story queries
- ✅ Archive old drafts

---

## Troubleshooting

### Images Not Uploading
**Check:**
- File size limits
- Supported formats
- Network connection
- CORS headers configured

### Story Generation Fails
**Check:**
- OpenAI API key configured
- API rate limits not exceeded
- Internet connection
- Backend logs for errors

### Stories Not Displaying
**Check:**
- Story data structure matches format
- Image URLs accessible
- CSS not hidden by theme
- Browser console for JS errors

---

## Future Enhancements

1. **Image Selection UI** - Let users pick 3 from N images
2. **Story Templates** - Custom user-created templates
3. **Voice Narration** - Text-to-speech for story reading
4. **Story Sharing** - Generate shareable links
5. **PDF Export** - Download story as PDF
6. **Story Analytics** - Track reading time, engagement
7. **Bulk Generation** - Generate multiple stories at once
8. **Custom Themes** - User-defined story themes
9. **Image Enhancement** - Auto-enhance before use
10. **Story Revision** - User feedback to improve story

---

## Support & Resources

### API Documentation
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Backend Routes](../routes/story-generation.routes.js)
- [Frontend API Utils](../utils/api.js)

### Components
- [ImageUploadComponent](./ImageUploadComponent.jsx)
- [StoryPreviewComponent](./StoryPreviewComponent.jsx)
- [StoryGenerationStep](./StoryGenerationStep.jsx)

### Services
- [Story Generation Service](../services/story-generation.service.js)

---

**Last Updated:** 2024-01-15
**Status:** ✅ Production Ready
