// Story API Routes
const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { verifyToken } = require('../middleware/auth');
const {
  validateChildSafety,
  cleanupChildData,
  preventChildDataStorage,
} = require('../middleware/validateChildSafety');
const StoryProject = require('../models/StoryProject');
const StoryRenderer = require('../utils/storyRenderer');
const ImageProcessor = require('../utils/imageProcessor');
const ChildSafetyService = require('../services/childSafetyService');
const config = require('../config/config');

const ImageGenerationService = require('../services/imageGeneration');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.file.upload.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (config.file.upload.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
  limits: { fileSize: config.file.upload.maxSize }
});

// Create new story project
// 🔒 SECURITY: Validates child safety requirements
router.post(
  '/create',
  verifyToken,
  validateChildSafety,      // Enforce parental consent
  preventChildDataStorage,  // Prevent data persistence
  async (req, res) => {
  try {
    const {
      title,
      age_group,
      theme,
      page_count,
      child_name,
      child_gender,
      child_interests,
      child_notes,
      childAge,  // From safety validation
      parentEmail // From safety validation
    } = req.body;

    // Validation
    if (!age_group && !childAge) {
      return res.status(400).json({
        error: 'Required fields: age_group (or childAge), theme, page_count, child_name'
      });
    }

    if (!theme || !page_count || !child_name) {
      return res.status(400).json({
        error: 'Required fields: age_group, theme, page_count, child_name'
      });
    }

    // Create project
    const project = await StoryProject.create({
      user_id: req.userId,
      title: title || `${child_name}'s Story`,
      age_group: age_group || childAge,
      theme,
      page_count,
      child_name,
      child_gender,
      child_interests,
      child_notes
    });

    // Log safety event
    if (req.childSafety) {
      await ChildSafetyService.logSafetyEvent(req.userId, 'PROJECT_CREATED', {
        age: req.childSafety.age,
        childName: child_name,
        projectId: project.id,
        requiresParentConsent: req.childSafety.requiresParentConsent,
      }).catch(e => console.warn('Error logging project creation:', e));

      // Send parent consent email if child is under 13
      if (req.childSafety.requiresParentConsent && parentEmail) {
        ChildSafetyService.sendParentConsentNotification(
          parentEmail,
          child_name,
          req.childSafety.age
        ).catch(e => console.warn('Error sending parent email:', e));
      }
    }

    res.status(201).json({
      message: 'Story project created successfully',
      project,
      _security: {
        childSafetyValidated: !!req.childSafety,
        consentRequired: req.childSafety?.requiresParentConsent || false
      }
    });
  } catch (err) {
    console.error('[CREATE_PROJECT_ERROR]', err.message, err);
    res.status(500).json({ 
      error: 'Failed to create story project',
      details: err.message
    });
  }
});

// Update story project
router.put('/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify ownership
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project
    const updated = await StoryProject.update(projectId, req.body);

    res.json({
      message: 'Project updated successfully',
      project: updated
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Get project details
router.get('/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get user's projects
router.get('', verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const projects = await StoryProject.findByUserId(req.userId, limit, offset);
    const stats = await StoryProject.getProjectStats(req.userId);

    res.json({
      projects,
      stats,
      pagination: { limit, offset }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Delete project
router.delete('/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify ownership
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await StoryProject.delete(projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Upload photo
router.post('/:projectId/upload-photo', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify ownership
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const baseUrl = config.app.baseUrl;
    const originalUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const blurredPath = path.join(
      config.file.upload.uploadDir,
      `blurred_${req.file.filename}`
    );
    const watermarkedPath = path.join(
      config.file.upload.uploadDir,
      `watermarked_${req.file.filename}`
    );

    // Process image: apply blur and watermark
    await ImageProcessor.applyBlurAndWatermark(req.file.path, watermarkedPath);
    
    // Also create blurred version
    await ImageProcessor.applyBlur(req.file.path, blurredPath);

    const watermarkedUrl = `${baseUrl}/uploads/watermarked_${req.file.filename}`;

    // Save photo URLs to database for face swap feature
    console.log(`[PHOTO_UPLOAD] Saving child photo URLs to project ${projectId}`);
    await StoryProject.update(projectId, {
      child_photo_url: originalUrl,
      child_photo_preview_url: watermarkedUrl,
      child_photo_processed_url: watermarkedUrl
    });
    console.log(`[PHOTO_UPLOAD] ✓ Child photo URLs saved to database`);

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        fileId: path.basename(req.file.filename),
        facesDetected: 0,
        urls: {
          original: originalUrl,
          blurred: `${baseUrl}/uploads/blurred_${req.file.filename}`,
          watermarked: watermarkedUrl,
          previewSas: watermarkedUrl,
          originalSas: originalUrl
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Generate story from template
router.post('/:projectId/generate-story', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { customPrompt, storyLanguage = 'en' } = req.body;

    // Verify ownership
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Generate story with image prompts
    console.log(`[GENERATE_STORY] Starting story generation for project ${projectId}`);
    console.log(`[GENERATE_STORY] Language: ${storyLanguage}, Project theme: ${project.theme}, Page count: ${project.page_count}`);
    if (customPrompt) {
      console.log(`[GENERATE_STORY] Custom illustration prompt provided: ${customPrompt.substring(0, 100)}...`);
    }
    
    const storyPages = await StoryRenderer.generateStory(project, project.theme, customPrompt, storyLanguage);
    console.log(`[GENERATE_STORY] Generated ${storyPages.length} story pages`);
    console.log(`[GENERATE_STORY] First page sample:`, JSON.stringify(storyPages[0], null, 2));

    // Generate illustrations for each page (pass theme and child photo for face swap)
    console.log(`[GENERATE_STORY] Generating ${storyPages.length} illustrations`);
    const illustratedPages = await ImageGenerationService.generateBatchImages(
      storyPages,
      projectId,
      project.theme, // Pass theme for theme-specific images
      project.child_photo_url // Pass child photo URL for optional face swap
    );

    console.log(`[GENERATE_STORY] Generated ${illustratedPages.length} illustrated pages`);
    console.log(`[GENERATE_STORY] First illustrated page sample:`, JSON.stringify(illustratedPages[0], null, 2));

    // Save to database
    await StoryRenderer.saveStoryContent(projectId, illustratedPages);

    // Update project status
    await StoryProject.update(projectId, { status: 'story_generated' });

    console.log(`[GENERATE_STORY] Story generation completed for project ${projectId}`);

    res.json({
      message: 'Story generated successfully',
      story: illustratedPages
    });
  } catch (err) {
    console.error('[GENERATE_STORY_ERROR]', err);
    console.error('[GENERATE_STORY_ERROR_STACK]', err.stack);
    res.status(500).json({ error: 'Failed to generate story', details: err.message });
  }
});

// Get story content
router.get('/:projectId/content', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify ownership
    const project = await StoryProject.findById(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get story content
    const content = await StoryRenderer.getStoryContent(projectId);

    res.json({ content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch story content' });
  }
});

module.exports = router;
