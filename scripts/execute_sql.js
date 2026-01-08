require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('No POSTGRES_URL or DATABASE_URL found in .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
  });

  try {
    await client.connect();
    const sqlPath = process.argv[2];
    if (!sqlPath) {
        throw new Error('Please provide SQL file path');
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('Migration executed successfully');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
