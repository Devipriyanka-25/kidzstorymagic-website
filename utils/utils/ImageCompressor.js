/**
 * ImageCompressor.js
 * 
 * Purpose: Compress images for PDF generation
 * Features:
 * - Resize images based on quality level
 * - Convert to optimized format
 * - Calculate file sizes
 */

/**
 * Compress image using canvas
 * @param {string} imageUrl - URL or data URL of image
 * @param {number} quality - compression quality (0.4 for low, 0.7 for medium, 1 for high)
 * @returns {Promise<string>} - compressed image as data URL
 */
export const compressImage = async (imageUrl, quality = 1) => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions (reduce for lower quality)
        const maxWidth = quality === 1 ? 1200 : quality === 0.7 ? 900 : 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed image
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Compress multiple images
 * @param {Array} images - array of image URLs
 * @param {number} quality - compression quality
 * @returns {Promise<Array>} - compressed image URLs
 */
export const compressImages = async (images, quality = 1) => {
  try {
    const compressed = await Promise.all(
      images.map(img => compressImage(img, quality))
    );
    return compressed;
  } catch (error) {
    console.error('[IMAGE-COMPRESS] Error compressing images:', error);
    return images; // Return originals if compression fails
  }
};

/**
 * Calculate estimated file size
 * @param {Array} images - array of image data URLs
 * @returns {number} - estimated size in MB
 */
export const calculateFileSize = (images) => {
  let totalSize = 0;
  
  images.forEach(img => {
    if (img && typeof img === 'string') {
      // Data URL size estimation
      // Remove data:image/jpeg;base64, prefix
      const base64Data = img.split(',')[1];
      if (base64Data) {
        // Each Base64 character represents 6 bits, so divide by 1.33
        totalSize += (base64Data.length * 6) / 8 / 1024 / 1024;
      }
    }
  });

  return totalSize;
};

/**
 * Format file size for display
 * @param {number} bytes - size in bytes
 * @returns {string} - formatted size (e.g., "2.5 MB")
 */
export const formatFileSize = (mb) => {
  if (mb > 1) {
    return `${mb.toFixed(2)} MB`;
  }
  return `${(mb * 1024).toFixed(2)} KB`;
};

export default {
  compressImage,
  compressImages,
  calculateFileSize,
  formatFileSize
};
