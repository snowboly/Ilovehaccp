const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const USER_TOKEN = "PLACEHOLDER_USER_TOKEN"; // Valid owner token
const UNPAID_PLAN_ID = "PLACEHOLDER_UNPAID_PLAN_ID";

async function simulateDirectBypass() {
  console.log(`--- BYPASS TEST: Direct API call for Unpaid Plan (${UNPAID_PLAN_ID}) ---`);

  // Attempt Word Export (Premium Feature)
  console.log("\nAttempting to download Word doc directly...");
  const res = await fetch(`${BASE_URL}/api/download-word?planId=${UNPAID_PLAN_ID}`, {
    headers: { 'Authorization': `Bearer ${USER_TOKEN}` }
  });

  console.log(`HTTP Status: ${res.status}`);
  if (res.status === 403) {
      const data = await res.json();
      console.log('Result: BLOCKED. Message:', data.error);
      console.log('SUCCESS: The API enforced payment logic independently of the UI.');
  } else if (res.status === 200) {
      console.log('FAILURE: Bypass successful! The user downloaded the file without paying.');
  } else {
      console.log(`Unexpected status: ${res.status}`);
  }
}

simulateDirectBypass();
