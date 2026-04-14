const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

/**
 * GET /api/drafts/user
 * Get all draft stories for the authenticated user
 */
router.get('/user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[DRAFTS API] Fetching drafts for user:', userId);

    const result = await db.query(
      `SELECT 
        sp.id, 
        sp.child_name, 
        sp.theme, 
        sp.page_count,
        sp.status,
        sp.created_at,
        sp.updated_at,
        sp.title,
        sp.description,
        sp.preview_url,
        sp.age_group,
        sp.child_gender,
        sp.child_interests,
        COALESCE(COUNT(sc.id), 0) as completed_pages
      FROM story_projects sp
      LEFT JOIN story_content sc ON sp.id = sc.project_id
      WHERE sp.user_id = $1 AND sp.status IN ('draft', 'pending', 'in_progress')
      GROUP BY sp.id
      ORDER BY sp.updated_at DESC`,
      [userId]
    );

    console.log('[DRAFTS API] Found', result.rows.length, 'draft stories for user:', userId);
    console.log('[DRAFTS API] Draft stories:', result.rows);

    res.json({
      success: true,
      drafts: result.rows
    });
  } catch (error) {
    console.error('[DRAFTS API] Error fetching drafts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drafts',
      message: error.message
    });
  }
});

/**
 * GET /api/drafts/:draftId
 * Get a specific draft story
 */
router.get('/:draftId', verifyToken, async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT * FROM story_projects 
       WHERE id = $1 AND user_id = $2 AND status IN ('draft', 'pending', 'in_progress')`,
      [draftId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Draft not found'
      });
    }

    const draft = result.rows[0];

    // Get draft content
    const contentResult = await db.query(
      `SELECT * FROM story_content 
       WHERE project_id = $1 
       ORDER BY page_number ASC`,
      [draftId]
    );

    res.json({
      success: true,
      draft: {
        ...draft,
        pages: contentResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch draft',
      message: error.message
    });
  }
});

/**
 * POST /api/drafts
 * Create a new draft story
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      childName,
      theme,
      illustrationStyle,
      customIllustrationPrompt,
      pageCount = 20,
      title,
      description
    } = req.body;

    const result = await db.query(
      `INSERT INTO story_projects 
       (user_id, child_name, theme, illustration_style, custom_illustration_prompt, page_count, status, title, description, current_step, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, 1, NOW(), NOW())
       RETURNING id, user_id, child_name, theme, illustration_style, custom_illustration_prompt, page_count, status, title, created_at, updated_at`,
      [userId, childName, theme, illustrationStyle, customIllustrationPrompt, pageCount, title, description]
    );

    res.status(201).json({
      success: true,
      draft: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create draft',
      message: error.message
    });
  }
});

/**
 * PUT /api/drafts/:draftId
 * Update draft story (auto-save)
 */
router.put('/:draftId', verifyToken, async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;
    const {
      childName,
      theme,
      illustrationStyle,
      customIllustrationPrompt,
      pageCount,
      title,
      description,
      currentStep,
      pages
    } = req.body;

    // Verify ownership
    const ownershipCheck = await db.query(
      'SELECT id FROM story_projects WHERE id = $1 AND user_id = $2 AND status IN (\'draft\', \'pending\', \'in_progress\')',
      [draftId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to update this draft'
      });
    }

    // Update project metadata
    const updateResult = await db.query(
      `UPDATE story_projects 
       SET child_name = COALESCE($1, child_name),
           theme = COALESCE($2, theme),
           illustration_style = COALESCE($3, illustration_style),
           custom_illustration_prompt = COALESCE($4, custom_illustration_prompt),
           page_count = COALESCE($5, page_count),
           title = COALESCE($6, title),
           description = COALESCE($7, description),
           current_step = COALESCE($8, current_step),
           updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING id, child_name, theme, illustration_style, custom_illustration_prompt, page_count, status, title, current_step, updated_at`,
      [childName, theme, illustrationStyle, customIllustrationPrompt, pageCount, title, description, currentStep, draftId, userId]
    );

    // Update pages if provided
    if (Array.isArray(pages) && pages.length > 0) {
      for (const page of pages) {
        if (page.id) {
          // Update existing page
          await db.query(
            `UPDATE story_content 
             SET page_text = $1, page_illustration_prompt = $2, updated_at = NOW()
             WHERE id = $3 AND project_id = $4`,
            [page.page_text, page.page_illustration_prompt, page.id, draftId]
          );
        } else {
          // Insert new page
          await db.query(
            `INSERT INTO story_content 
             (project_id, page_number, page_text, page_illustration_prompt, created_at, updated_at)
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [draftId, page.page_number, page.page_text, page.page_illustration_prompt]
          );
        }
      }
    }

    res.json({
      success: true,
      draft: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update draft',
      message: error.message
    });
  }
});

/**
 * DELETE /api/drafts/:draftId
 * Delete a draft story
 */
router.delete('/:draftId', verifyToken, async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownershipCheck = await db.query(
      'SELECT id FROM story_projects WHERE id = $1 AND user_id = $2 AND status IN (\'draft\', \'pending\', \'in_progress\')',
      [draftId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this draft'
      });
    }

    // Delete associated story content
    await db.query(
      'DELETE FROM story_content WHERE project_id = $1',
      [draftId]
    );

    // Delete the project
    await db.query(
      'DELETE FROM story_projects WHERE id = $1 AND user_id = $2',
      [draftId, userId]
    );

    res.json({
      success: true,
      message: 'Draft deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete draft',
      message: error.message
    });
  }
});

/**
 * POST /api/drafts/:draftId/publish
 * Publish a draft story (move from draft to published)
 */
router.post('/:draftId/publish', verifyToken, async (req, res) => {
  try {
    const { draftId } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const ownershipCheck = await db.query(
      'SELECT id, page_count FROM story_projects WHERE id = $1 AND user_id = $2 AND status IN (\'draft\', \'pending\', \'in_progress\')',
      [draftId, userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to publish this draft'
      });
    }

    // Verify all pages are generated
    const pageCount = ownershipCheck.rows[0].page_count;
    const pagesResult = await db.query(
      `SELECT COUNT(*) as count FROM story_content WHERE project_id = $1`,
      [draftId]
    );

    if (pagesResult.rows[0].count < pageCount) {
      return res.status(400).json({
        success: false,
        error: 'Not all pages are generated yet. Cannot publish incomplete story.'
      });
    }

    // Update status to published
    const result = await db.query(
      `UPDATE story_projects 
       SET status = 'published', updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [draftId, userId]
    );

    res.json({
      success: true,
      story: result.rows[0]
    });
  } catch (error) {
    console.error('Error publishing draft:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish draft',
      message: error.message
    });
  }
});

module.exports = router;
