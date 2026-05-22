-- LendWise AI — Supabase / PostgreSQL schema
-- Run in Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- loan_applications (includes eligibility results)
-- ---------------------------------------------------------------------------
create table if not exists public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  income numeric(12, 2) not null check (income > 0),
  credit_score integer not null check (credit_score between 300 and 900),
  employment_type text not null check (
    employment_type in ('salaried', 'self_employed', 'contract', 'unemployed')
  ),
  approval_status text check (approval_status in ('approved', 'pending', 'rejected')),
  risk_score integer check (risk_score between 0 and 100),
  reason text,
  uploaded_filename text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_loan_applications_user_id
  on public.loan_applications (user_id);

create index if not exists idx_loan_applications_created_at
  on public.loan_applications (created_at desc);

-- ---------------------------------------------------------------------------
-- extracted_documents
-- ---------------------------------------------------------------------------
create table if not exists public.extracted_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  loan_application_id uuid references public.loan_applications (id) on delete set null,
  source_filename text,
  saved_filename text,
  name text,
  dob text,
  pan text,
  aadhaar text,
  address text,
  source text not null default 'gemini',
  created_at timestamptz not null default now()
);

create index if not exists idx_extracted_documents_user_id
  on public.extracted_documents (user_id);

create index if not exists idx_extracted_documents_loan_application_id
  on public.extracted_documents (loan_application_id);

-- ---------------------------------------------------------------------------
-- chat_history
-- ---------------------------------------------------------------------------
create table if not exists public.chat_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  session_id uuid not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_history_session_id
  on public.chat_history (session_id, created_at);

create index if not exists idx_chat_history_user_id
  on public.chat_history (user_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_loan_applications_updated_at on public.loan_applications;
create trigger trg_loan_applications_updated_at
  before update on public.loan_applications
  for each row execute function public.set_updated_at();
