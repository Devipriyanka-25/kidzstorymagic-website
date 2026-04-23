/**
 * Face Swap API Utilities
 * Helper functions for face detection and swapping
 */

import axios from 'axios';

// Get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Face Detection API
export const faceSwapAPI = {
  /**
   * Detect face in uploaded photo
   * @param {File} photo - Image file
   * @param {string} childName - Child's name
   * @param {string} userId - User ID
   * @param {string} storyId - Story ID (optional)
   * @returns {Promise} Face detection result
   */
  async detectFace(photo, childName, userId, storyId) {
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('childName', childName);
      formData.append('userId', userId);
      if (storyId) {
        formData.append('storyId', storyId);
      }

      const response = await axios.post('/api/photos/detect-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('[FACE_API] Detect face error:', error);
      throw new Error(error.response?.data?.error || 'Face detection failed');
    }
  },

  /**
   * Perform face swap on illustration (Simple - for DeepAI)
   * @param {string} faceImageUrl - URL of face photo
   * @param {string} illustrationImageUrl - URL of illustration
   * @param {Object} options - Additional options
   * @returns {Promise} Face swap result
   */
  async swapFaceDeepAI(faceImageUrl, illustrationImageUrl, options = {}) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/photos/face-swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          faceImageUrl,
          illustrationImageUrl,
          ...options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Face swap failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[FACE_API] ✓ Face swap successful');
      
      return result.result;
    } catch (error) {
      console.error('[FACE_API] DeepAI swap error:', error.message);
      throw error;
    }
  },

  /**
   * Swap face for multiple story pages with proper error handling
   * @param {string} faceImageUrl - URL of face photo
   * @param {array} pages - Story pages with illustration URLs
   * @param {Object} options - Additional options
   * @returns {Promise} Batch processing result
   */
  async swapFaceForStoryPages(faceImageUrl, pages, options = {}) {
    try {
      const swappedPages = [];
      let successCount = 0;
      let errorCount = 0;

      console.log(`[FACE_API] Processing ${pages.length} pages...`);

      for (const page of pages) {
        try {
          const illustrationUrl = page.illustrationUrl || page.image;
          
          if (!illustrationUrl) {
            console.warn(`[FACE_API] Page ${page.pageNumber} has no illustration URL`);
            swappedPages.push({
              ...page,
              faceSwapped: false,
              error: 'No illustration URL',
            });
            errorCount++;
            continue;
          }

          const result = await this.swapFaceDeepAI(
            faceImageUrl,
            illustrationUrl,
            {
              pageNumber: page.pageNumber,
              childName: options.childName,
              ...options,
            }
          );

          swappedPages.push({
            ...page,
            swappedImageUrl: result.swappedImageUrl,
            originalIllustrationUrl: illustrationUrl,
            faceSwapped: true,
            processedAt: result.processedAt,
            model: result.model,
          });

          successCount++;
          console.log(`[FACE_API] ✓ Page ${page.pageNumber} completed`);

          // Add delay between requests to avoid rate limiting (1-2 seconds)
          await new Promise(resolve => setTimeout(resolve, 1500));
        } catch (error) {
          console.warn(`[FACE_API] ✗ Page ${page.pageNumber} failed:`, error.message);
          errorCount++;

          // Keep original page if swap fails
          swappedPages.push({
            ...page,
            faceSwapped: false,
            error: error.message,
            originalIllustrationUrl: page.illustrationUrl || page.image,
          });
        }
      }

      console.log(`[FACE_API] Batch complete: ${successCount}/${pages.length} success`);

      return {
        pages: swappedPages,
        successCount,
        errorCount,
        totalPages: pages.length,
        status: errorCount === 0 ? 'success' : 'partial',
      };
    } catch (error) {
      console.error('[FACE_API] Batch processing error:', error.message);
      throw error;
    }
  },

  /**
   * Save face swap result to database
   * @param {Object} params - Save parameters
   * @returns {Promise} Save result
   */
  async saveFaceSwap(params) {
    try {
      const {
        storyId,
        photoId,
        pageNumber,
        originalIllustrationUrl,
        swappedIllustrationUrl,
        faceSwapData,
      } = params;

      const response = await axios.post(
        '/api/photos/save-face-swap',
        {
          storyId,
          photoId,
          pageNumber,
          originalIllustrationUrl,
          swappedIllustrationUrl,
          faceSwapData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('[FACE_API] Save face swap error:', error);
      throw new Error(error.response?.data?.error || 'Failed to save face swap');
    }
  },

  /**
   * Batch process face swaps for multiple pages
   * @param {Object} params - Batch parameters
   * @returns {Promise} Array of swapped illustrations
   */
  async processFaceSwaps(params) {
    try {
      const { storyId, faceData, illustrations, photoId } = params;

      const results = [];

      for (let i = 0; i < illustrations.length; i++) {
        try {
          const swapResult = await this.performFaceSwap({
            faceImageBase64: faceData.extracted_base64,
            illustrationImageUrl: illustrations[i].url,
            storyId,
            photoId,
            pageNumber: i + 1,
            facePosition: faceData.position,
            faceSize: {
              width: faceData.position.width,
              height: faceData.position.height,
            },
          });

          if (swapResult.success) {
            // Save to database
            await this.saveFaceSwap({
              storyId,
              photoId,
              pageNumber: i + 1,
              originalIllustrationUrl: illustrations[i].url,
              swappedIllustrationUrl: swapResult.result.swappedImage,
              faceSwapData: swapResult.processedData,
            });

            results.push({
              pageNumber: i + 1,
              success: true,
              swappedImage: swapResult.result.swappedImage,
            });
          } else {
            results.push({
              pageNumber: i + 1,
              success: false,
              error: swapResult.error || 'Unknown error',
              originalImage: illustrations[i].url,
            });
          }
        } catch (error) {
          console.error(`Error processing page ${i + 1}:`, error);
          results.push({
            pageNumber: i + 1,
            success: false,
            error: error.message,
            originalImage: illustrations[i].url,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('[FACE_API] Batch process error:', error);
      throw new Error(error.message || 'Batch face swap processing failed');
    }
  },

  /**
   * Get face swap results for a story
   * @param {string} storyId - Story ID
   * @returns {Promise} Array of face swapped illustrations
   */
  async getFaceSwapResults(storyId) {
    try {
      const response = await axios.get(`/api/photos/face-swap-results/${storyId}`, {
        headers: getAuthHeader(),
      });

      return response.data;
    } catch (error) {
      console.error('[FACE_API] Get results error:', error);
      throw new Error(error.response?.data?.error || 'Failed to retrieve face swap results');
    }
  },

  /**
   * Delete face swap result
   * @param {string} resultId - Face swap result ID
   * @returns {Promise} Delete confirmation
   */
  async deleteFaceSwap(resultId) {
    try {
      const response = await axios.delete(`/api/photos/face-swap/${resultId}`, {
        headers: getAuthHeader(),
      });

      return response.data;
    } catch (error) {
      console.error('[FACE_API] Delete error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete face swap');
    }
  },
};

// Image Processing Utilities
export const imageUtils = {
  /**
   * Get image dimensions
   * @param {string} src - Image source URL or base64
   * @returns {Promise} Image dimensions
   */
  async getImageDimensions(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Convert image to base64
   * @param {File} file - Image file
   * @returns {Promise} Base64 string
   */
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate image file
   * @param {File} file - Image file
   * @returns {Object} Validation result
   */
  validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const errors = [];

    if (!validTypes.includes(file.type)) {
      errors.push('Invalid image format. Use JPEG, PNG, GIF, or WebP');
    }

    if (file.size > maxSize) {
      errors.push('Image too large. Maximum 10MB');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Resize image for face detection
   * @param {string} base64 - Base64 image
   * @param {number} maxWidth - Max width
   * @param {number} maxHeight - Max height
   * @returns {Promise} Resized base64 image
   */
  async resizeImage(base64, maxWidth = 640, maxHeight = 480) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL());
      };
      img.src = base64;
    });
  },
};

export default faceSwapAPI;
