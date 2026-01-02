import { createClient } from '@supabase/supabase-js';

// robust fallback logic
const getEnvVar = (key: string, fallback: string) => {
  const value = process.env[key];
  if (!value || value === '' || value === 'undefined') {
    return fallback;
  }
  return value;
};

const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co');
const supabaseKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature'); // minimal valid JWT-like string

// Warn only if we are using fallbacks in a non-production build context to avoid log noise
if (supabaseUrl === 'https://placeholder.supabase.co' && typeof window === 'undefined') {
  console.warn('⚠️  Supabase environment variables missing. Using placeholders for build safety.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side only: privileged client
export const supabaseService = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey
);
