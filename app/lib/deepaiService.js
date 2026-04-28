/**
 * DeepAI Service Module
 * Handles face swap operations using DeepAI API
 * 
 * API Reference: https://deepai.org/machine-learning-model/face-swap
 */

const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;
const DEEPAI_API_URL = 'https://api.deepai.org/api/face-swap';

/**
 * Perform face swap using DeepAI API
 * @param {string} faceImageUrl - URL of the child's face photo
 * @param {string} illustrationUrl - URL of the cartoon illustration
 * @returns {Promise<{resultUrl: string}>} Face-swapped image URL
 */
export async function faceSwapWithDeepAI(faceImageUrl, illustrationUrl) {
  try {
    console.log('[DEEPAI_SERVICE] Starting face swap operation');
    console.log('[DEEPAI_SERVICE] Face image:', faceImageUrl.substring(0, 60) + '...');
    console.log('[DEEPAI_SERVICE] Illustration:', illustrationUrl.substring(0, 60) + '...');

    // Validate API key
    if (!DEEPAI_API_KEY) {
      throw new Error('DEEPAI_API_KEY is not configured');
    }

    // Prepare form data for DeepAI API
    const formData = new FormData();
    
    // DeepAI expects form data with file URLs
    // image1: the source face (child's photo)
    // image2: the target image (illustration)
    formData.append('image1', faceImageUrl);
    formData.append('image2', illustrationUrl);

    // Call DeepAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 second timeout

    try {
      console.log('[DEEPAI_SERVICE] Sending request to DeepAI API...');
      
      const response = await fetch(DEEPAI_API_URL, {
        method: 'POST',
        headers: {
          'api-key': DEEPAI_API_KEY,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DEEPAI_SERVICE] API error response:', response.status, errorText);
        throw new Error(`DeepAI API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Validate result
      if (!result.output_url) {
        console.error('[DEEPAI_SERVICE] No output URL in response:', result);
        throw new Error('DeepAI did not return an output URL');
      }

      console.log('[DEEPAI_SERVICE] ✅ Face swap successful');
      console.log('[DEEPAI_SERVICE] Output URL:', result.output_url.substring(0, 60) + '...');

      return {
        resultUrl: result.output_url,
        processingTime: result.processing_time || 'unknown',
      };

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Face swap operation timed out after 55 seconds');
      }
      throw error;
    }

  } catch (error) {
    console.error('[DEEPAI_SERVICE] ❌ Face swap failed:', error.message);
    throw new Error(`Face swap service error: ${error.message}`);
  }
}

/**
 * Batch face swap for multiple illustrations
 * @param {string} faceImageUrl - URL of the child's face photo
 * @param {string[]} illustrationUrls - Array of illustration URLs
 * @returns {Promise<string[]>} Array of face-swapped image URLs
 */
export async function batchFaceSwap(faceImageUrl, illustrationUrls) {
  try {
    console.log('[DEEPAI_SERVICE] Starting batch face swap for', illustrationUrls.length, 'images');

    const results = [];

    for (let i = 0; i < illustrationUrls.length; i++) {
      try {
        console.log(`[DEEPAI_SERVICE] Processing image ${i + 1}/${illustrationUrls.length}...`);
        
        const result = await faceSwapWithDeepAI(faceImageUrl, illustrationUrls[i]);
        results.push(result.resultUrl);

        // Add small delay between API calls to avoid rate limiting
        if (i < illustrationUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`[DEEPAI_SERVICE] Failed on image ${i + 1}:`, error.message);
        // Use original illustration URL if face swap fails
        results.push(illustrationUrls[i]);
      }
    }

    console.log('[DEEPAI_SERVICE] ✅ Batch face swap complete');
    return results;

  } catch (error) {
    console.error('[DEEPAI_SERVICE] ❌ Batch face swap failed:', error);
    throw error;
  }
}
