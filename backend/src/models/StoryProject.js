// Story Project Model
const pool = require('../config/database');

class StoryProject {
  static async create(projectData) {
    const {
      user_id,
      title,
      age_group,
      theme,
      page_count,
      child_name,
      child_gender,
      child_interests,
      child_notes
    } = projectData;

    const result = await pool.query(
      `INSERT INTO story_projects 
       (user_id, title, age_group, theme, page_count, child_name, child_gender, 
        child_interests, child_notes, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [user_id, title, age_group, theme, page_count, child_name, child_gender, 
       child_interests, child_notes]
    );

    return result.rows[0];
  }

  static async findById(id, userId = null) {
    let query = 'SELECT * FROM story_projects WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

  static async findByUserId(userId, limit = 10, offset = 0) {
    const result = await pool.query(
      `SELECT * FROM story_projects 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  }

  static async update(id, updates) {
    const {
      title,
      age_group,
      theme,
      page_count,
      child_name,
      child_gender,
      child_interests,
      child_notes,
      status,
      preview_url,
      published_pdf_url,
      child_photo_url,
      child_photo_preview_url,
      child_photo_processed_url
    } = updates;

    const result = await pool.query(
      `UPDATE story_projects 
       SET title = COALESCE($1, title),
           age_group = COALESCE($2, age_group),
           theme = COALESCE($3, theme),
           page_count = COALESCE($4, page_count),
           child_name = COALESCE($5, child_name),
           child_gender = COALESCE($6, child_gender),
           child_interests = COALESCE($7, child_interests),
           child_notes = COALESCE($8, child_notes),
           status = COALESCE($9, status),
           preview_url = COALESCE($10, preview_url),
           published_pdf_url = COALESCE($11, published_pdf_url),
           child_photo_url = COALESCE($13, child_photo_url),
           child_photo_preview_url = COALESCE($14, child_photo_preview_url),
           child_photo_processed_url = COALESCE($15, child_photo_processed_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [title, age_group, theme, page_count, child_name, child_gender, 
       child_interests, child_notes, status, preview_url, published_pdf_url, id,
       child_photo_url, child_photo_preview_url, child_photo_processed_url]
    );

    return result.rows[0] || null;
  }

  static async delete(id) {
    await pool.query(
      'DELETE FROM story_projects WHERE id = $1',
      [id]
    );
  }

  static async getProjectStats(userId) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_projects
       FROM story_projects
       WHERE user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }
}

module.exports = StoryProject;
