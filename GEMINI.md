# iLoveHACCP - Technical Memories

## Implementation Status

- v3.31 Admin Auth Hydration Fix (Jan 20, 2026):
- **Problem:** `/admin` was briefly loading then redirecting to `/login` due to a Supabase auth hydration race condition (getUser() running before session restoration).
- **Fix:** Updated `src/components/admin/AdminGuard.tsx` to:
    1. Use `supabase.auth.getSession()` for the initial fast check.
    2. Subscribe to `supabase.auth.onAuthStateChange()` to handle hydration events.
    3. Show a loading spinner (`checking` state) until the session is definitively resolved.
    4. Only redirect after confirming no session or non-admin role.
- **Architecture:** 
    - **Frontend:** Strict Client-Side Gating via `AdminGuard`. No server-side auth in `layout.tsx` or `page.tsx`.
    - **Backend:** API routes continue to use server-side `validateAdminRequest` from `src/lib/admin-auth.ts`.

- v3.32 HACCP Builder Audit Hardening & Results Page Overhaul (Jan 20, 2026):
- **Goal:** Align with strict auditor requirements, remove "HACCP Lite" branding, and enforce data integrity.
- **Key Changes:**
    1. **Zero State Enforcement:** 
        - "Start New Plan" and anonymous sessions now strictly purge all local state.
        - Resume logic is conditional: only for authenticated users with server-side drafts.
        - Added "Continuing Draft" banner for clarity.
    2. **Risk & Assumption Gating:**
        - Implemented `riskFlags` (e.g., `SHELF_LIFE_UNVALIDATED`, `HIGH_RISK_RTE`, `SCOPE_GROUPED`).
        - Added dynamic "Key Assumptions & Gaps" section to the results page.
        - High-Risk combinations (RTE + Assumption) trigger a mandatory typed confirmation modal.
    3. **Results Page Overhaul ("Audit Grade"):**
        - **Renamed:** "Validation" -> "Draft Review". "Audit Report" -> "Draft Assessment".
        - **Explicit Exclusions:** Added "What This Draft Does Not Provide" section (No validation, no approval).
        - **Automated Checks:** Clearly listed what IS checked (Logic, Completeness) vs what IS NOT (Accuracy, Effectiveness).
        - **Neutral Next Steps:** Replaced sales pricing with factual "Optional Next Steps" (Self-Service vs Professional Review).
        - **Strong Warnings:** Added "Use without professional review may result in unmanaged risks" to all export options.
    4. **UX/UI:**
        - Added `cursor-pointer` to all interactive builder elements.
        - Improved button affordance and layout for the review page.

### v3.30 Admin Auth & Browser Client Fixes (Jan 19, 2026)
- **Browser Client:** Standardized `src/utils/supabase/client.ts` to use `@supabase/ssr` `createBrowserClient`.
- **Login Sync:** Implemented `window.location.href` in `AuthForm.tsx` to force a hard reload on login, solving SSR cookie synchronization issues.
- **Admin Gating Strategy:** Migrated from Server-Side Auth (`verifyAdminAccess`) to Client-Side Gating (`AdminGuard`).
    - **AdminGuard:** Created `src/components/admin/AdminGuard.tsx` to protect admin routes client-side.
    - **Layout:** Stripped auth logic from `src/app/admin/layout.tsx`, making it purely structural.
    - **Pages:** Updated `src/app/admin/page.tsx` and all sub-pages (`reviews`, `plans`, `payments`, `logs`) to remove server-side checks and rely on the new guard (or layout structure).
    - **Cleanup:** Completely removed the legacy `verifyAdminAccess` function and all its references.
- **Code Quality:** Fixed critical build errors in `src/app/admin/page.tsx` including syntax errors in Supabase queries and invalid multiline JSX attributes.

### v3.30 Draft Persistence & Admin Access Fixes (Jan 18, 2026)
- **Draft Persistence:** Implemented robust draft persistence for anonymous users and login handovers.
    - **Database Schema:** Added `plan_data` (JSONB) column to the `drafts` table via `src/db/migration_drafts_plan_data.sql`.
    - **Dashboard Visibility:** Dashboard now fetches and displays active drafts ("In Progress") alongside completed plans.
    - **Handover Logic:** Prevents session loss by ensuring draft data is saved to the database immediately after generation and linking it to the user upon login.
- **Admin Access Hardening:**
    - **Centralized Config:** Moved admin email list to `src/lib/constants.ts` as the single source of truth.
    - **Case-Insensitivity:** Updated all 9 admin API routes (`admin/*`, `download-pdf`, `download-word`) to normalize email checks (`toLowerCase()`), preventing lockouts due to capitalization mismatches.
- **Download Availability:**
    - **Draft Downloads:** Updated PDF and Word export APIs to support "Free Drafts" by falling back to the `drafts` table if a plan ID is not found in the `plans` table.
    - **Permission Logic:** Drafts are correctly treated as "Unpaid" (Watermarked PDF only, Word blocked/upgrade prompt).

### v3.29 Final Gating & Persistence Fixes (Jan 15, 2026)
- **Monetization Enforcement:** Implemented strict UI gating for validation reports, blurring detailed findings for unpaid users with a clear "Unlock" call-to-action.
- **Session Persistence:** Added logic to restore the generated plan and validation report from `localStorage` (`haccp_plan_id`) upon reload, preventing data loss.
- **Document Safety:** Removed "Approved By" fields from self-service export cover pages to prevent regulatory misunderstanding.
- **Export Logic:** Replaced export buttons with a payment prompt for unpaid users, aligned with server-side entitlement checks.

### v3.28 Branding Update (Jan 15, 2026)
- **Terminology Shift:** Replaced "AI" with "Automated", "System", or "Tool" across user-facing interfaces (Builder, Pricing, Privacy) to position the product as a professional compliance tool rather than a generic AI generator.
- **Content Expansion:** Generated 10 new high-value EU industry guides targeting "Meal Prep", "Home Bakers", "Street Food", "Seafood", "Vegan Cafes", and "Nightclubs".

### v3.27 Content Expansion (Jan 15, 2026)
- **Niche Guides:** Generated 10 new high-value EU industry guides targeting "Meal Prep", "Home Bakers", "Street Food", "Seafood", "Vegan Cafes", and "Nightclubs".
- **SEO Update:** Regenerated `sitemap.xml` to include all 101 articles for immediate indexing.

### v3.26 Hydration Fix (Jan 15, 2026)
- **JSON-LD Placement:** Moved the `JSONLD` component to the bottom of the `ResourcesPage` JSX structure to resolve a React hydration mismatch caused by `<script>` tag placement at the root level.

### v3.25 Final Polish & Verification (Jan 15, 2026)
- **CCP Logic Verification:** Confirmed implementation of conditional, single-page CCP management with flattened data structures for accurate reporting.
- **Notification Hardening:** Verified idempotent webhook handling to prevent duplicate emails and side effects.
- **UX Finalization:** Completed rollout of contextual tooltips across the builder and resolved minor build issues.
- **Admin Review API:** Exposed hardened API endpoints for review in a dedicated `review_hardening` folder.

### v3.24 Phase 1 Backend Hardening (Jan 15, 2026)
- **Authorization Binding:** Hardened critical API routes (`save-plan`, `download-pdf`, `download-word`) to enforce strict server-side ownership checks, preventing cross-user data access.
- **Entitlement Enforcement:** Implemented robust payment tier and validation status checks directly in the export endpoints, ensuring users can only download what they've paid for and what is compliant.
- **Webhook Idempotency:** Refined the Stripe webhook handler to strictly prevent duplicate processing and side effects.
- **Admin Scalability:** Added server-side pagination to Admin Users and Audit Logs lists to handle growing datasets efficiently.
- **Audit Compliance:** Expanded logging coverage to include `VIEW_PLAN` events for detailed admin access, creating a comprehensive audit trail.

### v3.23 Contextual Guidance (Jan 15, 2026)
- **Tooltip System:** Implemented a reusable, mobile-friendly tooltip component for explaining technical HACCP terms without influencing user decisions.
- **Content Enrichment:** Added neutral, auditor-safe tooltips to 10 key areas including Hazard Severity, Likelihood, CCP Identification, Critical Limits, and Verification Activities.
- **Schema Update:** Extended the JSON question schema to support an optional `tooltip` field for centralized content management.

### v3.22 Builder UX & Stability (Jan 15, 2026)
- **CCP Management UX:** Replaced the sequential CCP wizard loop with a single, consolidated page displaying all Critical Control Points as "Card Groups" for better overview.
- **Dynamic Schema:** Implemented on-the-fly schema generation to render multiple CCP monitoring sections dynamically based on Hazard Analysis results.
- **Code Restoration:** Resolved a critical regression where generation and validation logic was accidentally removed during refactoring.
- **Stability:** Fixed build errors related to duplicate code blocks and missing function definitions.

### v3.21 Builder Logic Refinement (Jan 15, 2026)
- **CCP Logic:** Implemented dynamic "Card Group" wizard step for CCP Management, iterating through identified CCPs with context.
- **Conditional Workflow:** Section 8 (CCP Management) is now automatically skipped if no CCPs are identified in the Hazard Analysis.
- **Data Structure:** Flattened CCP answer schema to include `ccp_id` and all nested answers in a clean array.
- **Export & Validation:** Updated PDF/Word generation and AI Validation rules to handle plans with "No CCPs" correctly (controlled via PRPs).

### v3.20 Admin Dashboard & Security Overhaul (Jan 15, 2026)
- **Oversight Console:** Implemented a new Admin Dashboard with strict "Observer" role enforcement.
- **Expert Review Workflow:** Added a dedicated workspace for the €79 tier, featuring split-screen context and reviewer comments.
- **Audit Logging:** Migrated to a generic `access_logs` system to track `VIEW`, `ADD_COMMENT`, and `COMPLETE_REVIEW` actions by admins.
- **Security Hardening:** Implemented lightweight list fetching and separate, logged endpoints for detailed plan access to prevent data leakage.
- **Pagination:** Added server-side pagination to the Plans list to ensure scalability.

### v3.19 Dashboard UX Refinement (Jan 15, 2026)
- **Import Confirmation:** Added a safety modal for the "Claim Plan" feature to prevent accidental imports and ensure ID accuracy.
- **Retention Banner:** Implemented a prominent "Resume Draft" banner that appears automatically if an unfinished plan exists, reducing user abandonment.
- **Visual Feedback:** Integrated `AlertTriangle` and `History` icons for better context in dashboard actions.

### v3.12 Privacy & Security Compliance (Jan 13, 2026)
- **Privacy Policy Enhancements:**
    - **Data Retention:** Defined explicit timelines for account data (indefinite for active, 30-day purge for deleted).
    - **Transparency:** Explicitly named **Groq Inc.** and **OpenAI** as technology partners with links to their respective privacy/security policies.
    - **User Rights:** Expanded GDPR/CCPA section with clear instructions for Subject Access Requests (SAR).
- **Terms of Service Enhancements:**
    - **Data Security Section:** Added Section 6 detailing encryption standards (TLS 1.3, AES-256), RLS access controls, and a 72-hour incident notification commitment.
    - **Renumbering:** Systematically updated all subsequent sections (up to 16) to maintain logical flow.

### v3.11 UK Regulatory Clarity (Jan 13, 2026)
- **UK Compliance:**
    - **Retained Law:** Added a dedicated citation for **Retained Regulation (EC) No 852/2004** to the `/resources` page to explicitly support UK users post-Brexit.
    - **Context:** Clarified that this mirrors EU standards, providing reassurance to UK operators.

### v3.10 Content Quality & Credibility (Jan 13, 2026)
- **Regulatory Transparency:**
    - **Source Links:** Added direct, authoritative links to **Regulation (EC) No 852/2004** and **Codex CXC 1-1969** on the `/resources` page.
    - **Mapping Table:** Implemented a detailed table in `/resources` explaining exactly how the tool's 7-step output maps to specific Articles (5(2)(a-g)) of EU Regulation 852/2004.
- **Legal Exposure Management:**
    - **Prominent Disclaimer:** Added a visible, non-dismissible "Automated Guidance • Not Legal Advice" banner to the top of the HACCP Builder (`HACCPBuilder.tsx`).
    - **Citation Enhancements:** Updated the `Citation` component to support descriptions for better context.

### v3.9 Compliance & Liability Mitigation (Jan 13, 2026)
- **Legal Risk Reduction:**
    - **FDA Decoupling:** Removed all specific references to the FDA, FSMA, and 21 CFR to avoid US-centric liability.
    - **Compliance Language:** Replaced absolute claims like "Compliant" and "Guaranteed" with softer terms like "Aligns with Standards" and "Standardization".
    - **Disclaimers:** Added a robust "No Legal Advice & No Guarantee" section to the Terms of Service and a prominent disclaimer to the PDF cover page.
- **Content Sanitization:**
    - **Article Cleanup:** Removed articles with heavy FDA focus (`fda-vs-eu-regulations`, `haccp-and-fda-fsma-what-food-businesses-must-know`).
    - **Global Replacements:** Replaced FDA-specific terms with generic international equivalents (e.g., "Regulatory Authorities", "Food Safety Authority") across all 76 articles.
- **Auditor Rigor:**
    - **Transparency:** Added explanations to the homepage about how the tool uses Codex-based decision trees and pre-validated critical limits to meet auditor expectations.

### v3.8 Formatting & Database Integrity (Jan 12, 2026)
- **Formatting Overhaul:**
    - **Header Standardization:** Converted all `### Header` and `<p>### Header</p>` patterns to standard `<h3>Header</h3>` HTML tags across all articles.
    - **Bold Tag Rendering:** Converted all markdown bold syntax (`**text**`) to proper HTML `<strong>text</strong>` tags.
    - **Code Readability:** Improved source formatting by adding newlines after closing header tags.
- **Database Synchronization:**
    - **Ghost Articles:** Identified and fixed articles (e.g., "HACCP for Craft Breweries") that existed in the database but were missing from the local `src/data/articles.ts` file.
    - **Direct DB Fixes:** Created `scripts/fix_db_formatting.js` to apply formatting fixes directly to 8 database-resident articles that were missed by local scripts.
    - **Robust Migration:** Updated `scripts/migrate_articles_to_db.js` with improved regex parsing to handle quoted/unquoted keys and ensure reliable synchronization of all 78 articles.
- **Bug Fixes:**
    - **Syntax Repair:** Fixed a critical syntax error in `src/data/articles.ts` where the reformatting script inadvertently stripped closing backticks from article content strings.
    - **Diagnostics:** Added `scripts/check_breweries.js` and `scripts/check_db_content.js` to verify specific content integrity in the database.

### Marketing Strategy (Jan 12, 2026)
- **Inbound Submission Targets:**
    - **AI Directories:** There's An AI For That, Futurepedia, TopAI.tools (Priority: High, immediate traffic).
    - **SaaS Platforms:** Product Hunt (Planned Launch), BetaList, SaaSHub.
    - **Industry Channels:** Food Safety Magazine, LinkedIn Groups (Food Safety Professionals), Reddit (`r/foodsafety`, `r/restauranteur`).
- **Outbound Strategy:**
    - **Apollo.io:** Utilization of Apollo.io for targeted cold outreach.
        - **Target:** "Food Safety Managers", "Head of Quality", "Restaurant Owners".
        - **Filter:** Food & Beverages, Hospitality, Catering (EU/USA focus).
        - **Offer:** Direct B2B sales for "Starter Review" and "Expert Review" tiers.

### v3.7 Content Restoration & Expansion (Jan 12, 2026)
- **Article Restoration:**
    - **Digital vs. Paper Records:** Successfully regenerated and restored this missing 4500-word expert article (`digital-vs-paper-records`).
    - **Sync & Fixes:** Updated `generate_expert_article.js` with slugify helpers and `migrate_articles_to_db.js` to handle quoted keys. Synced article to Supabase and replaced placeholders with Pexels images.
- **Niche Guides:**
    - **Batch 3 Prepared:** Updated `generate_eu_niche_batch.js` to process the next 5 EU niche guides (Craft Breweries, Hospital Catering, Care Home Kitchens, Coffee Roasteries, Sandwich Shops).

### v3.6 Branding & Authentication (Jan 9, 2026)
- **Branding Refresh:**
    - **New Icon:** Designed and implemented a custom "Shield & Heart" SVG logo to symbolize safety/compliance + the brand name.
    - **Metadata:** Updated site description in `layout.tsx` to "Free online HACCP tool for food businesses. Build HACCP plans, manage compliance, and prepare for audits with iLoveHACCP."
    - **Cleanup:** Removed legacy `favicon.ico` files to force browser adoption of the new SVG icon.
- **Authentication:**
    - **SSO:** Implemented Google OAuth via Supabase in `AuthForm.tsx`.
    - **Configuration:** User updated Google Cloud Console (App Name: "iLoveHACCP", Logo Uploaded, Authorized Domains added).
    - **UI:** Added a branded "Continue with Google" button.

### v3.5 Marketing & Reliability Update (Jan 8, 2026)
- **Marketing Launch:**
    - **Trust Section:** Added homepage section with stats (1,240+ plans) and sector coverage to build authority.
    - **Lead Magnet:** Implemented "2026 Food Safety Inspection Checklist" download section. Captures emails to `leads` table and auto-sends PDF via Resend.
    - **User Menu:** Added authenticated User Menu with avatar/dropdown to Navbar.
- **Critical Fixes:**
    - **Stripe Checkout:** Fixed "loading forever" issue by opening new tab immediately. Fixed API version mismatch (`2024-06-20`). Enabled coupons (requires "Customer-Facing" codes in Dashboard).
    - **Plan Editing:** Enabled editing of existing plans! Builder now loads previous inputs (`_original_inputs`) and performs `UPDATE` instead of `INSERT`.
    - **PDF Attachments:** Implemented server-side PDF generation (`@react-pdf/renderer`) in API routes. Plans and Checklists are now attached directly to emails.
    - **DOCX Parity:** Updated Word generator to include all sections found in the PDF (Benchmarking, Toolkit, Process Flow).
    - **Contact Consolidation:** Routed all billing/privacy/contact inquiries to `support@ilovehaccp.com`.

### v3.4 Authentication & Retention Polish (Jan 7, 2026)
- **Email & Link Integrity:**
    - **Plan Persistence:** Implemented `/api/plans/[id]` server-side fetch to allow anonymous users to view their generated plans via email links, bypassing RLS safely.
    - **URL Loading:** Updated `HACCPBuilder.tsx` to automatically detect `?id=` in the URL and load the results dashboard directly.
    - **Professional Templates:** Created and implemented high-converting HTML templates for Signup, Password Reset, and Plan Delivery emails. Backups stored in `src/db/email_templates/`.
- **Identity & Security:**
    - **Forgot Password Flow:** Added a complete "Forgot Password" UI in `AuthForm.tsx` and a dedicated `src/app/update-password/page.tsx` reset handler.
    - **Auto-Login:** Implemented `onAuthStateChange` listener in the login form to automatically redirect users to the dashboard as soon as they click their email confirmation link.
- **Cleanup & DevOps:**
    - Removed all debug buttons and temporary testing files.
    - Verified full production email pipeline via `noreply@ilovehaccp.com`.
    - Synchronized all latest developments to GitHub.

### v3.3 Conversion & Reliability Overhaul (Jan 6, 2026)
- **Wizard UX/UI Enhancements:**
    - **Smart Navigation:** Implemented a history stack for the "Back" button to correctly handle skipped logic steps.
    - **Auto-Save:** Added `localStorage` persistence to save user progress automatically and a "Resume Last Session" button.
    - **Inline Validation:** Replaced native `alert()` popups with inline error messages and red border states for a smoother experience.
    - **Auto-Scroll:** Implemented smooth scrolling to the top of the wizard container on every step change.
    - **Reassurance:** Added "No HACCP knowledge needed" text to the intro screen to reduce user anxiety.
    - **New Steps:** Added **Logo Upload** (Branding) and **Template Selection** (Minimal, Corporate, Modern) to the wizard.
    - **PDF Engine:** Updated PDF generator to render the uploaded logo and apply color themes based on the selected template.

- **Email System Implementation (Resend):**
    - **Infrastructure:** Installed `resend` SDK and created API routes for `send-plan-email` and `send-contact-email`.
    - **Configuration:** Set up `RESEND_API_KEY` (user provided) and configured sender as `noreply@ilovehaccp.com`.
    - **Features:** 
        - **Plan Delivery:** Users receive a direct link to their generated plan via email.
        - **Admin Notifications:** Contact form submissions now trigger an instant email to `support@ilovehaccp.com`.

- **Visuals & Branding:**
    - **Local Avatars:** Switched from unstable external APIs to **locally hosted SVGs** (`/public/team/`) for team avatars to ensure 100% uptime and correct appearance.
    - **Role Updates:** Renamed team roles (Joao: Scientific Lead & Founder, Margarida: Head of Compliance, Fabio: Lead Auditor, Claudia: Technical Lead, Isabel: Head of Ops).
    - **Bio Updates:** Refined Dr. Joao's bio to "The scientific visionary behind our tool logic."
    - **Image Sanitization:** Created `scripts/generate_images_from_suggestions.js` to replace 380+ `[IMAGE_SUGGESTION]` tags with safe, high-quality Pexels images (sanitized query logic). **Synced live database.**

- **Marketing & Content:**
    - **Hero Section:** Rewrote copy to be outcome-focused ("Create a HACCP Plan in Minutes"), added value checklist, and tightened layout for above-the-fold visibility.
    - **Audience Segmentation:** Added "Who this is for / Not for" section to build trust.
    - **Trust Signals:** Added a **Founder Note** section and an explicit **Disclaimer** in the footer.
    - **Feature List:** Renamed features to focus on business outcomes (e.g., "Inspection Ready").
    - **New Service:** Added "Expert Review" pricing card ("From €99") and dashboard promo banner.

- **Database & Deployment:**
    - **RLS Fix:** Created and executed SQL migration to allow anonymous users to save plans (fixed "Enter valid email" error).
    - **Build Fix:** Added `.npmrc` with `legacy-peer-deps` to resolve Vercel build conflicts.

### v3.2 Editorial & Functional Polish (Jan 5, 2026)
- **Content Integrity:** 
    - Deduplicated article database.
    - Fixed 404 links to FDA FSMA/Food Code guidance.
    - Implemented **Smart Image Deduplication**.
- **Editorial Redesign:** Transformed Article Detail pages into a clean, "Wikipedia-style" layout.
- **Wizard Enhancements:** Added "Infrastructure Maintenance" and "Preventative Maintenance" steps.

## Current Pricing Model
- **Free Tier:** AI-Generated HACCP Plan + Instant PDF Export + PRPs.
- **Starter Review (€79 + VAT):** AI Plan + Expert 1-on-1 Human Review + Compliance Stamp + **Editable Word Doc**.
- **Expert Review (From €99 + VAT):** Professional audit of existing plans with detailed action report.
- **Expert Pro (Custom):** Multi-site operations, industrial audits, and bespoke consultancy.

## Future Roadmap (v2.0)
- **Automated Product Labels:** Implement a module to generate compliant food product labels based on the ingredients and allergens captured in the HACCP builder. This will include nutritional facts (optional), allergen bolding, and shelf-life guidance.

## Next Steps
1.  **Submission:** Submit the site to top AI Directories (Futurepedia, There's An AI For That).
2.  **Outreach:** Set up Apollo.io account and begin prospecting for B2B leads.
3.  **Content Expansion:** Run `node scripts/generate_eu_niche_batch.js` to generate the next batch of EU niche guides.
4.  **v2.0 Scoping:** Begin technical research for the "Automated Product Labels" module.