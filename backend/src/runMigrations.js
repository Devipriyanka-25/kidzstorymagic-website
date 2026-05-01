// Run database migrations and seed data
const dotenv = require('dotenv');
const path = require('path');

// Load .env file first
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = require('./config/database');
const fs = require('fs');

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');

    // Read migration files in order
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`⏳ Running: ${file}`);
      await pool.query(sql);
      console.log(`✅ Completed: ${file}`);
    }

    // Update demo user role to admin
    console.log('⏳ Setting demo user role to admin...');
    await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2',
      ['admin', 'demo@example.com']
    );
    console.log('✅ Demo user updated to admin role');

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
