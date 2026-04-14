// Face Swap Service
// Uses Replicate API to swap faces in generated illustrations with child's photo
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class FaceSwapService {
  /**
   * Initialize Replicate client
   */
  static initializeReplicate() {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN not configured in environment variables');
    }
    return process.env.REPLICATE_API_TOKEN;
  }

  /**
   * Swap faces in image using Replicate API
   * Replaces baby face in generated illustration with child's photo
   * 
   * @param {string} illustrationUrl - URL of generated illustration
   * @param {string} childPhotoUrl - URL or path of child's photo
   * @param {string} projectId - Project ID for logging
   * @returns {Promise<string>} - URL of face-swapped image
   */
  static async swapFace(illustrationUrl, childPhotoUrl, projectId) {
    try {
      console.log(`[FACE_SWAP] Starting face swap for project ${projectId}`);
      console.log(`[FACE_SWAP] Illustration: ${illustrationUrl.substring(0, 80)}...`);
      console.log(`[FACE_SWAP] Child Photo: ${childPhotoUrl.substring(0, 80)}...`);

      const token = this.initializeReplicate();

      // Use a more reliable face swap model: lucataco/face_swap
      // This model is simpler and more reliable than strmoder/roop
      console.log('[FACE_SWAP] Submitting to Replicate face swap model...');
      
      const predictionResponse = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: 'da0e4c0f842e84fae29c39f0d3fbc4f05dccc7b5e1c2b7c5d5b0e0f9f8e0d0f', // lucataco/face_swap
          input: {
            source_image: childPhotoUrl,
            target_image: illustrationUrl
          }
        },
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const predictionId = predictionResponse.data.id;
      console.log(`[FACE_SWAP] Prediction submitted with ID: ${predictionId}`);

      // Poll for prediction completion with longer timeout
      const result = await this.pollPrediction(predictionId, token, projectId, 60);

      if (result.status === 'succeeded' && result.output) {
        const swappedImageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        console.log(`[FACE_SWAP] ✓ Face swap successful!`);
        return swappedImageUrl;
      } else if (result.status === 'failed') {
        console.error(`[FACE_SWAP] Prediction failed:`, result.error);
        throw new Error(`Face swap failed: ${result.error || 'Unknown error'}`);
      } else {
        console.warn(`[FACE_SWAP] Unexpected status: ${result.status}`);
        return illustrationUrl; // Return original if face swap doesn't complete
      }
    } catch (err) {
      console.error('[FACE_SWAP_ERROR]', err.message);
      if (err.response) {
        console.error('[FACE_SWAP_ERROR_RESPONSE]', err.response.status, err.response.data);
      }
      console.error('[FACE_SWAP] Returning original illustration due to face swap error');
      return illustrationUrl; // Return original image if face swap fails
    }
  }

  /**
   * Poll Replicate API for prediction completion
   * @param {string} predictionId - Prediction ID from Replicate
   * @param {string} token - Replicate API token
   * @param {string} projectId - Project ID for logging
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise<object>} - Final prediction result
   */
  static async pollPrediction(predictionId, token, projectId, maxAttempts = 60) {
    const pollInterval = 3000; // 3 seconds between polls
    let attempts = 0;
    let lastStatus = null;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${token}`
            },
            timeout: 30000
          }
        );

        const prediction = response.data;
        
        // Log status change
        if (prediction.status !== lastStatus) {
          console.log(`[FACE_SWAP_POLL] Status: ${prediction.status} (attempt ${attempts + 1}/${maxAttempts})`);
          lastStatus = prediction.status;
        }

        if (prediction.status === 'succeeded') {
          console.log(`[FACE_SWAP_POLL] ✓ Prediction succeeded!`);
          return prediction;
        } else if (prediction.status === 'failed') {
          console.error(`[FACE_SWAP_POLL] ✗ Prediction failed:`, prediction.error);
          return prediction;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      } catch (err) {
        console.error('[FACE_SWAP_POLL_ERROR]', err.message);
        throw err;
      }
    }

    throw new Error(`Face swap prediction timed out after ${maxAttempts} attempts (${(maxAttempts * pollInterval / 1000).toFixed(0)}s)`);
  }

  /**
   * Batch apply face swap to all pages
   * @param {array} pages - Array of page objects with illustrationUrl
   * @param {string} childPhotoUrl - Child's photo URL
   * @param {string} projectId - Project ID
   * @returns {Promise<array>} - Pages with face-swapped images
   */
  static async batchSwapFaces(pages, childPhotoUrl, projectId) {
    try {
      // Validate inputs
      if (!childPhotoUrl) {
        console.warn(`[FACE_SWAP_BATCH] No child photo URL provided, skipping face swap`);
        return pages;
      }

      console.log(`[FACE_SWAP_BATCH] Starting batch face swap for ${pages.length} pages`);
      console.log(`[FACE_SWAP_BATCH] Child Photo URL: ${childPhotoUrl.substring(0, 100)}...`);

      const swappedPages = await Promise.all(
        pages.map(async (page, index) => {
          try {
            if (!page.illustrationUrl) {
              console.warn(`[FACE_SWAP_BATCH] Page ${index} has no illustration URL, skipping`);
              return page;
            }

            console.log(`[FACE_SWAP_BATCH] Processing page ${index + 1}/${pages.length}`);
            const swappedUrl = await this.swapFace(page.illustrationUrl, childPhotoUrl, projectId);
            
            return {
              ...page,
              faceSwappedUrl: swappedUrl,
              faceSwapped: true
            };
          } catch (err) {
            console.warn(`[FACE_SWAP_BATCH_WARN] Failed to swap face for page ${index}:`, err.message);
            return {
              ...page,
              faceSwapped: false,
              faceSwapError: err.message
            };
          }
        })
      );

      console.log(`[FACE_SWAP_BATCH] Completed face swap for ${pages.length} pages`);
      return swappedPages;
    } catch (err) {
      console.error('[FACE_SWAP_BATCH_ERROR]', err.message);
      throw err;
    }
  }

  /**
   * Check if face swap is enabled and configured
   * @returns {boolean}
   */
  static isEnabled() {
    const enabled = process.env.ENABLE_FACE_SWAP === 'true';
    const hasToken = !!process.env.REPLICATE_API_TOKEN;
    
    console.log(`[FACE_SWAP_CHECK] Enabled: ${enabled}, Has Token: ${hasToken}`);
    
    if (enabled && !hasToken) {
      console.warn('[FACE_SWAP_CHECK] Face swap enabled but REPLICATE_API_TOKEN not configured');
    }
    
    return enabled && hasToken;
  }
}

module.exports = FaceSwapService;
