-- Fix RLS for Plans and Leads to allow public submission
-- Plans: Allow anonymous inserts
create policy "Enable insert for everyone" on public.plans for insert with check (true);

-- Leads: Ensure public inserts are allowed (dropping existing to be safe/idempotent if name matches)
drop policy if exists "Enable insert for everyone" on public.leads;
create policy "Enable insert for everyone" on public.leads for insert with check (true);
