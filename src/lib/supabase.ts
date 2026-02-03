import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[supabase] Missing env vars. Falling back to local defaults for build/runtime.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

/**
 * @deprecated Use supabaseAdmin for privileged operations to make intent clear.
 */
export const supabaseAdmin = supabaseService;
