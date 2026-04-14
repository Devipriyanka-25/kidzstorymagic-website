# Photo Upload API - Quick Reference

## Frontend Usage

### Basic Upload with Progress

```javascript
import { photoUploadAPI } from '@/utils/photoUploadAPI';

// Upload photo with progress tracking
const response = await photoUploadAPI.uploadPhoto(
  projectId,
  fileObject,
  (progress) => {
    console.log(`Upload: ${progress}%`);
  }
);

// Response
{
  success: true,
  data: {
    projectId,
    fileId,
    facesDetected: 1,
    urls: {
      original,
      blurred,
      watermarked
    }
  }
}
```

### File Validation

```javascript
import { photoValidation } from '@/utils/photoUploadAPI';

// Validate before upload
const validation = photoValidation.validateFile(file);
if (!validation.valid) {
  console.error(validation.error); // "File type not supported"
}

// Get file info
const info = photoValidation.getFileInfo(file);
// { name, type, size, sizeInMB, lastModified }

// Get preview URL
const preview = await photoValidation.getPreviewUrl(file);
// data:image/jpeg;base64,...
```

### Get Photo Preview

```javascript
const response = await photoUploadAPI.getPhotoPreview(projectId);

// Response
{
  success: true,
  data: {
    previewUrl: "https://...?sv=...", // Fresh SAS URL
    metadata: {
      fileId,
      facesDetected,
      uploadedAt
    },
    previewUrlExpiry
  }
}
```

### Delete Photo

```javascript
const response = await photoUploadAPI.deletePhoto(projectId);

// Response
{ success: true, message: "Photo deleted successfully" }
```

### Progress Utilities

```javascript
import { photoUploadProgress } from '@/utils/photoUploadAPI';

// Format progress
photoUploadProgress.formatProgress(75);        // "75%"

// Get status message
photoUploadProgress.getStatusMessage(25);      // "Uploading..."
photoUploadProgress.getStatusMessage(50);      // "Processing image..."
photoUploadProgress.getStatusMessage(90);      // "Finalizing..."

// Estimate remaining time
const elapsed = Date.now() - startTime;
const estimate = photoUploadProgress.estimateRemainingTime(progress, elapsed);
// "~5s", "~2m", etc.
```

## Backend Usage

### Image Processing

```javascript
const { ImageProcessingService } = require('./services/imageProcessing');

// Process image: crop -> blur -> watermark
const processed = await ImageProcessingService.processImage(
  imageBuffer,
  faceRegions, // [{x, y, w, h}, ...]
  {
    cropWidth: 800,
    cropHeight: 1000,
    blurRadius: 30,
    watermarkText: 'PREVIEW'
  }
);

// Returns: { original, blurred, watermarked: Buffer }
```

### Face Detection

```javascript
const { getAzureVisionService } = require('./services/azureVision');

const vision = getAzureVisionService();

// Detect faces
const faces = await vision.detectFaces(imageBuffer);
// [{x: 100, y: 50, w: 150, h: 200, confidence: 0.95, age: 8, gender: 'male'}, ...]

// Analyze image
const analysis = await vision.analyzeImage(imageBuffer);
// { faceCount, color: {...}, description, objects: [...], tags: [...] }

// Describe image
const description = await vision.describeImage(imageBuffer);
// { captions: [...], tags: [...] }

// Extract text
const ocr = await vision.extractText(imageBuffer);
// { fullText: "...", regions: [...] }
```

### Azure Blob Storage

```javascript
const { getAzureBlobService } = require('./services/azureBlob');

const blob = getAzureBlobService();

// Upload processed images
const urls = await blob.uploadProcessedImages(
  {
    original: imageBuffer,
    blurred: blurredBuffer,
    watermarked: watermarkedBuffer
  },
  projectId,
  {
    fileId,
    facesDetected: 1,
    uploadedAt: new Date().toISOString()
  }
);

// Returns: { original: "https://...", blurred: "...", watermarked: "..." }

// Generate SAS URL
const sasUrl = await blob.generateSasUrl(blobName, 60); // 1 hour
// "https://...?sv=...&sig=...&se=..."

// Get blob properties
const props = await blob.getBlobProperties(blobName);

// Delete blob
await blob.deleteBlob(blobName);

// List blobs
const blobs = await blob.listBlobs(`${projectId}/`);
```

## API Routes

### Upload Photo

```
POST /api/story/:projectId/upload-photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  photo: <binary file>

Success (200):
{
  success: true,
  data: {
    projectId, fileId, facesDetected,
    urls: { original, blurred, watermarked }
  }
}

Error (400/401/404/500):
{
  success: false,
  message: "...",
  error: "...",
  details: "..."
}
```

### Get Preview

```
GET /api/story/:projectId/photo-preview
Authorization: Bearer <token>

Success (200):
{
  success: true,
  data: {
    previewUrl: "https://...?sv=...",
    metadata: { fileId, facesDetected, uploadedAt },
    previewUrlExpiry: "2024-01-15T11:30:00Z"
  }
}
```

### Delete Photo

```
DELETE /api/story/:projectId/photo
Authorization: Bearer <token>

Success (200):
{
  success: true,
  message: "Photo deleted successfully"
}
```

## Error Handling

### Frontend Error Pattern

```javascript
try {
  const response = await photoUploadAPI.uploadPhoto(projectId, file);
  // Use response.data
} catch (error) {
  // error = { message, error, details }
  console.error(error.message);
  // "Photo upload failed"
  
  console.error(error.error);
  // "File type not supported"
  
  console.error(error.details);
  // Stack trace in development
}
```

### Backend Error Pattern

```javascript
// Error logging
console.error('[PHOTO_UPLOAD_ERROR] Upload failed:', error);
console.error('[AZURE_VISION_ERROR] Face detection failed:', error);
console.error('[AZURE_BLOB_ERROR] Upload failed:', error);

// Error response
res.status(500).json({
  success: false,
  message: 'Photo upload failed',
  error: error.message,
  details: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
```

## Common Patterns

### Upload with Validation

```javascript
const { photoValidation, photoUploadAPI } = require('@/utils/photoUploadAPI');

// In component
const handleFileSelect = (file) => {
  const validation = photoValidation.validateFile(file);
  if (!validation.valid) {
    setError(validation.error);
    return;
  }

  handleUpload(file);
};

const handleUpload = async (file) => {
  try {
    const response = await photoUploadAPI.uploadPhoto(projectId, file);
    setSuccess('Photo uploaded successfully!');
  } catch (error) {
    setError(error.message);
  }
};
```

### Progress Display

```javascript
const [progress, setProgress] = useState(0);
const [startTime] = useState(Date.now());

const handleUpload = async (file) => {
  await photoUploadAPI.uploadPhoto(projectId, file, (p) => {
    setProgress(p);
  });
};

// In render
<p>{photoUploadProgress.formatProgress(progress)}</p>
<p>{photoUploadProgress.getStatusMessage(progress)}</p>
<p>{photoUploadProgress.estimateRemainingTime(progress, Date.now() - startTime)}</p>
```

### Retry Logic

```javascript
const retryUpload = async (projectId, file, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await photoUploadAPI.uploadPhoto(projectId, file);
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }
};
```

## Testing Examples

### Test File Upload

```bash
# Create test image
ffmpeg -f lavfi -i color=c=blue:s=800x1000 -frames:v 1 test.jpg

# Upload using curl
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "photo=@test.jpg" \
  http://localhost:5000/api/story/PROJECT_ID/upload-photo
```

### Test Face Detection

```javascript
// Mock multiple faces
const mockFaceRegions = [
  { x: 100, y: 50, w: 150, h: 200, confidence: 0.95 },
  { x: 400, y: 80, w: 140, h: 190, confidence: 0.92 }
];

const result = await ImageProcessingService.processImage(
  imageBuffer,
  mockFaceRegions
);
// Should blur both faces
```

## Environment Variables

```bash
# Storage
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_ACCOUNT_NAME=...
AZURE_STORAGE_CONTAINER=story-images

# Vision API
AZURE_VISION_ENDPOINT=https://region.api.cognitive.microsoft.com/
AZURE_VISION_API_KEY=...

# Processing
IMAGE_CROP_WIDTH=800
IMAGE_CROP_HEIGHT=1000
IMAGE_BLUR_RADIUS=30
IMAGE_UPLOAD_MAX_SIZE=52428800

# SAS
SAS_URL_EXPIRY_MINUTES=60
```

## Logging Reference

### Success Logs
- `[PHOTO_UPLOAD] Starting upload for project {projectId}`
- `[PHOTO_UPLOAD] Face detection completed: {count} faces found`
- `[PHOTO_UPLOAD] Images uploaded successfully`

### Warning Logs
- `[PHOTO_UPLOAD_WARN] Face detection failed, proceeding without blur`

### Error Logs
- `[PHOTO_UPLOAD_ERROR] No file provided`
- `[AZURE_VISION_ERROR] Face detection failed`
- `[AZURE_BLOB_ERROR] Upload failed`
- `[PHOTO_DELETE_ERROR] Failed to delete photo`

---

**Quick Links**
- Full Guide: `backend/src/PHOTO_UPLOAD_GUIDE.md`
- Setup Checklist: `PHOTO_UPLOAD_SETUP_CHECKLIST.md`
- Frontend Component: `frontend/components/wizard/Step5PhotoUpload.jsx`
- API Utilities: `frontend/utils/photoUploadAPI.js`
