require('dotenv').config();
const pool = require('./src/config/database');

async function checkAdminUsers() {
  try {
    const result = await pool.query(
      `SELECT email, name, role FROM users 
       WHERE email IN ('storymagic26@gmail.com', 'demo@example.com') 
       OR role = 'admin'`
    );
    
    console.log('\n👑 Admin Users:');
    console.log('─'.repeat(60));
    
    if (result.rows.length === 0) {
      console.log('  No admin users found!');
    } else {
      result.rows.forEach(user => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        console.log('─'.repeat(60));
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkAdminUsers();
