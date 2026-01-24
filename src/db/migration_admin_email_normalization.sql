-- 1. Remove duplicates (keeping the one with the smallest internal ID)
-- Uses ctid as a robust way to identify rows without assuming a PK, though usually there is an ID.
DELETE FROM public.admin_whitelist
WHERE ctid NOT IN (
  SELECT min(ctid)
  FROM public.admin_whitelist
  GROUP BY lower(email)
);

-- 2. Normalize existing emails to lowercase
UPDATE public.admin_whitelist
SET email = lower(email);

-- 3. Enforce Uniqueness and Lowercase on future inserts
-- Unique Index on the email column (now lowercased)
CREATE UNIQUE INDEX IF NOT EXISTS admin_whitelist_email_unique_idx ON public.admin_whitelist (email);

-- Optional: Constraint to ensure lowercase (if supported, or just rely on app logic + unique index)
-- ALTER TABLE public.admin_whitelist ADD CONSTRAINT email_check CHECK (email = lower(email));
