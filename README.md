# ilovehaccp.com - Professional AI HACCP Solutions

A high-authority SaaS platform that automates Hazard Analysis and Critical Control Point (HACCP) planning for food businesses worldwide.

## 🚀 Status: Professional Standard (Launch Ready)

### 🌟 Key Enhancements:
1.  **High-Authority UI/UX:**
    *   **Expert Personas:** Integrated bio-profiles for Industry Veterans, Lead Auditors, and Scientists to signal trust and E-E-A-T.
    *   **Advanced Article Engine:** Long-form (5000+ word) scientific articles with sticky Table of Contents and specialized typography.
    *   **Traffic-First model:** Unlocked PDF generation for free users to maximize user acquisition and lead capture.
2.  **Professional "Toolkit" PDF:**
    *   **Audit-Ready Documents:** Cover pages, signature blocks, and version control.
    *   **Operational Appendices:** Automatically appends blank Monitoring Logs (Temperature logs, Cleaning checklists, Training records) for daily use.
3.  **HACCP Builder 2.0:**
    *   **Persistent State:** Progress is saved automatically via `localStorage`.
    *   **Expert Tooltips:** In-line "Expert Tips" explaining the compliance rationale for every question.
    *   **Branching Logic:** Smartly skips irrelevant sections based on business type.
4.  **Monetization & Lead Capture:**
    *   **Stripe Integration:** Optional €29/€79 tiers for Expert Reviews and Compliance Assurance.
    *   **Email Lead Capture:** "Email me my plan" functionality on the result page for conversion optimization.
5.  **Security & Infrastructure:**
    *   **Database-Backed Rate Limiting:** Prevents AI quota exhaustion (3 gens/hour/IP).
    *   **Secure RLS:** Hardened Supabase policies ensuring data isolation.
    *   **Hardened Legal Framework:** AI-specific disclaimers, zero-training privacy policy, and digital refund terms.

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Next.js API Routes + Supabase Service Role.
- **AI:** Groq SDK (Llama 3.3 70B).
- **Database:** Supabase (PostgreSQL) with RLS.
- **PDF:** @react-pdf/renderer.
- **Payments:** Stripe Checkout + Webhooks.

## 📂 Key Scripts
- `scripts/generate_expert_article.js`: Multi-step engine for high-quality content.
- `scripts/regenerate_all.js`: Bulk content upgrader with rate-limit handling.
- `scripts/dedupe_articles.js`: Safety script for data integrity.

## 🛠 Deployment Checklist
1. **Env Vars:** `STRIPE_SECRET_KEY`, `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. **Build:** `npm run build`.
3. **Pushed:** Changes are synced to GitHub `main` branch.
