const pool = require('./src/config/database');

async function createDemoUser() {
  const passwordHash = '$2a$10$zXFZ6611U.a56zTt5NHf0.Lq881xvguUYGLR9BYBCXLMBCoRHDjj.';
  
  try {
    // Delete existing user
    await pool.query('DELETE FROM users WHERE email = $1', ['demo@example.com']);
    console.log('Deleted existing demo user');
    
    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, preferred_currency, created_at, updated_at, is_active) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true) RETURNING id, name, email, password_hash',
      ['Demo User', 'demo@example.com', passwordHash, 'USD']
    );
    
    console.log('Demo user created successfully:');
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Password Hash:', result.rows[0].password_hash);
    console.log('\nYou can now log in with:');
    console.log('Email: demo@example.com');
    console.log('Password: Demo@123456');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

createDemoUser();
