#!/usr/bin/env node

/**
 * Quick script to fix user password in Supabase
 * Usage: node fix-password.js
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Set credentials directly (or load from env)
const SUPABASE_URL = 'https://wwninqezevmxlvtjhruo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bmlucWV6ZXZteGx2dGpocnVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MjQyNSwiZXhwIjoyMDkyMDI4NDI1fQ.X454EsatKRG3jGNgB0XN0w3ylgr-AJJv2GInXpwYp2I';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.production');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fixPassword() {
  try {
    const email = 'devipriyankak91@gmail.com';
    const newPassword = 'Niru12345@';
    const passwordHash = '$2b$10$8b3uZ69Le1gDl7Wl31vuJ.aMwDY.XXW/.TX7Vu2ui/XMJ6NJOWKFy';

    console.log(`🔄 Updating password for ${email}...`);

    // First, find the user
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (findError) {
      console.error('❌ User not found:', findError.message);
      process.exit(1);
    }

    console.log(`✅ Found user: ${existingUser.name} (${existingUser.email})`);

    // Update the password hash
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        is_active: true,
      })
      .eq('id', existingUser.id)
      .select('id, email, name, is_active');

    if (updateError) {
      console.error('❌ Update failed:', updateError.message);
      process.exit(1);
    }

    console.log('✅ Password updated successfully!');
    console.log('✅ Account is now active');
    console.log('\n🎉 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPassword();
