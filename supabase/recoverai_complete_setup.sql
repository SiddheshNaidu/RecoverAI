-- =============================================================================
-- RecoverAI — Supabase: schema + indexes + view + RLS
-- Run in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- =============================================================================
-- After this, add to your frontend .env:
--   VITE_SUPABASE_URL=https://<project>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<anon key from Project Settings → API>
--
-- Optional (recommended before production): set staff users in Auth with
--   Dashboard → Authentication → Users → user → Raw App Meta Data:
--   { "role": "staff" }
-- Patient rows should use id = the same uuid as auth.users.id when using
-- the patient mobile app with Supabase Auth.
-- =============================================================================

-- Extensions (uuid generation; usually already enabled on Supabase)
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  procedure text,
  discharge_date date,
  recovery_total_days int,
  recovery_current_day int,
  risk_level text check (risk_level in ('LOW', 'MODERATE', 'CRITICAL')),
  phase text,
  phase_label text,
  hospital_name text,
  hospital_phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.caregivers (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  name text,
  phone text,
  relation text
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  name text,
  dose text
);

create table if not exists public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete cascade,
  log_date date not null,
  status text not null check (status in ('taken', 'missed', 'upcoming'))
);

create table if not exists public.recovery_trajectory (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  day_number int not null,
  expected_pain numeric,
  actual_pain numeric
);

create table if not exists public.protocol_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  task_name text,
  time_slot text,
  icon_type text,
  task_date date
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  appt_date date not null,
  appt_time text,
  reason text,
  doctor_name text
);

create table if not exists public.caregiver_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  alert_date date,
  message text
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  entry_date date,
  ai_summary text,
  raw_input text
);

-- -----------------------------------------------------------------------------
-- Indexes (performance + FK lookups under RLS)
-- -----------------------------------------------------------------------------

create index if not exists idx_caregivers_patient_id on public.caregivers (patient_id);
create index if not exists idx_medications_patient_id on public.medications (patient_id);
create index if not exists idx_medication_logs_patient_id on public.medication_logs (patient_id);
create index if not exists idx_medication_logs_date on public.medication_logs (log_date);
create index if not exists idx_recovery_trajectory_patient_id on public.recovery_trajectory (patient_id);
create index if not exists idx_protocol_tasks_patient_date on public.protocol_tasks (patient_id, task_date);
create index if not exists idx_appointments_date on public.appointments (appt_date);
create index if not exists idx_caregiver_alerts_patient_id on public.caregiver_alerts (patient_id);
create index if not exists idx_journal_entries_patient_id on public.journal_entries (patient_id);

-- -----------------------------------------------------------------------------
-- View: last 7 calendar days of medication logs (used by frontend)
-- security_invoker = underlying table RLS applies to the current user
-- -----------------------------------------------------------------------------

drop view if exists public.medication_adherence_7day;

create view public.medication_adherence_7day
with (security_invoker = true) as
select
  ml.patient_id,
  ml.medication_id,
  m.name as medication_name,
  m.dose,
  ml.log_date,
  ml.status
from public.medication_logs ml
join public.medications m on m.id = ml.medication_id
where ml.log_date >= (current_date - interval '6 days')
  and ml.log_date <= current_date;

-- Grant read on view to API roles (Supabase defaults often cover this; safe to repeat)
grant select on public.medication_adherence_7day to authenticated, anon;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.patients enable row level security;
alter table public.caregivers enable row level security;
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.recovery_trajectory enable row level security;
alter table public.protocol_tasks enable row level security;
alter table public.appointments enable row level security;
alter table public.caregiver_alerts enable row level security;
alter table public.journal_entries enable row level security;

-- Helper: staff JWT (set app_metadata.role = "staff" on the user in Supabase Auth)
-- coalesce(..., '') avoids null issues

-- --- patients ---
drop policy if exists "patients_select_own" on public.patients;
drop policy if exists "patients_insert_own" on public.patients;
drop policy if exists "patients_update_own" on public.patients;
drop policy if exists "patients_staff_all" on public.patients;

create policy "patients_select_own"
  on public.patients for select
  using (auth.uid() = id);

create policy "patients_insert_own"
  on public.patients for insert
  with check (auth.uid() = id);

create policy "patients_update_own"
  on public.patients for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "patients_staff_all"
  on public.patients for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- caregivers ---
drop policy if exists "caregivers_patient_select" on public.caregivers;
drop policy if exists "caregivers_staff_all" on public.caregivers;

create policy "caregivers_patient_select"
  on public.caregivers for select
  using (patient_id = auth.uid());

create policy "caregivers_staff_all"
  on public.caregivers for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- medications ---
drop policy if exists "medications_patient_select" on public.medications;
drop policy if exists "medications_staff_all" on public.medications;

create policy "medications_patient_select"
  on public.medications for select
  using (patient_id = auth.uid());

create policy "medications_staff_all"
  on public.medications for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- medication_logs ---
drop policy if exists "medication_logs_patient_select" on public.medication_logs;
drop policy if exists "medication_logs_patient_insert" on public.medication_logs;
drop policy if exists "medication_logs_staff_all" on public.medication_logs;

create policy "medication_logs_patient_select"
  on public.medication_logs for select
  using (patient_id = auth.uid());

create policy "medication_logs_patient_insert"
  on public.medication_logs for insert
  with check (patient_id = auth.uid());

create policy "medication_logs_staff_all"
  on public.medication_logs for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- recovery_trajectory ---
drop policy if exists "recovery_trajectory_patient_select" on public.recovery_trajectory;
drop policy if exists "recovery_trajectory_staff_all" on public.recovery_trajectory;

create policy "recovery_trajectory_patient_select"
  on public.recovery_trajectory for select
  using (patient_id = auth.uid());

create policy "recovery_trajectory_staff_all"
  on public.recovery_trajectory for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- protocol_tasks ---
drop policy if exists "protocol_tasks_patient_select" on public.protocol_tasks;
drop policy if exists "protocol_tasks_staff_all" on public.protocol_tasks;

create policy "protocol_tasks_patient_select"
  on public.protocol_tasks for select
  using (patient_id = auth.uid());

create policy "protocol_tasks_staff_all"
  on public.protocol_tasks for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- appointments ---
drop policy if exists "appointments_patient_select" on public.appointments;
drop policy if exists "appointments_staff_all" on public.appointments;

create policy "appointments_patient_select"
  on public.appointments for select
  using (patient_id = auth.uid());

create policy "appointments_staff_all"
  on public.appointments for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- caregiver_alerts ---
drop policy if exists "caregiver_alerts_patient_select" on public.caregiver_alerts;
drop policy if exists "caregiver_alerts_staff_all" on public.caregiver_alerts;

create policy "caregiver_alerts_patient_select"
  on public.caregiver_alerts for select
  using (patient_id = auth.uid());

create policy "caregiver_alerts_staff_all"
  on public.caregiver_alerts for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- --- journal_entries ---
drop policy if exists "journal_entries_patient_select" on public.journal_entries;
drop policy if exists "journal_entries_patient_insert" on public.journal_entries;
drop policy if exists "journal_entries_staff_all" on public.journal_entries;

create policy "journal_entries_patient_select"
  on public.journal_entries for select
  using (patient_id = auth.uid());

create policy "journal_entries_patient_insert"
  on public.journal_entries for insert
  with check (patient_id = auth.uid());

create policy "journal_entries_staff_all"
  on public.journal_entries for all
  using (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  )
  with check (
    auth.role() = 'authenticated'
    and coalesce((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'staff'
  );

-- -----------------------------------------------------------------------------
-- OPTIONAL — Local / demo only (anon key can read/write everything)
-- ⚠️  DO NOT run in production. Remove these policies before going live.
-- Uncomment the block below if the frontend has no Auth/JWT staff role yet.
-- -----------------------------------------------------------------------------

/*
drop policy if exists "dev_anon_all_patients" on public.patients;
drop policy if exists "dev_anon_all_caregivers" on public.caregivers;
drop policy if exists "dev_anon_all_medications" on public.medications;
drop policy if exists "dev_anon_all_medication_logs" on public.medication_logs;
drop policy if exists "dev_anon_all_recovery_trajectory" on public.recovery_trajectory;
drop policy if exists "dev_anon_all_protocol_tasks" on public.protocol_tasks;
drop policy if exists "dev_anon_all_appointments" on public.appointments;
drop policy if exists "dev_anon_all_caregiver_alerts" on public.caregiver_alerts;
drop policy if exists "dev_anon_all_journal_entries" on public.journal_entries;

create policy "dev_anon_all_patients" on public.patients for all to public using (true) with check (true);
create policy "dev_anon_all_caregivers" on public.caregivers for all to public using (true) with check (true);
create policy "dev_anon_all_medications" on public.medications for all to public using (true) with check (true);
create policy "dev_anon_all_medication_logs" on public.medication_logs for all to public using (true) with check (true);
create policy "dev_anon_all_recovery_trajectory" on public.recovery_trajectory for all to public using (true) with check (true);
create policy "dev_anon_all_protocol_tasks" on public.protocol_tasks for all to public using (true) with check (true);
create policy "dev_anon_all_appointments" on public.appointments for all to public using (true) with check (true);
create policy "dev_anon_all_caregiver_alerts" on public.caregiver_alerts for all to public using (true) with check (true);
create policy "dev_anon_all_journal_entries" on public.journal_entries for all to public using (true) with check (true);
*/

-- =============================================================================
-- Done. Verify: Table Editor should list all tables; run a test select as anon
-- only after enabling OPTIONAL block, or sign in as staff/patient with JWT.
-- =============================================================================
