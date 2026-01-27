// ADMIN_EMAILS was removed in favor of role-based access via 'profiles' table.
// See src/lib/admin-auth.ts and src/db/migration_role_based_access.sql
export const CONSTANTS_VERSION = 'v2';

/**
 * Single source of truth for plan tier pricing & features.
 * Used by: create-checkout route, dashboard display, landing page, builder summary.
 *
 * UI labels live here so every surface stays consistent.
 */
export const PLAN_TIERS = {
  professional: {
    amount: 3900,
    currency: 'eur',
    label: 'Document Export',
    shortLabel: 'Document Export',
    upgradeLabel: 'Export Draft',
    desc: 'Clean PDF + Word export (no watermark).',
    features: { export: true, review: false },
  },
  expert: {
    amount: 9900,
    currency: 'eur',
    label: 'Plan Review & Feedback',
    shortLabel: 'Plan Review',
    upgradeLabel: 'Request Review',
    desc: 'Human review & written feedback + all exports included.',
    features: { export: true, review: true },
  },
} as const;

export type TierKey = keyof typeof PLAN_TIERS;

/** Price strings derived from PLAN_TIERS (avoids magic numbers elsewhere). */
export const TIER_PRICE = {
  professional: `€${PLAN_TIERS.professional.amount / 100}`,
  expert: `€${PLAN_TIERS.expert.amount / 100}`,
} as const;