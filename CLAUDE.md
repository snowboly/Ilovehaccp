# CLAUDE.md - iLoveHACCP Codebase Guide

## Project Overview

iLoveHACCP is a SaaS platform that automates HACCP (Hazard Analysis and Critical Control Points) plan generation for food businesses. It targets UK and EU markets, providing AI-assisted food safety compliance documentation with professional export capabilities, expert review workflows, and Stripe-based monetization.

**Domain:** `www.ilovehaccp.com`
**Status:** Production / Launch Ready

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.1 (App Router) |
| Language | TypeScript 5 (strict mode) |
| React | React 19.2.3 (Server + Client Components) |
| Styling | Tailwind CSS 4, PostCSS, `clsx`, `tailwind-merge` |
| Database | PostgreSQL via Supabase (with RLS) |
| Auth | Supabase Auth (email/password, session cookies) |
| Payments | Stripe (one-time checkout + webhooks) |
| AI (primary) | Groq SDK (Llama 3.3 70B) |
| AI (fallback) | OpenAI (`gpt-4o-mini`) |
| Email | Resend (transactional + marketing) |
| PDF | `@react-pdf/renderer` (server + client) |
| Word Export | `docx` library |
| Icons | `lucide-react` |
| Animations | Framer Motion |
| Analytics | Vercel Analytics |
| Hosting | Vercel |

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # ~27 API route handlers
│   │   ├── admin/              # Admin endpoints (stats, users, plans, reviews, audit-logs)
│   │   ├── drafts/             # Draft CRUD + attach
│   │   ├── plans/              # Plan CRUD
│   │   ├── export/             # PDF/DOCX generation
│   │   ├── download-pdf/       # PDF download with auth
│   │   ├── download-word/      # Word download with auth
│   │   ├── generate-plan/      # AI plan generation (rate-limited)
│   │   ├── create-checkout/    # Stripe checkout session
│   │   ├── webhook/stripe/     # Stripe webhook (idempotent)
│   │   └── ...                 # me, save-plan, claim-plan, send-* email routes
│   ├── admin/                  # Admin dashboard pages
│   ├── dashboard/              # User dashboard
│   ├── builder/                # HACCP plan builder (questionnaire)
│   ├── plan/                   # Plan view/results
│   ├── login/, signup/         # Auth pages
│   ├── resources/              # Content/articles pages
│   ├── terms/, cookies/, contact/ # Legal/info pages
│   ├── layout.tsx              # Root layout (providers, navbar, footer)
│   └── globals.css             # Global Tailwind styles
├── components/
│   ├── builder/                # Questionnaire, QuestionCard, SaveProgressModal
│   ├── pdf/                    # HACCPDocument, ChecklistDocument (react-pdf)
│   ├── layout/                 # Navbar, Footer, UserMenu, CookieConsent, SEO, JSONLD
│   ├── admin/                  # AdminGuard, admin UI components
│   ├── landing/                # Landing page sections
│   ├── resources/              # Article listing/display
│   ├── ui/                     # Shared UI primitives
│   └── providers.tsx           # Context providers (LanguageProvider)
├── lib/
│   ├── supabase.ts             # Supabase clients (anon + service role)
│   ├── admin-auth.ts           # Admin role validation
│   ├── audit.ts                # Fire-and-forget access logging
│   ├── token.ts                # HMAC-SHA256 token generation/verification
│   ├── groq.ts                 # Groq SDK client
│   ├── constants.ts            # App-wide constants (admin emails, etc.)
│   ├── i18n.tsx                # Language context + translation
│   ├── locales.ts              # Translation strings
│   ├── email/                  # sendEmail(), HTML templates
│   ├── export/                 # PDF/Word generation logic, permissions, auth
│   └── builder/                # Builder utilities (withTimeoutFetch, etc.)
├── types/
│   ├── haccp.ts                # HACCPQuestion, HACCPSectionData, QuestionType
│   └── versioning.ts           # Plan version + audit types
├── data/
│   ├── haccp/                  # HACCP standards reference, question loader
│   ├── articles.ts             # 101+ long-form articles (~1.4MB)
│   └── faqs.ts                 # FAQ content
├── db/                         # SQL migrations (30+ files)
│   ├── schema.sql              # Base schema (plans, review_requests)
│   ├── migration_*.sql         # Feature migrations (auth, payments, drafts, RLS, etc.)
│   └── email_templates/        # HTML email templates
└── utils/
    └── supabase/               # Server/client Supabase helpers (createClient)
scripts/                        # 76+ Node.js utility scripts
tests/                          # Playwright E2E tests
public/                         # Static assets (fonts, images, SVGs)
```

## Development Commands

```bash
npm run dev        # Start dev server (runs restore_favicons.js first)
npm run build      # Production build (runs restore_favicons.js first)
npm run start      # Start production server
npm run lint       # Run ESLint (Next.js core-web-vitals + TypeScript)
```

All three main commands (`dev`, `build`, `start`) run `scripts/restore_favicons.js` as a pre-hook to reconstruct favicon files from base64 sources in `scripts/favicons-base64/`.

## Path Aliases

Use `@/*` to reference `./src/*`:
```typescript
import { supabaseService } from '@/lib/supabase';
import { HACCPQuestion } from '@/types/haccp';
```

## Environment Variables

Required in `.env.local` (never committed):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...          # Public: browser client
NEXT_PUBLIC_SUPABASE_ANON_KEY=...     # Public: browser client
SUPABASE_SERVICE_ROLE_KEY=...         # Secret: server-side only

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# AI Providers
GROQ_API_KEY=...                      # Primary (free tier)
OPENAI_API_KEY=...                    # Fallback

# Email
RESEND_API_KEY=...
RESEND_FROM="iLoveHACCP <noreply@ilovehaccp.com>"
ADMIN_REVIEW_INBOX=...

# Application
APP_URL=...                           # Base URL for email links
API_RATE_LIMIT_ENABLED=true

# PDF Export (optional - uses local LibreOffice if not set)
GOTENBERG_URL=...                     # Gotenberg service URL for DOCX-to-PDF conversion
```

## Architecture Patterns

### Server vs Client Components

- **Server Components** (default): Used for layouts, static pages, admin layout auth guard
- **Client Components** (`"use client"`): Used for interactive pages (builder, dashboard, auth forms)
- Admin auth is gated client-side via `AdminGuard` component (uses `onAuthStateChange` for hydration safety)

### API Route Pattern

All API routes follow this structure:

```typescript
export async function POST(req: Request) {
  try {
    // 1. Extract & validate auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Get user from token
    const { data: { user } } = await supabaseService.auth.getUser(token);

    // 3. Validate input
    const { planId } = await req.json();
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    // 4. Ownership/permission check
    if (plan.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 5. Business logic + response
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Route Error:', error);
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
```

### Supabase Clients

Two Supabase client instances exist:

```typescript
// src/lib/supabase.ts
export const supabase = createClient(url, anonKey);           // Anon-level (public)
export const supabaseService = createClient(url, serviceKey);  // Service role (privileged)

// src/utils/supabase/client.ts  - Browser client (cookies)
// src/utils/supabase/server.ts  - Server component client (cookies)
```

- Use `supabaseService` in API routes for privileged operations (bypasses RLS)
- Use `createClient()` from `utils/supabase/` in components for session-aware queries
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client

### Authentication Flow

1. Email/password auth via Supabase (`AuthForm.tsx`)
2. Session cookies managed by `@supabase/ssr`
3. API routes validate via `Authorization: Bearer <token>` header
4. Admin checks: `validateAdminRequest()` in `src/lib/admin-auth.ts` (role + email allowlist, case-insensitive)
5. Shared/anonymous access: Custom HMAC-SHA256 tokens (`src/lib/token.ts`)

### State Management

- **No Redux/Zustand** - uses React Context API only
- `LanguageProvider` for i18n (`src/lib/i18n.tsx`)
- Local `useState`/`useRef` for form state
- `localStorage` for builder progress persistence
- Supabase for server-side draft/plan persistence

### Payment Model

One-time payments (not subscriptions):
- **Free tier**: Watermarked PDF, validation view
- **Professional (EUR 39)**: Clean PDF + Word export
- **Expert (EUR 79-99)**: Expert review + export

Stripe webhook at `/api/webhook/stripe` processes `checkout.session.completed` events with idempotency via `stripe_processed_events` table (unique constraint on event ID).

## Database

### Schema Management

- Base schema in `src/db/schema.sql`
- Feature migrations in `src/db/migration_*.sql` (30+ files)
- Migrations are applied manually via Supabase dashboard or SQL editor
- No automated migration runner (no Prisma/Drizzle)

### Key Tables

| Table | Purpose |
|-------|---------|
| `plans` | Completed HACCP plans (JSONB `full_plan` column) |
| `drafts` | In-progress plans with `plan_data` JSONB |
| `review_requests` | Expert review workflow |
| `user_roles` | Role-based access (admin) |
| `admin_whitelist` | Admin email allowlist |
| `rate_limits` | API rate limiting (3 gens/hour/IP) |
| `access_logs` | Audit trail |
| `stripe_processed_events` | Webhook idempotency |
| `subscribers` | Newsletter subscribers |
| `contact_submissions` | Contact form entries |

### Row-Level Security (RLS)

RLS is enabled on all user-facing tables. Plans and drafts are scoped to `user_id`. Admin operations use the service role client to bypass RLS.

## Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| React components | PascalCase files | `QuestionCard.tsx`, `AuthForm.tsx` |
| Utility files | camelCase | `supabase.ts`, `admin-auth.ts` |
| API routes | kebab-case directories | `generate-plan/`, `create-checkout/` |
| Constants | UPPER_SNAKE_CASE | `HACCP_STANDARDS`, `RATE_LIMIT_COUNT` |
| DB columns | snake_case | `user_id`, `created_at`, `payment_status` |
| DB tables | snake_case plural | `plans`, `drafts`, `access_logs` |
| TypeScript types | PascalCase | `HACCPQuestion`, `AccessTokenPayload` |
| Event handlers | `handle*` prefix | `handleSubmit()`, `handleAnswerChange()` |
| Boolean functions | `is*`/`check*`/`verify*` | `isExportAllowed()`, `verifyAccessToken()` |
| Data fetchers | `get*` | `getPostLoginRedirect()` |

## Error Handling

- API routes: try/catch with structured `{ error: string }` JSON responses and appropriate HTTP status codes
- Stripe webhook: Signature verification + idempotency check before processing
- Rate limiting: Graceful degradation (continues if rate limit check fails)
- Audit logging: Fire-and-forget (never blocks the response, `src/lib/audit.ts`)
- Client-side: `useState` error/success messages, `console.error` for debugging
- Export permission checks return `{ allowed: boolean; reason?: string }` objects

## Security Considerations

When modifying code, maintain these security practices:

- **Ownership checks**: All plan/draft mutations verify `user_id` matches the authenticated user
- **Admin validation**: Use `validateAdminRequest()` for all admin endpoints (checks role + email allowlist)
- **Email normalization**: Always use `toLowerCase()` for email comparisons
- **Token verification**: Use `timingSafeEqual` for HMAC comparisons (constant-time)
- **Input validation**: Validate and sanitize URL redirect targets (no open redirects: `next.startsWith('/') && !next.startsWith('//')`)
- **Service role isolation**: `supabaseService` is server-only; never import in client components
- **Webhook signatures**: Always verify Stripe signatures before processing events
- **Rate limiting**: Enforce generation limits (3/hour/IP) in `/api/generate-plan`
- **RLS**: Never disable RLS on user-facing tables; use service role for admin operations
- **Security headers**: HSTS, X-Frame-Options, X-Content-Type-Options configured in `next.config.ts`
- **CSRF**: Bearer tokens for admin APIs; `SameSite` cookies for session-based routes

## Testing

- **Framework**: Playwright (E2E only)
- **Test files**: `tests/` directory
- **Key test areas**: Admin auth (case sensitivity), builder flow, draft resume
- **No unit test framework** configured (no Jest/Vitest)

## Content Generation

The `scripts/` directory contains 76+ Node.js utility scripts. Key ones:

```bash
node scripts/generate_expert_article.js "Title" [slug]    # Generate single article
node scripts/regenerate_all.js                             # Batch upgrade articles
node scripts/dedupe_articles.js                            # Clean article duplicates
node scripts/generate_sitemap.js                           # Regenerate sitemap.xml
```

Articles are stored in `src/data/articles.ts` (101+ articles, ~1.4MB). They are written by 5 distinct expert personas for E-E-A-T authority signals.

## Key Business Rules

1. **Plan generation** uses a detailed system prompt (~450 lines) focused on EC 852/2004 and UK FSA standards
2. **Risk flags** (`SHELF_LIFE_UNVALIDATED`, `HIGH_RISK_RTE`, `SCOPE_GROUPED`) trigger mandatory confirmation modals
3. **Export gating**: Plans with `block_export === true` or "Major Gaps" assessment cannot be exported
4. **Draft persistence**: Builder progress saves to `localStorage` and syncs to Supabase `drafts` table
5. **Anonymous-to-authenticated handover**: Drafts created anonymously are attached to user account on login via `/api/drafts/attach`
6. **Versioning**: Plan saves create version snapshots in `plan_versions` table with `framework_version` and `question_set_versions`

## Git Workflow

- PR-based workflow with feature branches
- Semantic commit prefixes: `fix()`, `feat()`, `debug()`, `refactor()`
- Deploy via Vercel (auto-deploys on push to main)
- No CI/CD workflows configured (no `.github/workflows/`)
- No pre-commit hooks (no Husky)

## Common Pitfalls

- **Supabase hydration**: Auth session may not be available immediately on page load. Use `onAuthStateChange()` to wait for hydration before making auth decisions (see `AdminGuard.tsx` pattern)
- **PDF rendering**: Uses local TTF font files in `public/fonts/`. The `@react-pdf/renderer` requires Node.js runtime (not Edge)
- **Legacy peer deps**: `.npmrc` has `legacy-peer-deps=true` due to dependency conflicts. Use `npm install --legacy-peer-deps` if adding packages
- **Favicon restoration**: Favicons are git-ignored and rebuilt from base64 at build time. Do not commit favicon PNGs directly
- **Large data file**: `src/data/articles.ts` is ~1.4MB. Avoid reading it in full when possible
- **TypeScript excludes**: `review_hardening/` directory is excluded from compilation
