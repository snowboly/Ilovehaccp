-- Migration for Generic Access/Audit Logs
-- Supersedes specific admin_audit_logs for broader compliance

create table if not exists public.access_logs (
  id uuid default uuid_generate_v4() primary key,
  actor_email text not null,
  actor_role text default 'admin',
  entity_type text not null, -- 'plan', 'user', 'system'
  entity_id text, -- nullable if system-wide
  action text not null, -- 'VIEW', 'EDIT', 'REVIEW_COMPLETE'
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Security: Append-only, Admin-only read
alter table public.access_logs enable row level security;

create policy "No public access" 
  on public.access_logs 
  for all 
  using (false);
