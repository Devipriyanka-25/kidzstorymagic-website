# Face Swap Usage Guide

## Quick Setup

### 1. Get DeepAI API Key
- Go to https://deepai.org/account/profile
- Sign up (free)
- Copy API key

### 2. Add to Environment
```bash
vercel env add DEEPAI_API_KEY
# Paste your key
vercel deploy --prod
```

### 3. Use in Component

```jsx
import { faceSwapAPI } from '@/utils/faceSwapAPI';

// Single page
const result = await faceSwapAPI.swapFaceDeepAI(
  'https://example.com/face.jpg',
  'https://example.com/story-illustration.jpg',
  { childName: 'Emma', pageNumber: 1 }
);

// Multiple pages
const batchResult = await faceSwapAPI.swapFaceForStoryPages(
  'https://example.com/face.jpg',
  storyPages, // array with illustrationUrl or image property
  { childName: 'Emma' }
);

// Access swapped images
batchResult.pages.forEach(page => {
  if (page.faceSwapped) {
    console.log(`Page ${page.pageNumber}: ${page.swappedImageUrl}`);
  }
});
```

## API Reference

### `swapFaceDeepAI(faceImageUrl, illustrationImageUrl, options)`

Swap face from one image into another.

**Parameters:**
- `faceImageUrl` (string): URL of the face photo
- `illustrationImageUrl` (string): URL of the story illustration
- `options` (object): Additional parameters
  - `childName` (string): Child's name
  - `pageNumber` (number): Page number
  - `storyId` (string): Story ID
  - `photoId` (string): Photo ID

**Returns:**
```javascript
{
  swappedImageUrl: "https://...",
  predictionId: "...",
  model: "deepai-face-swap",
  processedAt: "2024-04-23T10:30:00Z"
}
```

### `swapFaceForStoryPages(faceImageUrl, pages, options)`

Process multiple story pages with face swap.

**Parameters:**
- `faceImageUrl` (string): URL of the face photo
- `pages` (array): Story pages with `illustrationUrl` or `image`
- `options` (object): Additional parameters
  - `childName` (string): Child's name
  - Other options pass through to swapFaceDeepAI

**Returns:**
```javascript
{
  pages: [ /* pages with swappedImageUrl or error */ ],
  successCount: 18,
  errorCount: 2,
  totalPages: 20,
  status: "partial"
}
```

## Integration Example

```jsx
import { useState } from 'react';
import { faceSwapAPI } from '@/utils/faceSwapAPI';
import StoryPreviewComponent from './StoryPreviewComponent';

export default function StoryPreview({ story, faceImageUrl }) {
  const [pages, setPages] = useState(story.pages);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleApplyFaceSwap = async () => {
    setProcessing(true);
    setProgress(0);

    try {
      // Start face swap batch processing
      const result = await faceSwapAPI.swapFaceForStoryPages(
        faceImageUrl,
        pages,
        { childName: story.childName }
      );

      // Update pages with swapped images
      setPages(result.pages);
      setProgress(100);

      console.log(`✓ Face swap complete: ${result.successCount}/${result.totalPages}`);
    } catch (error) {
      console.error('Face swap failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <button onClick={handleApplyFaceSwap} disabled={processing}>
        {processing ? `Processing... ${progress}%` : 'Apply Face Swap'}
      </button>

      <StoryPreviewComponent 
        story={{ ...story, pages }} 
        isProcessing={processing}
      />
    </>
  );
}
```

## Pricing

- **Cost per swap**: $0.05
- **Free credits**: $5-10 for new accounts
- **Rate limit**: 1 request/second
- **Max batch**: ~100 pages per story (recommended)

## Error Handling

```javascript
try {
  const result = await faceSwapAPI.swapFaceDeepAI(faceUrl, illustUrl);
} catch (error) {
  if (error.message.includes('not configured')) {
    console.log('Add DEEPAI_API_KEY to environment');
  } else if (error.message.includes('rate limit')) {
    console.log('Wait a moment and try again');
  } else {
    console.log('Face swap failed:', error.message);
  }
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "DEEPAI_API_KEY not configured" | Add API key to Vercel env vars |
| "Face not detected" | Use clear, well-lit face photo |
| "Rate limit exceeded" | Reduce batch size or add delay |
| "Invalid image URL" | Ensure URL is publicly accessible |
| "Processing timed out" | DeepAI takes ~10-30 seconds per image |

## Next Steps

1. ✅ Get DeepAI API key
2. ✅ Add to Vercel environment
3. ✅ Test `swapFaceDeepAI()` with sample images
4. ✅ Integrate `swapFaceForStoryPages()` into story preview
5. ✅ Show progress bar during batch processing
6. ✅ Allow user to enable/disable face swap toggle
7. ✅ Cache swapped images for performance
