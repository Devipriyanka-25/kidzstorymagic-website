// Backend Database Migration Helper
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');
const Logger = require('../utils/logger');

class DatabaseMigration {
  static async runMigration(migrationName, sqlContent) {
    const client = await pool.connect();
    try {
      Logger.info(`Starting migration: ${migrationName}`);
      await client.query('BEGIN');
      await client.query(sqlContent);
      await client.query('COMMIT');
      Logger.info(`Completed migration: ${migrationName}`);
      return { success: true, message: `Migration ${migrationName} completed` };
    } catch (error) {
      await client.query('ROLLBACK');
      Logger.error(`Migration failed: ${migrationName}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async runAllMigrations(migrationsDir) {
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const results = [];
    for (const file of files) {
      try {
        const filePath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        await this.runMigration(file, sqlContent);
        results.push({ file, status: 'success' });
      } catch (error) {
        Logger.error(`Failed to run migration: ${file}`, error);
        results.push({ file, status: 'failed', error: error.message });
      }
    }
    return results;
  }

  static async checkDatabaseState() {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      return result.rows.map(r => r.table_name);
    } finally {
      client.release();
    }
  }

  static async seedDatabase(seedData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { table, data } of seedData) {
        for (const record of data) {
          const columns = Object.keys(record);
          const values = Object.values(record);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(',');
          const query = `
            INSERT INTO ${table} (${columns.join(',')})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `;
          await client.query(query, values);
        }
      }
      
      await client.query('COMMIT');
      Logger.info('Database seeding completed');
      return { success: true, message: 'Database seeded successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      Logger.error('Database seeding failed', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = DatabaseMigration;
