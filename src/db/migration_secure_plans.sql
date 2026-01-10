-- SECURE RLS Policy for 'plans' table
-- Now that we use Server-Side saving (/api/save-plan), we can DISABLE public writes.

-- 1. Drop existing permissive policies
drop policy if exists "Enable insert for everyone" on public.plans;
drop policy if exists "Allow public insert" on public.plans;
drop policy if exists "Allow public update" on public.plans;

-- 2. Allow users to SEE their own plans (Auth only)
-- We'll keep the public select for now so anonymous users can view their plan via link (uuid is the "password")
-- But we can restrict it slightly if we wanted. For now, public read by ID is acceptable for this MVP.
-- Existing: "Allow public select" on public.plans for select using (true); -> Keep this.

-- 3. DISABLE all direct inserts/updates from the client.
-- No new policies needed. By default, RLS blocks everything not explicitly allowed.
-- Since we removed the INSERT/UPDATE policies, clients get 403 Forbidden on direct DB writes.
-- Our /api/save-plan uses the SERVICE_ROLE_KEY, which bypasses RLS, so it still works.

-- Summary:
-- Client: Can READ (if they have ID). CANNOT WRITE.
-- Server (API): Can READ/WRITE everything.
