// ADMIN_EMAILS was removed in favor of role-based access via 'profiles' table.
// See src/lib/admin-auth.ts and src/db/migration_role_based_access.sql
export const CONSTANTS_VERSION = 'v2';

/**
 * Single source of truth for plan tier pricing & features.
 * Used by: create-checkout route, dashboard display, landing page.
 */
export const PLAN_TIERS = {
  professional: {
    amount: 3900,
    currency: 'eur',
    label: 'Export Unlock',
    desc: 'Includes Word & PDF export. Self-service document only.',
    features: { export: true, review: false },
  },
  expert: {
    amount: 9900,
    currency: 'eur',
    label: 'Expert Review',
    desc: 'Professional review & feedback + Export Unlock.',
    features: { export: true, review: true },
  },
} as const;

export type TierKey = keyof typeof PLAN_TIERS;