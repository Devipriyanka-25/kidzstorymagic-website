/**
 * Serverless Database Module for Vercel
 * Handles PostgreSQL connections for serverless functions
 */

const { Pool } = require('pg');

let pool = null;

/**
 * Get or create database pool
 * Each serverless function gets its own pool instance
 */
function getPool() {
  if (pool) return pool;

  const connectionUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbName = process.env.DB_NAME;
  const dbUser = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;

  if (connectionUrl) {
    // Use connection string (Supabase, Railway, etc.)
    pool = new Pool({
      connectionString: connectionUrl,
      ssl: { rejectUnauthorized: false }
    });
  } else {
    // Use individual connection parameters
    pool = new Pool({
      host: dbHost || 'localhost',
      port: parseInt(dbPort || '5432'),
      database: dbName || 'kidz_story_magic',
      user: dbUser || 'postgres',
      password: dbPassword,
      max: 1, // Serverless: max 1 connection per function
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }

  pool.on('error', (err) => {
    console.error('[DB] Unexpected error:', err);
  });

  return pool;
}

/**
 * Execute a query
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const pool = getPool();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB] Query executed (${duration}ms):`, text.substring(0, 50));
    return result;
  } catch (err) {
    console.error('[DB] Query error:', err);
    throw err;
  }
}

/**
 * Get a single row
 */
async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

/**
 * Get all rows
 */
async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Close all pools
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  query,
  getOne,
  getAll,
  closePool,
  getPool
};
