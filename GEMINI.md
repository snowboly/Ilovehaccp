# ScriptWorkflow - Technical Memories (ilovehaccp.com)

## Implementation Status

### Professional Platform Overhaul (Jan 2026)
- **Expert Personas:** Created `ExpertAdvisors.tsx` and integrated 3 personas (Sarah Jenkins, Dr. Eleanor Vance, Marcus Thorne) into the homepage and article UI.
- **Article UI:** Implemented sticky Table of Contents, authority signals, and `@tailwindcss/typography` optimization for 5000+ word deep-dives.
- **Freemium Pivot:** Unlocked PDF generation for free users to drive traffic. PDF now includes operational logs (Toolkit).
- **HACCP Builder:** Added `localStorage` persistence, educational tooltips, and validated 18-section flow.
- **Stripe Integration:** Implemented `/api/create-checkout`, pricing cards, and `/api/webhook/stripe` for plan upgrades (€29/€79).
- **Security Audit:**
    - Hardened Supabase RLS (restricted SELECT to owners).
    - Implemented database-backed Rate Limiting (3/hr/IP) in `/api/generate-plan`.
    - Added `supabaseService` client for privileged operations.
- **Legal Hardening:** Updated Terms/Privacy with explicit AI training opt-outs and Free Tier liability waivers.
- **SEO & Branding:** New "i [Heart] HACCP" logo, custom SVG favicon, and updated metadata.

### Infrastructure & Scripts
- `scripts/generate_expert_article.js`: Outline-to-Section multi-step generator for long-form quality.
- `scripts/regenerate_all.js`: Automatic bulk upgrader for legacy articles.
- `scripts/dedupe_articles.js`: Utility to clean up `articles.ts` during generation failures.

## Next Steps
- Run `node scripts/regenerate_all.js` once Groq quota resets.
- Monitor Stripe webhooks in production.
- Capture first 100 leads using the new email capture.
