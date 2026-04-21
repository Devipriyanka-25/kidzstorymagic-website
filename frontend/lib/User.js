// User model for Vercel API routes
const { getPool } = require('./db');

class User {
  static async create(userData) {
    const { name, email, password_hash, preferred_currency = 'USD' } = userData;
    const pool = getPool();
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, preferred_currency, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, preferred_currency, created_at`,
      [name, email, password_hash, preferred_currency]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id) {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, name, email, profile_picture_url, preferred_currency, location, created_at FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id, updates) {
    const { name, profile_picture_url, preferred_currency, location } = updates;
    const pool = getPool();
    
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           profile_picture_url = COALESCE($2, profile_picture_url),
           preferred_currency = COALESCE($3, preferred_currency),
           location = COALESCE($4, location),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, email, profile_picture_url, preferred_currency, location`,
      [name, profile_picture_url, preferred_currency, location, id]
    );
    
    return result.rows[0] || null;
  }

  static async delete(id) {
    const pool = getPool();
    await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    );
  }
}

module.exports = User;
