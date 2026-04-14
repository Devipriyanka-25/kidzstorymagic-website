// Image Processing Service
// Handles image manipulation: cropping, blur, watermark

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessingService {
  /**
   * Auto-crop image to center with specified dimensions
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Number} width - Target width
   * @param {Number} height - Target height
   * @returns {Promise<Buffer>} Cropped image buffer
   */
  static async autoCropToCenter(imageBuffer, width = 800, height = 1000) {
    try {
      console.log('[IMAGE_PROCESSING] Auto-cropping image to center');
      
      const metadata = await sharp(imageBuffer).metadata();
      const { width: imgWidth, height: imgHeight } = metadata;

      // Calculate crop dimensions maintaining aspect ratio
      const aspectRatio = width / height;
      const imageAspectRatio = imgWidth / imgHeight;

      let cropWidth, cropHeight, left, top;

      if (imageAspectRatio > aspectRatio) {
        // Image is wider - crop width
        cropHeight = imgHeight;
        cropWidth = Math.floor(imgHeight * aspectRatio);
        left = Math.floor((imgWidth - cropWidth) / 2);
        top = 0;
      } else {
        // Image is taller - crop height
        cropWidth = imgWidth;
        cropHeight = Math.floor(imgWidth / aspectRatio);
        left = 0;
        top = Math.floor((imgHeight - cropHeight) / 2);
      }

      console.log(`[IMAGE_PROCESSING] Crop dimensions: ${cropWidth}x${cropHeight}, position: (${left}, ${top})`);

      const croppedImage = await sharp(imageBuffer)
        .extract({
          left,
          top,
          width: cropWidth,
          height: cropHeight
        })
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();

      console.log('[IMAGE_PROCESSING] Auto-crop completed');
      return croppedImage;
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Auto-crop failed:', error);
      throw error;
    }
  }

  /**
   * Apply Gaussian blur to specified region
   * @param {Buffer} imageBuffer - Image buffer
   * @param {Array} faceRegions - Array of face bounding boxes [{x, y, w, h}, ...]
   * @param {Number} blurRadius - Blur radius (default 30)
   * @returns {Promise<Buffer>} Blurred image buffer
   */
  static async applyFaceBlur(imageBuffer, faceRegions = [], blurRadius = 30) {
    try {
      console.log(`[IMAGE_PROCESSING] Applying blur to ${faceRegions.length} face regions`);

      if (!faceRegions || faceRegions.length === 0) {
        console.log('[IMAGE_PROCESSING] No face regions detected, returning original');
        return imageBuffer;
      }

      let output = imageBuffer;

      // Apply blur to each face region sequentially
      for (let i = 0; i < faceRegions.length; i++) {
        const region = faceRegions[i];
        console.log(`[IMAGE_PROCESSING] Blurring face ${i + 1}: x=${region.x}, y=${region.y}, w=${region.w}, h=${region.h}`);

        // Get metadata for each iteration
        const metadata = await sharp(output).metadata();

        // Ensure region is within bounds
        const x = Math.max(0, region.x);
        const y = Math.max(0, region.y);
        const w = Math.min(region.w, metadata.width - x);
        const h = Math.min(region.h, metadata.height - y);

        // Create blur overlay for this region
        const blurOverlay = await sharp({
          create: {
            width: metadata.width,
            height: metadata.height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .png()
          .toBuffer();

        // Apply Gaussian blur to face region
        // Since sharp doesn't have native face blur, we'll use pixelate effect
        const faceRegionImage = await sharp(output)
          .extract({ left: x, top: y, width: w, height: h })
          .blur(blurRadius)
          .toBuffer();

        // Composite the blurred region back
        output = await sharp(output)
          .composite([
            {
              input: faceRegionImage,
              left: x,
              top: y
            }
          ])
          .toBuffer();
      }

      console.log('[IMAGE_PROCESSING] Face blur completed');
      return output;
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Face blur failed:', error);
      throw error;
    }
  }

  /**
   * Add diagonal watermark text across image
   * @param {Buffer} imageBuffer - Image buffer
   * @param {String} watermarkText - Text to display (default: "PREVIEW")
   * @param {Number} opacity - Opacity 0-1 (default: 0.3)
   * @returns {Promise<Buffer>} Watermarked image buffer
   */
  static async addDiagonalWatermark(imageBuffer, watermarkText = 'PREVIEW', opacity = 0.3) {
    try {
      console.log(`[IMAGE_PROCESSING] Adding watermark: "${watermarkText}"`);

      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      // Create watermark SVG with diagonal text
      const svgWatermark = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>
              text {
                font-family: Arial, sans-serif;
                font-size: 60px;
                font-weight: bold;
                fill: rgba(255, 255, 255, ${opacity});
                text-anchor: middle;
                letter-spacing: 20px;
              }
            </style>
          </defs>
          <g transform="translate(${width / 2}, ${height / 2}) rotate(-45)">
            <text x="0" y="0">${watermarkText}</text>
          </g>
          <!-- Add multiple watermarks for coverage -->
          <g transform="translate(${width / 4}, ${height / 4}) rotate(-45)">
            <text x="0" y="0" opacity="${opacity}">${watermarkText}</text>
          </g>
          <g transform="translate(${(width * 3) / 4}, ${(height * 3) / 4}) rotate(-45)">
            <text x="0" y="0" opacity="${opacity}">${watermarkText}</text>
          </g>
        </svg>
      `;

      const watermarkedImage = await sharp(imageBuffer)
        .composite([
          {
            input: Buffer.from(svgWatermark),
            tile: false
          }
        ])
        .toBuffer();

      console.log('[IMAGE_PROCESSING] Watermark added successfully');
      return watermarkedImage;
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Watermark failed:', error);
      throw error;
    }
  }

  /**
   * Complete pipeline: crop -> blur faces -> watermark
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Array} faceRegions - Face bounding boxes from Vision API
   * @param {Object} options - Processing options
   * @returns {Promise<{blurred: Buffer, watermarked: Buffer}>} Processed images
   */
  static async processImage(imageBuffer, faceRegions = [], options = {}) {
    try {
      const {
        cropWidth = 800,
        cropHeight = 1000,
        blurRadius = 30,
        watermarkText = 'PREVIEW',
        watermarkOpacity = 0.3
      } = options;

      console.log('[IMAGE_PROCESSING] Starting full pipeline');

      // Step 1: Auto-crop
      let croppedImage = await this.autoCropToCenter(
        imageBuffer,
        cropWidth,
        cropHeight
      );

      // Step 2: Adjust face coordinates to cropped image dimensions
      // Face coordinates need to be recalculated based on the crop region
      const adjustedFaceRegions = this.adjustCoordinatesToCropedImage(
        faceRegions,
        imageBuffer,
        cropWidth,
        cropHeight
      );

      // Step 3: Apply blur to faces
      const blurredImage = await this.applyFaceBlur(
        croppedImage,
        adjustedFaceRegions,
        blurRadius
      );

      // Step 4: Add watermark
      const watermarkedImage = await this.addDiagonalWatermark(
        blurredImage,
        watermarkText,
        watermarkOpacity
      );

      console.log('[IMAGE_PROCESSING] Pipeline completed successfully');

      return {
        blurred: blurredImage,
        watermarked: watermarkedImage
      };
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Adjust face coordinates from original image to cropped image
   * @param {Array} faceRegions - Original face coordinates
   * @param {Buffer} originalImageBuffer - Original image
   * @param {Number} targetWidth - Target width for crop
   * @param {Number} targetHeight - Target height for crop
   * @returns {Array} Adjusted coordinates
   */
  static async adjustCoordinatesToCropedImage(
    faceRegions,
    originalImageBuffer,
    targetWidth,
    targetHeight
  ) {
    try {
      if (!faceRegions || faceRegions.length === 0) {
        return [];
      }

      const metadata = await sharp(originalImageBuffer).metadata();
      const { width: originalWidth, height: originalHeight } = metadata;

      // Calculate crop parameters
      const aspectRatio = targetWidth / targetHeight;
      const imageAspectRatio = originalWidth / originalHeight;

      let cropOffsetX = 0;
      let cropOffsetY = 0;
      let cropWidth = originalWidth;
      let cropHeight = originalHeight;

      if (imageAspectRatio > aspectRatio) {
        cropWidth = Math.floor(originalHeight * aspectRatio);
        cropOffsetX = Math.floor((originalWidth - cropWidth) / 2);
      } else {
        cropHeight = Math.floor(originalWidth / aspectRatio);
        cropOffsetY = Math.floor((originalHeight - cropHeight) / 2);
      }

      // Scale factor after resize
      const scaleX = targetWidth / cropWidth;
      const scaleY = targetHeight / cropHeight;

      // Adjust each face region
      const adjustedRegions = faceRegions.map(region => ({
        x: Math.max(0, Math.floor((region.x - cropOffsetX) * scaleX)),
        y: Math.max(0, Math.floor((region.y - cropOffsetY) * scaleY)),
        w: Math.floor(region.w * scaleX),
        h: Math.floor(region.h * scaleY)
      }));

      console.log(
        `[IMAGE_PROCESSING] Adjusted ${adjustedRegions.length} face regions for cropped image`
      );
      return adjustedRegions;
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Coordinate adjustment failed:', error);
      return [];
    }
  }

  /**
   * Get image metadata
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Object>} Image metadata
   */
  static async getImageMetadata(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      console.log('[IMAGE_PROCESSING] Image metadata:', metadata);
      return metadata;
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Metadata retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Convert image to specific format
   * @param {Buffer} imageBuffer - Image buffer
   * @param {String} format - Output format (jpeg, png, webp)
   * @param {Object} options - Format-specific options
   * @returns {Promise<Buffer>} Converted image
   */
  static async convertFormat(imageBuffer, format = 'jpeg', options = { quality: 90 }) {
    try {
      console.log(`[IMAGE_PROCESSING] Converting image to ${format}`);

      let converter = sharp(imageBuffer);

      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          converter = converter.jpeg(options);
          break;
        case 'png':
          converter = converter.png(options);
          break;
        case 'webp':
          converter = converter.webp(options);
          break;
        default:
          converter = converter.jpeg(options);
      }

      const output = await converter.toBuffer();
      console.log(`[IMAGE_PROCESSING] Image converted to ${format}`);
      return output;
    } catch (error) {
      console.error('[IMAGE_PROCESSING_ERROR] Format conversion failed:', error);
      throw error;
    }
  }
}

module.exports = ImageProcessingService;
