const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// CONFIG
const BASE_URL = 'http://localhost:3000';
const USER_TOKEN = "PLACEHOLDER_USER_TOKEN"; // Must be owner or admin
const PLAN_ID = "PLACEHOLDER_PLAN_ID"; // Must be valid and PAID (for Word)

async function downloadFile(url, filename) {
  console.log(`Downloading ${filename}...`);
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${USER_TOKEN}` }
  });

  if (!res.ok) {
    console.error(`Failed to download ${filename}: ${res.status} ${res.statusText}`);
    const err = await res.json();
    console.error(err);
    return;
  }

  const buffer = await res.buffer();
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, buffer);
  console.log(`Saved to ${filePath}`);
}

async function verifyIntegrity() {
  console.log("--- EXPORT INTEGRITY TEST ---");
  
  // 1. Download PDF
  await downloadFile(`${BASE_URL}/api/download-pdf?planId=${PLAN_ID}`, 'integrity_test.pdf');

  // 2. Download Word
  await downloadFile(`${BASE_URL}/api/download-word?planId=${PLAN_ID}`, 'integrity_test.docx');

  console.log("\n--- MANUAL VERIFICATION REQUIRED ---");
  console.log("1. Open 'integrity_test.pdf' and 'integrity_test.docx'.");
  console.log("2. Compare Section 1-10 order.");
  console.log("3. Verify Hazard Analysis table has Severity/Likelihood columns.");
  console.log("4. Check Footer for 'Plan vX'.");
  console.log("5. Check Cover Page for Metadata.");
}

(async () => {
    if (PLAN_ID === "PLACEHOLDER_PLAN_ID") {
        console.log("Please set PLAN_ID and USER_TOKEN.");
        return;
    }
    await verifyIntegrity();
})();
