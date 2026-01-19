-- 1. Create Profiles Table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view their own profile" 
on public.profiles for select 
using (auth.uid() = id);

-- Policy: Service Role can do anything (Implicit, but good to remember)

-- 3. Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- 4. Trigger for new signups
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill existing users (SAFE: insert on conflict do nothing)
-- This ensures existing users get a profile entry
insert into public.profiles (id, email, role)
select id, email, 'user' from auth.users
on conflict (id) do nothing;

-- 6. Grant Admin Access to specific email (Migration Step)
-- Uses the previously hardcoded email to bootstrap the first admin
update public.profiles 
set role = 'admin' 
where email = 'joao@ilovehaccp.com';
