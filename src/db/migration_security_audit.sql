-- Security Hardening Migration

-- 1. Add user_id to plans table if it doesn't exist
do $$
begin
  if not exists (select from information_schema.columns where table_name = 'plans' and column_name = 'user_id') then
    alter table public.plans add column user_id uuid references auth.users(id);
  end if;
end $$;

-- 2. Update Row Level Security (RLS) for plans
alter table public.plans enable row level security;

-- Drop permissive policies
drop policy if exists "Enable insert for all users" on public.plans;
drop policy if exists "Enable read for all users" on public.plans;

-- Create secure policies
create policy "Users can insert their own plans" 
  on public.plans for insert 
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can see their own plans" 
  on public.plans for select 
  using (auth.uid() = user_id);

create policy "Users can update their own plans" 
  on public.plans for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own plans" 
  on public.plans for delete 
  using (auth.uid() = user_id);

-- 3. Security for review_requests
alter table public.review_requests enable row level security;

drop policy if exists "Enable insert for all users" on public.review_requests;

create policy "Users can insert review requests for their plans" 
  on public.review_requests for insert 
  with check (
    exists (
      select 1 from public.plans 
      where id = plan_id and user_id = auth.uid()
    )
  );

create policy "Users can see their own review requests"
  on public.review_requests for select
  using (
    exists (
      select 1 from public.plans 
      where id = plan_id and user_id = auth.uid()
    )
  );