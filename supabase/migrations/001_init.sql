-- Rust It Up / RustThisRepo schema
-- For future Supabase connection. GitHub Pages demo uses localStorage mocks.

create extension if not exists "pgcrypto";

-- projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'github',
  owner text not null,
  repo text not null,
  canonical_url text not null,
  default_branch text,
  latest_sha text,
  visibility text default 'public',
  primary_language text,
  category text,
  license_spdx text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner, repo)
);

-- scans
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  requested_by uuid,
  commit_sha text not null,
  status text not null,
  scanner_version text not null,
  started_at timestamptz,
  completed_at timestamptz,
  failure_code text,
  failure_message text,
  artifact_path text,
  created_at timestamptz not null default now(),
  unique (project_id, commit_sha, scanner_version)
);

create index if not exists scans_status_idx on public.scans (status);
create index if not exists scans_created_idx on public.scans (created_at desc);

-- findings
create table if not exists public.findings (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade,
  finding_type text not null,
  key text not null,
  numeric_value numeric,
  text_value text,
  evidence jsonb not null default '{}'::jsonb,
  confidence text not null default 'medium'
);

create index if not exists findings_scan_idx on public.findings (scan_id);

-- estimates
create table if not exists public.estimates (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade unique,
  rust_upside integer not null check (rust_upside between 0 and 100),
  migration_feasibility integer not null check (migration_feasibility between 0 and 100),
  commercial_signal integer not null check (commercial_signal between 0 and 100),
  opportunity_score integer not null check (opportunity_score between 0 and 100),
  recommendation text not null,
  confidence text not null,
  p50_engineer_months numeric not null,
  p90_engineer_months numeric not null,
  cicd_low_days integer not null,
  cicd_high_days integer not null,
  first_slice jsonb not null default '{}'::jsonb,
  value_scenarios jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  benchmark_plan jsonb not null default '[]'::jsonb,
  model_version text not null
);

-- leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references public.scans (id) on delete set null,
  email text not null,
  company text,
  role text,
  production_use boolean,
  monthly_compute_band text,
  primary_pain text,
  request_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_idx on public.leads (created_at desc);

-- project_signals
create table if not exists public.project_signals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  signal_type text not null,
  anonymous_session_id text,
  work_email_domain text,
  created_at timestamptz not null default now()
);

create index if not exists project_signals_project_idx on public.project_signals (project_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- RLS
alter table public.projects enable row level security;
alter table public.scans enable row level security;
alter table public.findings enable row level security;
alter table public.estimates enable row level security;
alter table public.leads enable row level security;
alter table public.project_signals enable row level security;

-- Public read for published project/scan/estimate/findings
create policy "Public read projects"
  on public.projects for select
  using (visibility = 'public' or visibility is null);

create policy "Public read scans"
  on public.scans for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = scans.project_id
        and (p.visibility = 'public' or p.visibility is null)
    )
  );

create policy "Public read findings"
  on public.findings for select
  using (
    exists (
      select 1
      from public.scans s
      join public.projects p on p.id = s.project_id
      where s.id = findings.scan_id
        and (p.visibility = 'public' or p.visibility is null)
    )
  );

create policy "Public read estimates"
  on public.estimates for select
  using (
    exists (
      select 1
      from public.scans s
      join public.projects p on p.id = s.project_id
      where s.id = estimates.scan_id
        and (p.visibility = 'public' or p.visibility is null)
    )
  );

-- Anyone can create a lead (form)
create policy "Anyone insert leads"
  on public.leads for insert
  with check (true);

-- Anyone can insert anonymous signals
create policy "Anyone insert signals"
  on public.project_signals for insert
  with check (true);

-- Service role / authenticated admin policies would be added with auth.users roles.
-- Writes to projects/scans/findings/estimates are intended for service role (edge + worker).
