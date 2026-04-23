/**
 * Replicate API Service
 * Handles face swap and other ML tasks via Replicate
 */

const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

/**
 * Call Replicate API to perform face swap
 * Using strmoder/roop v2 - Popular face swap model
 */
export async function faceSwapWithReplicate(faceImageUrl, targetImageUrl, options = {}) {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN not configured. Get it from https://replicate.com/account/api-tokens');
  }

  try {
    console.log('[REPLICATE] Starting face swap prediction...');
    console.log(`[REPLICATE] Face image: ${faceImageUrl.substring(0, 50)}...`);
    console.log(`[REPLICATE] Target image: ${targetImageUrl.substring(0, 50)}...`);

    // Create prediction
    const predictionResponse = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '9e7c2a91d928c03a0e68b1000aae75bc7be2e2db7ff5f30e79e2f53b6c8da0b6', // strmoder/roop:v2
        input: {
          source_url: faceImageUrl,
          target_url: targetImageUrl,
          swap_condition: 'All faces', // Swap all faces in target
          gender_source: options.genderSource || 'No', // Detect automatically
          gender_target: options.genderTarget || 'No',
          model: 'inswapper_128.onnx', // High quality model
          codeformer: false, // Don't apply face restoration for speed
          only_center_face: options.onlyCenterFace !== false, // Focus on center face
          num_steps: 50, // Quality vs speed tradeoff
        },
      }),
    });

    if (!predictionResponse.ok) {
      const error = await predictionResponse.json();
      throw new Error(`Replicate API error: ${error.detail || predictionResponse.statusText}`);
    }

    let prediction = await predictionResponse.json();
    const predictionId = prediction.id;

    console.log(`[REPLICATE] Prediction created: ${predictionId}`);
    console.log(`[REPLICATE] Status: ${prediction.status}`);

    // Poll for completion (max 5 minutes)
    const maxAttempts = 60; // 60 * 5 seconds = 5 minutes
    let attempts = 0;

    while (
      (prediction.status === 'processing' || prediction.status === 'starting') &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
        headers: {
          Authorization: `Token ${apiToken}`,
        },
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to get prediction status: ${statusResponse.statusText}`);
      }

      prediction = await statusResponse.json();
      attempts++;

      console.log(`[REPLICATE] Attempt ${attempts}/${maxAttempts} - Status: ${prediction.status}`);

      if (prediction.status === 'succeeded') {
        console.log('[REPLICATE] ✓ Face swap completed successfully');
        return {
          success: true,
          resultUrl: prediction.output,
          predictionId,
          processedAt: new Date().toISOString(),
          model: 'strmoder/roop:v2',
        };
      }

      if (prediction.status === 'failed') {
        console.error('[REPLICATE] Prediction failed:', prediction.error);
        throw new Error(`Face swap failed: ${prediction.error || 'Unknown error'}`);
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Face swap processing timed out after 5 minutes');
    }

    throw new Error(`Unexpected prediction status: ${prediction.status}`);
  } catch (error) {
    console.error('[REPLICATE] Error:', error.message);
    throw error;
  }
}

/**
 * Download image and convert to base64
 * Needed for client-side image processing
 */
export async function imageUrlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Detect image type from URL or content-type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('[IMAGE_CONVERT] Error:', error.message);
    throw error;
  }
}

/**
 * Validate image URL is accessible
 */
export async function validateImageUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('[IMAGE_VALIDATE] Error:', error.message);
    return false;
  }
}

/**
 * Get face swap pricing info
 */
export function getPricingInfo() {
  return {
    model: 'strmoder/roop:v2',
    costPerCall: 0.085, // Approximate cost
    estimatedCostFor20Pages: 1.7, // 20 * 0.085
    note: 'Prices are approximate and may vary based on usage',
    source: 'https://replicate.com/strmoder/roop',
  };
}
