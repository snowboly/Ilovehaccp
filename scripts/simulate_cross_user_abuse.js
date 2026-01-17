const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// INSTRUCTIONS:
// Replace these with real values from your testing environment
const USER_B_TOKEN = "TOKEN_FOR_ATTACKER_B"; 
const PLAN_ID_A = "PLAN_ID_OWNED_BY_USER_A";

async function simulateAbuse() {
  console.log(`--- ABUSE TEST: User B attempting to export User A's Plan (${PLAN_ID_A}) ---`);

  // 1. Attempt PDF Export
  console.log("\nAttempting Unauthorized PDF Export...");
  const pdfRes = await fetch(`${BASE_URL}/api/download-pdf?planId=${PLAN_ID_A}`, {
    headers: { 'Authorization': `Bearer ${USER_B_TOKEN}` }
  });
  console.log(`PDF Export Status: ${pdfRes.status}`); // EXPECTED: 403
  if (pdfRes.status === 403) {
      const data = await pdfRes.json();
      console.log('Result: BLOCKED. Message:', data.error);
  }

  // 2. Attempt Word Export
  console.log("\nAttempting Unauthorized Word Export...");
  const wordRes = await fetch(`${BASE_URL}/api/download-word?planId=${PLAN_ID_A}`, {
    headers: { 'Authorization': `Bearer ${USER_B_TOKEN}` }
  });
  console.log(`Word Export Status: ${wordRes.status}`); // EXPECTED: 403
  if (wordRes.status === 403) {
      const data = await wordRes.json();
      console.log('Result: BLOCKED. Message:', data.error);
  }
}

simulateAbuse();
