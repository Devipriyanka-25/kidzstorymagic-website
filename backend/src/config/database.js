// Database connection configuration
const { Pool } = require('pg');
const config = require('../config/config');

let pool;

// Check if DATABASE_URL is provided (cloud database)
if (config.database.connectionUrl) {
  console.log('[DATABASE] Using connection URL (cloud database)');
  pool = new Pool({
    connectionString: config.database.connectionUrl,
    ssl: { rejectUnauthorized: false } // For cloud databases
  });
} else {
  console.log('[DATABASE] Using individual connection parameters (local database)');
  console.log('[DATABASE] Host:', config.database.host);
  console.log('[DATABASE] Port:', config.database.port);
  console.log('[DATABASE] Database:', config.database.name);
  console.log('[DATABASE] User:', config.database.user);
  console.log('[DATABASE] Password:', config.database.password ? '***' : 'NOT SET');
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: config.database.pool.max,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

pool.on('error', (err) => {
  console.error('[DATABASE] Unexpected error on idle client:', err);
});

pool.on('connect', () => {
  console.log('[DATABASE] Pool connection established');
});

module.exports = pool;
