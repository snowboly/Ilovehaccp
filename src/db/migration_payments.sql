-- Add payment tracking to plans
alter table public.plans 
add column if not exists payment_status text default 'pending'; -- pending, paid

-- Allow public to select their own if paid or if they have the ID (though RLS restricts this now)
-- Let's stick to auth-based or session-based retrieval for safety.
