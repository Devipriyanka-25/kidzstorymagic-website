// Image Processing Utilities
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class ImageProcessor {
  /**
   * Apply blur to an image
   */
  static async applyBlur(imagePath, outputPath, radius = 25) {
    try {
      await sharp(imagePath)
        .blur(radius)
        .toFile(outputPath);
      return outputPath;
    } catch (err) {
      console.error('Blur failed:', err);
      throw new Error('Failed to blur image');
    }
  }

  /**
   * Add watermark text to image
   */
  static async addWatermark(imagePath, outputPath, text = 'PREVIEW - WATERMARK') {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Create watermark SVG
      const watermarkSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <defs>
            <style>
              .watermark-text {
                font-size: 48px;
                fill: rgba(255, 255, 255, 0.3);
                font-weight: bold;
              }
            </style>
          </defs>
          <g transform="translate(${metadata.width / 2}, ${metadata.height / 2}) rotate(-45)">
            <text x="0" y="0" class="watermark-text" text-anchor="middle">
              ${text}
            </text>
          </g>
        </svg>
      `;

      const watermarkBuffer = Buffer.from(watermarkSvg);

      await sharp(imagePath)
        .composite([{ input: watermarkBuffer, blend: 'over' }])
        .toFile(outputPath);

      return outputPath;
    } catch (err) {
      console.error('Watermark failed:', err);
      throw new Error('Failed to add watermark');
    }
  }

  /**
   * Apply both blur and watermark to image
   */
  static async applyBlurAndWatermark(imagePath, outputPath) {
    try {
      // First blur the image
      const tempBlurPath = path.join(
        path.dirname(outputPath),
        `temp_blur_${uuidv4()}.jpg`
      );
      
      await this.applyBlur(imagePath, tempBlurPath);
      
      // Then add watermark
      await this.addWatermark(tempBlurPath, outputPath);
      
      // Clean up temp file
      await fs.unlink(tempBlurPath);
      
      return outputPath;
    } catch (err) {
      console.error('Blur and watermark failed:', err);
      throw err;
    }
  }

  /**
   * Generate thumbnail for preview
   */
  static async generateThumbnail(imagePath, outputPath, size = 300) {
    try {
      await sharp(imagePath)
        .resize(size, size, { fit: 'cover' })
        .toFile(outputPath);
      return outputPath;
    } catch (err) {
      console.error('Thumbnail generation failed:', err);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Process image for high-resolution PDF
   */
  static async processForHighRes(imagePath, outputPath) {
    try {
      await sharp(imagePath)
        .jpeg({ quality: 95, progressive: true })
        .toFile(outputPath);
      return outputPath;
    } catch (err) {
      console.error('High-res processing failed:', err);
      throw new Error('Failed to process image for PDF');
    }
  }

  /**
   * Crop image to remove unwanted areas
   */
  static async cropImage(imagePath, outputPath, left, top, width, height) {
    try {
      await sharp(imagePath)
        .extract({ left, top, width, height })
        .toFile(outputPath);
      return outputPath;
    } catch (err) {
      console.error('Crop failed:', err);
      throw new Error('Failed to crop image');
    }
  }

  /**
   * Rotate image
   */
  static async rotateImage(imagePath, outputPath, angle) {
    try {
      await sharp(imagePath)
        .rotate(angle)
        .toFile(outputPath);
      return outputPath;
    } catch (err) {
      console.error('Rotation failed:', err);
      throw new Error('Failed to rotate image');
    }
  }
}

module.exports = ImageProcessor;
