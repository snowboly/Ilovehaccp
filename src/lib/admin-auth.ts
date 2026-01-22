import { supabaseService } from '@/lib/supabase';

// For API Routes
export async function validateAdminRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return { error: 'Unauthorized', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);

  if (authError || !user) return { error: 'Invalid Session', status: 401 };

  const [{ data: roleRow }, { data: whitelistEntry }] = await Promise.all([
    supabaseService
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabaseService
      .from('admin_whitelist')
      .select('email')
      .eq('email', user.email ?? '')
      .maybeSingle(),
  ]);

  if (!roleRow || roleRow.role !== 'admin' || !whitelistEntry?.email) {
    return { error: 'Forbidden: Admin Access Required', status: 403 };
  }

  return { user };
}

export async function checkAdminRole(userId: string, email?: string | null) {
  const [{ data: roleRow }, { data: whitelistEntry }] = await Promise.all([
    supabaseService
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle(),
    supabaseService
      .from('admin_whitelist')
      .select('email')
      .eq('email', email ?? '')
      .maybeSingle(),
  ]);

  return roleRow?.role === 'admin' && !!whitelistEntry?.email;
}
