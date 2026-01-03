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
      <p>Hazard Analysis and Critical Control Points (HACCP) is a systematic preventive approach to food safety. It addresses physical, chemical, and biological hazards as a means of prevention rather than finished product inspection. This guide breaks down the 7 principles into simple, actionable steps.</p>

      <h2>Principle 1: Conduct a Hazard Analysis</h2>
      <p>The first step involves identifying any hazards that must be prevented, eliminated, or reduced to acceptable levels. Hazards can be biological (bacteria), chemical (cleaning agents), or physical (glass, metal).</p>
      
      <h3>How to do it:</h3>
      <ul>
        <li>List every step in your process (e.g., receiving, cooking, serving).</li>
        <li>Identify potential hazards at each step.</li>
        <li>Determine the likelihood and severity of each hazard.</li>
      </ul>

      <h2>Principle 2: Determine Critical Control Points (CCPs)</h2>
      <p>A Critical Control Point (CCP) is a step at which control can be applied and is essential to prevent or eliminate a food safety hazard or reduce it to an acceptable level.</p>
      <p>Examples include cooking (to kill bacteria) or cooling (to prevent bacterial growth).</p>

      <h2>Principle 3: Establish Critical Limits</h2>
      <p>For each CCP, you must establish a critical limit. This is a maximum and/or minimum value to which a biological, chemical, or physical parameter must be controlled.</p>
      <blockquote>Example: Cooking chicken to an internal temperature of 75°C (165°F) for 15 seconds.</blockquote>

      <h2>Principle 4: Establish Monitoring Procedures</h2>
      <p>Monitoring is a planned sequence of observations or measurements to assess whether a CCP is under control and to produce an accurate record for future use in verification.</p>

      <h2>Principle 5: Establish Corrective Actions</h2>
      <p>Corrective actions are procedures to be followed when a deviation occurs. If a CCP is not within critical limits, you must act immediately.</p>

      <h2>Principle 6: Establish Verification Procedures</h2>
      <p>Verification activities, other than monitoring, determine the validity of the HACCP plan and that the system is operating according to the plan.</p>

      <h2>Principle 7: Establish Record-Keeping and Documentation Procedures</h2>
      <p>Efficient and accurate record keeping is essential to the application of a HACCP system. Records should include the HACCP plan itself, hazard analysis, and monitoring records.</p>
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
      <h2>1. Copy-Pasting Generic Plans</h2>
      <p>Many businesses download a template and simply change the name. This is a critical error. Your HACCP plan must be tailored to your specific menu, equipment, and processes. An inspector will spot a generic plan immediately.</p>

      <h2>2. Confusing PRPs with CCPs</h2>
      <p>Prerequisite Programs (PRPs) like cleaning and pest control are the foundation. Critical Control Points (CCPs) are specific steps to control hazards (like cooking). Confusing them leads to an unmanageable plan.</p>

      <h2>3. Over-complicating the Plan</h2>
      <p>More CCPs isn't better. Too many CCPs make the plan impossible to follow. Stick to the points that are truly critical for safety.</p>

      <h2>4. Failing to Verify Records</h2>
      <p>Writing down temperatures is useless if no one checks them. Management must review records weekly to ensure staff are actually following the procedures.</p>

      <h2>5. Inadequate Training</h2>
      <p>The best plan in the world fails if staff don't understand it. Training must be regular, documented, and practical.</p>
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
      <p>Artificial Intelligence is transforming food safety from a reactive to a proactive discipline. By analyzing vast amounts of data, AI can predict risks before they become incidents.</p>

      <h2>Automated Hazard Analysis</h2>
      <p>Tools like iLoveHACCP use Large Language Models (LLMs) to scan your menu and identify hazards instantly, referencing global databases like the FDA and Codex Alimentarius.</p>

      <h2>Smart Monitoring</h2>
      <p>IoT sensors connected to AI systems can monitor fridge temperatures 24/7, alerting staff immediately if a deviation occurs, eliminating manual log errors.</p>
    `
  }
];