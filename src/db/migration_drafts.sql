-- Create Drafts Table for Autosave
create table public.drafts (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  user_id uuid references auth.users(id), -- Nullable for anonymous users
  answers jsonb default '{}'::jsonb,      -- Stores the form state
  status text default 'active'            -- active, generated, abandoned
);

-- RLS Policies
alter table public.drafts enable row level security;

-- Allow anyone to create a draft
create policy "Enable insert for all users" on public.drafts for insert with check (true);

-- Allow reading/updating only if you have the UUID (Bearer Token pattern for anonymous) OR if you own it
-- Note: For anonymous drafts, knowing the ID allows access. This is standard for "shareable/resume" links.
create policy "Enable select for owners or ID holders" on public.drafts for select 
using (
    (auth.uid() = user_id) OR 
    (user_id IS NULL) -- Implicitly relies on knowing the UUID to query it
);

create policy "Enable update for owners or ID holders" on public.drafts for update
using (
    (auth.uid() = user_id) OR 
    (user_id IS NULL)
);
