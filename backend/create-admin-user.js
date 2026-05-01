require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'Kids@2026';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Delete existing user if it exists
    await pool.query('DELETE FROM users WHERE email = $1', ['storymagic26@gmail.com']);
    console.log('Cleared any existing admin user');
    
    // Insert new admin user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, preferred_currency, role, created_at, updated_at, is_active) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true) RETURNING id, name, email, password_hash, role',
      ['Story Magic Admin', 'storymagic26@gmail.com', passwordHash, 'USD', 'admin']
    );
    
    console.log('✅ Admin user created successfully:');
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Role:', result.rows[0].role);
    console.log('\n✨ Login credentials:');
    console.log('Email: storymagic26@gmail.com');
    console.log('Password: Kids@2026');
    console.log('\nAfter login, you will be redirected to: http://localhost:3004/admin-dashboard');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createAdminUser();
