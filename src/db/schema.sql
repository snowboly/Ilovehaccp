-- Enable UUID extension for unique IDs
create extension if not exists "uuid-ossp";

-- 1. Create Plans Table
create table public.plans (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Business Details
  business_name text,
  business_type text,
  
  -- Product Details
  product_name text,
  product_description text,
  storage_type text,
  intended_use text,
  
  -- The Plan Data (JSON)
  process_steps jsonb, 
  hazard_analysis jsonb,
  
  -- Meta
  status text default 'draft'
);

-- 2. Create Review Requests Table
create table public.review_requests (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  plan_id uuid references public.plans(id),
  contact_email text,
  
  status text default 'pending' -- pending, in_review, completed
);

-- 3. Set Permissions (Row Level Security)
-- For this prototype, we allow public inserts so users don't need to log in to start.
alter table public.plans enable row level security;
alter table public.review_requests enable row level security;

-- Policy: Allow anyone to create a plan
create policy "Enable insert for all users" on public.plans for insert with check (true);
create policy "Enable read for all users" on public.plans for select using (true);

-- Policy: Allow anyone to request a review
create policy "Enable insert for all users" on public.review_requests for insert with check (true);
