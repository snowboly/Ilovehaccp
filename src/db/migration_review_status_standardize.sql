-- Migration: Standardize review_status values
-- This migration ensures consistent review_status values across all plans.
-- Allowed values: 'in_progress', 'concluded' (legacy: 'pending', 'reviewed', 'completed')

-- 1. Set review_status to 'in_progress' for plans where review was requested but status is null
UPDATE public.plans
SET review_status = 'in_progress'
WHERE review_requested = true
  AND review_status IS NULL;

-- 2. Standardize legacy 'pending' status to 'in_progress'
UPDATE public.plans
SET review_status = 'in_progress'
WHERE review_status = 'pending';

-- 3. Standardize legacy 'reviewed' and 'completed' status to 'concluded'
UPDATE public.plans
SET review_status = 'concluded'
WHERE review_status IN ('reviewed', 'completed');

-- 4. Add a comment explaining the allowed values
COMMENT ON COLUMN public.plans.review_status IS 'Review status: in_progress (under review), concluded (review finished). NULL means not requested.';
