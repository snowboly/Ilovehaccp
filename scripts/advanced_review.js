require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const context = {
  wizard_cards: [
    "Identity: Name, Country, Business Type (Restaurant, Bakery, etc.)",
    "Inventory: Ingredients, Food Categories (Meat, Produce, etc.), Allergens",
    "Risk Level: Vulnerable groups, Shelf life",
    "Workflow: Process steps (Receiving, Storage, Thawing, Prep, Cooking, Cooling, Reheating, Holding, Packaging)",
    "Equipment: List of equipment used",
    "Suppliers: Approved supplier status",
    "Processing: Cooking details (temp, method), Cooling, Reheating",
    "Maintenance: Equipment Calibration frequency",
    "Hygiene: Cleaning frequency, Staff training, Pest control contract",
    "Compliance: CCP Monitoring commitment"
  ],
  output_structure: {
    executive_summary: "Professional overview",
    prerequisite_programs: "Array of programs (Cleaning, Pest, Maintenance, Allergen)",
    process_flow_narrative: "Text description of flow",
    hazard_analysis: "Table with hazards, control measures, and CCP flags",
    ccp_summary: "Detailed table for CCPs (limits, monitoring, corrective actions)"
  }
};

async function getAdvancedReview() {
  console.log("🚀 Consulting OpenAI for advanced SaaS enhancements...");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o for higher quality strategic review
      messages: [
        {
          role: "system",
          content: "You are a Senior SaaS Architect and a Food Safety Compliance Consultant (Lead Auditor). Your goal is to review the current HACCP Wizard and output structure and suggest 5 advanced technical features and 3 output enhancements that would make this platform a world-class enterprise-ready solution."
        },
        {
          role: "user",
          content: `Current Wizard Context: ${JSON.stringify(context, null, 2)}`
        }
      ],
    });

    console.log("\n--- STRATEGIC SaaS REVIEW ---\n");
    console.log(response.choices[0].message.content);
    console.log("\n-----------------------------\n");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

getAdvancedReview();
