// Database connection for Vercel API routes
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    const connectionUrl = process.env.DATABASE_URL || process.env.DATABASE_CONNECTION_URL;
    
    if (connectionUrl) {
      pool = new Pool({
        connectionString: connectionUrl,
        ssl: { rejectUnauthorized: false }
      });
    } else {
      pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }

    pool.on('error', (err) => {
      console.error('[DATABASE] Unexpected error:', err);
    });
  }

  return pool;
}

module.exports = { getPool };
