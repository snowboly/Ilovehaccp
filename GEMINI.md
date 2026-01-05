# ScriptWorkflow - Technical Memories (ilovehaccp.com)

## Implementation Status

### v3.2 Editorial & Functional Polish (Jan 5, 2026)
- **Content Integrity:** 
    - Deduplicated article database (removed 1 corrupted/duplicate entry).
    - Fixed 404 links to FDA FSMA/Food Code guidance.
    - Implemented **Smart Image Deduplication**: Replaced 101 duplicate image instances with context-aware, unique Pexels assets.
- **Editorial Redesign:** 
    - Transformed Article Detail pages (`/resources/[slug]`) into a clean, "Wikipedia-style" layout (sans-serif body, serif headers, sidebar TOC/Infobox) to improve readability and authority.
- **Wizard Enhancements:** 
    - Added "Infrastructure Maintenance" and "Preventative Maintenance" steps to the builder wizard.
    - Updated PDF generation logic to include these new compliance controls.
    - Visual Process Flow in PDF now matches the web UI "card" style (red/white theme with arrows).
- **Monetization & Admin:**
    - **Admin Dashboard:** Created a secure `/admin/dashboard` (server-side email whitelist) to view paid plans.
    - **Word Export:** Implemented `.docx` generation for paid users (and admins).
    - **Stripe:** Updated API version to `2025-12-15.clover` and verified webhook configuration for automatic plan unlocking.
- **Internationalization (i18n):**
    - Extended translation dictionary to cover the **entire Landing Page** (Hero, Features, Pricing, How It Works).
    - Refactored components to use dynamic `t()` hooks, ensuring full page translation when switching languages.
- **Visuals:**
    - Reverted expert avatars to stable DiceBear v9 `avataaars` seeds (Joao/Fabio=Male, others=Female) to ensure reliability.

### v3.1 Avatar & Authority Refinements (Jan 4, 2026)
- **Avatar System Upgrade:** 
    - Migrated from DiceBear 7.x to 9.x to resolve broken image issues caused by API versioning.
    - Simplified avatar URLs (removed complex query parameters) for better stability and faster loading.
- **Team Persona Consistency:** 
    - Standardized expert names across all touchpoints (About Us, Homepage, Resource Detail).
    - Updated references to ensure "Dr. Margarida" and "Dr. Isabel" are consistently used instead of earlier variants.
- **Resource Page UX:** Fixed indentation and code structure in the article detail template for better maintainability.

### v3.0 Professional Launch Refinements (Jan 3, 2026)
- **About Us Overhaul (Sobel Inspired):** Completely redesigned the "About Us" page to mirror high-authority regulatory consultancy standards.
    - Added a mission-driven Hero section focused on democratizing compliance.
    - Implemented "Leadership Insights" featuring prominent quotes from Dr. Joao and Dr. Margaret.
    - Added a "Core Pillars" section (Precision, Innovation, Integrity, etc.) with detailed icons.
    - Relocated the entire expert team from the homepage to this page to strengthen authority.
- **Team Visuals & Balanced Layout:**
    - Transitioned all team members to modern `api.dicebear.com` avatars.
    - Structured the team grid into a balanced 3+2 layout (Joao, Margaret, Fabio on top; Claudia, Elizabeth centered below).
    - Verified gender seeds for avatars (Joao = male).
- **Homepage Streamlining:** Removed the team section from the homepage to focus exclusively on the core product value and pricing.
- **Legal Hardening:** Overhauled Terms, Privacy, and Refund policies with "Plain English Summaries" and explicit AI-liability disclaimers.
- **Resources Search Engine:** 
    - Replaced the tab-switcher with a unified, real-time search interface for 66 articles and 15+ FAQs.
    - Integrated high-quality, category-specific Unsplash images for every article.
    - Implemented FAQ Accordions for improved mobile UX.
- **Navigation UX:** 
    - Converted "Resources" into a professional hover-dropdown with icons and anchor links (#articles, #faqs).
    - Moved the Language Selector to the far end of the Navbar per standard SaaS patterns.
- **Freemium Pivot:** Unlocked PDF Export for free users and focused the Starter tier purely on "Expert Review."
- **Developer Infrastructure:**
    - Resolved Turbopack workspace root inference issues via `next.config.ts`.
    - Fixed UTF-16 encoding corruption in `articles.ts` using Node.js sanitization.

### Infrastructure & Scripts
- `scripts/regenerate_all.js`: Automatic bulk upgrader with **OpenAI Fallback**.
- `scripts/dedupe_articles.js`: Utility to clean up `articles.ts` and fix syntax errors.
- `scripts/add_article_images.js`: (Completed) Automatically assigned relevant imagery to the article catalog.

## Current Pricing Model
- **Free Tier:** AI-Generated HACCP Plan + Instant PDF Export + PRPs.
- **Starter Review (€79 + VAT):** AI Plan + Expert 1-on-1 Human Review + Compliance Stamp + **Editable Word Doc**.
- **Expert Pro (Custom):** Multi-site operations, industrial audits, and bespoke consultancy.

## Next Steps
- Monitor traffic and search queries on the new Resources engine.
- Integrate Brevo for automated lead nurturing after PDF download.
- Final production verification and DNS cutover.