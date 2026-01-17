-- Secure Plans Table (v2)
-- Fixes issue where users could see all plans but not delete them.
-- Enforces strict ownership for all operations.

-- 1. Drop loose policies
drop policy if exists "Allow public insert" on public.plans;
drop policy if exists "Allow public select" on public.plans;
drop policy if exists "Allow public update" on public.plans;
drop policy if exists "Enable insert for everyone" on public.plans;
drop policy if exists "Enable insert for all users" on public.plans;
drop policy if exists "Enable read for all users" on public.plans;

-- 2. Create Strict Policies
-- SELECT: Users can only see their own plans
create policy "Users can view own plans" 
on public.plans for select 
using (auth.uid() = user_id);

-- INSERT: Users can only insert plans assigned to themselves
create policy "Users can insert own plans" 
on public.plans for insert 
with check (auth.uid() = user_id);

-- UPDATE: Users can only update their own plans
create policy "Users can update own plans" 
on public.plans for update 
using (auth.uid() = user_id);

-- DELETE: Users can only delete their own plans
create policy "Users can delete own plans" 
on public.plans for delete 
using (auth.uid() = user_id);
