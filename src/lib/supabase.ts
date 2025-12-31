import { createClient } from '@supabase/supabase-js';

// Fallback values to prevent build-time crashes (e.g. during static generation)
// These allow the app to build, but actual data fetching will fail if keys are missing at runtime.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  if (typeof window === 'undefined') {
    // Only warn on server/build
    console.warn('⚠️  Supabase environment variables missing. Using placeholders for build.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);