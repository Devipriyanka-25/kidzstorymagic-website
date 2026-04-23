# Face Swap Integration - DeepAI API Setup

## Overview

We've switched from Replicate to **DeepAI** for face swapping because:
- ✅ More reliable face swap results
- ✅ Simpler API integration
- ✅ No lengthy model queue times
- ✅ Pay-as-you-go ($0.05 per swap)
- ✅ Free trial credits included

## Setup Steps

### 1. Create DeepAI Account

1. Go to https://deepai.org/account/profile
2. Sign up (free account)
3. Copy your API key from the profile page

### 2. Add to Vercel Environment

```powershell
cd "s:\Priya\Project\Kidz Story Magic"
vercel env add DEEPAI_API_KEY
# Paste your API key when prompted
vercel deploy --prod
```

### 3. Test the Endpoint

```bash
curl -X POST http://localhost:3001/api/photos/face-swap \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d @- << 'EOF'
{
  "faceImageUrl": "https://via.placeholder.com/200x200?text=Face",
  "illustrationImageUrl": "https://via.placeholder.com/600x400?text=Story",
  "childName": "Emma",
  "pageNumber": 1
}
EOF
```

## API Endpoint

**POST** `/api/photos/face-swap`

### Request Body

```json
{
  "faceImageUrl": "string (URL of child's face photo)",
  "illustrationImageUrl": "string (URL of story illustration)",
  "storyId": "string (optional)",
  "photoId": "string (optional)",
  "pageNumber": "number (optional)",
  "childName": "string (optional)"
}
```

### Response (Success)

```json
{
  "success": true,
  "message": "Face swap completed successfully",
  "result": {
    "storyId": "project-123",
    "swappedImageUrl": "https://deepai.org/result/...",
    "model": "deepai-face-swap",
    "processedAt": "2024-04-23T10:30:00Z"
  },
  "pricing": {
    "model": "face-swap",
    "estimatedCost": 0.05,
    "currency": "USD",
    "provider": "deepai.org"
  }
}
```

### Response (Error)

```json
{
  "error": "Face swap service not configured",
  "message": "DEEPAI_API_KEY environment variable is missing",
  "setup": "Get your free API key from https://deepai.org/account/profile"
}
```

## Pricing

| Task | Cost | Notes |
|------|------|-------|
| Face Swap | $0.05/call | Charged per successful swap |
| Free Credits | $5-10 | Included with new account |
| Monthly Limit | No hard limit | Pay-as-you-go |

### Example Costs
- 100 face swaps = $5
- 500 face swaps = $25/month
- 1000 face swaps = $50/month

## Integration with Story Preview

Face swap is automatically called when:
1. User generates story and uploads their face photo
2. For each page in the story, child's face is swapped into the illustration
3. Swapped images replace placeholder images in preview
4. User can regenerate individual pages or whole story

## Troubleshooting

| Error | Solution |
|-------|----------|
| "DEEPAI_API_KEY not configured" | Add API key to Vercel environment variables |
| "API rate limited" | DeepAI has 1 request/second limit, implement queue |
| "Invalid image URL" | Check image URL is publicly accessible |
| "Face not detected" | Ensure face photo is clear and well-lit |

## Alternative Providers

If DeepAI has issues, fallback options:

### 1. **AWS Rekognition**
- Pros: Highly reliable, part of AWS ecosystem
- Cons: Complex setup, more expensive (~$1-5 per swap)
- Setup: Create AWS account, configure IAM credentials

### 2. **Azure Face API**
- Pros: Part of Azure ecosystem, good documentation
- Cons: Not specifically for face swapping (face detection only)
- Setup: Create Azure account, configure cognitive services

### 3. **Local Model (CompreFace)**
- Pros: Self-hosted, no per-call costs
- Cons: Infrastructure overhead, slower processing
- Setup: Docker compose deployment

### 4. **imgupscaler.com**
- Pros: Simple API, no account needed
- Cons: Less reliable, inconsistent results

## Files Modified

1. **`app/api/lib/deepaiService.js`** - New DeepAI service module
2. **`app/api/photos/face-swap/route.js`** - Updated endpoint to use DeepAI
3. **`.env.local`** - Add DEEPAI_API_KEY

## Next Steps

1. ✅ Get DeepAI API key
2. ✅ Add to Vercel environment  
3. ✅ Deploy to production
4. ✅ Test with sample images
5. ✅ Integrate with story preview component
6. ✅ Show swapped images in user preview

## Documentation

- DeepAI Docs: https://deepai.org/docs
- API Status: https://api.deepai.org/status
- Support: support@deepai.org
