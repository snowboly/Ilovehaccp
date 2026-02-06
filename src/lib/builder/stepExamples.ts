/**
 * Step-specific contextual examples for the HACCP builder.
 *
 * Used in:
 *  - Process Flow: step_description placeholder
 *  - Hazard Analysis: process_control_description placeholder
 *  - Hazard Analysis: per-hazard-type description placeholders
 */

export interface StepExamples {
  /** Placeholder for step_description in process flow */
  description: string;
  /** Placeholder for process_control_description in hazard analysis */
  processControl: string;
  /** Per-hazard-type placeholder hints */
  hazards: {
    bio: string;
    chem: string;
    phys: string;
    allergen: string;
  };
}

const STEP_EXAMPLES: Record<string, StepExamples> = {
  "Goods Receiving": {
    description: "e.g., Inspect deliveries, check temperatures, verify supplier certificates",
    processControl:
      "e.g., Temperature check on arrival (chilled ≤5°C, frozen ≤−18°C); visual inspection of packaging integrity; supplier COA verified and filed",
    hazards: {
      bio: "e.g., Salmonella or Listeria in raw materials, contamination from damaged packaging",
      chem: "e.g., Pesticide residues, undeclared additives, packaging migration",
      phys: "e.g., Foreign bodies in raw materials (stones, metal, plastic fragments)",
      allergen: "e.g., Undeclared allergens from supplier, mislabelled ingredients",
    },
  },
  "Ambient Storage": {
    description: "e.g., Store dry goods in cool, dry area; FIFO stock rotation applied",
    processControl:
      "e.g., Stock rotation (FIFO) checked weekly; storage area temp ≤25°C; pest control programme in place",
    hazards: {
      bio: "e.g., Mould growth from humidity, pest contamination (rodents, insects)",
      chem: "e.g., Cleaning chemical contamination from nearby storage, packaging migration",
      phys: "e.g., Pest droppings, packaging debris, dust contamination",
      allergen: "e.g., Cross-contact from open containers of allergenic ingredients",
    },
  },
  "Chilled Storage": {
    description: "e.g., Store perishable goods at 0–5°C; monitor fridge temperatures daily",
    processControl:
      "e.g., Fridge temperature monitored and logged twice daily (target 0–5°C); FIFO stock rotation enforced; raw and RTE products segregated",
    hazards: {
      bio: "e.g., Listeria monocytogenes growth if temperature exceeds 5°C, cross-contamination between raw and RTE",
      chem: "e.g., Cleaning chemical residues on shelves",
      phys: "e.g., Condensation drip, packaging debris",
      allergen: "e.g., Cross-contact between allergenic and non-allergenic products from shared shelving",
    },
  },
  "Frozen Storage": {
    description: "e.g., Store frozen goods at ≤−18°C; monitor freezer temperatures daily",
    processControl:
      "e.g., Freezer temperature monitored and logged daily (target ≤−18°C); stock rotation applied; door seals checked weekly",
    hazards: {
      bio: "e.g., Pathogen survival if freezer failure occurs, contamination during thaw–refreeze cycles",
      chem: "e.g., Packaging migration from frost-damaged containers",
      phys: "e.g., Ice crystal damage to packaging, foreign bodies from damaged packaging",
      allergen: "e.g., Cross-contact from shared freezer space with allergenic products",
    },
  },
  "Defrosting": {
    description: "e.g., Thaw products under controlled conditions (fridge, cold water, or microwave)",
    processControl:
      "e.g., Defrost in fridge at ≤5°C or under cold running water; core temp monitored; use within 24 hours of thawing; never refreeze",
    hazards: {
      bio: "e.g., Rapid bacterial growth in temperature danger zone (5–63°C) during uncontrolled thawing",
      chem: "e.g., Chemical absorption from thawing liquids or containers",
      phys: "e.g., Foreign bodies revealed as product thaws",
      allergen: "e.g., Cross-contact from thawing multiple products together",
    },
  },
  "Preparation (Raw)": {
    description: "e.g., Wash, peel, cut, portion raw ingredients; segregate from RTE",
    processControl:
      "e.g., Separate raw preparation area/equipment; colour-coded chopping boards; hands washed between raw and RTE handling",
    hazards: {
      bio: "e.g., Salmonella, E. coli, Campylobacter from raw meat/poultry; cross-contamination to RTE via hands/surfaces",
      chem: "e.g., Sanitiser residues on preparation surfaces, pesticide residues on produce",
      phys: "e.g., Bone fragments, stones in vegetables, blade fragments from worn equipment",
      allergen: "e.g., Cross-contact from shared equipment or surfaces used for allergenic ingredients",
    },
  },
  "Preparation (RTE)": {
    description: "e.g., Assemble, slice, plate ready-to-eat products; dedicated RTE area",
    processControl:
      "e.g., Dedicated RTE preparation area; clean and sanitised surfaces before use; staff hand hygiene enforced; no raw food contact",
    hazards: {
      bio: "e.g., Listeria monocytogenes from environmental contamination, Norovirus from food handlers",
      chem: "e.g., Cleaning chemical residues on RTE contact surfaces",
      phys: "e.g., Glass fragments, plasters, hair, jewellery from food handlers",
      allergen: "e.g., Cross-contact from shared slicers, utensils, or surfaces",
    },
  },
  "Cooking / Heat Treatment": {
    description: "e.g., Cook to safe core temperature; verify with calibrated probe thermometer",
    processControl:
      "e.g., Core temperature ≥75°C for ≥30 seconds (or equivalent time/temp); calibrated probe thermometer used; time/temp logged per batch",
    hazards: {
      bio: "e.g., Survival of Salmonella, E. coli, or Listeria if core temperature not reached",
      chem: "e.g., Formation of acrylamide at high temperatures, chemical migration from cooking vessels",
      phys: "e.g., Equipment fragments (e.g., broken thermometer tip, worn sieve mesh)",
      allergen: "e.g., Cross-contact from shared cooking oil, utensils, or cooking vessels",
    },
  },
  "Cooling": {
    description: "e.g., Cool cooked food rapidly from 63°C to ≤5°C within 90 minutes",
    processControl:
      "e.g., Cool from 63°C to ≤5°C within 90 minutes; use blast chiller or shallow containers; core temp logged at start and end",
    hazards: {
      bio: "e.g., Clostridium perfringens, Bacillus cereus spore germination during slow cooling in danger zone (5–63°C)",
      chem: "e.g., Chemical migration from cooling containers",
      phys: "e.g., Foreign bodies from cooling equipment or uncovered containers",
      allergen: "e.g., Cross-contact if cooling near uncovered allergenic products",
    },
  },
  "Reheating": {
    description: "e.g., Reheat to core temperature ≥75°C; serve immediately; reheat once only",
    processControl:
      "e.g., Reheat to core ≥75°C throughout; use within 2 hours; reheat only once; core temp verified with probe thermometer",
    hazards: {
      bio: "e.g., Survival of spore-forming bacteria (C. perfringens, B. cereus) if reheat temperature insufficient",
      chem: "e.g., Chemical migration from microwave-safe containers at high temperatures",
      phys: "e.g., Equipment fragments from worn heating elements",
      allergen: "e.g., Cross-contact from shared reheating equipment (e.g., microwave, bain-marie)",
    },
  },
  "Hot Holding": {
    description: "e.g., Hold cooked food at ≥63°C; monitor temperature regularly",
    processControl:
      "e.g., Hot holding temperature ≥63°C; temperature checked and logged every 2 hours; discard after 2 hours if below 63°C",
    hazards: {
      bio: "e.g., Toxin production by Staphylococcus aureus, growth of C. perfringens if temp drops below 63°C",
      chem: "e.g., Chemical migration from hot holding containers",
      phys: "e.g., Foreign bodies from open display (customer-facing environments)",
      allergen: "e.g., Cross-contact from shared serving utensils or bain-marie compartments",
    },
  },
  "Cold Display": {
    description: "e.g., Display chilled products at ≤5°C; monitor display unit temperatures",
    processControl:
      "e.g., Display unit temperature ≤5°C; temperature checked and logged twice daily; products covered/protected; time limit if unrefrigerated (≤4 hours)",
    hazards: {
      bio: "e.g., Listeria growth if display temp exceeds 5°C, contamination from customer handling",
      chem: "e.g., Cleaning residues on display surfaces",
      phys: "e.g., Glass fragments from broken display units, foreign bodies from customer contact",
      allergen: "e.g., Cross-contact from adjacent allergenic products in shared display",
    },
  },
  "Packaging / Labelling": {
    description: "e.g., Pack into final packaging; apply correct labels with allergen and date info",
    processControl:
      "e.g., Label accuracy check (allergens, use-by date, batch code) per run; packaging integrity checked; seals verified",
    hazards: {
      bio: "e.g., Contamination from unclean packaging materials, post-process contamination during packing",
      chem: "e.g., Chemical migration from packaging materials, ink contamination",
      phys: "e.g., Packaging fragments (plastic, staples, cardboard), foreign bodies from packing area",
      allergen: "e.g., Incorrect allergen labelling, cross-contact from shared packing lines",
    },
  },
  "Distribution / Sale": {
    description: "e.g., Transport at correct temperature; maintain cold chain; record delivery temps",
    processControl:
      "e.g., Vehicle pre-cooled before loading; delivery temperature ≤5°C (chilled) or ≤−18°C (frozen); temp logged on delivery note",
    hazards: {
      bio: "e.g., Temperature abuse during transport, contamination from unclean delivery vehicles",
      chem: "e.g., Contamination from transport chemicals, fuel, or co-transported goods",
      phys: "e.g., Physical damage during transit, foreign bodies from vehicle",
      allergen: "e.g., Cross-contact from co-transported allergenic products",
    },
  },
};

/** Fallback examples for steps that don't match any known pattern (custom/"Other" steps). */
const DEFAULT_EXAMPLES: StepExamples = {
  description: "e.g., Describe what happens at this step, equipment used, key parameters",
  processControl:
    "e.g., Describe the specific controls applied at this step (temperature, time, visual checks, etc.)",
  hazards: {
    bio: "e.g., Bacterial contamination, viral contamination, parasites",
    chem: "e.g., Chemical residues, cleaning agents, packaging migration",
    phys: "e.g., Foreign bodies (metal, glass, plastic, bone)",
    allergen: "e.g., Cross-contact from shared equipment or surfaces",
  },
};

/**
 * Get contextual examples for a process step based on its name.
 * Matches exactly first, then falls back to fuzzy keyword matching.
 */
export function getStepExamples(stepName: string | undefined | null): StepExamples {
  if (!stepName) return DEFAULT_EXAMPLES;

  // Exact match
  if (STEP_EXAMPLES[stepName]) return STEP_EXAMPLES[stepName];

  // Fuzzy keyword match (case-insensitive)
  const lower = stepName.toLowerCase();

  for (const [key, examples] of Object.entries(STEP_EXAMPLES)) {
    const keyLower = key.toLowerCase();
    // Check if step name contains the key or vice versa
    if (lower.includes(keyLower) || keyLower.includes(lower)) {
      return examples;
    }
  }

  // Keyword-based fallback for common partial matches
  const keywordMap: [string[], string][] = [
    [["receiv", "goods in", "intake", "delivery", "incoming"], "Goods Receiving"],
    [["ambient", "dry stor", "room temp"], "Ambient Storage"],
    [["chill", "refrigerat", "fridge", "cold stor"], "Chilled Storage"],
    [["freez", "frozen stor"], "Frozen Storage"],
    [["defrost", "thaw"], "Defrosting"],
    [["prep", "raw prep", "butcher", "trim", "wash"], "Preparation (Raw)"],
    [["rte prep", "assembly", "salad", "sandwich", "plat"], "Preparation (RTE)"],
    [["cook", "heat treat", "bak", "fry", "grill", "roast", "boil", "steam", "pasteur"], "Cooking / Heat Treatment"],
    [["cool", "blast chill", "rapid chill"], "Cooling"],
    [["reheat", "re-heat"], "Reheating"],
    [["hot hold", "bain-marie", "hot display", "hot serv"], "Hot Holding"],
    [["cold display", "cold serv", "salad bar", "deli counter"], "Cold Display"],
    [["pack", "label", "seal", "wrap"], "Packaging / Labelling"],
    [["distribut", "dispatch", "transport", "deliver", "sale", "serving"], "Distribution / Sale"],
  ];

  for (const [keywords, key] of keywordMap) {
    if (keywords.some(kw => lower.includes(kw))) {
      return STEP_EXAMPLES[key] || DEFAULT_EXAMPLES;
    }
  }

  return DEFAULT_EXAMPLES;
}
