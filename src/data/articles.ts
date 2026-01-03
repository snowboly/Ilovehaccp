export interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
  publishedAt: string;
}

export const articles: Article[] = [
  {
    slug: "7-principles-of-haccp",
    title: "The 7 Principles of HACCP Explained Simply",
    category: "Education",
    readTime: "5 min read",
    excerpt: "Understand the core framework of food safety without the jargon. A guide for beginners.",
    publishedAt: "Jan 3, 2026",
    content: `
      <h2>Introduction</h2>
      <p>Hazard Analysis and Critical Control Points (HACCP) is a systematic preventive approach to food safety. It addresses physical, chemical, and biological hazards as a means of prevention rather than finished product inspection.</p>
      <h2>Principle 1: Conduct a Hazard Analysis</h2>
      <p>Identify hazards at every step (receiving, cooking, serving). Is there a risk of Salmonella? Metal shards? Cleaning chemicals?</p>
      <h2>Principle 2: Determine CCPs</h2>
      <p>Find the points where you can actually controlled the hazard. Cooking is a classic CCP. Receiving might be one for temperature.</p>
      <h2>Principle 3: Establish Critical Limits</h2>
      <p>Set the max/min value. e.g., Cook to 75°C. Fridge below 5°C. These are your red lines.</p>
      <h2>Principle 4: Monitoring</h2>
      <p>Who checks? How often? "Chef checks temp every batch" is a procedure.</p>
      <h2>Principle 5: Corrective Actions</h2>
      <p>What if it goes wrong? "Discard product" or "Re-cook". Write it down before it happens.</p>
      <h2>Principle 6: Verification</h2>
      <p>Double check the system. Calibrate thermometers. Review logs weekly.</p>
      <h2>Principle 7: Record Keeping</h2>
      <p>If it's not written down, it didn't happen. Keep logs for 12 months.</p>
    `
  },
  {
    slug: "top-5-haccp-mistakes",
    title: "Top 5 Mistakes in Restaurant HACCP Plans",
    category: "Compliance",
    readTime: "4 min read",
    excerpt: "Are you making these common errors? Learn how to avoid critical non-compliance issues.",
    publishedAt: "Jan 2, 2026",
    content: `
      <h2>1. Generic Templates</h2>
      <p>Using a downloaded template without customizing it to your specific menu and equipment is the #1 audit failure.</p>
      <h2>2. Confusing PRPs and CCPs</h2>
      <p>Cleaning is usually a Prerequisite Program (PRP), not a Critical Control Point (CCP). Confusing them bloats your plan.</p>
      <h2>3. Too Many CCPs</h2>
      <p>If everything is critical, nothing is. Stick to the absolute essentials (Cooking, Cooling, Reheating).</p>
      <h2>4. Ignoring Training</h2>
      <p>A perfect binder on the shelf is useless if the staff doesn't know it exists.</p>
      <h2>5. Pencil Whipping</h2>
      <p>Filling out logs at the end of the week instead of real-time. Auditors can spot this a mile away.</p>
    `
  },
  {
    slug: "ai-in-food-safety",
    title: "AI in Food Safety: The Future of Compliance",
    category: "Technology",
    readTime: "6 min read",
    excerpt: "How machine learning is revolutionizing how we detect hazards and manage documentation.",
    publishedAt: "Dec 28, 2025",
    content: `
      <h2>The Digital Revolution</h2>
      <p>AI is moving food safety from reactive to proactive. Instead of waiting for a recall, AI predicts risks.</p>
      <h2>Automated Hazard Analysis</h2>
      <p>LLMs can scan thousands of ingredients against global hazard databases in seconds, identifying risks a human might miss.</p>
      <h2>IoT Integration</h2>
      <p>Smart sensors feed data to AI hubs, alerting you to fridge failures before the food spoils.</p>
    `
  },
  {
    slug: "vacuum-packing-safety",
    title: "Vacuum Packing & Sous Vide: A Safety Guide",
    category: "High Risk",
    readTime: "8 min read",
    excerpt: "Botulism is a real risk in anaerobic environments. Learn the 10-day rule and safe temperatures.",
    publishedAt: "Dec 25, 2025",
    content: `
      <h2>The Anaerobic Risk</h2>
      <p>Clostridium botulinum thrives where there is no oxygen. Vacuum packing creates this exact environment.</p>
      <h2>The 10-Day Rule</h2>
      <p>In many jurisdictions (like the UK FSA), vacuum packed foods have a max shelf life of 10 days unless stored below 3°C or frozen.</p>
      <h2>Sous Vide Controls</h2>
      <p>Cooking at low temps requires precise time control to achieve pasteurization. 60°C for 45 mins might be safe, but 50°C might rarely be.</p>
    `
  },
  {
    slug: "allergen-management-big-9",
    title: "Allergen Management: The 'Big 9' Explained",
    category: "Compliance",
    readTime: "5 min read",
    excerpt: "Milk, Eggs, Fish, Shellfish, Tree Nuts, Peanuts, Wheat, Soy, Sesame. How to manage cross-contact.",
    publishedAt: "Dec 20, 2025",
    content: `
      <h2>Separation is Key</h2>
      <p>Store allergens on bottom shelves so they don't spill onto other foods. Use purple (or color-coded) boards.</p>
      <h2>Labeling</h2>
      <p>Every ingredient must be clearly labeled. "May contain" is a last resort, not a cover-all.</p>
      <h2>Staff Training</h2>
      <p>Servers must know exactly what is in every dish. Guessing leads to anaphylaxis.</p>
    `
  },
  {
    slug: "calibrate-thermometer",
    title: "How to Calibrate Your Thermometer",
    category: "Operations",
    readTime: "3 min read",
    excerpt: "A step-by-step guide to the Ice Point Method. Do this weekly to stay compliant.",
    publishedAt: "Dec 18, 2025",
    content: `
      <h2>The Ice Point Method</h2>
      <ol>
        <li>Fill a glass with crushed ice.</li>
        <li>Add water to the top of the ice.</li>
        <li>Stir and let sit for 3 minutes.</li>
        <li>Insert probe. It should read 0°C (+/- 1°C).</li>
      </ol>
      <h2>Boiling Point Method</h2>
      <p>Only use this if ice isn't available. Water boils at 100°C (at sea level). Be careful of steam burns.</p>
    `
  },
  {
    slug: "cleaning-vs-sanitizing",
    title: "Cleaning vs. Sanitizing: What's the Difference?",
    category: "Fundamentals",
    readTime: "4 min read",
    excerpt: "You can't sanitize a dirty surface. Understand the two-stage cleaning process.",
    publishedAt: "Dec 15, 2025",
    content: `
      <h2>Stage 1: Cleaning</h2>
      <p>Removal of visible soil, grease, and food debris using detergent and agitation (scrubbing).</p>
      <h2>Stage 2: Sanitizing</h2>
      <p>Reduction of bacteria to safe levels using heat (82°C+) or chemicals (Chlorine/Quats).</p>
      <h2>Common Error</h2>
      <p>Spraying sanitizer on a greasy table. The grease deactivates the chemical. You must clean FIRST.</p>
    `
  },
  {
    slug: "pest-control-maps",
    title: "Pest Control: Why Your Plan Needs a Map",
    category: "Operations",
    readTime: "4 min read",
    excerpt: "Bait stations must be numbered and mapped. Here's how to structure your pest defense.",
    publishedAt: "Dec 10, 2025",
    content: `
      <h2>Integrated Pest Management (IPM)</h2>
      <p>Focus on exclusion (door sweeps, screens) rather than just poisoning.</p>
      <h2>The Map</h2>
      <p>Your HACCP folder must have a floor plan showing every bait station location. If trap #4 catches a mouse, you need to know where #4 is immediately.</p>
    `
  },
  {
    slug: "staff-training-frequency",
    title: "Staff Training: How Often is Enough?",
    category: "Management",
    readTime: "5 min read",
    excerpt: "Induction is not enough. Refresher training is required by law. Best practices for 2026.",
    publishedAt: "Dec 05, 2025",
    content: `
      <h2>Induction</h2>
      <p>Before they touch food, they must know the basics: Washing hands, illness reporting, allergens.</p>
      <h2>On-the-Job</h2>
      <p>Shadowing a senior chef. Document this!</p>
      <h2>Refresher</h2>
      <p>Annually is the standard. But brief "toolbox talks" monthly are better for retention.</p>
    `
  },
  {
    slug: "person-in-charge",
    title: "The Role of the 'Person in Charge' (PIC)",
    category: "Management",
    readTime: "6 min read",
    excerpt: "Every shift needs a PIC. What are their legal responsibilities?",
    publishedAt: "Dec 01, 2025",
    content: `
      <h2>Always Present</h2>
      <p>During operating hours, someone must be accountable. They must be trained and capable of answering inspector questions.</p>
      <h2>Authority</h2>
      <p>The PIC must have the authority to send sick staff home or close the kitchen if hot water fails.</p>
    `
  },
  {
    slug: "brcgs-vs-iso22000",
    title: "BRCGS vs. ISO 22000: Certification Guide",
    category: "Industry",
    readTime: "10 min read",
    excerpt: "Which GFSI standard is right for your manufacturing facility? A comparative analysis.",
    publishedAt: "Nov 28, 2025",
    content: `
      <h2>BRCGS (Brand Reputation Compliance Global Standards)</h2>
      <p>Prescriptive. Tells you exactly what to do. Preferred by UK/US retailers.</p>
      <h2>ISO 22000</h2>
      <p>Flexible. Based on management systems. Great if you already have ISO 9001.</p>
      <h2>FSSC 22000</h2>
      <p>ISO 22000 + Pre-requisites. GFSI recognized. The gold standard for international trade.</p>
    `
  },
  {
    slug: "managing-suppliers",
    title: "Managing Suppliers: The Approved Supplier List",
    category: "Supply Chain",
    readTime: "5 min read",
    excerpt: "You are responsible for what you buy. How to vet and monitor your supply chain.",
    publishedAt: "Nov 25, 2025",
    content: `
      <h2>The List</h2>
      <p>You can only buy from the list. If a chef runs to the supermarket, that's a non-conformance unless the supermarket is on the list.</p>
      <h2>Vetting</h2>
      <p>Ask for their HACCP certificate or audit report. Don't just take their word for it.</p>
    `
  },
  {
    slug: "food-fraud-vaccp",
    title: "Food Fraud (VACCP): Protecting Your Brand",
    category: "High Risk",
    readTime: "7 min read",
    excerpt: "Horse meat in beef? Olive oil diluted with sunflower? Vulnerability Assessment explained.",
    publishedAt: "Nov 20, 2025",
    content: `
      <h2>VACCP vs HACCP</h2>
      <p>HACCP is for accidental hazards. VACCP is for intentional adulteration for economic gain.</p>
      <h2>High Risk Foods</h2>
      <p>Honey, Olive Oil, Alcohol, Spices, Meat. If it's expensive, someone will try to fake it.</p>
    `
  },
  {
    slug: "listeria-control",
    title: "Listeria: The Silent Killer in Refrigerated Foods",
    category: "Microbiology",
    readTime: "6 min read",
    excerpt: "Unlike Salmonella, Listeria grows in the fridge. Why ready-to-eat foods are the danger zone.",
    publishedAt: "Nov 15, 2025",
    content: `
      <h2>Psychrotrophic</h2>
      <p>Listeria monocytogenes can grow at 0°C. Cold storage slows it down but doesn't stop it.</p>
      <h2>Biofilms</h2>
      <p>It hides in drains and cracks. Scrubbing isn't enough; you need mechanical action and strong sanitizers.</p>
    `
  },
  {
    slug: "traceability-recall",
    title: "Traceability: Can You Recall in 4 Hours?",
    category: "Compliance",
    readTime: "5 min read",
    excerpt: "The standard audit test: Track a batch of flour from receiving to the customer plate in 4 hours.",
    publishedAt: "Nov 10, 2025",
    content: `
      <h2>One Step Back, One Step Forward</h2>
      <p>Know who you bought it from, and who you sold it to.</p>
      <h2>Mass Balance</h2>
      <p>If you bought 10kg, and have 2kg left, can you account for the 8kg sold? If you sold 15kg, you have a problem (undeclared ingredients?).</p>
    `
  }
];
