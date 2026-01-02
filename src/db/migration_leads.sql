-- Create Leads Table for Email Capture
create table if not exists public.leads (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default now(),
    email text not null,
    plan_id uuid references public.plans(id),
    source text default 'builder_result' -- e.g. 'builder_result', 'newsletter'
);

-- RLS: Anyone can insert, only admins can read
alter table public.leads enable row level security;

create policy "Enable insert for all users" 
on public.leads for insert 
with check (true);
