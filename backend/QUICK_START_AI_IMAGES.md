# ⚡ Quick Start: Add Real AI Images (5 minutes)

This guide shows the fastest way to get real AI-generated book illustrations.

## Step 1: Get OpenAI API Key (2 minutes)

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (looks like: `sk-proj-xxx...`)
4. Keep it safe - never share it!

## Step 2: Install Required Package (1 minute)

```bash
cd backend
npm install openai
```

## Step 3: Add to .env File (1 minute)

Open `backend/.env` and add:

```
IMAGE_PROVIDER=DALLE
OPENAI_API_KEY=sk_your_key_here
```

Replace `sk_your_key_here` with your actual key from Step 1.

Example (FAKE):
```
IMAGE_PROVIDER=DALLE
OPENAI_API_KEY=sk-proj-abc123def456ghi789jkl
```

## Step 4: Restart Backend (1 minute)

```bash
# Stop current backend (Ctrl+C in terminal)
# Start new backend
npm run dev
```

Watch for this in logs:
```
[IMAGE_GENERATION] Provider: DALLE
```

## Step 5: Test It! 🎉

1. Open http://localhost:3000
2. Go through wizard steps 1-5 (upload photo)
3. Click "Preview Story" in Step 6
4. **Watch the backend logs** - you'll see:
   ```
   [DALLE] Calling OpenAI DALL-E 3 API...
   [DALLE] Image generated successfully: https://...
   ```
5. **Each page will show an AI-generated illustration!** 🎨

---

## 🎨 What You'll See

**Before (Placeholder):**
- Generic placeholder images like "via.placeholder.com"

**After (Real AI):**
- Beautiful AI artwork showing baby character in story settings
- Each page has unique illustration matching the story
- Watermarked with child's face as cover

---

## 💰 Cost & Estimation

- **Cost per image:** $0.080
- **Per 20-page story:** ~$1.60
- **Free tier:** $5 credit monthly (make 60+ images free!)

---

## 🐛 Troubleshooting

**"Module 'openai' not found"**
```bash
npm install openai
npm run dev
```

**"Invalid API key"**
- Check key is correct from https://platform.openai.com/api-keys
- Make sure `.env` file is in backend directory
- Restart with: `npm run dev`

**"Still showing placeholders"**
- Check backend logs for provider name
- Verify `IMAGE_PROVIDER=DALLE` in .env
- Confirm API key is valid

---

## ✅ That's It!

You now have real AI images! 

**Next Steps:**
- Adjust image prompts in `backend/src/utils/storyRenderer.js`
- Try different themes to see varied artwork
- Switch to other providers in `AI_IMAGE_SETUP.md` if needed

---

## 📚 Full Documentation

See `backend/AI_IMAGE_SETUP.md` for:
- Other providers (Stable Diffusion, Midjourney, Azure)
- Advanced configuration
- Production deployment
- Cost optimization

---

**Time to get real images: 5 minutes ⚡**
**Quality improvement: 1000% 🚀**
