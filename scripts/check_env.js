require('dotenv').config({ path: '.env.local' });

const keys = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'RESEND_API_KEY'
];

console.log("🔍 Checking Environment Variables...");
keys.forEach(key => {
    const exists = !!process.env[key];
    console.log(`${exists ? '✅' : '❌'} ${key}`);
});