// Azure Vision API Service
// Detects faces and extracts facial features

const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { ApiKeyCredentials } = require('@azure/ms-rest-js');

class AzureVisionService {
  constructor() {
    const endpoint = process.env.AZURE_VISION_ENDPOINT;
    const apiKey = process.env.AZURE_VISION_API_KEY;

    if (!endpoint || !apiKey) {
      throw new Error('Azure Vision API credentials not configured');
    }

    this.client = new ComputerVisionClient(
      new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': apiKey } }),
      endpoint
    );

    console.log('[AZURE_VISION] Service initialized');
  }

  /**
   * Detect faces in image
   * @param {Buffer} imageBuffer - Image data
   * @returns {Promise<Array>} Array of face regions
   */
  async detectFaces(imageBuffer) {
    try {
      console.log('[AZURE_VISION] Detecting faces in image');

      // Convert buffer to base64 for API
      const imageData = imageBuffer.toString('base64');

      // Call API
      const faceResults = await this.client.analyzeImageInStream(
        imageBuffer,
        {
          visualFeatures: ['Faces'],
          details: ['Celebrities', 'Landmarks']
        }
      );

      if (!faceResults.faces || faceResults.faces.length === 0) {
        console.log('[AZURE_VISION] No faces detected');
        return [];
      }

      // Extract and normalize face regions
      const faceRegions = faceResults.faces.map(face => {
        const { faceRectangle } = face;
        return {
          x: faceRectangle.left,
          y: faceRectangle.top,
          w: faceRectangle.width,
          h: faceRectangle.height,
          confidence: face.faceAttributes?.headPose?.yaw || 0,
          age: face.faceAttributes?.age,
          gender: face.faceAttributes?.gender
        };
      });

      console.log(`[AZURE_VISION] Detected ${faceRegions.length} faces`);
      return faceRegions;
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Face detection failed:', error);
      throw error;
    }
  }

  /**
   * Detect faces from URL
   * @param {String} imageUrl - Image URL
   * @returns {Promise<Array>} Array of face regions
   */
  async detectFacesFromUrl(imageUrl) {
    try {
      console.log(`[AZURE_VISION] Detecting faces from URL: ${imageUrl}`);

      const faceResults = await this.client.analyzeImage(
        imageUrl,
        {
          visualFeatures: ['Faces'],
          details: ['Celebrities', 'Landmarks']
        }
      );

      if (!faceResults.faces || faceResults.faces.length === 0) {
        console.log('[AZURE_VISION] No faces detected from URL');
        return [];
      }

      const faceRegions = faceResults.faces.map(face => {
        const { faceRectangle } = face;
        return {
          x: faceRectangle.left,
          y: faceRectangle.top,
          w: faceRectangle.width,
          h: faceRectangle.height,
          confidence: face.faceAttributes?.headPose?.yaw || 0,
          age: face.faceAttributes?.age,
          gender: face.faceAttributes?.gender
        };
      });

      console.log(`[AZURE_VISION] Detected ${faceRegions.length} faces from URL`);
      return faceRegions;
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Face detection from URL failed:', error);
      throw error;
    }
  }

  /**
   * Analyze image for various features
   * @param {Buffer} imageBuffer - Image data
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeImage(imageBuffer) {
    try {
      console.log('[AZURE_VISION] Analyzing image');

      const analysis = await this.client.analyzeImageInStream(
        imageBuffer,
        {
          visualFeatures: [
            'Categories',
            'Color',
            'Description',
            'Faces',
            'Objects',
            'Tags'
          ],
          details: ['Celebrities', 'Landmarks']
        }
      );

      const result = {
        categories: analysis.categories || [],
        color: analysis.imageType?.isBwImg ? 'black_white' : analysis.color?.dominantColors || [],
        description: analysis.description?.captions?.[0]?.text || '',
        faces: (analysis.faces || []).map(face => ({
          x: face.faceRectangle.left,
          y: face.faceRectangle.top,
          w: face.faceRectangle.width,
          h: face.faceRectangle.height,
          age: face.faceAttributes?.age,
          gender: face.faceAttributes?.gender
        })),
        objects: analysis.objects || [],
        tags: analysis.tags || []
      };

      console.log('[AZURE_VISION] Image analysis completed');
      return result;
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Image analysis failed:', error);
      throw error;
    }
  }

  /**
   * Describe image content
   * @param {Buffer} imageBuffer - Image data
   * @param {Number} maxCaptions - Max captions to return
   * @returns {Promise<Object>} Description result
   */
  async describeImage(imageBuffer, maxCaptions = 1) {
    try {
      console.log('[AZURE_VISION] Describing image');

      const description = await this.client.analyzeImageInStream(
        imageBuffer,
        {
          visualFeatures: ['Description'],
          language: 'en',
          maxDescription: maxCaptions
        }
      );

      const result = {
        captions: (description.description?.captions || []).map(caption => ({
          text: caption.text,
          confidence: caption.confidence
        })),
        tags: description.description?.tags || []
      };

      console.log('[AZURE_VISION] Image description completed');
      return result;
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Image description failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from image (OCR)
   * @param {Buffer} imageBuffer - Image data
   * @returns {Promise<Object>} OCR results
   */
  async extractText(imageBuffer) {
    try {
      console.log('[AZURE_VISION] Extracting text from image');

      const result = await this.client.recognizeTextInStream(imageBuffer, 'en');

      const extractedText = result.regions
        ?.flatMap(region =>
          region.lines?.flatMap(line =>
            line.words?.map(word => word.text).join(' ')
          )
        )
        .join('\n') || '';

      console.log('[AZURE_VISION] Text extraction completed');
      return {
        fullText: extractedText,
        regions: result.regions || []
      };
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Text extraction failed:', error);
      throw error;
    }
  }

  /**
   * Detect objects in image
   * @param {Buffer} imageBuffer - Image data
   * @returns {Promise<Array>} Detected objects
   */
  async detectObjects(imageBuffer) {
    try {
      console.log('[AZURE_VISION] Detecting objects in image');

      const analysis = await this.client.analyzeImageInStream(
        imageBuffer,
        {
          visualFeatures: ['Objects']
        }
      );

      const objects = (analysis.objects || []).map(obj => ({
        name: obj.objectName,
        confidence: obj.confidence,
        rectangle: {
          x: obj.rectangle.x,
          y: obj.rectangle.y,
          w: obj.rectangle.w,
          h: obj.rectangle.h
        }
      }));

      console.log(`[AZURE_VISION] Detected ${objects.length} objects`);
      return objects;
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Object detection failed:', error);
      throw error;
    }
  }

  /**
   * Get visual features from image
   * @param {Buffer} imageBuffer - Image data
   * @returns {Promise<Object>} Visual features
   */
  async getVisualFeatures(imageBuffer) {
    try {
      console.log('[AZURE_VISION] Extracting visual features');

      const analysis = await this.client.analyzeImageInStream(
        imageBuffer,
        {
          visualFeatures: [
            'Categories',
            'Color',
            'Description',
            'Faces',
            'ImageType',
            'Objects',
            'Tags'
          ]
        }
      );

      const features = {
        isAdultContent: analysis.adultContent?.isAdultContent || false,
        isRacyContent: analysis.adultContent?.isRacyContent || false,
        categories: analysis.categories || [],
        color: {
          dominantColors: analysis.color?.dominantColors || [],
          isBWImg: analysis.imageType?.isBwImg || false,
          accentColor: analysis.color?.accentColor
        },
        faceCount: (analysis.faces || []).length,
        hasClipArt: analysis.imageType?.clipArtType > 0,
        hasLineDrawing: analysis.imageType?.lineDrawingType > 0,
        tags: (analysis.tags || []).map(tag => ({
          name: tag.name,
          confidence: tag.confidence
        }))
      };

      console.log('[AZURE_VISION] Visual features extracted');
      return features;
    } catch (error) {
      console.error('[AZURE_VISION_ERROR] Feature extraction failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
let azureVisionInstance = null;

const getAzureVisionService = () => {
  if (!azureVisionInstance) {
    azureVisionInstance = new AzureVisionService();
  }
  return azureVisionInstance;
};

module.exports = { AzureVisionService, getAzureVisionService };
