# Face Swap Pipeline Integration Guide

## Overview

This guide explains how to integrate face swap functionality into the story generation pipeline, so that when children upload photos and generate stories, their faces are automatically embedded into the cartoon characters.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORY GENERATION PIPELINE                    │
└─────────────────────────────────────────────────────────────────┘

1️⃣  CHILD PHOTO UPLOAD
    ├─ User uploads child's photo
    ├─ Photo validation (size, format, face detection)
    └─ Photo stored/referenced for later use

2️⃣  GENERATE CARTOON SCENE
    ├─ Use Stable Diffusion/SDXL via Replicate
    ├─ Generate illustrated character matching child description
    ├─ Each page generates unique scene/outfit progression
    └─ Output: High-quality cartoon illustration

3️⃣  RUN FACE SWAP ⭐ NEW
    ├─ Take child's photo (source)
    ├─ Take generated cartoon illustration (target)
    ├─ Use DeepAI or Replicate face swap API
    ├─ Embed child's facial features onto cartoon
    └─ Output: Cartoon with child's face

4️⃣  COMPOSE FINAL IMAGE
    ├─ Add story text overlays
    ├─ Format page layout
    ├─ Add page numbers/decorations
    └─ Output: Ready-to-print page

5️⃣  SHOW IN PREVIEW
    ├─ Display all pages
    ├─ Allow user to review before purchase
    ├─ Enable PDF generation
    └─ Process checkout
```

## Current Implementation Status

### ✅ Already Implemented
- Photo upload component (`components/FaceSwapComponent.jsx`)
- Face detection endpoint (`/api/photos/detect-face`)
- Face swap API endpoint (`/api/photos/face-swap`)
- Illustration generation (`/api/generate-story-page`)
- Story preview UI

### 🆕 New Integration Point
- **Story generation pipeline orchestration** (`lib/storyGenerationPipeline.ts`)
- **Automatic face swap application** during story generation

### 🔄 Integration Steps

## Step 1: Update Story Generation Request

When calling story generation, include:

```typescript
interface StoryGenerationRequest {
  projectId: string;
  childName: string;
  childAge: number;
  theme: string;
  childPhotoUrl: string;        // ⭐ Child's uploaded photo
  enableFaceSwap: boolean;       // ⭐ Enable face swap processing
  pageCount: number;
}
```

## Step 2: Call Updated Pipeline

```typescript
import { generateStoryWithFaceSwap } from '@/lib/storyGenerationPipeline';

// In your wizard component or checkout page
const generatedStory = await generateStoryWithFaceSwap({
  projectId: 'story_123',
  childName: 'Emma',
  childAge: 6,
  theme: 'fairy-tale',
  childPhotoUrl: 'https://..../uploaded-photo.jpg',
  enableFaceSwap: true,
  pageCount: 12,
});

// Access results
generatedStory.pages.forEach(page => {
  console.log('Page', page.pageNumber);
  console.log('Original illustration:', page.illustrationUrl);
  console.log('Face-swapped version:', page.faceSwappedUrl);
});
```

## Step 3: API Endpoint Integration

### POST `/api/story/generate-with-faceswap` (NEW)

```json
{
  "projectId": "story_abc123",
  "childName": "Emma",
  "childAge": 6,
  "theme": "fairy-tale",
  "childPhotoUrl": "https://storage.example.com/photos/emma.jpg",
  "enableFaceSwap": true,
  "pageCount": 12,
  "userId": "user_xyz789"
}
```

**Response:**

```json
{
  "success": true,
  "story": {
    "id": "story_abc123",
    "projectId": "story_abc123",
    "childName": "Emma",
    "title": "Emma's Fairy Tale Adventure",
    "status": "ready",
    "pages": [
      {
        "pageNumber": 1,
        "title": "Once Upon a Time",
        "content": "Emma discovered a magical portal...",
        "illustrationUrl": "https://..../illustration-1.jpg",
        "faceSwappedUrl": "https://..../illustration-1-faceswap.jpg",
        "pageType": "cover"
      },
      {
        "pageNumber": 2,
        "title": "The Enchanted Forest",
        "content": "Emma walked through the forest...",
        "illustrationUrl": "https://..../illustration-2.jpg",
        "faceSwappedUrl": "https://..../illustration-2-faceswap.jpg",
        "pageType": "story"
      }
      // ... more pages
    ],
    "createdAt": "2026-04-28T10:30:00Z"
  }
}
```

## Step 4: Component Integration

### Update Step 6 (Review & Checkout)

```jsx
// components/wizard/Step6ReviewCheckout.jsx
import { generateStoryWithFaceSwap } from '@/lib/storyGenerationPipeline';

export default function Step6ReviewCheckout({ formData, uploadedPhotoUrl }) {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateStory = async () => {
    setLoading(true);
    try {
      const generatedStory = await generateStoryWithFaceSwap({
        projectId: formData.projectId,
        childName: formData.childName,
        childAge: formData.childAge,
        theme: formData.theme,
        childPhotoUrl: uploadedPhotoUrl, // ⭐ Pass the uploaded photo
        enableFaceSwap: formData.enableFaceSwap ?? true, // Default to enabled
        pageCount: formData.pageCount || 12,
      });

      setStory(generatedStory);
    } catch (error) {
      console.error('Story generation failed:', error);
      // Show error UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-preview">
      <button onClick={handleGenerateStory} disabled={loading}>
        {loading ? 'Generating with Face Swap...' : 'Preview Story'}
      </button>

      {story && (
        <div className="pages-preview">
          {story.pages.map(page => (
            <div key={page.pageNumber} className="page">
              {/* Show face-swapped image */}
              <img 
                src={page.faceSwappedUrl || page.illustrationUrl} 
                alt={page.title} 
              />
              <h3>{page.title}</h3>
              <p>{page.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Face Swap API Details

### Source & Target Images

**Source Image** (Child's Photo)
- What: Real photograph of the child
- From: User upload (`childPhotoUrl`)
- Format: JPG, PNG, or data URL

**Target Image** (Cartoon Illustration)  
- What: Generated cartoon character
- From: Replicate SDXL output (`illustrationUrl`)
- Format: JPG URL

### Face Swap Providers

#### Option 1: DeepAI (Current)
- **Endpoint**: `/api/photos/face-swap`
- **Model**: DeepAI Face Swap API
- **Cost**: ~$0.005-0.01 per swap
- **Speed**: 5-15 seconds
- **Quality**: Good, natural-looking results

#### Option 2: Replicate (Alternative)
- **Model**: `strmoder/roop`
- **Cost**: ~$0.10 per swap
- **Speed**: 30-60 seconds
- **Quality**: Excellent, very high-quality results

## Error Handling & Fallbacks

```typescript
// If face swap fails, use original illustration
if (!page.faceSwappedUrl) {
  // Fallback to non-swapped illustration
  console.warn(`Face swap failed for page ${page.pageNumber}, using original`);
  displayImage = page.illustrationUrl;
}

// If photo URL invalid or not provided
if (!request.childPhotoUrl || !request.enableFaceSwap) {
  // Generate story without face swap
  console.log('Face swap disabled or no photo provided');
  skipFaceSwap = true;
}
```

## Performance Optimization

### Batch Processing
```typescript
// Process multiple pages in parallel
const faceSwappedPages = await Promise.all(
  pages.map(page => applyFaceSwapToPage(page, childPhotoUrl))
);
```

### Caching
```typescript
// Cache results per child
const cacheKey = `faceswap-${childId}-${pageNumber}`;
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### Timeout Handling
```typescript
// Set timeouts for long-running operations
const timeout = 2 * 60 * 1000; // 2 minutes per page
const result = await Promise.race([
  faceSwapPromise,
  timeoutPromise(timeout)
]);
```

## Database Schema Updates

### Add to `stories` table:

```sql
ALTER TABLE stories ADD COLUMN face_swap_enabled BOOLEAN DEFAULT true;
ALTER TABLE stories ADD COLUMN child_photo_url VARCHAR(500);

-- Track face swap status per page
CREATE TABLE story_face_swaps (
  id SERIAL PRIMARY KEY,
  story_id VARCHAR(100),
  page_number INT,
  original_illustration_url VARCHAR(500),
  face_swapped_url VARCHAR(500),
  face_swap_model VARCHAR(50), -- 'deepai' or 'replicate'
  swap_status VARCHAR(20), -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id)
);
```

## Testing Checklist

- [ ] Photo upload works and validates face detection
- [ ] Illustration generation creates cartoon character
- [ ] Face swap API processes photos correctly
- [ ] Face-swapped image matches child's features
- [ ] Fallback works if face swap fails
- [ ] All 12+ pages generate with face swap
- [ ] PDF export includes face-swapped images
- [ ] Performance acceptable (no timeouts)
- [ ] Mobile view displays face-swapped previews
- [ ] Error messages are user-friendly

## User Experience Flow

```
1. User uploads child photo
   ↓ (Face detection runs)
   ✓ "Face detected! Ready for personalization"

2. User selects theme and generates story
   ↓ (Shows progress: "Generating illustrations...")
   ✓ "Generating illustrations" → 50%
   ✓ "Applying face swap" → 75%
   ✓ "Composing final pages" → 100%

3. Preview shows:
   - Cartoon character with child's face
   - Full story with all pages
   - "Ready to purchase?" option

4. User can:
   - Download PDF with face-swapped pages
   - Share on social media
   - Purchase physical book
```

## Monitoring & Analytics

Track these metrics:

```typescript
// Success rate
success_rate = successful_face_swaps / total_face_swaps

// Average processing time per page
avg_time_per_page = total_time / page_count

// User satisfaction
- "Face looks accurate?" (1-5 rating)
- "Would you recommend?" (Yes/No)
```

## Troubleshooting

### Face swap produces low-quality results
- **Cause**: Original photo has poor lighting or angle
- **Solution**: Request better quality photo or different angle

### Face swap times out
- **Cause**: DeepAI API overloaded
- **Solution**: Switch to Replicate or add retry logic

### Face not detected
- **Cause**: Photo doesn't contain a clear face
- **Solution**: Reject photo and ask user to reupload

### Cartoon character doesn't match child's appearance
- **Cause**: Illustration prompt didn't match child description
- **Solution**: Improve prompt with more specific child details

## Future Enhancements

- [ ] Multiple face options (different expressions)
- [ ] Face customization (adjust positioning, size)
- [ ] Batch generate multiple stories simultaneously
- [ ] Video face swap for animated stories
- [ ] AR preview with real phone camera
- [ ] AI styling (apply child's fashion taste to character)
