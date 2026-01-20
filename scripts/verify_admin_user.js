require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdmin(email) {
  console.log(`Checking admin status for: ${email}`);

  // 1. Get User ID from Auth
  // Note: listUsers() might be paginated, but for a small user base find() is okay. 
  // Better to search by email if possible or just list enough.
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
      console.error('Error listing users:', userError);
      return;
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) { 
      console.log('❌ User not found in Auth system.'); 
      return; 
  }
  console.log(`✅ User found. ID: ${user.id}`);

  // 2. Check Profile in 'profiles' table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
      console.log('❌ Error fetching profile:', profileError);
  } else {
      console.log('✅ Profile found:', profile);
      if (profile.role === 'admin') {
          console.log('🎉 STATUS: CONFIRMED ADMIN');
      } else {
          console.log(`⚠️ STATUS: NOT ADMIN (Role is '${profile.role}')`);
      }
  }
}

checkAdmin('joao@ilovehaccp.com');
