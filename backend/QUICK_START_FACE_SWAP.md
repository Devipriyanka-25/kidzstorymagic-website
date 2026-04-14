# Quick Start: Face Swap in 5 Minutes

Get personalized illustrations with child's face swapped in! ⚡

## 5-Minute Setup

### Step 1: Get Replicate API Token (2 min)
```
1. Visit https://replicate.com and sign up (free!)
2. Go to https://replicate.com/account  
3. Copy your API token
```

### Step 2: Update .env File (1 min)
```bash
# Open: backend/.env
# Find these lines:

ENABLE_FACE_SWAP=false                          # Change to: true
REPLICATE_API_TOKEN=your_replicate_api_token_here  # Paste your token
```

### Step 3: Restart Backend (30 sec)
```bash
cd "s:\Priya\Project\Kidz Story Magic\backend"
npm run dev
```

### Step 4: Test It! (1.5 min)
1. Open frontend at http://localhost:3001
2. Go through wizard: name, age, theme, **upload photo**
3. Click "Preview Story"
4. Watch faces get swapped! 👶→👧

## That's It! 🎉

Your generated illustrations now have your child's face instead of a generic baby!

## Example .env Update

**Before:**
```env
ENABLE_FACE_SWAP=false
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

**After:**
```env
ENABLE_FACE_SWAP=true
REPLICATE_API_TOKEN=r8_1234abcd5678efgh1234abcd5678efgh
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Face swap not working | Restart backend: `npm run dev` |
| "API token error" | Check `backend/.env` is saved correctly |
| Takes too long | Normal! First attempt takes ~2-5 min |
| Face swap failed | Uses original image, tries again next time |

## View Backend Logs

Watch face swap happening:
```bash
# Look for:
[FACE_SWAP] Starting face swap for project...
[FACE_SWAP] Face swap successful: https://...
```

## Cost Example

For a 20-page book:
- Image Generation (DALLE): $1.60
- Face Swap (Replicate): $0.20-2.00
- **Total: ~$2-4 per book**

Replicate gives $10/month free = 50+ face swaps!

## Next Steps

1. ✅ Enable face swap (completed above)
2. Test with wizard flow
3. Check results in preview
4. Adjust if needed
5. Deploy with face swap enabled!

Need more details? See: `FACE_SWAP_SETUP.md`
