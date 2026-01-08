
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUser(email) {
    console.log(`🔍 Checking status for: ${email}`);
    
    // We need to list users (requires service role key)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
        console.error("Error listing users:", error.message);
        return;
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
        console.log("❌ User not found.");
    } else {
        console.log("✅ User Found:");
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Confirmed At: ${user.email_confirmed_at || "❌ NOT CONFIRMED"}`);
        console.log(`   Last Sign In: ${user.last_sign_in_at}`);
        console.log(`   Created At: ${user.created_at}`);
    }
}

// Get email from command line arg or show latest
const emailToCheck = process.argv[2];

if (emailToCheck) {
    checkUser(emailToCheck);
} else {
    console.log("⚠️ No email provided. Showing latest 5 users...");
    (async () => {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 5, sortBy: { field: 'created_at', direction: 'desc' } });
        if(error) console.error(error);
        else {
            users.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5).forEach(u => {
                 console.log(`------------------------------------------------`);
                 console.log(`Email: ${u.email}`);
                 console.log(`Confirmed: ${u.email_confirmed_at ? '✅ ' + u.email_confirmed_at : '❌ NO'}`);
                 console.log(`Created: ${u.created_at}`);
            });
        }
    })();
}
