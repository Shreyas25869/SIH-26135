-- Rozgaar Mitra — Training Provider Portal
-- Run this in the Supabase SQL editor (or `supabase db push` if you use the CLI).
-- These tables are the shared models referenced in the brief: Course, Batch,
-- Trainee, Assessment (skill scores), Certification, Outcome — the same
-- `trainees` table Person 1's (trainee-facing) app should read from.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Training providers (shared with the provider-facing app)
-- ---------------------------------------------------------------------------
create table if not exists training_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  organization_name text not null,
  provider_type text,
  email text,
  phone text,
  address text,
  district text,
  city text,
  verification_status text default 'Pending',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references training_providers(id) on delete cascade,
  course_name text not null,
  sector text,
  description text,
  duration_hours integer,
  level text,
  certification_available boolean default false,
  status text default 'Active' check (status in ('Active', 'Archived')),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Batches
-- ---------------------------------------------------------------------------
create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  batch_name text not null,
  start_date date,
  end_date date,
  capacity int default 0,
  location text,
  status text default 'Upcoming' check (status in ('Upcoming', 'Ongoing', 'Completed')),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Trainees — shared with the trainee-facing side of the product
-- ---------------------------------------------------------------------------
create table if not exists trainees (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references batches(id) on delete set null,
  name text not null,
  phone text,
  district text,
  status text default 'Ongoing' check (status in ('Ongoing', 'Completed', 'Dropped Out')),
  attendance_pct numeric default 0,
  progress_pct numeric default 0,
  dropout_reason text,
  dropout_notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Skill assessments — one row per attempt, history is never overwritten
-- ---------------------------------------------------------------------------
create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid references trainees(id) on delete cascade,
  skill text not null,
  score numeric,
  max_score numeric default 100,
  assessor text,
  date date default current_date,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Certifications — one per trainee
-- ---------------------------------------------------------------------------
create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid unique references trainees(id) on delete cascade,
  name text,
  level text,
  issue_date date default current_date,
  reference_id text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Employment outcomes — one per trainee, updated as follow-ups happen
-- ---------------------------------------------------------------------------
create table if not exists outcomes (
  id uuid primary key default gen_random_uuid(),
  trainee_id uuid unique references trainees(id) on delete cascade,
  placed boolean default false,
  employer text,
  role text,
  salary numeric,
  follow_up_days int default 90,
  follow_up_status text default 'Pending' check (follow_up_status in ('Pending', 'Completed')),
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_courses_provider on courses(provider_id);
create index if not exists idx_batches_course on batches(course_id);
create index if not exists idx_trainees_batch on trainees(batch_id);
create index if not exists idx_assessments_trainee on assessments(trainee_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Demo-permissive policies below (no login page, so the anon key drives all
-- reads/writes). Before going further than a hackathon demo, replace these
-- with policies scoped to an authenticated provider, e.g. matching
-- auth.uid() against a provider_id on each row.
-- ---------------------------------------------------------------------------
alter table training_providers enable row level security;
alter table courses enable row level security;
alter table batches enable row level security;
alter table trainees enable row level security;
alter table assessments enable row level security;
alter table certifications enable row level security;
alter table outcomes enable row level security;

create policy "public read training providers" on training_providers for select using (true);
create policy "public write training providers" on training_providers for all using (true) with check (true);

create policy "public read courses" on courses for select using (true);
create policy "public write courses" on courses for all using (true) with check (true);

create policy "public read batches" on batches for select using (true);
create policy "public write batches" on batches for all using (true) with check (true);

create policy "public read trainees" on trainees for select using (true);
create policy "public write trainees" on trainees for all using (true) with check (true);

create policy "public read assessments" on assessments for select using (true);
create policy "public write assessments" on assessments for all using (true) with check (true);

create policy "public read certifications" on certifications for select using (true);
create policy "public write certifications" on certifications for all using (true) with check (true);

create policy "public read outcomes" on outcomes for select using (true);
create policy "public write outcomes" on outcomes for all using (true) with check (true);
