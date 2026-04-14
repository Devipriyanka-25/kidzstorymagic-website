// Image Generation Service
// Generates illustrations for story pages using AI
const config = require('../config/config');
const DemoImageProvider = require('./demoImageProvider');
const FaceSwapService = require('./faceSwapService');

// Import required libraries (add to package.json)
// If using DALL-E: npm install openai
// If using Stable Diffusion: npm install axios
// For Face Swap: npm install axios (for Replicate API calls)

class ImageGenerationService {
  /**
   * Generate illustration from text prompt
   * Route to appropriate provider based on environment variable
   */
  static async generateImage(prompt, projectId, pageNumber, theme = 'friends') {
    try {
      console.log(`[IMAGE_GENERATION] Generating image for page ${pageNumber}`);
      console.log(`[IMAGE_GENERATION] Provider: ${process.env.IMAGE_PROVIDER || 'DEMO'}`);
      console.log(`[IMAGE_GENERATION] Prompt: ${prompt.substring(0, 100)}...`);

      const provider = process.env.IMAGE_PROVIDER || 'DEMO';

      let imageUrl;
      
      switch (provider.toUpperCase()) {
        case 'DALLE':
          imageUrl = await this.generateWithDallE(prompt);
          break;
        case 'STABLE_DIFFUSION':
          imageUrl = await this.generateWithStableDiffusion(prompt);
          break;
        case 'MIDJOURNEY':
          imageUrl = await this.generateWithMidjourney(prompt);
          break;
        case 'AZURE':
          imageUrl = await this.generateWithAzure(prompt);
          break;
        case 'DEMO':
          imageUrl = DemoImageProvider.generateDemoImageUrl(pageNumber, theme, projectId);
          console.log('[DEMO] Using demo images - to enable real AI images, set IMAGE_PROVIDER in .env');
          break;
        default:
          imageUrl = this.generatePlaceholderImage(prompt, projectId, pageNumber);
      }

      return {
        success: true,
        imageUrl: imageUrl,
        prompt: prompt,
        pageNumber: pageNumber,
        generated: true,
        provider: provider
      };
    } catch (err) {
      console.error('[IMAGE_GENERATION_ERROR]', err.message);
      // Fallback to demo
      return {
        success: false,
        imageUrl: DemoImageProvider.generateDemoImageUrl(pageNumber, theme, projectId),
        prompt: prompt,
        pageNumber: pageNumber,
        generated: false,
        error: err.message
      };
    }
  }

  /**
   * Generate placeholder image URL
   * Fallback when AI generation fails or not configured
   */
  static generatePlaceholderImage(prompt, projectId, pageNumber) {
    return `https://via.placeholder.com/400x500/dbeafe/1e40af?text=Page+${pageNumber}`;
  }

  /**
   * Batch generate images for all story pages
   * @param {array} pages - Story pages with text and image prompts
   * @param {string} projectId - Project ID
   * @param {string} theme - Story theme
   * @param {string} childPhotoUrl - Optional child photo URL for face swap
   * @returns {Promise<array>} - Pages with generated/face-swapped illustration URLs
   */
  static async generateBatchImages(pages, projectId, theme = 'friends', childPhotoUrl = null) {
    try {
      console.log(`[IMAGE_GENERATION] Batch generating ${pages.length} images for project ${projectId}`);
      console.log(`[IMAGE_GENERATION] Child Photo URL provided: ${!!childPhotoUrl}`);
      if (childPhotoUrl) {
        console.log(`[IMAGE_GENERATION] Child Photo URL: ${childPhotoUrl.substring(0, 100)}...`);
      }
      
      // Step 1: Generate all illustrations
      const generatedPages = await Promise.all(
        pages.map((page, index) =>
          this.generateImage(page.imagePrompt, projectId, page.page_number || index + 1, theme)
            .then(result => ({
              ...page,
              illustrationUrl: result.imageUrl,
              imageProvider: result.provider
            }))
            .catch(err => {
              console.warn(`[IMAGE_GENERATION_WARN] Failed to generate image for page ${page.page_number}:`, err.message);
              return {
                ...page,
                illustrationUrl: DemoImageProvider.generateDemoImageUrl(page.page_number, theme, projectId),
                imageProvider: 'DEMO'
              };
            })
        )
      );

      // Step 2: Apply face swap if enabled and child photo provided
      console.log(`[IMAGE_GENERATION] Checking face swap: Enabled=${FaceSwapService.isEnabled()}, HasPhoto=${!!childPhotoUrl}`);
      
      if (FaceSwapService.isEnabled() && childPhotoUrl) {
        console.log(`[IMAGE_GENERATION] ✓ Face swap is ENABLED and child photo provided. Applying face swap...`);
        try {
          const faceSwappedPages = await FaceSwapService.batchSwapFaces(generatedPages, childPhotoUrl, projectId);
          
          // Use face-swapped images as primary illustrations
          const finalPages = faceSwappedPages.map((page, index) => ({
            ...page,
            illustrationUrl: page.faceSwappedUrl || page.illustrationUrl, // Use face-swapped if available, fallback to original
            hasFaceSwap: !!page.faceSwappedUrl
          }));

          console.log(`[IMAGE_GENERATION] Face swap completed for ${pages.length} pages`);
          return finalPages;
        } catch (err) {
          console.error('[IMAGE_GENERATION_FACE_SWAP_ERROR]', err.message);
          console.warn('[IMAGE_GENERATION] Continuing without face swap, using original generated images');
          return generatedPages; // Return generated images without face swap if face swap fails
        }
      } else {
        console.log(`[IMAGE_GENERATION] Face swap skipped: Enabled=${FaceSwapService.isEnabled()}, HasPhoto=${!!childPhotoUrl}`);
      }

      return generatedPages;
    } catch (err) {
      console.error('[IMAGE_BATCH_GENERATION_ERROR]', err.message);
      throw err;
    }
  }

  /**
   * ==========================================
   * OPENAI DALL-E 3 INTEGRATION
   * ==========================================
   * 
   * Setup:
   * 1. npm install openai
   * 2. Get API key from https://platform.openai.com/api-keys
   * 3. Set environment variable: OPENAI_API_KEY=sk_...
   * 4. Set IMAGE_PROVIDER=DALLE in .env
   * 
   * Cost: $0.080 per image
   */
  static async generateWithDallE(prompt) {
    try {
      console.log('[DALLE] Initializing OpenAI client...');
      const { OpenAI } = require('openai');
      
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not set in environment');
      }
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 60000 // 60 second timeout
      });

      console.log('[DALLE] Calling OpenAI DALL-E 3 API...');
      console.log('[DALLE] Prompt length:', prompt.length);
      
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt.substring(0, 1000), // DALLE-3 has 1000 char limit
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid'
      });

      if (!response.data || !response.data[0] || !response.data[0].url) {
        throw new Error('Invalid response from DALLE-3 API');
      }

      const imageUrl = response.data[0].url;
      console.log('[DALLE] ✓ Image generated successfully:', imageUrl.substring(0, 50) + '...');
      
      return imageUrl;
    } catch (err) {
      console.error('[DALLE_ERROR]', err.message);
      console.error('[DALLE_ERROR_DETAILS]', err);
      throw err;
    }
  }

  /**
   * ==========================================
   * STABLE DIFFUSION INTEGRATION
   * ==========================================
   * 
   * Setup Option 1 (Cloud - Stability AI):
   * 1. Get API key from https://www.stabilityai.com/
   * 2. Set environment: STABILITY_API_KEY=sk_...
   * 3. Set IMAGE_PROVIDER=STABLE_DIFFUSION
   * 
   * Setup Option 2 (Local - Automatic1111 WebUI):
   * 1. Install from https://github.com/AUTOMATIC1111/stable-diffusion-webui
   * 2. Run: ./webui.sh
   * 3. API available at http://127.0.0.1:7860
   * 4. Set STABLE_DIFFUSION_URL=http://127.0.0.1:7860/api
   * 
   * Cost (Cloud): $0.025 per image
   * Cost (Local): One-time setup
   */
  static async generateWithStableDiffusion(prompt) {
    try {
      const axios = require('axios');
      
      const useCloud = process.env.STABILITY_API_KEY;
      
      if (useCloud) {
        // Cloud-based Stability AI
        console.log('[STABLE_DIFFUSION] Using Cloud API...');
        
        const response = await axios.post(
          'https://api.stability.ai/v1/generate',
          {
            steps: 30,
            width: 1024,
            height: 1024,
            seed: 0,
            cfg_scale: 7.0,
            samples: 1,
            text_prompts: [
              {
                text: prompt,
                weight: 1
              }
            ]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
            }
          }
        );

        if (response.data.artifacts && response.data.artifacts.length > 0) {
          const imageData = response.data.artifacts[0].base64;
          const dataUrl = `data:image/png;base64,${imageData}`;
          console.log('[STABLE_DIFFUSION] Image generated successfully');
          return dataUrl;
        }
      } else {
        // Local Automatic1111 WebUI
        console.log('[STABLE_DIFFUSION] Using Local WebUI...');
        
        const sdUrl = process.env.STABLE_DIFFUSION_URL || 'http://127.0.0.1:7860/api';
        
        const response = await axios.post(
          `${sdUrl}/txt2img`,
          {
            prompt: prompt,
            negative_prompt: 'ugly, blurry, distorted',
            steps: 20,
            width: 1024,
            height: 1024,
            cfg_scale: 7.0,
            sampler_name: 'DPM++ 2M Karras'
          }
        );

        if (response.data.images && response.data.images.length > 0) {
          const imageData = response.data.images[0];
          const dataUrl = `data:image/png;base64,${imageData}`;
          console.log('[STABLE_DIFFUSION] Image generated successfully');
          return dataUrl;
        }
      }
    } catch (err) {
      console.error('[STABLE_DIFFUSION_ERROR]', err.message);
      throw err;
    }
  }

  /**
   * ==========================================
   * MIDJOURNEY INTEGRATION
   * ==========================================
   * 
   * Setup:
   * 1. Get API key from https://www.midjourney.com/
   * 2. Use third-party API like Midjourney API or Replicate
   * 3. Set environment variable: MIDJOURNEY_API_KEY=...
   * 4. Set IMAGE_PROVIDER=MIDJOURNEY
   * 
   * Alternative: Use Replicate (easier)
   * 1. Get api token from https://replicate.com/
   * 2. npm install replicate
   * 3. Set REPLICATE_API_TOKEN=...
   */
  static async generateWithMidjourney(prompt) {
    try {
      // Using Replicate as Midjourney alternative (often better quality)
      const Replicate = require('replicate');
      
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN
      });

      console.log('[MIDJOURNEY] Calling Replicate API (Midjourney model)...');
      
      const output = await replicate.run(
        'midjourney/midjourney:4c83b976-d925-4b95-b278-f7de8374a6a7',
        {
          input: {
            prompt: prompt,
            negative_prompt: 'ugly, distorted, blurry'
          }
        }
      );

      const imageUrl = output && output.length > 0 ? output[0] : null;
      
      if (!imageUrl) {
        throw new Error('No image URL returned from Midjourney');
      }

      console.log('[MIDJOURNEY] Image generated successfully:', imageUrl);
      return imageUrl;
    } catch (err) {
      console.error('[MIDJOURNEY_ERROR]', err.message);
      throw err;
    }
  }

  /**
   * ==========================================
   * AZURE OPENAI INTEGRATION
   * ==========================================
   * 
   * Setup:
   * 1. Create Azure OpenAI resource
   * 2. Get: API_KEY, ENDPOINT, DEPLOYMENT_NAME
   * 3. Set environment variables:
   *    - AZURE_OPENAI_API_KEY=...
   *    - AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
   *    - AZURE_OPENAI_DEPLOYMENT=dall-e-3
   * 4. Set IMAGE_PROVIDER=AZURE
   * 
   * Cost: Same as DALL-E ($0.080 per image)
   */
  static async generateWithAzure(prompt) {
    try {
      const axios = require('axios');
      
      const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'dall-e-3';

      if (!endpoint || !apiKey) {
        throw new Error('Azure OpenAI credentials not configured');
      }

      console.log('[AZURE] Calling Azure OpenAI DALL-E...');
      
      const response = await axios.post(
        `${endpoint}/openai/deployments/${deployment}/images/generations?api-version=2024-02-15-preview`,
        {
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const imageUrl = response.data.data[0].url;
      console.log('[AZURE] Image generated successfully:', imageUrl);
      
      return imageUrl;
    } catch (err) {
      console.error('[AZURE_ERROR]', err.message);
      throw err;
    }
  }
}

module.exports = ImageGenerationService;
