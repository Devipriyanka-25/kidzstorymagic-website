# Photo Upload Pipeline Implementation Guide

## Overview

The photo upload pipeline is a complete end-to-end system for handling child photos in the Kidz Story Magic application. It includes:

- **Frontend**: Photo selection, validation, progress tracking, and preview display
- **Backend Services**: Image processing, face detection, and cloud storage
- **Cloud Integration**: Azure Blob Storage for image storage and Azure Vision API for face detection

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js/React)                    │
│                                                                 │
│  Step5PhotoUpload.jsx                                           │
│  ├─ File selection & validation (photoValidation)               │
│  ├─ Local preview generation                                    │
│  └─ Upload with progress tracking                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │ POST /api/story/:projectId/upload-photo
                           │ (multipart/form-data)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Express Server                       │
│                                                                 │
│  photoUpload.js (Routes)                                        │
│  ├─ POST /upload-photo                                          │
│  ├─ GET /photo-preview                                          │
│  └─ DELETE /photo                                               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌────────────────┐ ┌─────────────┐ ┌──────────────────┐
│ ImageProcessing│ │ AzureVision │ │  AzureBlob       │
│   Service      │ │   Service   │ │  Service         │
├────────────────┤ ├─────────────┤ ├──────────────────┤
│ autoCropToCenter│ │detectFaces()│ │uploadBlob()      │
│ applyFaceBlur()│ │analyzeImage │ │generateSasUrl()  │
│addDiagonalWater│ │describeImage│ │uploadProcessed()│
│processImage()  │ │extractText()│ │deleteBlob()      │
└────────────────┘ └─────────────┘ └──────────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
  ┌─────────────────┐              ┌──────────────────────┐
  │ PostgreSQL      │              │ Azure Blob Storage   │
  │                 │              │                      │
  │ story_projects  │              │ /story-images/:      │
  │ ├─ photo_url    │              │  ├─ original.jpg     │
  │ ├─ preview_url  │              │  ├─ blurred.jpg      │
  │ ├─ processed_url│              │  └─ watermarked.jpg  │
  │ └─ photo_meta   │              │                      │
  └─────────────────┘              └──────────────────────┘
```

## Backend Services

### 1. imageProcessing.js

Handles image manipulation using Sharp.js library.

**Key Methods:**

- `autoCropToCenter(imageBuffer, width=800, height=1000)` - Crops image to center, maintains 4:5 aspect ratio
- `applyFaceBlur(imageBuffer, faceRegions[], blurRadius=30)` - Applies Gaussian blur to detected face regions
- `addDiagonalWatermark(imageBuffer, watermarkText, opacity)` - Adds SVG-based diagonal watermark
- `processImage(imageBuffer, faceRegions[], options)` - Complete pipeline: crop → blur → watermark
- `adjustCoordinatesToCropedImage(faceRegions, originalBuffer, targetW, targetH)` - Recalculates face coordinates after cropping/resizing

**Usage:**

```javascript
const ImageProcessingService = require('./services/imageProcessing');

const processedImages = await ImageProcessingService.processImage(
  imageBuffer,           // File buffer
  faceRegions,           // Array of {x, y, w, h} from face detection
  {
    cropWidth: 800,
    cropHeight: 1000,
    blurRadius: 30,
    watermarkText: 'PREVIEW'
  }
);

// Returns: { blurred, watermarked }
```

### 2. azureVision.js

Integrates with Azure Computer Vision API for face detection.

**Key Methods:**

- `detectFaces(imageBuffer)` - Detects faces and returns rectangles
- `detectFacesFromUrl(imageUrl)` - Detects faces from URL
- `analyzeImage(imageBuffer)` - Full image analysis (faces, objects, colors, tags, etc.)
- `describeImage(imageBuffer, maxCaptions)` - Image description with captions
- `extractText(imageBuffer)` - OCR text extraction
- `detectObjects(imageBuffer)` - Object detection
- `getVisualFeatures(imageBuffer)` - Extract visual features

**Usage:**

```javascript
const { getAzureVisionService } = require('./services/azureVision');

const visionService = getAzureVisionService();
const faceRegions = await visionService.detectFaces(imageBuffer);

// Returns: Array of { x, y, w, h, confidence, age, gender }
```

### 3. azureBlob.js

Handles image storage and retrieval from Azure Blob Storage.

**Key Methods:**

- `uploadBlob(buffer, fileName, metadata)` - Upload single blob
- `uploadProcessedImages(images, projectId, metadata)` - Upload batch (original, blurred, watermarked)
- `generateSasUrl(blobName, expiryMinutes)` - Generate temporary access URLs
- `deleteBlob(blobName)` - Delete blob
- `downloadBlob(blobName)` - Download blob
- `getBlobProperties(blobName)` - Get metadata
- `listBlobs(prefix)` - List blobs with prefix

**Usage:**

```javascript
const { getAzureBlobService } = require('./services/azureBlob');

const blobService = getAzureBlobService();

// Upload processed images
const urls = await blobService.uploadProcessedImages(
  {
    original: imageBuffer,
    blurred: blurredBuffer,
    watermarked: watermarkedBuffer
  },
  projectId,
  metadata
);

// Generate SAS URL
const sasUrl = await blobService.generateSasUrl(blobName, 60); // 1 hour
```

## API Endpoints

### POST /api/story/{projectId}/upload-photo

Upload and process a child photo.

**Request:**
- Method: `POST`
- Auth: Required (Bearer token)
- Content-Type: `multipart/form-data`
- Body:
  - `photo` (file): JPEG, PNG, or WebP image (max 50MB)

**Response (Success):**
```json
{
  "success": true,
  "message": "Photo uploaded and processed successfully",
  "data": {
    "projectId": "uuid",
    "fileId": "uuid",
    "facesDetected": 1,
    "faceRegions": [
      { "x": 100, "y": 50, "w": 150, "h": 200, "confidence": 0.95 }
    ],
    "urls": {
      "original": "https://...",
      "blurred": "https://...",
      "watermarked": "https://..."
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Photo upload failed",
  "error": "File type not supported",
  "details": "..."
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Invalid file or parameters
- `401` - Unauthorized
- `404` - Project not found
- `500` - Server error

### GET /api/story/{projectId}/photo-preview

Get photo preview with fresh SAS URL.

**Request:**
- Method: `GET`
- Auth: Required (Bearer token)

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "previewUrl": "https://...?sv=...",
    "metadata": {
      "fileId": "uuid",
      "facesDetected": 1,
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    "previewUrlExpiry": "2024-01-15T11:30:00Z"
  }
}
```

### DELETE /api/story/{projectId}/photo

Delete uploaded photo and all processed versions.

**Request:**
- Method: `DELETE`
- Auth: Required (Bearer token)

**Response (Success):**
```json
{
  "success": true,
  "message": "Photo deleted successfully"
}
```

## Frontend Integration

### photoUploadAPI.js

Utility functions for photo upload operations.

**Functions:**

```javascript
import { photoUploadAPI, photoValidation, photoUploadProgress } from '@/utils/photoUploadAPI';

// Upload photo with progress
await photoUploadAPI.uploadPhoto(projectId, file, (progress) => {
  console.log(`Upload progress: ${progress}%`);
});

// Validate file
const validation = photoValidation.validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
}

// Get file info
const info = photoValidation.getFileInfo(file);

// Get preview URL
const preview = await photoValidation.getPreviewUrl(file);

// Get photo preview
await photoUploadAPI.getPhotoPreview(projectId);

// Delete photo
await photoUploadAPI.deletePhoto(projectId);

// Progress utilities
photoUploadProgress.formatProgress(75);        // "75%"
photoUploadProgress.getStatusMessage(50);      // "Processing image..."
photoUploadProgress.estimateRemainingTime(50, 5000); // "~5s"
```

### Step5PhotoUpload Component

Enhanced wizard step for photo upload with:

- File selection with drag-and-drop
- Local preview generation
- Upload with progress tracking
- Face detection feedback
- Processed preview display
- Error handling
- Privacy information

**Features:**

- Accepts JPEG, PNG, WebP images up to 50MB
- Shows upload progress percentage and status
- Displays face detection count
- Shows before/after preview (original vs. blurred)
- Graceful error handling with user-friendly messages
- Responsive design

## Environment Configuration

Add to `.env` or `.env.local`:

```
# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_ACCOUNT_NAME=your-account
AZURE_STORAGE_CONTAINER=story-images

# Azure Vision API
AZURE_VISION_ENDPOINT=https://region.api.cognitive.microsoft.com/
AZURE_VISION_API_KEY=your-key

# Image Processing
IMAGE_UPLOAD_MAX_SIZE=52428800
IMAGE_CROP_WIDTH=800
IMAGE_CROP_HEIGHT=1000
IMAGE_BLUR_RADIUS=30
```

## Database Schema

### story_projects Table Updates

```sql
ALTER TABLE story_projects ADD COLUMN IF NOT EXISTS
  child_photo_url VARCHAR(500),
  child_photo_preview_url VARCHAR(500),
  child_photo_processed_url VARCHAR(500),
  photo_metadata JSONB;
```

**Columns:**
- `child_photo_url` - Original uploaded photo URL
- `child_photo_preview_url` - Blurred (privacy-protected) preview URL
- `child_photo_processed_url` - Watermarked version URL
- `photo_metadata` - JSONB with: fileId, facesDetected, faceRegions, uploadedAt, originalFileName

## Error Handling

The system handles various error cases:

### File Validation Errors
- Invalid MIME type
- File size exceeds limit
- Missing file

### Face Detection Errors
- API timeout
- Invalid image format
- Network error

**Graceful Handling:** If face detection fails, the system continues without blur and just applies watermark.

### Upload Errors
- Authentication failure (401)
- Project not found (404)
- Storage quota exceeded
- Azure service unavailable

**Retry Logic:** The backend automatically retries Azure operations with exponential backoff.

## Performance Considerations

### Image Processing
- Original image: 3000x3750px (for high-quality illustrations)
- Processed versions: 800x1000px (optimized for preview)
- Blur radius: 30px (balance between privacy and file size)
- Watermark opacity: 0.3 (subtle overlay)

### Upload Performance
- Max file size: 50MB (accommodates high-res cameras)
- Chunked upload with progress tracking
- Parallel processing of crop/blur/watermark
- SAS URL expiration: 60 minutes default, 7 days for previews

### Azure Optimization
- Connection pooling for Vision API
- Blob storage region selection
- CDN integration for image delivery
- SAS URL caching to reduce API calls

## Security Considerations

### Privacy Protection
- Automatic face blur on detected faces
- Diagonal watermark on preview photos
- All URLs include SAS tokens with expiration
- Original photos stored securely in Azure

### Access Control
- Authentication required for all endpoints
- Project ownership verification
- User can only access own photos
- SAS URLs expire after time limit

### Data Protection
- HTTPS/TLS for all communications
- Azure managed encryption at rest
- Secure token storage in localStorage
- No sensitive data in logs

## Troubleshooting

### Common Issues

**Issue: "Face detection failed"**
- Solution: Continue with watermark, user doesn't need face blur
- Cause: Azure Vision API timeout or invalid image
- Log: [PHOTO_UPLOAD_WARN] Face detection failed

**Issue: "SAS URL expired"**
- Solution: Request fresh URL via GET /photo-preview
- Cause: SAS URL lifetime exceeded
- Solution: URLs auto-refresh on next request

**Issue: "File too large"**
- Solution: Compress image or reduce resolution
- Cause: File exceeds 50MB limit
- See: photoValidation.validateFile()

**Issue: "Invalid image format"**
- Solution: Use JPEG, PNG, or WebP only
- Cause: Unsupported MIME type
- See: Backend fileFilter in multer config

## Testing

### Manual Testing

1. **Photo Upload Flow**
   ```bash
   # 1. Create project
   POST /api/story/create
   
   # 2. Upload photo
   POST /api/story/:projectId/upload-photo
   
   # 3. Get preview
   GET /api/story/:projectId/photo-preview
   
   # 4. Delete photo
   DELETE /api/story/:projectId/photo
   ```

2. **Test Cases**
   - Valid JPEG file (< 50MB)
   - PNG with transparency
   - WebP format
   - File > 50MB (should fail)
   - Invalid MIME type (should fail)
   - No faces (should watermark only)
   - Multiple faces (should blur all)

### Integration Testing
- Frontend upload with progress tracking
- Backend image processing pipeline
- Azure Vision API face detection
- Azure Blob Storage upload/download
- SAS URL generation and expiration
- Database updates

## Migration Guide

### Step 1: Database Setup

Run migration file:
```sql
\i src/migrations/001_add_photo_upload_columns.sql
```

### Step 2: Install Dependencies

```bash
# Backend
npm install @azure/storage-blob @azure/cognitiveservices-vision-computervision @azure/ms-rest-js

# Frontend
npm install (already has axios, already configured)
```

### Step 3: Configure Environment

Add Azure credentials to `.env`:
- AZURE_STORAGE_CONNECTION_STRING
- AZURE_VISION_ENDPOINT
- AZURE_VISION_API_KEY

### Step 4: Enable Routes

Routes are automatically loaded in `index.js` via:
```javascript
app.use('/api/story', photoUploadRoutes);
```

### Step 5: Test Integration

1. Upload photo via Step5PhotoUpload component
2. Verify:
   - Image processing (crop/blur/watermark)
   - Face detection
   - Azure storage upload
   - Database updates
   - SAS URL generation

## Future Enhancements

1. **Batch Upload** - Multiple photos per story
2. **Image Filters** - Style transfer, artistic effects
3. **Illustration Integration** - Use processed photo in illustrations
4. **CDN Delivery** - Azure CDN for faster image serving
5. **AI-Generated Avatars** - Alternative to real photos
6. **Advanced Privacy** - Selective blur of background
7. **Analytics** - Track photo quality insights

## Support

For issues or questions:
1. Check error logs: `[PHOTO_UPLOAD_ERROR]`, `[AZURE_VISION_ERROR]`
2. Verify Azure credentials and quotas
3. Check file size and format
4. Review network connectivity
5. Contact support with error details
