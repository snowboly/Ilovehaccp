import { createClient } from '@/utils/supabase/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { redirect } from 'next/navigation';

export async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect('/dashboard');
  }

  return user;
}
