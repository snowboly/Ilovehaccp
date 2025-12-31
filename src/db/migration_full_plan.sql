-- Migration to support full HACCP plan storage
alter table public.plans add column if not exists full_plan jsonb;
alter table public.plans add column if not exists user_id uuid references auth.users(id);

-- Update RLS policies to be more secure (owner only)
drop policy if exists "Enable read for all users" on public.plans;
create policy "Enable read for owners" on public.plans for select using (auth.uid() = user_id);
create policy "Enable update for owners" on public.plans for update using (auth.uid() = user_id);
create policy "Enable delete for owners" on public.plans for delete using (auth.uid() = user_id);
