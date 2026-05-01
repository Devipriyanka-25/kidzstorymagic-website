require('dotenv').config();
const pool = require('./src/config/database');

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users LIMIT 10');
    console.log('\n📋 Users in database:');
    console.log('─'.repeat(60));
    result.rows.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log('─'.repeat(60));
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkUsers();
