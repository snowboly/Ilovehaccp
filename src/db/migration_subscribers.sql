-- Subscribers Table for Newsletter
create table if not exists public.subscribers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null
);

-- Enable RLS
alter table public.subscribers enable row level security;

-- Allow public inserts
create policy "Enable insert for everyone" on public.subscribers for insert with check (true);

-- Allow service role to read
create policy "Enable read for service role" on public.subscribers for select using (true);