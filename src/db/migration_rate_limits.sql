-- Create Rate Limits Table for AI Generation
create table if not exists public.rate_limits (
  id uuid default uuid_generate_v4() primary key,
  identifier text not null unique, -- IP address or User ID
  last_request timestamp with time zone not null,
  request_count int default 1
);

-- Enable RLS
alter table public.rate_limits enable row level security;

-- Policies
-- We don't want public access to this table. Only the service role (backend API) should access it.
-- However, for RLS to be "active" but private, we can just enable it and add no policies for 'anon' or 'authenticated'.
-- The Service Role key bypasses RLS automatically.
