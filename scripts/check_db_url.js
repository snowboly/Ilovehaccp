
require('dotenv').config({ path: '.env.local' });

if (process.env.DATABASE_URL) {
    console.log("✅ DATABASE_URL is present.");
} else if (process.env.POSTGRES_URL) {
    console.log("✅ POSTGRES_URL is present.");
} else {
    console.log("❌ No direct DB connection string found.");
}
