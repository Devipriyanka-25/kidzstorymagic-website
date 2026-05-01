require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function createTestUser() {
  try {
    // Hash the password
    const password = 'Test@123456';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Delete existing user if it exists
    await pool.query('DELETE FROM users WHERE email = $1', ['testuser@example.com']);
    console.log('Cleared any existing test user');
    
    // Insert new test user with "user" role
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, preferred_currency, role, created_at, updated_at, is_active) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true) RETURNING id, name, email, password_hash, role',
      ['Test User', 'testuser@example.com', passwordHash, 'USD', 'user']
    );
    
    console.log('✅ Test user created successfully:');
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Role:', result.rows[0].role);
    console.log('\n✨ Login credentials:');
    console.log('Email: testuser@example.com');
    console.log('Password: Test@123456');
    console.log('\nAfter login, you will be redirected to: http://localhost:3004/dashboard');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createTestUser();
