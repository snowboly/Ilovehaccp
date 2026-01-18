import { createClient } from '@/utils/supabase/server';
import { ADMIN_EMAILS } from '@/lib/constants';
import { redirect } from 'next/navigation';

export async function verifyAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const userEmail = user?.email?.toLowerCase();
  
  if (error || !user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    redirect('/dashboard');
  }

  return user;
}
