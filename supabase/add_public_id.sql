-- Add public_id to patients table
alter table public.patients add column if not exists public_id text unique default substr(md5(random()::text), 1, 8);

-- Backfill existing patients with a random public_id if needed
-- (The default already handles this during column creation on existing rows in most Postgres versions)

-- Update indexes for faster lookups
create index if not exists idx_patients_public_id on public.patients (public_id);
