-- Migration to support newsletter subscribers
create table public.subscribers (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  status text default 'active'
);

-- Row Level Security
alter table public.subscribers enable row level security;
create policy "Enable insert for everyone" on public.subscribers for insert with check (true);
create policy "Enable read for authenticated admins" on public.subscribers for select using (auth.role() = 'authenticated');
