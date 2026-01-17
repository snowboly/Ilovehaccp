const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const USER_TOKEN = "PLACEHOLDER_USER_TOKEN"; 
const PLAN_ID = "PLACEHOLDER_PLAN_ID"; 

async function simulateModification() {
  console.log("--- TEST: Modifying Plan AFTER Export ---");

  // 1. Update Plan
  const newName = `Bakery Updated ${Date.now()}`;
  console.log(`Updating Business Name to: ${newName}`);
  
  const res = await fetch(`${BASE_URL}/api/save-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${USER_TOKEN}`
    },
    body: JSON.stringify({
      planId: PLAN_ID,
      businessName: newName,
      // ... other fields assumed same ...
      metadata: {
          framework_version: "1.0.0",
          question_set_versions: {} 
      }
    })
  });

  if (!res.ok) {
      console.error(`Update failed: ${res.status}`);
      return;
  }
  
  console.log("Update Successful (HTTP 200)");

  // 2. Verify Versioning Logic (Simulated check)
  console.log("\n[ANALYSIS] Checking Versioning Integrity...");
  // In a real DB check, we'd see:
  // Row 1: version 1
  // Row 2: version 1 (Duplicate!)
  console.warn("⚠️  WARNING: Current save-plan logic hardcodes version_number = 1.");
  console.warn("    The exported document will reflect the NEW content but the WRONG version number.");
}

(async () => {
    if (PLAN_ID === "PLACEHOLDER_PLAN_ID") {
        console.log("Please set PLAN_ID and USER_TOKEN.");
        return;
    }
    await simulateModification();
})();
