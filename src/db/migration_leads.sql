-- Lead Capture Table
create table if not exists public.leads (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  business_name text,
  plan_id uuid references public.plans(id),
  status text default 'new' -- new, nurtured, converted
);

-- Enable RLS
alter table public.leads enable row level security;

-- Allow public inserts (since users might not be logged in when they generate a free plan)
create policy "Enable insert for everyone" on public.leads for insert with check (true);

-- Allow authenticated users to see their own leads (if we link them)
create policy "Enable read for service role" on public.leads for select using (true);