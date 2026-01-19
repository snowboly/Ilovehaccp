import { createClient } from '@/utils/supabase/server';
import { supabaseService } from '@/lib/supabase';
import { redirect } from 'next/navigation';

// For Server Components / Pages
export async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Role Check via Profiles (RLS protected)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    // console.warn(`Unauthorized admin access attempt: ${user.email}`);
    redirect('/dashboard');
  }

  return user;
}

// For API Routes
export async function validateAdminRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

  if (authError || !user) return { error: 'Invalid Session', status: 401 };

  // Role Check via Service Client (Bypasses RLS)
  const { data: profile } = await supabaseService
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return { error: 'Forbidden: Admin Access Required', status: 403 };
  }

  return { user };
}

export async function checkAdminRole(userId: string) {
  const { data: profile } = await supabaseService
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role === 'admin';
}
