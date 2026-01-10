
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function triggerLeadMagnet() {
    console.log("🚀 Triggering Lead Magnet API...");
    try {
        const res = await fetch(`${BASE_URL}/api/send-lead-magnet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'info@scriptworkflow.com' // Testing with your email
            })
        });

        const text = await res.text();
        console.log("Status:", res.status);
        try {
            const data = JSON.parse(text);
            console.log("Response:", JSON.stringify(data, null, 2));
        } catch (e) {
            console.log("Raw Response:", text);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

triggerLeadMagnet();
