-- Migration for Expert Review Workflow & Admin Audit Logs

-- 1. Update Plans Table for Review Workflow
alter table public.plans 
add column if not exists review_requested boolean default false,
add column if not exists review_status text default null, -- 'pending', 'in_progress', 'completed'
add column if not exists reviewed_at timestamp with time zone,
add column if not exists review_comments text;

-- 2. Create Admin Audit Logs Table
create table if not exists public.admin_audit_logs (
  id uuid default uuid_generate_v4() primary key,
  admin_email text not null,
  plan_id uuid references public.plans(id),
  action text not null, -- 'VIEW_PLAN', 'ADD_COMMENT', 'COMPLETE_REVIEW', 'TOGGLE_PAYMENT'
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Security for Audit Logs (RLS)
alter table public.admin_audit_logs enable row level security;

-- Only admins can insert (via service role in API)
-- Only admins can select (via service role in API)
-- No public access
create policy "No public access to audit logs" 
  on public.admin_audit_logs 
  for all 
  using (false);
