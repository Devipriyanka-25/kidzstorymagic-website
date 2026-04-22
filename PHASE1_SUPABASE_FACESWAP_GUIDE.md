# Phase 1: Supabase Setup & Face Swap Implementation Guide

## Overview

This guide walks through setting up Supabase database and implementing the face swap feature for Kidz Story Magic.

## Part 1: Supabase Database Setup

### Step 1: Access Your Supabase Project

1. Go to: https://app.supabase.com
2. Sign in with your account
3. Select the project: **kidzstorymagic-website** (Project ID: wwninqezevmxlvtjhruo)

### Step 2: Create Database Tables

1. In the Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the entire SQL schema below:

```sql
-- Create auth_users table
CREATE TABLE IF NOT EXISTS auth_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  preferred_currency VARCHAR(10) DEFAULT 'USD',
  profile_picture_url TEXT,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stories table
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(100),
  age_group VARCHAR(50),
  theme VARCHAR(100),
  illustration_style VARCHAR(100),
  num_pages INTEGER DEFAULT 10,
  story_content TEXT,
  html_content TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  cover_image_url TEXT,
  pdf_url TEXT,
  epub_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

-- Create drafts table
CREATE TABLE IF NOT EXISTS drafts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  child_name VARCHAR(255),
  theme VARCHAR(100),
  illustration_style VARCHAR(100),
  gender VARCHAR(50),
  age INTEGER,
  interests TEXT,
  special_notes TEXT,
  form_data JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create photos table (for face swap feature)
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  child_name VARCHAR(255),
  original_url TEXT NOT NULL,
  face_detected BOOLEAN DEFAULT false,
  face_image_url TEXT,
  face_embedding JSONB,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create face_swapped_illustrations table
CREATE TABLE IF NOT EXISTS face_swapped_illustrations (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  photo_id INTEGER REFERENCES photos(id) ON DELETE SET NULL,
  page_number INTEGER,
  original_illustration_url TEXT NOT NULL,
  swapped_illustration_url TEXT NOT NULL,
  face_swap_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_drafts_user_id ON drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_story_id ON photos(story_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_face_swapped_story_id ON face_swapped_illustrations(story_id);
```

4. Click **RUN** (or Ctrl+Enter)
5. Wait for the success message

### Step 3: Enable Row Level Security (Optional but Recommended)

1. Go to **Authentication** → **Policies**
2. For each table, click **New Policy**
3. Add policies to restrict access to user's own data

Example for `auth_users`:
```sql
CREATE POLICY "Users can read own data" ON auth_users
  FOR SELECT USING (auth.uid() = id);
```

## Part 2: Face Swap Feature Implementation

### Overview

The face swap feature consists of three main components:

1. **Face Detection** - Extracts face from uploaded photo
2. **Face Swap** - Integrates face into story illustrations
3. **Result Storage** - Saves processed images to database

### Component Files Created

#### 1. Face Detection Endpoint: `/api/photos/detect-face`

**Endpoint:** `POST /api/photos/detect-face`

**Purpose:** Detects faces in uploaded images and extracts face data

**Request:**
```javascript
const formData = new FormData();
formData.append('photo', fileObject);
formData.append('childName', 'Emma');
formData.append('userId', user.id);
formData.append('storyId', storyId);

const response = await fetch('/api/photos/detect-face', {
  method: 'POST',
  body: formData,
});
```

**Response:**
```json
{
  "success": true,
  "photo": {
    "childName": "Emma",
    "original_base64": "data:image/jpeg;base64,..."
  },
  "faceDetection": {
    "detected": true,
    "confidence": 0.95,
    "faces": [...]
  },
  "faceData": {
    "extracted_base64": "data:image/png;base64,...",
    "position": { "x": 100, "y": 50, "width": 150, "height": 200 },
    "landmarks": { "leftEye": {...}, "rightEye": {...}, ... }
  }
}
```

#### 2. Face Swap Endpoint: `/api/photos/face-swap`

**Endpoint:** `POST /api/photos/face-swap`

**Purpose:** Integrates detected face into story illustrations

**Request:**
```javascript
const response = await fetch('/api/photos/face-swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    faceImageBase64: faceData.extracted_base64,
    illustrationImageUrl: 'https://...',
    storyId: 123,
    photoId: 456,
    pageNumber: 1,
    facePosition: { x: 100, y: 50 },
    faceSize: { width: 150, height: 200 },
    rotation: 0,
  }),
});
```

**Response:**
```json
{
  "success": true,
  "result": {
    "storyId": 123,
    "pageNumber": 1,
    "swappedImage": "data:image/png;base64,...",
    "metadata": { "width": 512, "height": 512 }
  }
}
```

#### 3. Save Result Endpoint: `/api/photos/save-face-swap`

**Endpoint:** `POST /api/photos/save-face-swap`

**Purpose:** Stores face swap results in database

**Request:**
```javascript
const response = await fetch('/api/photos/save-face-swap', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    storyId: 123,
    photoId: 456,
    pageNumber: 1,
    originalIllustrationUrl: 'https://...',
    swappedIllustrationUrl: 'data:image/png;base64,...',
    faceSwapData: { /* metadata */ },
  }),
});
```

### React Component: FaceSwapComponent

Located at: `/components/FaceSwapComponent.jsx`

**Features:**
- Photo upload with preview
- Child name input
- Face detection with visual feedback
- Face landmarks visualization
- Confidence score display
- Extracted face preview

**Usage in Wizard:**
```jsx
import FaceSwapComponent from '@/components/FaceSwapComponent';

export default function StoryWizard() {
  const handleFaceDetected = (faceData) => {
    console.log('Face detected:', faceData);
    // Store for later use
  };

  return (
    <div>
      <FaceSwapComponent 
        storyId={storyId}
        onFaceDetected={handleFaceDetected}
      />
    </div>
  );
}
```

## Part 3: Integration with Story Creation Flow

### Workflow

1. **Upload Phase**
   - User uploads child's photo
   - `FaceSwapComponent` detects face
   - Face data stored in component state

2. **Generation Phase**
   - Story is generated with AI
   - Illustrations are created
   - For each page, check if face swap is needed

3. **Swap Phase**
   - For each illustration page:
     - Call `/api/photos/face-swap` with face + illustration
     - Get swapped illustration back
     - Save result via `/api/photos/save-face-swap`

4. **Display Phase**
   - Show story with face-swapped illustrations
   - User can download PDF with swapped images

### Example Integration Code

```jsx
// In story creation wizard
const processFaceSwaps = async (storyId, faceData, illustrations) => {
  const swappedIllustrations = [];

  for (let i = 0; i < illustrations.length; i++) {
    try {
      // Call face swap API
      const swapResponse = await fetch('/api/photos/face-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceImageBase64: faceData.extracted_base64,
          illustrationImageUrl: illustrations[i].url,
          storyId,
          photoId: faceData.photoId,
          pageNumber: i + 1,
        }),
      });

      const swapData = await swapResponse.json();

      if (swapData.success) {
        // Save result
        await fetch('/api/photos/save-face-swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            storyId,
            photoId: faceData.photoId,
            pageNumber: i + 1,
            originalIllustrationUrl: illustrations[i].url,
            swappedIllustrationUrl: swapData.result.swappedImage,
          }),
        });

        swappedIllustrations.push(swapData.result.swappedImage);
      }
    } catch (error) {
      console.error(`Failed to swap page ${i + 1}:`, error);
      swappedIllustrations.push(illustrations[i].url); // Fallback
    }
  }

  return swappedIllustrations;
};
```

## Part 4: Production Enhancements

### Current Implementation

The current implementation uses mock face detection. For production, integrate with:

#### Option 1: Google Cloud Vision API
```bash
npm install @google-cloud/vision
```

#### Option 2: AWS Rekognition
```bash
npm install aws-sdk
```

#### Option 3: Azure Computer Vision
```bash
npm install @azure/cognitiveservices-vision-computervision
```

#### Option 4: Client-side Face API.js
```html
<script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
```

### Real Face Swap

For production face swapping, consider:

1. **DeepFaceLab** - Open source, high quality
2. **InsightFace** - Fast and accurate
3. **Stripe Face Swap API** - Cloud-based service
4. **Custom TensorFlow Model** - Full control

## Part 5: Testing the Implementation

### Test Face Detection

```bash
curl -X POST http://localhost:3000/api/photos/detect-face \
  -F "photo=@/path/to/photo.jpg" \
  -F "childName=Emma" \
  -F "userId=1" \
  -F "storyId=1"
```

### Test Face Swap

```bash
curl -X POST http://localhost:3000/api/photos/face-swap \
  -H "Content-Type: application/json" \
  -d '{
    "faceImageBase64": "data:image/png;base64,...",
    "illustrationImageUrl": "https://...",
    "storyId": 1,
    "pageNumber": 1
  }'
```

### Test Database

```bash
curl -X POST http://localhost:3000/api/photos/save-face-swap \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storyId": 1,
    "photoId": 1,
    "pageNumber": 1,
    "swappedIllustrationUrl": "data:image/png;base64,..."
  }'
```

## Part 6: Environment Variables

Add to your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wwninqezevmxlvtjhruo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For production face detection (optional)
GOOGLE_CLOUD_VISION_API_KEY=your_api_key
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AZURE_VISION_API_KEY=your_key
```

## Part 7: Security Considerations

1. **Row Level Security (RLS)** - Enable on Supabase for data protection
2. **File Validation** - Check image file types and sizes
3. **Authentication** - All endpoints require JWT tokens
4. **Rate Limiting** - Implement rate limiting for API endpoints
5. **Data Privacy** - Don't store raw face data; use embeddings instead
6. **GDPR Compliance** - Allow users to delete their photos

## Part 8: Database Backup

Regular backups are enabled on Supabase. To manually backup:

```bash
# Using Supabase CLI
supabase db pull --schema-only
```

## Part 9: Monitoring

Monitor these endpoints in production:
- `/api/photos/detect-face` - Face detection latency
- `/api/photos/face-swap` - Image processing time
- `/api/photos/save-face-swap` - Database writes

## Next Steps

1. ✅ Run the Supabase setup SQL
2. ✅ Deploy code with `git push`
3. ✅ Test endpoints with sample photos
4. ✅ Integrate FaceSwapComponent into wizard
5. ✅ Add face swap processing to story generation
6. ✅ Setup production face detection API

## Troubleshooting

### "table auth_users not found"
- Run the SQL schema setup in Supabase SQL Editor
- Check table exists in Supabase Dashboard > Tables

### "Unauthorized" errors
- Verify JWT token is valid
- Check Authorization header format: `Bearer YOUR_TOKEN`
- Ensure user is authenticated

### "Face detection failed"
- Check image file is valid
- Verify image size is < 10MB
- Try a different photo

### Face swap looks bad
- Use higher quality illustrations
- Adjust face position and size parameters
- Integrate real face swap ML model

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review error logs in Vercel dashboard
3. Test endpoints individually before integration
