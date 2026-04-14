/**
 * backend/src/routes/story-generation.routes.js
 * 
 * Purpose: Handle story generation workflows
 * Features:
 * - Generate story from uploaded images
 * - AI image analysis and selection
 * - Story content generation with theme
 * - Draft management
 * - Regeneration with different parameters
 */

const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const { 
  generateStoryFromImages,
  selectImagesForStory,
  createStoryContent,
  saveDraft,
  regenerateStory
} = require('../services/story-generation.service');

/**
 * POST /api/story/generate-from-images
 * Generate story from uploaded images
 */
router.post('/generate-from-images', authenticateJWT, async (req, res) => {
  try {
    console.log('[STORY-GEN] Generating story from images');
    
    const { projectId, childName, theme, images, regenerationCount = 0 } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!projectId || !childName || !images || images.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: projectId, childName, images'
      });
    }

    if (images.length < 3) {
      return res.status(400).json({
        error: 'Minimum 3 images required for story generation'
      });
    }

    if (images.length > 10) {
      return res.status(400).json({
        error: 'Maximum 10 images allowed for story generation'
      });
    }

    // Generate story using AI service
    const story = await generateStoryFromImages({
      userId,
      projectId,
      childName,
      theme: theme || 'adventure',
      images,
      regenerationCount
    });

    console.log('[STORY-GEN] ✓ Story generated successfully', {
      storyId: story.id,
      pageCount: story.pages.length
    });

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('[STORY-GEN] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate story'
    });
  }
});

/**
 * POST /api/story/save-draft
 * Save generated story as draft
 */
router.post('/save-draft', authenticateJWT, async (req, res) => {
  try {
    console.log('[STORY-DRAFT] Saving story as draft');
    
    const { projectId, story, images, status = 'draft' } = req.body;
    const userId = req.user.id;

    if (!projectId || !story) {
      return res.status(400).json({
        error: 'Missing required fields: projectId, story'
      });
    }

    const draft = await saveDraft({
      userId,
      projectId,
      story,
      images: images || [],
      status
    });

    console.log('[STORY-DRAFT] ✓ Draft saved successfully', { draftId: draft.id });

    res.json({
      success: true,
      data: draft
    });
  } catch (error) {
    console.error('[STORY-DRAFT] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to save draft'
    });
  }
});

/**
 * POST /api/story/:storyId/regenerate
 * Regenerate story with different image selection
 */
router.post('/:storyId/regenerate', authenticateJWT, async (req, res) => {
  try {
    console.log('[STORY-REGEN] Regenerating story');
    
    const { storyId } = req.params;
    const { images, theme, childName } = req.body;
    const userId = req.user.id;

    if (!images || images.length === 0) {
      return res.status(400).json({
        error: 'Images required for story regeneration'
      });
    }

    const regeneratedStory = await regenerateStory({
      userId,
      storyId,
      images,
      theme,
      childName
    });

    console.log('[STORY-REGEN] ✓ Story regenerated successfully');

    res.json({
      success: true,
      data: regeneratedStory
    });
  } catch (error) {
    console.error('[STORY-REGEN] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to regenerate story'
    });
  }
});

/**
 * GET /api/story/:storyId
 * Get story details
 */
router.get('/:storyId', authenticateJWT, async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // Fetch from database
    const story = await require('../models/Story').findById(storyId);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Verify ownership
    if (story.userId !== userId && story.isPublic !== true) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('[STORY-GET] Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch story'
    });
  }
});

module.exports = router;
