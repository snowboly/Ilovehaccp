-- 1. Add user_id column to plans table
alter table public.plans 
add column user_id uuid references auth.users(id);

-- 2. Update RLS (Row Level Security) Policies
-- First, drop the old "allow all" policies
drop policy if exists "Enable insert for all users" on public.plans;
drop policy if exists "Enable read for all users" on public.plans;

-- 3. Create new secure policies
-- Allow users to view ONLY their own plans
create policy "Users can view own plans" 
on public.plans for select 
using (auth.uid() = user_id);

-- Allow users to insert plans (automatically linking their ID)
create policy "Users can insert own plans" 
on public.plans for insert 
with check (auth.uid() = user_id);

-- Allow users to update their own plans
create policy "Users can update own plans" 
on public.plans for update 
using (auth.uid() = user_id);

-- Allow users to delete their own plans
create policy "Users can delete own plans" 
on public.plans for delete 
using (auth.uid() = user_id);
