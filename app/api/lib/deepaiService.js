/**
 * DeepAI Face Swap Service
 * Alternative to Replicate - more reliable face swapping
 * API: https://deepai.org/api/deepdream (or face swap endpoints)
 */

const DEEPAI_API_BASE = 'https://api.deepai.org/api';
const DEEPAI_FACE_SWAP_ENDPOINT = 'https://api.deepai.org/api/face-swap';

/**
 * Call DeepAI API to perform face swap
 * @param {string} sourceImageUrl - URL of source face image
 * @param {string} targetImageUrl - URL of target/illustration image  
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Result with swapped image URL
 */
export async function faceSwapWithDeepAI(sourceImageUrl, targetImageUrl, options = {}) {
  const apiKey = process.env.DEEPAI_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPAI_API_KEY not configured. Get it from https://deepai.org/account/profile');
  }

  try {
    console.log('[DEEPAI] Starting face swap...');
    console.log(`[DEEPAI] Source: ${sourceImageUrl.substring(0, 60)}...`);
    console.log(`[DEEPAI] Target: ${targetImageUrl.substring(0, 60)}...`);

    const formData = new FormData();
    formData.append('source_url', sourceImageUrl);
    formData.append('target_url', targetImageUrl);

    const response = await fetch(DEEPAI_FACE_SWAP_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[DEEPAI] API error:', error);
      throw new Error(`DeepAI API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[DEEPAI] ✓ Face swap completed');
    console.log('[DEEPAI] Result URL:', result.output_url);

    return {
      success: true,
      resultUrl: result.output_url,
      predictionId: result.id || `deepai_${Date.now()}`,
      processedAt: new Date().toISOString(),
      model: 'deepai-face-swap',
      provider: 'deepai'
    };
  } catch (error) {
    console.error('[DEEPAI] Face swap error:', error.message);
    throw error;
  }
}

/**
 * Alternative: Use removal.ai for background removal then compose
 * Or use imgupscailer.com for face swap
 */
export async function faceSwapWithImgUpscaler(sourceImageUrl, targetImageUrl, options = {}) {
  const apiKey = process.env.IMGUPSCALER_API_KEY;

  if (!apiKey) {
    throw new Error('IMGUPSCALER_API_KEY not configured');
  }

  try {
    console.log('[IMGUPSCALER] Starting face swap...');

    const response = await fetch('https://api.imgupscaler.com/api/face-swap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        source_image: sourceImageUrl,
        target_image: targetImageUrl,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`ImgUpscaler error: ${error.message}`);
    }

    const result = await response.json();
    console.log('[IMGUPSCALER] ✓ Face swap completed');

    return {
      success: true,
      resultUrl: result.result_url,
      predictionId: result.task_id,
      processedAt: new Date().toISOString(),
      model: 'imgupscaler-face-swap',
      provider: 'imgupscaler'
    };
  } catch (error) {
    console.error('[IMGUPSCALER] Error:', error.message);
    throw error;
  }
}

/**
 * Get pricing info for face swap services
 */
export function getPricingInfo() {
  return {
    provider: 'deepai',
    model: 'face-swap',
    costPerCall: 0.05, // DeepAI charges ~$0.05 per face swap
    currency: 'USD',
    monthlyCredits: 50, // Free tier usually includes some credits
  };
}

/**
 * Detect if image has faces using DeepAI
 */
export async function detectFacesWithDeepAI(imageUrl) {
  const apiKey = process.env.DEEPAI_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPAI_API_KEY not configured');
  }

  try {
    console.log('[DEEPAI] Detecting faces in:', imageUrl.substring(0, 60));

    const formData = new FormData();
    formData.append('image', imageUrl);

    const response = await fetch(`${DEEPAI_API_BASE}/face-detector`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Face detection failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('[DEEPAI] Found faces:', result.faces?.length || 0);

    return {
      hasFaces: (result.faces?.length || 0) > 0,
      faceCount: result.faces?.length || 0,
      faces: result.faces || [],
    };
  } catch (error) {
    console.error('[DEEPAI] Detection error:', error.message);
    throw error;
  }
}
