-- Fix RLS Policy for 'plans' table to allow anonymous inserts
-- It seems previous policies might be conflicting or not applied correctly.

-- 1. Drop existing policies to ensure a clean slate
drop policy if exists "Enable insert for everyone" on public.plans;
drop policy if exists "Enable insert for all users" on public.plans;
drop policy if exists "Enable read for all users" on public.plans;
drop policy if exists "Users can update their own plans" on public.plans;

-- 2. Create permissive INSERT policy (Required for anonymous generation)
create policy "Allow public insert" on public.plans for insert with check (true);

-- 3. Create SELECT policy (Allow reading if you own it or it's public - for now, allowing access to created row)
-- Note: 'using (true)' allows anyone to read anything, which is insecure for production but needed if we don't track anon sessions.
-- Better approach: Return the inserted row immediately and store ID in local storage (which we do).
create policy "Allow public select" on public.plans for select using (true);

-- 4. Create UPDATE policy (Allow updates if you know the ID - loose security for MVP)
create policy "Allow public update" on public.plans for update using (true);
