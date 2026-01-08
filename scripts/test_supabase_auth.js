require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSignup() {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "Password123!";

    console.log(`🚀 Testing Supabase Signup for: ${testEmail}...`);

    const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
    });

    if (error) {
        console.error("❌ Signup Failed:", error.message);
        if (error.message.includes("confirmation email")) {
            console.log("\n👉 ANALYSIS: Supabase is still trying to send the email via its own (broken) provider.");
            console.log("👉 ACTION: Did you enable 'Custom SMTP' in the Supabase Dashboard yet?");
        }
    } else {
        console.log("✅ Signup Request Sent!");
        console.log("User ID:", data.user?.id);
        console.log("Confirmation Sent to:", data.user?.email);
    }
}

testSignup();
