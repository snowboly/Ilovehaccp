create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  reviewer_id uuid null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_plan_id_idx on reviews(plan_id);
