const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const USER_TOKEN = "PLACEHOLDER_USER_TOKEN"; 

async function verifyCCPTraceability() {
  console.log("--- TEST: Verifying CCP -> Process Step Traceability ---");

  // 1. Construct Payload with Explicit Linkage
  // In the real app, HACCPMasterFlow builds this. Here we simulate the final payload.
  const planPayload = {
    businessName: "Traceability Test Bakery",
    // ...
    fullPlan: {
        hazard_analysis: [
            {
                step_name: "Cooking Step 5", // Specific name
                hazards: "Salmonella",
                severity: "High",
                likelihood: "Medium",
                is_ccp: true,
                control_measure: "Heat treatment"
            }
        ],
        ccp_summary: [
            {
                ccp_step: "Cooking Step 5", // <--- THIS IS THE CRITICAL LINK
                hazard: "Salmonella",
                critical_limit: "75C for 30s",
                monitoring: "Probe",
                corrective_action: "Recook",
                frequency: "Every batch"
            }
        ],
        validation: {
            block_export: false,
            section_1_overall_assessment: { audit_readiness: "Ready" }
        }
    }
  };

  // 2. Save Plan
  console.log("Saving Plan...");
  const saveRes = await fetch(`${BASE_URL}/api/save-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${USER_TOKEN}`
    },
    body: JSON.stringify({
        businessName: "Traceability Test",
        fullPlan: planPayload.fullPlan
    })
  });

  if (!saveRes.ok) {
      console.error("Save failed", await saveRes.text());
      return;
  }

  const savedData = await saveRes.json();
  const plan = savedData.plan;
  const ccp = plan.full_plan.ccp_summary[0];

  console.log("\n--- VERIFICATION ---");
  console.log(`Hazard Step Name: "${plan.full_plan.hazard_analysis[0].step_name}"`);
  console.log(`CCP Step Name:    "${ccp.ccp_step}"`);

  if (ccp.ccp_step === "Cooking Step 5") {
      console.log("✅ SUCCESS: CCP is explicitly linked to 'Cooking Step 5'");
  } else {
      console.log("❌ FAILURE: CCP step name mismatch or missing.");
  }

  console.log("\n(Visual check required for PDF: Ensure 'Cooking Step 5' appears in CCP column)");
}

(async () => {
    if (USER_TOKEN === "PLACEHOLDER_USER_TOKEN") {
        console.log("Please set USER_TOKEN.");
        return;
    }
    await verifyCCPTraceability();
})();
