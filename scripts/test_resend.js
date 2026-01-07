
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
    console.log("📧 Testing Resend API Key...");
    console.log("Key Prefix:", process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 5) : "MISSING");

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Use default test domain first
            to: 'delivered@resend.dev', // Resend "Sink" address
            subject: 'Test Email',
            html: '<p>It works!</p>'
        });
        console.log("✅ Success:", data);
    } catch (e) {
        console.error("❌ Failed:", e);
    }
}

testEmail();
