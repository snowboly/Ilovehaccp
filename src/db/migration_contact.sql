-- Create Contact Messages Table
create table if not exists public.contact_messages (
    id uuid default uuid_generate_v4() primary key,
    created_at timestamp with time zone default now(),
    name text not null,
    email text not null,
    subject text,
    message text not null,
    status text default 'new' -- new, read, replied
);

-- RLS: Anyone can insert, only admins can read
alter table public.contact_messages enable row level security;

create policy "Enable insert for all users" 
on public.contact_messages for insert 
with check (true);
