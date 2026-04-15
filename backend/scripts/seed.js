const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = require('../src/config/database');

async function seed() {
  const email = process.env.DEMO_USER_EMAIL;
  const password = process.env.DEMO_USER_PASSWORD;

  if (!email || !password) {
    console.log('[SEED] No demo user configured. Set DEMO_USER_EMAIL and DEMO_USER_PASSWORD to seed one.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, preferred_currency, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = CURRENT_TIMESTAMP`,
    [process.env.DEMO_USER_NAME || 'Demo User', email, passwordHash, 'USD']
  );

  console.log(`[SEED] Demo user ready: ${email}`);
}

seed()
  .catch((error) => {
    console.error('[SEED] Failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
