-- Add tier column to plans
alter table public.plans add column if not exists tier text;
