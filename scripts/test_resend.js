
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("📧 Testing Resend API Key...");
    console.log("Key Prefix:", process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 5) : "MISSING");

    try {
        const data = await resend.emails.send({
            from: 'noreply@ilovehaccp.com', 
            to: 'delivered@resend.dev', 
            subject: 'Test Email from iLoveHACCP',
            html: '<p>It works! Domain verification passed.</p>'
        });
        console.log("✅ Success:", data);
    } catch (e) {
        console.error("❌ Failed:", e);
    }
}

testEmail();
