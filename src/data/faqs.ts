export interface FAQItem {
  q: string;
  a: string;
}

export const faqs: FAQItem[] = [
  // Regulation-Triggered (SEO Goldmine)
  {
    q: "Do I need a HACCP plan in the UK?",
    a: "Yes. Under UK food hygiene law (Regulation (EC) No 852/2004), all food business operators—including restaurants, takeaways, and retailers—must have a food safety management system based on HACCP principles. For very small businesses, this can be a simple, proportionate plan like our generated drafts."
  },
  {
    q: "What are the HACCP requirements under Regulation 852/2004?",
    a: "Article 5 of Regulation 852/2004 requires you to implement a procedure based on 7 principles: hazard analysis, identifying critical control points (CCPs), establishing limits, monitoring, corrective actions, verification, and documentation."
  },
  {
    q: "What does an Environmental Health Officer (EHO) look for during an inspection?",
    a: "An EHO looks for evidence that your HACCP plan is being followed daily. This includes completed temperature logs, cleaning schedules, staff training records, and proof that you know your Critical Control Points (CCPs). A 'dusty binder' isn't enough; they need to see active monitoring."
  },
  {
    q: "Does a small food business need a full HACCP plan?",
    a: "The law requires your plan to be 'proportionate' to your size and risk. A coffee shop needs a much simpler plan than a meat processing plant. Our tool automatically scales the complexity based on your business type to ensure you aren't overwhelmed with unnecessary paperwork."
  },

  // General & Legal
  {
    q: "Is a generated HACCP plan legal?",
    a: "Yes, provided it accurately reflects your actual operations. The law requires a plan based on HACCP principles; the tool used to draft it does not matter. However, the business operator is responsible for validating and implementing the plan. We recommend our Professional Review for peace of mind."
  },
  {
    q: "Does this cover me for local health inspections?",
    a: "Our output is specifically designed to meet UK and EU standards (Regulation EC 852/2004). Most local health authorities align with these principles. For businesses in the UK, it complements frameworks like 'Safer Food, Better Business' (SFBB)."
  },
  {
    q: "Do I need to sign up to generate a plan?",
    a: "You can draft your plan completely for free. To download the final professional PDF and save your progress, a free account is required."
  },
  
  // Technical & Usage
  {
    q: "What if my product lineup changes?",
    a: "Our platform allows you to edit your plan at any time. Simply log in, update your ingredients or steps, and re-generate the hazard analysis instantly."
  },
  {
    q: "Can I use this for a multi-site operation?",
    a: "Yes. For multi-site operations, we recommend our Enterprise/Pro tier which allows for central management and standardization across locations. The standard builder is best for single-site locations."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade encryption for all data. Your recipes and operational details are private and never shared with third parties."
  },
  {
    q: "How does the tool know my specific hazards?",
    a: "We use an advanced logic engine trained on thousands of food safety documents, epidemiological data, and regulatory texts. It correlates your inputs (e.g., 'sous-vide chicken') with known biological, chemical, and physical hazards."
  },

  // Pricing & Billing
  {
    q: "What is included in the €79 Starter Review?",
    a: "The Starter Review package includes full access to our builder tool, unlimited edits, PDF export, and a standard review of your plan by one of our food safety experts to ensure alignment with standards."
  },
  {
    q: "Do you offer refunds?",
    a: "Because the digital product (the HACCP plan) is delivered instantly, we generally do not offer refunds once the file has been downloaded. However, if you are unsatisfied with the expert review, please contact us."
  },
  {
    q: "Is there a monthly fee?",
    a: "No. The €79 Starter Review is a one-time payment per plan. Enterprise/Pro clients may have custom billing arrangements."
  },

  // Specific Food Safety Topics
  {
    q: "Does this handle allergens?",
    a: "Yes. The builder includes a specific section for allergen management, helping you identify and control the 14 major allergens (EU) or the Big 9 (US) depending on your region."
  },
  {
    q: "What about Prerequisite Programs (PRPs)?",
    a: "The generated plan includes standard operating procedures (SOPs) for key PRPs like Cleaning & Sanitation, Pest Control, and Staff Training. These are essential foundations for your HACCP plan."
  },
  {
    q: "Can I export to Word or Excel?",
    a: "Currently, we export to a secured, professional PDF format to ensure document integrity. Editable formats are available upon request for Pro tier customers."
  },
  {
    q: "How often should I review my HACCP plan?",
    a: "You should review your plan at least annually, or whenever there is a significant change to your product, equipment, suppliers, or regulations."
  },
  {
    q: "Do you support VACCP and TACCP?",
    a: "Our current tool focuses on HACCP (Safety). Vulnerability (VACCP) and Threat (TACCP) assessments are part of our advanced Enterprise module. Contact us for details."
  }
];
