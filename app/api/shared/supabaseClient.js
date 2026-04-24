/**
 * Supabase Client for Backend
 * Used for database operations in API routes
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wwninqezevmxlvtjhruo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[SUPABASE] Missing environment variables');
}

// Create Supabase client with service key (for backend operations)
// Return null when keys are missing so routes can degrade safely in preview environments.
export const supabaseClient = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export default supabaseClient;
