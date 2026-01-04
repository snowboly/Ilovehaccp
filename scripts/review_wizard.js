require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const wizardLogic = `
Questions Structure:
1. Identity: Business Name, Country, Type.
2. Inventory: Ingredients, Categories, Allergens.
3. Risk: Vulnerable groups, Shelf life.
4. Workflow: Process steps (Receiving, Storage, etc.), Key Equipment, Supplier Approval.
5. Processing: Cooking (Yes/No), Min Temp, Cooling, Reheating.
6. Maintenance: Equipment Calibration (Regularly/Occasionally/No).
7. Hygiene: Cleaning frequency, Training, Pest Control.
8. Monitoring: Will monitor CCPs (Yes/No).

Current Features:
- Branching logic (skip cooking questions if no cooking).
- PDF Generation with Visual Process Flow.
- Regional Temperature Units (C/F).
- LocalStorage persistence.
`;

async function reviewWizard() {
  console.log("Requesting OpenAI review of the HACCP Wizard...");
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a world-class Product Designer and Food Safety Expert. Review this HACCP Wizard logic and provide 5 advanced, high-impact suggestions to move it from a basic tool to a market-leading professional SaaS."
        },
        {
          role: "user",
          content: wizardLogic
        }
      ],
    });

    console.log("\n--- OPENAI SUGGESTIONS ---\n");
    console.log(response.choices[0].message.content);
    console.log("\n--------------------------\n");
  } catch (error) {
    console.error("Error during OpenAI review:", error.message);
  }
}

reviewWizard();
