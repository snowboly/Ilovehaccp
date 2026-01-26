-- 1. Add feature flags (default to false for safety)
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS export_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS review_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS checkout_session_id TEXT;

-- 2. Backfill existing paid plans (Legacy Support)
-- If status was 'paid', they have export access.
UPDATE public.plans 
SET export_paid = TRUE 
WHERE payment_status = 'paid';

-- If tier was 'expert' and paid, they have review access.
UPDATE public.plans 
SET review_paid = TRUE 
WHERE payment_status = 'paid' AND tier = 'expert';

-- 3. Optimization Index for Dashboard
CREATE INDEX IF NOT EXISTS idx_plans_user_status 
ON public.plans (user_id, export_paid, review_paid);

-- 4. Strict Webhook Idempotency
CREATE TABLE IF NOT EXISTS public.stripe_processed_events (
    event_id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for processed events (admin only)
ALTER TABLE public.stripe_processed_events ENABLE ROW LEVEL SECURITY;
-- No public access policies needed as this is backend-only