
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch'); // You might need to install this or use built-in fetch if node version is high enough

const BASE_URL = 'http://localhost:3000'; // Adjust if port is different

async function triggerEmail() {
    // Valid plan ID from DB
    const planId = '6e67a1d0-871f-4277-b5d6-247c58ed199c'; 
    
    console.log("🚀 Triggering Email API...");
    try {
        const res = await fetch(`${BASE_URL}/api/send-plan-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'info@ilovehaccp.com', // Using a controlled email
                businessName: 'docapesca',
                planId: planId
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

// Check if node has native fetch (Node 18+)
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

triggerEmail();
