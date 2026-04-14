// Photo Upload Routes
// Handles photo upload, processing, and storage

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');
const { ImageProcessingService } = require('../services/imageProcessing');
const { getAzureBlobService } = require('../services/azureBlob');
const { getAzureVisionService } = require('../services/azureVision');
const pool = require('../config/database');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

/**
 * POST /story/:projectId/upload-photo
 * Upload and process child photo
 */
router.post('/:projectId/upload-photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId; // Use req.userId set by auth middleware

    console.log(`[PHOTO_UPLOAD] Starting upload for project ${projectId} (userId: ${userId})`);

    // Validate project ownership
    const projectQuery = 'SELECT * FROM story_projects WHERE id = $1 AND user_id = $2';
    const projectResult = await pool.query(projectQuery, [projectId, userId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (!req.file) {
      console.error('[PHOTO_UPLOAD_ERROR] No file provided');
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    const imageBuffer = req.file.buffer;
    console.log(`[PHOTO_UPLOAD] File received: ${req.file.originalname} (${imageBuffer.length} bytes)`);

    // Step 1: Detect faces
    console.log('[PHOTO_UPLOAD] Detecting faces...');
    const visionService = getAzureVisionService();
    let faceRegions = [];

    try {
      faceRegions = await visionService.detectFaces(imageBuffer);
      console.log(`[PHOTO_UPLOAD] Face detection completed: ${faceRegions.length} faces found`);
    } catch (faceError) {
      console.warn('[PHOTO_UPLOAD_WARN] Face detection failed, proceeding without blur:', faceError.message);
      // Continue without face blur - will just watermark
    }

    // Step 2: Process image
    console.log('[PHOTO_UPLOAD] Processing image...');
    const processedImages = await ImageProcessingService.processImage(
      imageBuffer,
      faceRegions,
      {
        cropWidth: 800,
        cropHeight: 1000,
        blurRadius: 30,
        watermarkText: 'PREVIEW'
      }
    );

    console.log('[PHOTO_UPLOAD] Image processing completed', {
      hasBlurred: !!processedImages.blurred,
      hasWatermarked: !!processedImages.watermarked,
      hasOriginal: !!processedImages.original
    });

    // Step 3: Upload to Azure Blob Storage
    console.log('[PHOTO_UPLOAD] Uploading images to Azure...');
    const blobService = getAzureBlobService();
    
    // Ensure container exists
    await blobService.ensureContainer();
    
    const fileId = uuidv4();
    const timestamp = Date.now();

    // Create metadata
    const metadata = {
      projectId,
      userId,
      uploadDate: new Date().toISOString(),
      facesDetected: String(faceRegions.length),
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype
    };

    // Upload images with descriptive names
    const uploadedUrls = await blobService.uploadProcessedImages(
      {
        original: imageBuffer,
        blurred: processedImages.blurred,
        watermarked: processedImages.watermarked
      },
      projectId,
      {
        ...metadata,
        fileId,
        timestamp
      }
    );

    console.log('[PHOTO_UPLOAD] Images uploaded successfully', {
      originalUrl: uploadedUrls.original,
      blurredUrl: uploadedUrls.blurred,
      watermarkedUrl: uploadedUrls.watermarked
    });

    // Step 4: Update database with photo information
    const updateQuery = `
      UPDATE story_projects 
      SET 
        child_photo_url = $1,
        child_photo_preview_url = $2,
        child_photo_processed_url = $3,
        photo_metadata = $4,
        updated_at = NOW()
      WHERE id = $5 AND user_id = $6
      RETURNING *;
    `;

    const photoMetadata = JSON.stringify({
      fileId,
      facesDetected: faceRegions.length,
      faceRegions,
      uploadedAt: new Date().toISOString(),
      originalFileName: req.file.originalname
    });

    const updateResult = await pool.query(updateQuery, [
      uploadedUrls.original,
      uploadedUrls.blurred,
      uploadedUrls.watermarked,
      photoMetadata,
      projectId,
      userId
    ]);

    console.log(`[PHOTO_UPLOAD] Database updated for project ${projectId}`);

    // Step 5: Generate preview URLs with SAS tokens (valid for 7 days for preview)
    const previewSasUrl = await blobService.generateSasUrl(
      `${projectId}/preview-${fileId}.jpg`,
      60 * 24 * 7 // 7 days
    );

    const originalSasUrl = await blobService.generateSasUrl(
      `${projectId}/original-${fileId}.jpg`,
      60 * 24 * 7
    );

    console.log('[PHOTO_UPLOAD] Success - Photo uploaded and processed');

    const responseData = {
      success: true,
      message: 'Photo uploaded and processed successfully',
      data: {
        projectId,
        fileId,
        facesDetected: faceRegions.length,
        faceRegions,
        urls: {
          original: uploadedUrls.original,
          blurred: uploadedUrls.blurred,
          watermarked: uploadedUrls.watermarked,
          previewSas: previewSasUrl,
          originalSas: originalSasUrl
        },
        project: updateResult.rows[0]
      }
    };

    console.log('[PHOTO_UPLOAD] Response data:', JSON.stringify(responseData, null, 2));

    res.status(200).json(responseData);
  } catch (error) {
    console.error('[PHOTO_UPLOAD_ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Photo upload failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /story/:projectId/photo-preview
 * Get photo preview URL with SAS token
 */
router.get('/:projectId/photo-preview', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId; // Use req.userId set by auth middleware

    console.log(`[PHOTO_PREVIEW] Fetching preview for project ${projectId}`);

    const projectQuery = `
      SELECT id, child_photo_preview_url, photo_metadata 
      FROM story_projects 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(projectQuery, [projectId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = result.rows[0];

    if (!project.child_photo_preview_url) {
      return res.status(404).json({
        success: false,
        message: 'No photo uploaded for this project'
      });
    }

    // Generate fresh SAS URL
    const blobService = getAzureBlobService();
    const parts = project.child_photo_preview_url.split('/');
    const blobName = parts[parts.length - 1];

    const previewSasUrl = await blobService.generateSasUrl(blobName, 60); // 1 hour

    const metadata = project.photo_metadata ? JSON.parse(project.photo_metadata) : {};

    console.log('[PHOTO_PREVIEW] Preview retrieved successfully');

    res.status(200).json({
      success: true,
      data: {
        previewUrl: previewSasUrl,
        metadata: metadata,
        previewUrlExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('[PHOTO_PREVIEW_ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve photo preview',
      error: error.message
    });
  }
});

/**
 * DELETE /story/:projectId/photo
 * Delete uploaded photo
 */
router.delete('/:projectId/photo', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId; // Use req.userId set by auth middleware

    console.log(`[PHOTO_DELETE] Deleting photo for project ${projectId}`);

    // Get project to find photo references
    const projectQuery = `
      SELECT id, child_photo_url, child_photo_preview_url, child_photo_processed_url
      FROM story_projects 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await pool.query(projectQuery, [projectId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const project = result.rows[0];
    if (!project.child_photo_url) {
      return res.status(404).json({
        success: false,
        message: 'No photo to delete'
      });
    }

    const blobService = getAzureBlobService();

    // Delete all versions from blob storage
    const deletePromises = [];

    if (project.child_photo_url) {
      const originalPath = project.child_photo_url.split('/').pop();
      deletePromises.push(blobService.deleteBlob(originalPath));
    }

    if (project.child_photo_preview_url) {
      const previewPath = project.child_photo_preview_url.split('/').pop();
      deletePromises.push(blobService.deleteBlob(previewPath));
    }

    if (project.child_photo_processed_url) {
      const processedPath = project.child_photo_processed_url.split('/').pop();
      deletePromises.push(blobService.deleteBlob(processedPath));
    }

    await Promise.all(deletePromises);
    console.log('[PHOTO_DELETE] Blobs deleted from storage');

    // Update database
    const updateQuery = `
      UPDATE story_projects 
      SET 
        child_photo_url = NULL,
        child_photo_preview_url = NULL,
        child_photo_processed_url = NULL,
        photo_metadata = NULL,
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;

    await pool.query(updateQuery, [projectId, userId]);

    console.log(`[PHOTO_DELETE] Photo deleted for project ${projectId}`);

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('[PHOTO_DELETE_ERROR]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo',
      error: error.message
    });
  }
});

module.exports = router;
