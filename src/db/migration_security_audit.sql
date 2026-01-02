-- 1. Secure Review Requests
-- Only owners or admins should see them. (Assuming guest can insert but not read back without auth)
drop policy if exists "Enable insert for all users" on public.review_requests;

create policy "Enable insert for anyone" 
on public.review_requests for insert 
with check (true);

create policy "Enable select for owners" 
on public.review_requests for select 
using (auth.email() = contact_email);

-- 2. Create Rate Limiting Table
create table if not exists public.rate_limits (
    identifier text primary key, -- IP address or User ID
    last_request timestamp with time zone default now(),
    request_count int default 1
);

-- 3. Update Plans Policies for Guest Support
drop policy if exists "Users can insert own plans" on public.plans;
create policy "Allow anyone to insert plans" on public.plans for insert with check (true);

drop policy if exists "Users can view own plans" on public.plans;
create policy "Users can view own plans" on public.plans for select using (auth.uid() = user_id);

