import { supabaseService } from '@/lib/supabase';

// For API Routes
export async function validateAdminRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

  if (authError || !user) return { error: 'Invalid Session', status: 401 };

  const [{ data: profile }, { data: whitelistEntry }] = await Promise.all([
    supabaseService
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single(),
    supabaseService
      .from('admin_whitelist')
      .select('email')
      .eq('email', user.email ?? '')
      .maybeSingle(),
  ]);

  if (!profile || profile.role !== 'admin' || !whitelistEntry?.email) {
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
