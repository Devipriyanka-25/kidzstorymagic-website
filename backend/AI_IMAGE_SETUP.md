# AI Image Generation Setup Guide

This guide explains how to integrate real AI image generation services into Kidz Story Magic.

## Quick Start

Choose ONE of the providers below and follow the setup instructions:

---

## 1️⃣ DALL-E 3 (Recommended - Easiest Setup) 🎨

**Best for:** High-quality, consistent character generation

### Setup Steps:

1. **Install required package:**
   ```bash
   npm install openai
   ```

2. **Get API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create new secret key
   - Copy the key (starts with `sk-`)

3. **Update `.env` file:**
   ```
   IMAGE_PROVIDER=DALLE
   OPENAI_API_KEY=sk_your_key_here
   ```

4. **Pricing:**
   - $0.080 per image (1024x1024)
   - Estimated cost: ~$1-2 per 20-page story

5. **Test:**
   ```bash
   # Backend will use DALL-E automatically
   npm run dev
   ```

### Code Example:
```javascript
// This is already implemented in imageGeneration.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.images.generate({
  model: 'dall-e-3',
  prompt: 'cute baby with big eyes...',
  n: 1,
  size: '1024x1024'
});
```

---

## 2️⃣ Stable Diffusion (Best for Costs - Free Local Option) 💰

### Option A: Local Setup (Free, but slow)

1. **Install Automatic1111 WebUI:**
   - Download from: https://github.com/AUTOMATIC1111/stable-diffusion-webui
   - Follow installation instructions for your OS

2. **Run the WebUI:**
   ```bash
   # Windows
   ./webui.bat

   # Linux/Mac
   ./webui.sh
   ```
   It will start at: `http://127.0.0.1:7860`

3. **Install required package:**
   ```bash
   npm install axios
   ```

4. **Update `.env`:**
   ```
   IMAGE_PROVIDER=STABLE_DIFFUSION
   STABLE_DIFFUSION_URL=http://127.0.0.1:7860/api
   ```

5. **Cost:** Free (one-time GPU setup)

### Option B: Cloud Setup (Stability AI)

1. **Get API Key:**
   - Visit https://www.stabilityai.com/
   - Sign up for free account
   - Get API key from dashboard

2. **Update `.env`:**
   ```
   IMAGE_PROVIDER=STABLE_DIFFUSION
   STABILITY_API_KEY=sk_your_key_here
   ```

3. **Cost:** $0.025 per image

---

## 3️⃣ Midjourney + Replicate (Artistic Quality) 🎭

**Best for:** Highly artistic, stylized illustrations

### Setup Steps:

1. **Install Replicate SDK:**
   ```bash
   npm install replicate
   ```

2. **Get Replicate Token:**
   - Visit https://replicate.com/
   - Sign up with GitHub
   - Get API token from settings
   - Copy token (looks like: `r8_...`)

3. **Update `.env`:**
   ```
   IMAGE_PROVIDER=MIDJOURNEY
   REPLICATE_API_TOKEN=r8_your_token_here
   ```

4. **Cost:** $0.10-0.30 per image (depending on model)

---

## 4️⃣ Azure OpenAI (Enterprise Option) ☁️

**Best for:** Companies using Azure infrastructure

### Setup Steps:

1. **Create Azure OpenAI Resource:**
   - Go to https://portal.azure.com/
   - Search for "OpenAI"
   - Create new resource
   - Deploy DALL-E 3 model

2. **Get Credentials:**
   - API Key from "Keys and Endpoint"
   - Endpoint URL
   - Deployment name (default: "dall-e-3")

3. **Update `.env`:**
   ```
   IMAGE_PROVIDER=AZURE
   AZURE_OPENAI_API_KEY=your_api_key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_DEPLOYMENT=dall-e-3
   ```

4. **Cost:** Same as DALL-E ($0.080 per image)

---

## 📊 Comparison Table

| Provider | Cost | Quality | Setup Time | Speed | Support |
|----------|------|---------|------------|-------|---------|
| DALL-E 3 | $0.08/img | Excellent | 2 min | Fast | Excellent |
| Stable Diffusion (Local) | Free | Good | 30+ min | Very Slow | Fair |
| Stable Diffusion (Cloud) | $0.025/img | Good | 5 min | Fast | Good |
| Midjourney (Replicate) | $0.10-0.30/img | Excellent | 5 min | Medium | Good |
| Azure OpenAI | $0.08/img | Excellent | 15 min | Fast | Excellent |

---

## 🧪 Testing the Integration

After setting up your provider:

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check logs for provider:**
   ```
   [IMAGE_GENERATION] Provider: DALLE
   ```

3. **Generate a story:**
   - Go to http://localhost:3000
   - Complete wizard steps 1-5
   - Click "Preview Story" in Step 6
   - Watch backend logs for image generation

4. **Verify images:**
   - Backend logs will show generated image URLs
   - Frontend should display illustrations on each page

---

## 🔧 Switching Providers

To switch providers:

1. **Update `.env`:**
   ```
   IMAGE_PROVIDER=DALLE
   # or
   IMAGE_PROVIDER=STABLE_DIFFUSION
   # or
   IMAGE_PROVIDER=MIDJOURNEY
   ```

2. **Restart backend:**
   ```bash
   npm run dev
   ```

3. **System will automatically use new provider**

---

## 💡 Tips & Optimization

### Prompt Engineering
The image prompts are auto-generated in `storyRenderer.js`. To improve:

```javascript
// Current prompt format:
"cute baby {{childName}} with big eyes, soft curls, wearing blue pajamas, 
sitting on a glowing moon, dreamy pastel sky, stars sparkling, Pixar-style illustration"
```

Enhance prompts by:
- Adding more descriptive details
- Specifying art style (Pixar, Disney, watercolor, etc.)
- Including lighting effects (soft glow, golden hour, etc.)

### Caching Generated Images
Consider adding caching to avoid regenerating images:

```javascript
// Cache in database or S3
const cachedImage = await db.query(
  'SELECT * FROM generated_images WHERE prompt_hash = ?',
  [hashPrompt(prompt)]
);

if (cachedImage) return cachedImage.url;
```

### Error Handling
All providers fallback to placeholder images on error:

```javascript
return {
  success: false,
  imageUrl: this.generatePlaceholderImage(...),
  error: err.message
};
```

---

## 🚀 Production Deployment

For production:

1. **Use environment variables** (never hardcode API keys)
2. **Set rate limits** to control costs
3. **Add image caching** to avoid regenerating
4. **Monitor API usage** in dashboards
5. **Implement retry logic** for failed generations
6. **Consider queue system** for batch image generation

---

## ❓ Troubleshooting

### "API key not valid"
- Verify key is correct
- Check environment variable is set: `echo $OPENAI_API_KEY`
- Make sure .env is in root directory

### "Image generation timeout"
- Increase timeout in axios/fetch calls
- Check API provider status
- Verify internet connection

### "Module not found"
- Install missing package: `npm install openai`
- Restart backend: `npm run dev`

### "Placeholder images showing"
- Check backend logs: `[IMAGE_GENERATION] Provider: DALLE`
- Verify IMAGE_PROVIDER env variable is set
- Confirm API credentials are valid

---

## 📞 Support

For issues with specific providers:

- **DALL-E**: https://platform.openai.com/docs/guides/images
- **Stable Diffusion**: https://stable-diffusion-art.com/
- **Replicate**: https://replicate.com/docs
- **Azure**: https://learn.microsoft.com/en-us/azure/ai-services/openai/

---

## Next Steps

1. Choose a provider from the list above
2. Follow provider-specific setup instructions
3. Update `.env` with your credentials
4. Test by generating a story
5. Adjust prompts in `storyRenderer.js` if needed

**Estimated time to get real images**: 5-15 minutes ⚡
