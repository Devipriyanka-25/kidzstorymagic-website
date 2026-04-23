/**
 * backend/src/services/childSafetyService.js
 *
 * Service to handle child safety and data deletion requirements
 * Ensures COPPA compliance and privacy protection
 */

const pool = require('../config/database');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Child Safety Service
 */
class ChildSafetyService {
  /**
   * Send parental consent notification email
   * For children under 13
   */
  static async sendParentConsentNotification(parentEmail, childName, age) {
    try {
      logger.info('[CHILD_SAFETY_EMAIL] Sending consent notification', {
        parentEmail: parentEmail.split('@')[0] + '@***',
        childName,
        age,
      });

      // Create transporter (use your email service config)
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const emailContent = `
        <h2>Parental Consent Confirmation</h2>
        <p>Hello,</p>
        <p>This is to confirm that <strong>${childName}</strong> (Age ${age}) has used our Kidz Story Magic service with your consent.</p>
        
        <h3>What we do:</h3>
        <ul>
          <li>Process uploaded photos for story generation</li>
          <li>Delete all photos immediately after processing</li>
          <li>Do NOT store personal or photo data permanently</li>
          <li>Comply with COPPA (Children's Online Privacy Protection Act)</li>
        </ul>

        <h3>Your child's privacy:</h3>
        <ul>
          <li>✓ Photos are deleted after checkout</li>
          <li>✓ Personal data is not shared or sold</li>
          <li>✓ No tracking or advertising to children</li>
          <li>✓ Full GDPR and COPPA compliance</li>
        </ul>

        <p>If you did not provide this consent or have questions, please contact us immediately.</p>
        
        <p>Best regards,<br/>Kidz Story Magic Team</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: parentEmail,
        subject: `[Kidz Story Magic] Parental Consent Confirmation for ${childName}`,
        html: emailContent,
      });

      logger.info('[CHILD_SAFETY_EMAIL] ✓ Consent email sent', {
        to: parentEmail.split('@')[0] + '@***',
      });

      return true;
    } catch (error) {
      logger.error('[CHILD_SAFETY_EMAIL] Error sending notification', error);
      // Don't throw - email failure shouldn't block story generation
      return false;
    }
  }

  /**
   * Delete child-related data from database
   * Called after story generation completes
   */
  static async deleteChildSessionData(userId, projectId) {
    try {
      logger.info('[CHILD_SAFETY_DELETE] Scheduling data deletion', {
        userId,
        projectId,
      });

      // Delete after a delay to ensure response is sent
      setTimeout(async () => {
        try {
          const queries = [
            // Clear temporary child data if stored
            `UPDATE story_projects SET child_metadata = NULL WHERE id = $1 AND user_id = $2`,
            // Clear upload history
            `DELETE FROM temp_uploads WHERE project_id = $1 AND user_id = $2 AND created_at < NOW() - INTERVAL '1 hour'`,
          ];

          for (const query of queries) {
            await pool.query(query, [projectId, userId]);
          }

          logger.info('[CHILD_SAFETY_DELETE] ✓ Child data deleted', {
            userId,
            projectId,
          });
        } catch (error) {
          logger.error('[CHILD_SAFETY_DELETE] Error during deletion', error);
        }
      }, 1000); // 1 second delay to ensure response is sent
    } catch (error) {
      logger.error('[CHILD_SAFETY_DELETE] Scheduling error', error);
    }
  }

  /**
   * Cleanup old temporary uploads
   * Prevents accumulation of undeleted files
   */
  static async cleanupOldUploads(maxAgeHours = 24) {
    try {
      logger.info('[CHILD_SAFETY_CLEANUP] Running old uploads cleanup');

      const result = await pool.query(
        `DELETE FROM temp_uploads WHERE created_at < NOW() - INTERVAL '${maxAgeHours} hours'`
      );

      logger.info('[CHILD_SAFETY_CLEANUP] ✓ Cleanup complete', {
        deletedRows: result.rowCount,
        maxAgeHours,
      });

      return result.rowCount;
    } catch (error) {
      logger.error('[CHILD_SAFETY_CLEANUP] Error during cleanup', error);
      return 0;
    }
  }

  /**
   * Validate parent email before processing
   * Optional: Can integrate with email verification services
   */
  static async validateParentEmail(parentEmail) {
    try {
      logger.info('[CHILD_SAFETY_EMAIL_VALIDATE] Validating parent email', {
        email: parentEmail.split('@')[0] + '@***',
      });

      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail)) {
        return { valid: false, reason: 'Invalid email format' };
      }

      // Check for disposable emails (optional)
      const disposableDomains = [
        'tempmail.com',
        'throwaway.email',
        '10minutemail.com',
        'guerrillamail.com',
      ];

      const domain = parentEmail.split('@')[1].toLowerCase();
      if (disposableDomains.includes(domain)) {
        logger.warn('[CHILD_SAFETY_EMAIL_VALIDATE] Disposable email detected', {
          domain,
        });
        return { valid: false, reason: 'Disposable email addresses are not accepted' };
      }

      logger.info('[CHILD_SAFETY_EMAIL_VALIDATE] ✓ Email valid', {
        email: parentEmail.split('@')[0] + '@***',
      });

      return { valid: true };
    } catch (error) {
      logger.error('[CHILD_SAFETY_EMAIL_VALIDATE] Validation error', error);
      return { valid: false, reason: 'Email validation error' };
    }
  }

  /**
   * Log child safety event for audit trail
   */
  static async logSafetyEvent(userId, eventType, details) {
    try {
      const query = `
        INSERT INTO child_safety_audit_log (user_id, event_type, details, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
      `;

      const result = await pool.query(query, [
        userId,
        eventType,
        JSON.stringify(details),
      ]);

      logger.info('[CHILD_SAFETY_AUDIT] Event logged', {
        userId,
        eventType,
      });

      return result.rows[0];
    } catch (error) {
      logger.warn('[CHILD_SAFETY_AUDIT] Error logging event', error);
      // Don't throw - audit logging shouldn't block operations
      return null;
    }
  }

  /**
   * Get child safety statistics for dashboard
   */
  static async getChildSafetyStats() {
    try {
      const stats = await pool.query(`
        SELECT
          COUNT(*) as total_requests,
          SUM(CASE WHEN details->>'age' < 13 THEN 1 ELSE 0 END) as under_13_count,
          SUM(CASE WHEN event_type = 'PARENTAL_CONSENT' THEN 1 ELSE 0 END) as parental_consents,
          SUM(CASE WHEN event_type = 'DATA_DELETED' THEN 1 ELSE 0 END) as data_deletions
        FROM child_safety_audit_log
        WHERE created_at > NOW() - INTERVAL '30 days'
      `);

      return stats.rows[0] || {
        total_requests: 0,
        under_13_count: 0,
        parental_consents: 0,
        data_deletions: 0,
      };
    } catch (error) {
      logger.error('[CHILD_SAFETY_STATS] Error fetching stats', error);
      return null;
    }
  }
}

module.exports = ChildSafetyService;
