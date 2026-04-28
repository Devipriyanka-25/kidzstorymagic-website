# 🧪 Face Swap Feature Testing & Validation Guide

## Test Scope
This document outlines how to test the face swap feature end-to-end in the Kidz Story Magic application.

---

## ✅ Pre-Test Checklist

- [ ] Application is running (`npm run dev`)
- [ ] PostgreSQL database is available
- [ ] Supabase connection is configured
- [ ] DeepAI API key is set in `.env.local`
- [ ] Test photos are available (3-5 JPEG/PNG files)
- [ ] Browser console is open (F12) for debugging

---

## Test Case 1: Photo Upload & Detection

### Steps:
1. Navigate to `/dashboard`
2. Click "Create New Story"
3. Complete Steps 1-4 (story details)
4. **Step 5 - Photo Upload**:
   - Click "Upload Photos"
   - Select 3-5 test photos
   - Verify all images appear in preview
   - Check file sizes display correctly

### Expected Results:
- ✅ All photos upload successfully
- ✅ Preview shows all 3+ photos
- ✅ Next button becomes enabled
- ✅ Console shows: `[PHOTO_UPLOAD] Images collected: 5`

### Troubleshooting:
```
If upload fails:
- Check browser console for errors
- Verify file size < 20MB
- Try JPEG format
- Check internet connection
```

---

## Test Case 2: Face Swap Auto-Detection

### Steps:
1. Continue from Test Case 1
2. Click "Next" to proceed to **Step 6 - Review**
3. Observe the review screen

### Expected Results:
- ✅ Photos display in "Child Photos" section
- ✅ Face swap indicator shows "✓ Enabled"
- ✅ First uploaded photo highlighted as primary
- ✅ Console shows: `[REVIEW] enableFaceSwap: true`

### Console Logs to Verify:
```javascript
[REVIEW] Checking face swap...
[REVIEW] formData.uploadedImages.length: 5
[REVIEW] enableFaceSwap: true
[REVIEW] Primary face URL set from uploadedImages[0]
```

---

## Test Case 3: Story Generation with Face Swap

### Steps:
1. Continue from Test Case 2
2. Enter all required checkout details
3. Complete payment (use Stripe test card: `4242 4242 4242 4242`)
4. Observe story generation process

### Expected Story Generation Flow:

**Console Output Timeline:**
```
[STORY_GENERATION] Starting story generation...
[STORY_GENERATION] Step 1: Generating story structure...
[STORY_GEN_PIPELINE] ✓ Story text generated

[STORY_GENERATION] Step 2: Generating illustrations...
[REPLICATE] Calling SDXL for page 1...
[REPLICATE] ✓ Illustration generated for page 1
... (repeat for all pages)

[STORY_GENERATION] Step 3: Applying face swap...
[FACE_SWAP] Processing page 1 with face swap...
[DEEPAI_SERVICE] Starting face swap operation
[DEEPAI_SERVICE] ✓ Face swap successful for page 1
... (repeat for all pages)

[STORY_GENERATION] ✓ All pages face-swapped successfully
[STORY_GENERATION] ✓ Story generation complete
```

### Expected Results:
- ✅ Story generates without errors
- ✅ Each page shows face swap processing
- ✅ Final story has child's face in illustrations
- ✅ Story appears in dashboard under "My Stories"

---

## Test Case 4: Story Download & Validation

### Steps:
1. Find generated story in dashboard
2. Click "Download" (PDF format)
3. Open PDF in browser/PDF viewer
4. Visually inspect each page

### Expected Results:
- ✅ PDF downloads successfully
- ✅ All pages display correctly
- ✅ Child's face visible in story illustrations
- ✅ Cartoon body + child's face integrated smoothly
- ✅ Text and images align properly

### PDF Quality Checks:
- [ ] Face swap quality is natural-looking
- [ ] No obvious distortions or artifacts
- [ ] Child's face matches uploaded photos
- [ ] Lighting blends well with illustration
- [ ] All pages consistent in quality

---

## Test Case 5: Face Swap API Direct Test

### Using cURL:
```bash
# Test the face swap endpoint directly
curl -X POST http://localhost:3000/api/photos/face-swap \
  -H "Content-Type: application/json" \
  -d '{
    "faceImageUrl": "https://example.com/child-photo.jpg",
    "illustrationImageUrl": "https://example.com/illustration.jpg",
    "childName": "Test Child",
    "pageNumber": 1
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "Face swap completed successfully",
  "swappedUrl": "https://cdn.../swapped-result.png",
  "result": {
    "storyId": "story-123",
    "photoId": "photo-456",
    "pageNumber": 1,
    "childName": "Test Child"
  }
}
```

---

## Test Case 6: Error Handling

### Test 6a: Missing DeepAI API Key
**Steps:**
1. Remove `DEEPAI_API_KEY` from `.env.local`
2. Restart application
3. Attempt to generate story

**Expected Result:**
```json
{
  "error": "Face swap service not configured",
  "message": "DEEPAI_API_KEY environment variable is missing",
  "status": 503
}
```

### Test 6b: Invalid Image URLs
**Steps:**
1. Attempt face swap with invalid URLs

**Expected Result:**
```json
{
  "error": "Missing required fields",
  "required": ["faceImageUrl", "illustrationImageUrl"],
  "status": 400
}
```

### Test 6c: Network Timeout
**Steps:**
1. Simulate slow network (DevTools throttling)
2. Attempt face swap

**Expected Result:**
- Timeout after 55 seconds
- Error message: "Face swap operation timed out"

---

## Performance Testing

### Metrics to Track:

```
1. Photo Upload Time:
   - 1 photo (5MB): < 10 seconds
   - 3 photos (15MB): < 20 seconds
   - 5 photos (25MB): < 30 seconds

2. Face Swap Processing per Page:
   - Average: 15-30 seconds
   - Max (timeout): 55 seconds
   - Min: 5 seconds

3. Total Story Generation (10 pages):
   - Illustration generation: ~2-3 minutes
   - Face swap processing: ~3-5 minutes
   - Total: ~5-8 minutes
```

### Load Testing:
```javascript
// Parallel face swaps
const pages = [
  'illustration1.jpg',
  'illustration2.jpg',
  'illustration3.jpg'
];

await Promise.all(pages.map(page =>
  fetch('/api/photos/face-swap', {
    method: 'POST',
    body: JSON.stringify({
      faceImageUrl,
      illustrationImageUrl: page
    })
  })
));
```

---

## Browser Console Log Reference

### Successful Face Swap Flow:
```
[PHOTO_UPLOAD] Images collected: 5
[PHOTO_UPLOAD] Images ready for processing
[REVIEW] Checking face swap capability...
[REVIEW] enableFaceSwap: true
[CHECKOUT] Processing payment...
[STORY_GENERATION] Starting pipeline...
[STORY_GEN_PIPELINE] Step 1: Story structure ✓
[STORY_GEN_PIPELINE] Step 2: Illustrations ✓
[STORY_GEN_PIPELINE] Step 3: Face swap enabled ✓
[DEEPAI_SERVICE] ✓ Face swap successful
[STORY_GEN_PIPELINE] ✓ All steps completed
```

---

## Known Limitations & Workarounds

| Issue | Cause | Workaround |
|-------|-------|-----------|
| Face not detected | Too small in frame | Upload face filling 60%+ of image |
| Distorted result | Extreme angle | Use front-facing photos |
| Processing timeout | Network slow | Check connection, retry |
| API rate limit | Too many simultaneous | Wait 1 minute, retry |
| Color mismatch | Different lighting | Process multiple photos |

---

## Acceptance Criteria

✅ **All of these must pass:**

1. [ ] Photos upload 3-5 images successfully
2. [ ] Step 6 detects uploaded photos
3. [ ] Face swap is automatically enabled
4. [ ] Story generates without errors
5. [ ] Each page shows face swap processing
6. [ ] Final story has child's face integrated
7. [ ] PDF downloads successfully
8. [ ] Face swap quality looks natural
9. [ ] No console errors during generation
10. [ ] Error handling works for edge cases

---

## Test Report Template

```
Test Date: [date]
Tester: [name]
Browser: [Chrome/Firefox/Safari]
OS: [Windows/Mac/Linux]

Test Case 1 - Photo Upload: [ ] PASS [ ] FAIL
Test Case 2 - Face Detection: [ ] PASS [ ] FAIL
Test Case 3 - Story Generation: [ ] PASS [ ] FAIL
Test Case 4 - PDF Download: [ ] PASS [ ] FAIL
Test Case 5 - API Direct Test: [ ] PASS [ ] FAIL
Test Case 6 - Error Handling: [ ] PASS [ ] FAIL

Overall Result: [ ] PASS [ ] FAIL

Issues Found:
- [Issue 1]
- [Issue 2]

Notes:
[Any additional observations]
```

---

## Quick Debug Tips

### Enable Detailed Logging:
```javascript
// In browser console
localStorage.setItem('DEBUG_FACE_SWAP', 'true');
// Reload page
```

### Check DeepAI API Health:
```bash
# Verify API key works (set DEEPAI_API_KEY first)
curl -H "api-key: $DEEPAI_API_KEY" \
  https://api.deepai.org/api/face-swap \
  -F "image1=@photo1.jpg" \
  -F "image2=@photo2.jpg"
```

### Monitor Network Requests:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "face-swap" requests
4. Check response times and status codes

---

## Support & Escalation

**If tests fail:**
1. Check console for specific error
2. Verify environment variables
3. Test API key with cURL
4. Check network connectivity
5. Review logs at `/var/logs/kidzstorymagic.log`
6. Contact support with:
   - Specific test case that failed
   - Browser console error message
   - DeepAI API response

---

