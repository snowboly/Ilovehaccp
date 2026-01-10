
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRateLimits() {
    const { data, error } = await supabase.from('rate_limits').select('*');
    if (error) {
        console.error("Error fetching rate limits:", error);
    } else {
        console.log("Rate Limits Table:", data);
    }
}

checkRateLimits();
