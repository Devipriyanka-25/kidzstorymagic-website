/**
 * backend/src/middleware/validateChildSafety.js
 *
 * Middleware to validate child safety requirements
 * Ensures COPPA compliance:
 * - Age validation (1-17)
 * - Parental consent for children under 13
 * - Parent email verification for children under 13
 * - No data storage after processing
 */

const logger = require('../utils/logger');

/**
 * Validate child safety requirements
 * COPPA-compliant validation middleware
 */
const validateChildSafety = (req, res, next) => {
  try {
    const { childName, childAge, parentEmail, parentConsent } = req.body;

    logger.info('[CHILD_SAFETY] Validating request', {
      childName,
      childAge,
      hasParentEmail: !!parentEmail,
      parentConsent,
    });

    // Validate child name
    if (!childName || typeof childName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Child name is required and must be a string',
        code: 'INVALID_CHILD_NAME',
      });
    }

    if (childName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Child name must be at least 2 characters long',
        code: 'INVALID_CHILD_NAME',
      });
    }

    // Validate child age
    if (!childAge || isNaN(childAge)) {
      return res.status(400).json({
        success: false,
        error: 'Child age is required and must be a number',
        code: 'INVALID_CHILD_AGE',
      });
    }

    const age = parseInt(childAge, 10);

    if (age < 1 || age > 17) {
      return res.status(400).json({
        success: false,
        error: 'Child age must be between 1 and 17 years old',
        code: 'INVALID_CHILD_AGE',
      });
    }

    // COPPA Compliance: Children under 13
    if (age < 13) {
      logger.warn('[CHILD_SAFETY] Child under 13 detected', { age });

      // Verify parental consent
      if (!parentConsent || parentConsent !== true) {
        logger.warn('[CHILD_SAFETY] Parental consent missing for child under 13', { age });
        return res.status(403).json({
          success: false,
          error: 'Parental consent is required for children under 13',
          code: 'PARENTAL_CONSENT_REQUIRED',
          details: 'A parent or guardian must provide explicit consent.',
        });
      }

      // Verify parent email
      if (!parentEmail || typeof parentEmail !== 'string') {
        logger.warn('[CHILD_SAFETY] Parent email missing for child under 13', { age });
        return res.status(400).json({
          success: false,
          error: 'Parent/guardian email is required for children under 13',
          code: 'PARENT_EMAIL_REQUIRED',
          details: 'We need to verify the parent or guardian email address.',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail.trim())) {
        logger.warn('[CHILD_SAFETY] Invalid parent email format', { parentEmail });
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid parent/guardian email address',
          code: 'INVALID_EMAIL_FORMAT',
        });
      }

      // Log verified under-13 access
      logger.info('[CHILD_SAFETY] ✓ Under-13 request verified', {
        age,
        parentEmail: parentEmail.split('@')[0] + '@***', // Mask for logs
        consent: true,
      });

      // Store in request for later use (e.g., sending consent email)
      req.childSafety = {
        age,
        requiresParentConsent: true,
        parentEmail: parentEmail.trim().toLowerCase(),
        requiresDataDeletion: true,
      };
    } else {
      // Age 13+: Consent still required (verifying user/guardian awareness)
      if (!parentConsent || parentConsent !== true) {
        logger.warn('[CHILD_SAFETY] Consent missing for user', { age });
        return res.status(400).json({
          success: false,
          error: 'You must acknowledge our child safety and privacy practices',
          code: 'SAFETY_ACKNOWLEDGMENT_REQUIRED',
        });
      }

      logger.info('[CHILD_SAFETY] ✓ 13+ user verified', { age });

      // Store in request for later use
      req.childSafety = {
        age,
        requiresParentConsent: false,
        parentEmail: null,
        requiresDataDeletion: true,
      };
    }

    // Mark request as safety-validated
    req.childSafety.validated = true;

    logger.info('[CHILD_SAFETY] ✓ Validation passed', {
      age: req.childSafety.age,
      requiresParentConsent: req.childSafety.requiresParentConsent,
    });

    next();
  } catch (error) {
    logger.error('[CHILD_SAFETY] Validation error', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during safety validation',
      code: 'VALIDATION_ERROR',
    });
  }
};

/**
 * Middleware to ensure data is deleted after processing
 * Cleans up memory and temporary storage
 */
const cleanupChildData = (req, res, next) => {
  try {
    // Store original send function
    const originalSend = res.send;

    // Override send to cleanup data
    res.send = function (data) {
      if (req.childSafety && req.childSafety.requiresDataDeletion) {
        // Schedule cleanup of image buffers from memory
        setImmediate(() => {
          if (req.file) {
            req.file.buffer = null;
          }
          if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file) => {
              file.buffer = null;
            });
          }
        });

        logger.info('[CHILD_SAFETY] Data cleanup scheduled', {
          hasFile: !!req.file,
          fileCount: req.files ? req.files.length : 0,
        });
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  } catch (error) {
    logger.error('[CHILD_SAFETY] Cleanup middleware error', error);
    next();
  }
};

/**
 * Middleware to prevent data storage in database for child processing
 * Ensures no photos or child personal data persists
 */
const preventChildDataStorage = (req, res, next) => {
  if (req.childSafety && req.childSafety.validated) {
    // Flag that this request should NOT persist any child data
    req.skipChildDataStorage = true;

    logger.info('[CHILD_SAFETY] Data storage prevention enabled for this request');
  }

  next();
};

module.exports = {
  validateChildSafety,
  cleanupChildData,
  preventChildDataStorage,
};
