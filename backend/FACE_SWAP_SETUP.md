# Face Swap Feature Setup Guide

This guide explains how to enable face swap functionality to replace the baby character's face in generated illustrations with the user's uploaded child photo.

## Overview

The face swap feature uses **Replicate API** to swap faces in AI-generated illustrations. When enabled, after an illustration is generated, the baby's face is replaced with the child's uploaded photo for a personalized touch.

## Setup Steps

### 1. Create Replicate Account

1. Go to [https://replicate.com](https://replicate.com)
2. Click "Sign up" and create a free account
3. Verify your email address
4. You get $10 in free credits per month

### 2. Get API Token

1. Log in to https://replicate.com/account
2. Scroll to "API tokens" section
3. Copy your API token (looks like: `r8_1234abcd5678efgh1234abcd5678efgh`)

### 3. Configure Backend

Open `backend/.env` and update:

```env
# Enable face swap
ENABLE_FACE_SWAP=true

# Add your Replicate API token
REPLICATE_API_TOKEN=r8_1234abcd5678efgh1234abcd5678efgh
```

### 4. Restart Backend

```bash
cd "s:\Priya\Project\Kidz Story Magic\backend"
npm run dev
```

## How It Works

### When Creating a Story

1. User fills out wizard steps (name, age, theme, etc.)
2. Uploads child photo
3. Clicks "Preview Story"
4. Backend generates story with AI images
5. **If face swap is enabled**: 
   - Takes generated illustration (baby character)
   - Replaces baby's face with child's uploaded photo
   - Returns personalized image with child's face

### Example Flow

```
User Photo: [Baby Photo]
        ↓
    [Generated Illustration with Generic Baby]
        ↓
    [Face Swap Processing]
        ↓
    [Illustration with Child's Face]
```

## Pricing

- **Replicate**: Free tier gets $10/month in free credits
- Each face swap call costs approximately $0.01-0.10 depending on model quality
- A 20-page book would cost roughly $0.20-2.00 in face swap credits
- Additionally, you need credits for image generation (DALLE-3: $0.08/image)

## Face Swap Models Available

The service is configured to use:
- **strmoder/roop v2** - Popular, good quality face swaps

To use other Replicate models, update `faceSwapService.js`:

```javascript
version: 'f3ef6b1ae8477c5639cd56a10404770b1260ac3f14c9c2df457c7d49eda672a7', // Change this version ID
```

Find more models at: https://replicate.com/explore?query=face+swap

## Troubleshooting

### Face Swap Disabled After Restart

**Issue**: Face swap isn't working even with ENABLE_FACE_SWAP=true

**Solutions**:
1. Verify REPLICATE_API_TOKEN is set correctly in `.env`
2. Check that `.env` file is saved
3. Restart backend with: `npm run dev`
4. Check backend logs for "[FACE_SWAP]" messages

### API Token Invalid Error

**Error**: `REPLICATE_API_TOKEN not configured in environment variables`

**Solution**:
1. Go to https://replicate.com/account
2. Copy API token again (may have expired)
3. Update `.env` file
4. Restart backend

### Face Swap Timeout

**Error**: Face swap prediction timed out

**Cause**: Replicate API is slow (usually temporary)

**Solution**:
- Automatically retries and uses original image
- Try again in a few minutes
- Check Replicate status at https://www.replicaterstatus.com/

### Child Photo Not Found

**Error**: Child photo URL is invalid

**Solution**:
1. Ensure photo was uploaded successfully in Step 3
2. Check that `child_photo_url` is saved in database
3. Try uploading photo again

## Monitoring Face Swap

Check backend logs for face swap activity:

```
[FACE_SWAP] Starting face swap for project xxxxx
[FACE_SWAP] Prediction submitted: pred_xxxxx
[FACE_SWAP_POLL] Status: processing (attempt 1/30)
[FACE_SWAP_POLL] Status: succeeded (attempt 5/30)
[FACE_SWAP] Face swap successful: https://...
```

## Disabling Face Swap

To disable face swap temporarily:

```env
ENABLE_FACE_SWAP=false
```

Illustrations will be generated without face swapping.

## Best Practices

1. **High-Quality Child Photos**: Upload clear, well-lit child photos for best results
2. **Simple Backgrounds**: Photos with simple backgrounds work better than complex ones
3. **Face Visibility**: Ensure face is clearly visible in the uploaded photo
4. **Multiple Angles**: If face swap fails, try a different photo angle

## Advanced Configuration

### Custom Face Swap Model

Edit `backend/src/services/faceSwapService.js`:

```javascript
version: 'YOUR_REPLICATE_MODEL_VERSION_ID_HERE',
input: {
  swap_image: childPhotoUrl,
  image: illustrationUrl
  // Add other model-specific parameters here
}
```

### Batch Processing

Face swap automatically processes all pages in parallel for efficiency.

### Fallback Behavior

If face swap fails:
- Returns original generated illustration
- No error thrown to user
- Story generation completes successfully

## Support

For issues with:
- **Replicate API**: https://replicate.com/docs
- **Kidz Story Magic**: Check logs in `backend.log`

## Pricing Comparison

| Feature | Provider | Cost per Image |
|---------|----------|----------------|
| Image Generation | DALLE-3 | $0.08 |
| Face Swap | Replicate | $0.01-0.10 |
| Total per Page | Combined | $0.09-0.18 |

For a 20-page book:
- Image Generation: ~$1.60
- Face Swap: ~$0.20-2.00
- **Total: ~$1.80-3.60 per book**
