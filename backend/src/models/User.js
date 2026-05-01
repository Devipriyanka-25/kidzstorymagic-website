// User Model
const pool = require('../config/database');
const crypto = require('crypto');

class User {
  static async create(userData) {
    const { name, email, password_hash, preferred_currency = 'USD', role = 'user' } = userData;
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, preferred_currency, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, preferred_currency, role, created_at`,
      [name, email, password_hash, preferred_currency, role]
    );
    
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, preferred_currency, role, created_at, updated_at, is_active FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, profile_picture_url, preferred_currency, role, location, created_at FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return result.rows[0] || null;
  }

  static async update(id, updates) {
    const { name, profile_picture_url, preferred_currency, location } = updates;
    
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
    await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1',
      [id]
    );
  }
}

module.exports = User;
