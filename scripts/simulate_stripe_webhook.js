const fetch = require('node-fetch');
const crypto = require('crypto');

// CONFIGURATION
const BASE_URL = 'http://localhost:3000';
const PLAN_ID = "PLACEHOLDER_PLAN_ID"; // Replace with a real plan ID from your DB
const USER_TOKEN = "PLACEHOLDER_USER_TOKEN"; // Needed to verify export status
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_secret"; // MUST match .env.local

async function simulateWebhook() {
  console.log(`--- SIMULATING STRIPE PAYMENT FOR PLAN: ${PLAN_ID} ---`);

  // 1. Construct Mock Payload
  const payload = {
    id: "evt_test_123",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_123",
        object: "checkout.session",
        metadata: {
          planId: PLAN_ID,
          userId: "user_test_123", // Metadata usually carries this
          businessName: "Test Bakery Inc."
        },
        payment_status: "paid",
        status: "complete",
        customer_email: "customer@example.com"
      }
    }
  };

  const payloadString = JSON.stringify(payload);

  // 2. Generate Signature
  // Stripe signature format: t=TIMESTAMP,v1=SIGNATURE
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payloadString}`;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(signedPayload);
  const signature = hmac.digest('hex');
  const stripeHeader = `t=${timestamp},v1=${signature}`;

  // 3. Send Webhook
  console.log("Sending Webhook...");
  const res = await fetch(`${BASE_URL}/api/webhook/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': stripeHeader
    },
    body: payloadString
  });

  console.log(`Webhook Response: ${res.status} ${res.statusText}`);
  const resText = await res.text();
  console.log(`Body: ${resText}`);

  if (!res.ok) {
      console.error("Webhook failed. Check if STRIPE_WEBHOOK_SECRET matches.");
      return;
  }

  // 4. Verify DB Status via Export Gate
  console.log("\n--- VERIFYING UNLOCK STATUS ---");
  // We attempt to download the Word doc. If 200, it's PAID. If 403, it's UNPAID.
  const checkRes = await fetch(`${BASE_URL}/api/download-word?planId=${PLAN_ID}`, {
      headers: { 'Authorization': `Bearer ${USER_TOKEN}` }
  });

  console.log(`Export Access Check: ${checkRes.status}`);
  if (checkRes.status === 200) {
      console.log("✅ SUCCESS: Plan is PAID. Word export is UNLOCKED.");
  } else if (checkRes.status === 403) {
      console.log("❌ FAILURE: Plan is still UNPAID. Webhook did not update DB?");
  } else {
      console.log(`⚠️ INDETERMINATE: Got status ${checkRes.status} (maybe 422 validation error?)");
  }
}

(async () => {
    if (PLAN_ID === "PLACEHOLDER_PLAN_ID") {
        console.log("Please edit this script to set a valid PLAN_ID and USER_TOKEN.");
        return;
    }
    await simulateWebhook();
})();
