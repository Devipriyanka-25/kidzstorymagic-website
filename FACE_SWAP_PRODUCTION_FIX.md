# Face Swap Production Fix - Deployment Guide

## Problem Fixed
✅ **Face swap was completely disabled in production** - The environment variable `NEXT_PUBLIC_ENABLE_PREVIEW_FACE_SWAP` was not configured, causing the entire face swap pipeline to be skipped.

## What Changed
- Added `NEXT_PUBLIC_ENABLE_PREVIEW_FACE_SWAP=true` to production configuration
- Updated all environment example files for documentation
- Build tested locally: ✓ PASSED
- Committed to GitHub: `bf2dac2` (main branch)

## Critical Next Step: Update Vercel Environment Variables

### ⚠️ ACTION REQUIRED (Must do this or face swap won't work in production)

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/Devipriyanka-25/kidzstorymagic
   - Project: kidzstorymagic-website

2. **Navigate to Project Settings → Environment Variables**

3. **Add/Verify These Variables Exist:**
   ```
   NEXT_PUBLIC_ENABLE_PREVIEW_FACE_SWAP=true
   DEEPAI_API_KEY=79aa6db1-4dfb-41f3-9f4c-206dfc2a98d7
   REPLICATE_API_TOKEN=[redacted]
   NEXT_PUBLIC_API_URL=https://kidzstorymagic-api.railway.app/api
   ```

4. **Set Environment Scopes:**
   - All three (Production, Preview, Development) OR
   - Just Production for safety

5. **Save Changes**

6. **Trigger Redeploy**
   - Go to Deployments
   - Click the latest deployment
   - Click "Redeploy" to rebuild with new environment variables

## How Face Swap Works (Now Enabled)

```
Upload Photos (Step 5)
    ↓
Generate Story + Illustrations (Step 6)
    ↓
For Each Illustration:
  1. Child photo extracted
  2. Passed to face swap API (DeepAI → Replicate fallback)
  3. Face swapped into illustration
  4. Result displayed in preview
    ↓
User Sees: Natural face-swapped character in storybook
```

## Technical Details

### Configuration File Changes
- `.env.local` → NEXT_PUBLIC_ENABLE_PREVIEW_FACE_SWAP=true
- `.env.production` → NEXT_PUBLIC_ENABLE_PREVIEW_FACE_SWAP=true
- `.env.example` → Updated to document this setting
- `.env.production.example` → Updated to document this setting

### Related Files
- `components/wizard/Step6ReviewCheckout.jsx` (line 35-36) - Controls the flag
- `app/api/photos/face-swap/route.js` - Face swap API endpoint
- `app/lib/deepaiService.js` - DeepAI integration
- `app/lib/replicateService.js` - Replicate integration

## Rollback if Needed
If issues occur, you can disable face swap by:
1. Setting `NEXT_PUBLIC_ENABLE_PREVIEW_FACE_SWAP=false` in Vercel
2. Or removing the variable entirely
3. Redeploy

## Verification After Deployment

1. Go to https://www.kidzstorymagic.org
2. Create a story with test account
3. Upload child photos (Step 5)
4. Generate story (Step 6)
5. **Expected Result:** Illustrations show child's face naturally blended into storybook characters
   - Face matches skin tone, lighting, angle
   - No distorted eyes/mouth/face
   - Natural blend with illustration

## Troubleshooting

### Face Swap Not Working After Update
- Check Vercel environment variables are set to `true`
- Check that redeploy finished successfully
- Clear browser cache (Ctrl+Shift+Delete)
- Try in incognito window

### API Errors
- DeepAI: Check `DEEPAI_API_KEY` is correct
- Replicate: Check `REPLICATE_API_TOKEN` is valid
- Both will show different error messages in browser console

### Performance Issues
- Face swap takes 3-5 minutes per page (normal)
- Multiple pages process in sequence
- First preview may show temporary image while face swap processes in background

## Success Indicators
✓ Preview shows child's face in story illustrations
✓ Face automatically swapped without user action
✓ Illustrations match reference sample quality
✓ No hard edges or distortion around face
✓ Facial features recognize and preserve likeness
