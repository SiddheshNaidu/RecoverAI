-- RecoverAI — run in Supabase SQL Editor (see backend/remove-hardcoded-data.md)
-- Step 1 + Step 9: schema, view, RLS

-- Patients
create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  procedure text,
  discharge_date date,
  recovery_total_days int,
  recovery_current_day int,
  risk_level text check (risk_level in ('LOW','MODERATE','CRITICAL')),
  phase text,
  phase_label text,
  hospital_name text,
  hospital_phone text,
  created_at timestamptz default now()
);

-- Caregivers
create table if not exists caregivers (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  name text,
  phone text,
  relation text
);

-- Medications
create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  name text,
  dose text
);

-- Medication logs
create table if not exists medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id) on delete cascade,
  patient_id uuid references patients(id) on delete cascade,
  log_date date,
  status text check (status in ('taken','missed','upcoming'))
);

-- Recovery trajectory
create table if not exists recovery_trajectory (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  day_number int,
  expected_pain numeric,
  actual_pain numeric
);

-- Protocol tasks
create table if not exists protocol_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  task_name text,
  time_slot text,
  icon_type text,
  task_date date
);

-- Appointments
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  appt_date date,
  appt_time text,
  reason text,
  doctor_name text
);

-- Caregiver alerts
create table if not exists caregiver_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  alert_date date,
  message text
);

-- Journal entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  entry_date date,
  ai_summary text,
  raw_input text
);

-- Flat rows for 7-day adherence UI (last 7 calendar days including today)
create or replace view medication_adherence_7day as
select
  ml.patient_id,
  ml.medication_id,
  m.name as medication_name,
  m.dose,
  ml.log_date,
  ml.status
from medication_logs ml
join medications m on m.id = ml.medication_id
where ml.log_date >= (current_date - interval '6 days')
  and ml.log_date <= current_date;

-- --- Row Level Security (adjust JWT claims for staff in production) ---
alter table patients enable row level security;
alter table caregivers enable row level security;
alter table medications enable row level security;
alter table medication_logs enable row level security;
alter table recovery_trajectory enable row level security;
alter table protocol_tasks enable row level security;
alter table appointments enable row level security;
alter table caregiver_alerts enable row level security;
alter table journal_entries enable row level security;

-- Patient reads own row (requires patients.id = auth.users.id)
drop policy if exists "patient_self" on patients;
create policy "patient_self" on patients
  for select using (auth.uid() = id);

-- Authenticated users with staff role in JWT (set via Supabase Auth hooks / app_metadata)
drop policy if exists "staff_patients_all" on patients;
create policy "staff_patients_all" on patients
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

-- Repeat pattern for related tables: staff all; patient own patient_id
drop policy if exists "patient_caregivers" on caregivers;
create policy "patient_caregivers" on caregivers
  for select using (
    exists (select 1 from patients p where p.id = caregivers.patient_id and p.id = auth.uid())
  );

drop policy if exists "staff_caregivers_all" on caregivers;
create policy "staff_caregivers_all" on caregivers
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

-- Simplified policies for other tables: mirror staff + patient ownership
drop policy if exists "patient_meds" on medications;
create policy "patient_meds" on medications
  for select using (patient_id = auth.uid());

drop policy if exists "staff_meds_all" on medications;
create policy "staff_meds_all" on medications
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

drop policy if exists "patient_med_logs" on medication_logs;
create policy "patient_med_logs" on medication_logs
  for select using (patient_id = auth.uid());

drop policy if exists "staff_med_logs_all" on medication_logs;
create policy "staff_med_logs_all" on medication_logs
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

drop policy if exists "patient_traj" on recovery_trajectory;
create policy "patient_traj" on recovery_trajectory
  for select using (patient_id = auth.uid());

drop policy if exists "staff_traj_all" on recovery_trajectory;
create policy "staff_traj_all" on recovery_trajectory
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

drop policy if exists "patient_tasks" on protocol_tasks;
create policy "patient_tasks" on protocol_tasks
  for select using (patient_id = auth.uid());

drop policy if exists "staff_tasks_all" on protocol_tasks;
create policy "staff_tasks_all" on protocol_tasks
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

drop policy if exists "patient_appts" on appointments;
create policy "patient_appts" on appointments
  for select using (patient_id = auth.uid());

drop policy if exists "staff_appts_all" on appointments;
create policy "staff_appts_all" on appointments
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

drop policy if exists "patient_alerts" on caregiver_alerts;
create policy "patient_alerts" on caregiver_alerts
  for select using (patient_id = auth.uid());

drop policy if exists "staff_alerts_all" on caregiver_alerts;
create policy "staff_alerts_all" on caregiver_alerts
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );

drop policy if exists "patient_journal" on journal_entries;
create policy "patient_journal" on journal_entries
  for select using (patient_id = auth.uid());

drop policy if exists "staff_journal_all" on journal_entries;
create policy "staff_journal_all" on journal_entries
  for all using (
    auth.role() = 'authenticated'
    and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'staff'
  );
