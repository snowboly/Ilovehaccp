# ilovehaccp.com - Professional Digital HACCP Solutions

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
    *   **Stripe Integration:** Review-based pricing model (€79 Starter Review / Custom Enterprise).
    *   **Email Lead Capture:** "Email me my plan" functionality on the result page for conversion optimization.
    *   **Lead Magnet:** "2026 Inspection Checklist" download for top-of-funnel lead capture.
    *   **Marketing Engine:** Trust indicators, social proof stats, and industry sector coverage.
5.  **Security & Infrastructure:**
    *   **Email System:** Resend integration with server-side PDF attachments.
    *   **Database-Backed Rate Limiting:** Prevents AI quota exhaustion (3 gens/hour/IP).
    *   **Secure RLS:** Hardened Supabase policies ensuring data isolation.
    *   **Hardened Legal Framework:** AI-specific disclaimers, zero-training privacy policy, and digital refund terms.

## 🛠 Tech Stack
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend:** Next.js API Routes + Supabase Service Role.
- **Email:** Resend (Transactional & Marketing).
- **AI:** Groq SDK (Llama 3.3 70B).
- **Database:** Supabase (PostgreSQL) with RLS.
- **PDF:** @react-pdf/renderer (Server-side & Client-side).
- **Payments:** Stripe Checkout + Webhooks.

## 🏗️ Development & Content

### Content Generation
The project includes a powerful suite of scripts to generate high-quality, long-form articles using AI.

- **`node scripts/generate_expert_article.js "Title" [slug]`**: Generates a single 5000+ word article with a specific persona.
- **`node scripts/regenerate_all.js`**: Batch processor that upgrades all placeholder articles in `articles.ts`.
  - **Features:** Auto-fallback from Groq (Free) to OpenAI (`gpt-4o-mini`) when rate limits are hit.
  - **Personas:** Articles are written by 5 distinct expert personas (Dr. Joao, Dr. Margarida, etc.) for variety and authority.
- **`node scripts/dedupe_articles.js`**: Maintenance utility to clean `articles.ts`, remove duplicates, and fix syntax errors.

### Environment Variables
Ensure your `.env.local` includes:
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
STRIPE_SECRET_KEY=...
GROQ_API_KEY=...    # Primary AI Provider
OPENAI_API_KEY=...  # Fallback AI Provider
RESEND_API_KEY=...
RESEND_FROM="iLoveHACCP <noreply@ilovehaccp.com>"
ADMIN_REVIEW_INBOX=...
APP_URL=...
```

## 🛠 Deployment Checklist
1. **Env Vars:** `STRIPE_SECRET_KEY`, `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. **Build:** `npm run build`.
3. **Pushed:** Changes are synced to GitHub `main` branch.

## 🗄️ Production DB Checklist (Quick)
1. **Run migrations:** Apply new SQL in `src/db/*.sql` to production (Supabase SQL editor or your migration pipeline).
2. **Verify critical tables exist:** `public.stripe_processed_events`, `public.haccp_plan_versions`, and any new tables referenced by API routes.
3. **Reload PostgREST schema cache:** `NOTIFY pgrst, 'reload schema';` or use the Supabase dashboard “Reload schema” button.
4. **RLS sanity check:** Ensure RLS policies exist for user-facing tables and that service-role access is restricted to backend routes.
5. **Smoke test:** Create a checkout session and confirm webhook idempotency + version snapshot writes succeed.

## 🔐 Security Hardening (Baseline)

### Response Headers (Middleware)
The middleware applies a minimal, compatibility-friendly security header set:

- **Content-Security-Policy (CSP)**: allows same-origin content plus common HTTPS assets, inline scripts/styles, and Stripe frames.
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`
  - `style-src 'self' 'unsafe-inline' https:`
  - `img-src 'self' data: https:`
  - `font-src 'self' data: https:`
  - `connect-src 'self' https:`
  - `frame-src https://js.stripe.com https://hooks.stripe.com`
  - `frame-ancestors 'self'`
  - `base-uri 'self'`
  - `form-action 'self'`
  - `object-src 'none'`
- **Strict-Transport-Security (HSTS)**: `max-age=63072000; includeSubDomains; preload` (production only).
- **Referrer-Policy**: `strict-origin-when-cross-origin`.

### CSRF Assumptions (POST Routes)
- **Stripe webhook**: Verified via `stripe-signature` and does not rely on cookies, so CSRF is not applicable.
- **Admin APIs**: Use `Authorization: Bearer` tokens, which are not sent automatically by browsers; CSRF exposure is limited to token leakage.
- **User-authenticated routes** (e.g., claim/import flows and dashboard actions) rely on Supabase session cookies. CSRF protection is expected to come from:
  - `SameSite=Lax` or stricter on auth cookies.
  - `HttpOnly` + `Secure` in production.
  - Server-side checks that the user is authenticated for any state-changing action.

If new POST endpoints are introduced that mutate user state and rely solely on cookies, consider adding explicit CSRF tokens or origin checking.

### Cookie Security Expectations
- Auth/session cookies should be `HttpOnly`, `Secure` (in production), and `SameSite=Lax` or `SameSite=Strict`.
- Any non-essential cookies must be opt-in and kept separate from authentication.
