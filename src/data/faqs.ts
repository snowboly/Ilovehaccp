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
    a: "Yes, provided it accurately reflects your actual operations. The law requires a plan based on HACCP principles; the tool used to draft it does not matter. However, the business operator is responsible for validating and implementing the plan. We recommend our Expert Review for peace of mind."
  },
  {
    q: "Is my plan certified or approved by regulators?",
    a: "No. The documents we generate are drafts to assist your documentation efforts. They are not certificates, approvals, or validations from any regulatory body (FSA, EHO, local councils, etc.). Your plan must be implemented in practice and may be reviewed by your local authority during inspection."
  },
  {
    q: "Who is responsible for food safety after I generate a plan?",
    a: "You are. As the Food Business Operator, you remain solely and legally responsible for food safety, the accuracy of your plan, and its day-to-day implementation. A document alone does not ensure safety—active monitoring, staff training, and equipment maintenance are your ongoing obligations."
  },
  {
    q: "What if I fail an inspection using your plan?",
    a: "Our tool provides a framework based on general HACCP principles, not a guarantee of passing any specific audit. Regulatory interpretation varies by inspector and jurisdiction. We strongly recommend professional review and on-site validation before your inspection."
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
    a: "Yes. You can create separate plans for each location to account for site-specific differences. For businesses needing centralized management across multiple sites, contact us at support@ilovehaccp.com to discuss your requirements."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade encryption for all data. Your recipes and operational details are private and never shared with third parties."
  },
  {
    q: "Who processes my data?",
    a: "Your inputs are processed by our technology partners under strict contractual terms. Your recipes and operational details are never used for model training, shared with third parties for marketing, or sold. See our Privacy Policy for full details."
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes. Under GDPR, you have the right to access, correct, export, or permanently delete your data. Email support@ilovehaccp.com with subject 'Privacy Request' and we'll respond within 30 days."
  },
  {
    q: "How does the tool know my specific hazards?",
    a: "We use an advanced logic engine trained on thousands of food safety documents, epidemiological data, and regulatory texts. It correlates your inputs (e.g., 'sous-vide chicken') with known biological, chemical, and physical hazards."
  },

  // Pricing & Billing
  {
    q: "What are the pricing options?",
    a: "Professional (€39): Clean PDF and Word export with unlimited edits. Expert Review (€99): Everything in Professional, plus a human food safety expert reviews your plan for standards alignment."
  },
  {
    q: "Do you offer refunds?",
    a: "Because HACCP plans are digital products delivered instantly, all sales are final once generated or downloaded. However, we will issue refunds for technical failures (corrupted or unusable files), accidental double charges, or non-delivery that our support team cannot resolve. Contact support@ilovehaccp.com."
  },
  {
    q: "Is there a monthly fee?",
    a: "No. Both tiers (€39 Professional and €99 Expert Review) are one-time payments per plan. No subscriptions required."
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
    a: "Yes. Professional and Expert tiers include Word (.docx) export for easy editing. PDF is available at all tiers. Excel export is not currently supported."
  },
  {
    q: "How often should I review my HACCP plan?",
    a: "You should review your plan at least annually, or whenever there is a significant change to your product, equipment, suppliers, or regulations."
  },
  {
    q: "Do you support VACCP and TACCP?",
    a: "Our current tool focuses on HACCP (Safety). Vulnerability (VACCP) and Threat (TACCP) assessments are on our roadmap. Contact support@ilovehaccp.com if this is a priority for your business."
  },

  // Account & Support
  {
    q: "I forgot my password. How do I reset it?",
    a: "Click 'Forgot password?' on the login page. We'll email you a reset link. Check your spam folder if it doesn't arrive within a few minutes."
  },
  {
    q: "How do I contact support?",
    a: "Email support@ilovehaccp.com for general inquiries, technical issues, or privacy requests. We aim to respond within 1-2 business days."
  },
  {
    q: "Which languages are available?",
    a: "Our marketing pages are available in English, German, Italian, and Lithuanian. The HACCP builder is currently in English, but you can use your browser's translation feature, and Word exports can be translated locally if needed."
  }
];
