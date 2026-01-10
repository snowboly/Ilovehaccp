const dotenv = require('dotenv');
const path = require('path');
const result = dotenv.config({ path: path.join(__dirname, '../.env.local') });
console.log('Parsed:', result.parsed ? Object.keys(result.parsed) : 'Failed');
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
