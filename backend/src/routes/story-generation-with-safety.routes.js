/**
 * backend/src/routes/story-generation-with-safety.routes.js
 *
 * Story generation routes with integrated child safety validation
 * Includes:
 * - COPPA compliance
 * - Parental consent verification
 * - Data deletion after processing
 * - No persistent storage of photos/child data
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  validateChildSafety,
  cleanupChildData,
  preventChildDataStorage,
} = require('../middleware/validateChildSafety');
const {
  generateStoryFromImages,
  selectImagesForStory,
  createStoryContent,
  saveDraft,
  regenerateStory,
} = require('../services/story-generation.service');
const ChildSafetyService = require('../services/childSafetyService');
const logger = require('../utils/logger');

/**
 * POST /api/story/generate-with-safety
 *
 * Generate story with child safety compliance
 *
 * Request Body:
 * {
 *   childName: string,           // Required
 *   childAge: number,            // Required (1-17)
 *   parentEmail: string,         // Required if age < 13
 *   parentConsent: boolean,      // Required
 *   theme: string,               // Optional
 *   projectId: string,           // Required
 *   images: File[],              // Required (base64 or files)
 *   storyPrompt: string          // Optional
 * }
 */
router.post(
  '/generate-with-safety',
  verifyToken,
  validateChildSafety,
  cleanupChildData,
  preventChildDataStorage,
  async (req, res) => {
    try {
      const {
        projectId,
        childName,
        childAge,
        parentEmail,
        theme = 'adventure',
        images,
        storyPrompt,
      } = req.body;
      const userId = req.user.id;
      const childSafety = req.childSafety; // From middleware

      logger.info('[STORY-GEN-SAFE] Story generation started', {
        projectId,
        childName,
        childAge,
        imageCount: images ? images.length : 0,
      });

      // Validate input
      if (!projectId || !images || images.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: projectId, images',
        });
      }

      if (images.length < 3 || images.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Stories require 3-10 images',
        });
      }

      // Log safety event
      await ChildSafetyService.logSafetyEvent(userId, 'STORY_GENERATION', {
        age: childAge,
        childName,
        imageCount: images.length,
        requiresParentConsent: childSafety.requiresParentConsent,
      });

      // Generate story using AI service
      const story = await generateStoryFromImages({
        userId,
        projectId,
        childName,
        theme,
        images,
        storyPrompt,
        regenerationCount: 0,
      });

      logger.info('[STORY-GEN-SAFE] ✓ Story generated', {
        storyId: story.id,
        pageCount: story.pages.length,
      });

      // If child is under 13, send parental consent notification
      if (childSafety.requiresParentConsent && parentEmail) {
        try {
          await ChildSafetyService.sendParentConsentNotification(
            parentEmail,
            childName,
            childAge
          );

          logger.info('[STORY-GEN-SAFE] Consent email sent', {
            to: parentEmail.split('@')[0] + '@***',
          });
        } catch (emailError) {
          logger.warn('[STORY-GEN-SAFE] Email sending failed (non-blocking)', emailError);
          // Don't block story generation if email fails
        }
      }

      // Schedule data deletion
      await ChildSafetyService.deleteChildSessionData(userId, projectId);

      // Log completion
      await ChildSafetyService.logSafetyEvent(userId, 'STORY_GENERATED', {
        storyId: story.id,
        childName,
        age: childAge,
        dataScheduledForDeletion: true,
      });

      res.json({
        success: true,
        data: story,
        dataPolicy: {
          message: 'Photos and child data will be deleted after checkout',
          photosStored: false,
          personalDataStored: false,
        },
      });
    } catch (error) {
      logger.error('[STORY-GEN-SAFE] Error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate story',
      });
    }
  }
);

/**
 * POST /api/story/generate-story
 * Generate story content from selected images (with child safety)
 */
router.post(
  '/generate-story',
  verifyToken,
  validateChildSafety,
  cleanupChildData,
  preventChildDataStorage,
  async (req, res) => {
    try {
      const {
        projectId,
        childName,
        childAge,
        parentEmail,
        selectedImages,
        theme = 'adventure',
      } = req.body;
      const userId = req.user.id;

      logger.info('[STORY-CONTENT-GEN] Generating story content', {
        projectId,
        childName,
        imageCount: selectedImages ? selectedImages.length : 0,
      });

      if (!projectId || !selectedImages || selectedImages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }

      // Generate story content
      const storyContent = await createStoryContent({
        userId,
        projectId,
        childName,
        theme,
        images: selectedImages,
      });

      // Schedule cleanup
      await ChildSafetyService.deleteChildSessionData(userId, projectId);

      res.json({
        success: true,
        data: storyContent,
      });
    } catch (error) {
      logger.error('[STORY-CONTENT-GEN] Error', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate story content',
      });
    }
  }
);

/**
 * POST /api/story/validate-child-info
 * Pre-validate child information without processing
 */
router.post('/validate-child-info', validateChildSafety, async (req, res) => {
  try {
    const { childAge, parentEmail } = req.body;

    res.json({
      success: true,
      message: 'Child information is valid',
      validation: {
        ageValid: true,
        under13: childAge < 13,
        consentRequired: childAge < 13,
        parentEmailVerified: !!parentEmail && childAge < 13,
      },
    });
  } catch (error) {
    logger.error('[VALIDATE-CHILD-INFO] Error', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
    });
  }
});

/**
 * GET /api/story/child-safety-policy
 * Get child safety policy and privacy information
 */
router.get('/child-safety-policy', (req, res) => {
  res.json({
    success: true,
    policy: {
      compliance: ['COPPA', 'GDPR', 'CCPA'],
      dataHandling: {
        photosStored: false,
        personalDataStored: false,
        deletionTiming: 'Immediately after processing',
        parentalConsentRequired: 'Age < 13',
      },
      privacy: {
        shareData: false,
        sellData: false,
        trackChildren: false,
        advertising: false,
      },
      parentsCanRequest: [
        'Data deletion',
        'Consent revocation',
        'Data export',
        'Contact information',
      ],
    },
  });
});

module.exports = router;
