# ilovehaccp.com - AI-Powered HACCP Planning

A modern SaaS platform that automates the creation of Hazard Analysis and Critical Control Point (HACCP) plans for food businesses using AI.

## 🚀 Current Status: Launch Ready (MVP)

### Core Features:
1.  **High-Authority Landing Page:**
    *   Interactive AI Demo (instant hazard analysis preview).
    *   Professional SEO structure with high-converting hooks.
    *   **3-Tier Pricing Model:**
        *   **Free Preview (€0):** Readiness check, on-screen hazard list (No Download).
        *   **Starter (€29/mo):** Full audit-ready PDF, complete CCP analysis.
        *   **Professional (€79/mo):** Expert validation, Word/Excel exports.
2.  **18-Section Gamified HACCP Wizard:**
    *   Typeform-style single-question flow with smooth transitions.
    *   Smart branching logic (skips irrelevant sections like "Cooking" or "Transport" based on user answers).
    *   Covers the full scope: Business Context, Ingredients, Processing, Storage, Cleaning, Pest Control, Training, etc.
3.  **Advanced AI Integration (Groq):**
    *   Uses **Llama 3.3 70B** for ultra-fast generation.
    *   Constructs comprehensive plans including Executive Summaries, Prerequisite Programs (PRPs), Hazard Analysis, and CCP tables.
4.  **Monetization & Gating:**
    *   **"Teaser" Mode:** Free users see a blurred/locked view of the critical data to drive upgrades.
    *   **PDF Generation:** Client-side generation using `@react-pdf/renderer`, available only to paid/logged-in users.
5.  **User Dashboard & Auth:**
    *   Supabase Auth integration.
    *   Dashboard to manage, edit, and delete projects.
6.  **Support Infrastructure:**
    *   **Resources Page:** Knowledge base with FAQs and scientific context.
    *   **Legal Pages:** Terms of Service, Privacy Policy, Cookie Policy (with AI disclaimers).
    *   **Contact:** Lead capture form for Enterprise inquiries.
    *   **Sitemap:** Dynamic `sitemap.xml` for SEO.

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Next.js API Routes.
- **AI:** Groq SDK (Llama 3.3).
- **Database:** Supabase (PostgreSQL).
- **PDF:** @react-pdf/renderer.

## 📂 Project Structure
- `/src/app`:
  - `/builder`: The main 18-step wizard.
  - `/dashboard`: User project management.
  - `/resources`: SEO content and articles.
  - `/contact`: Enterprise lead form.
  - `/api/generate-plan`: The AI logic hub.
- `/src/components`: Reusable UI (Builder, PDF, Auth).
- `/src/db`: SQL migration scripts.

## 🛠 Deployment
1. **Environment Variables:** Ensure `.env.local` is set up with Supabase and Groq keys.
2. **Build:** `npm run build`.
3. **Start:** `npm start`.
4. **Vercel:** Connect the repository and deploy.