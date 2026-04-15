const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = require('../src/config/database');

const rootDir = path.join(__dirname, '..', '..');
const schemaPath = path.join(rootDir, 'docs', 'database-schema.sql');
const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');

function makeSchemaIdempotent(sql) {
  return sql
    .replace(/CREATE TABLE\s+/gi, 'CREATE TABLE IF NOT EXISTS ')
    .replace(/CREATE INDEX\s+/gi, 'CREATE INDEX IF NOT EXISTS ');
}

async function runSqlFile(filePath, transform = (sql) => sql) {
  const sql = transform(fs.readFileSync(filePath, 'utf8'));
  if (!sql.trim()) {
    return;
  }

  console.log(`[MIGRATE] Applying ${path.relative(rootDir, filePath)}`);
  await pool.query(sql);
}

async function migrate() {
  try {
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const existingCoreTable = await pool.query("SELECT to_regclass('public.users') AS table_name");
    if (!existingCoreTable.rows[0].table_name) {
      await runSqlFile(schemaPath, makeSchemaIdempotent);
    } else {
      console.log('[MIGRATE] Existing database detected; skipping base schema');
    }

    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        await runSqlFile(path.join(migrationsDir, file));
      }
    }

    console.log('[MIGRATE] Database migration completed');
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('[MIGRATE] Failed:', error.message);
  process.exit(1);
});
