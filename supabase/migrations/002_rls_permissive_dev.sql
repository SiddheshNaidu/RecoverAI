-- OPTIONAL — Run after `001_recoverai_schema.sql` for local/hackathon demos where
-- Supabase Auth + `app_metadata.role = staff` is not wired yet.
-- This allows the anon key to read/write all rows. Remove or replace before production.

drop policy if exists "dev_allow_all_patients" on patients;
drop policy if exists "dev_allow_all_caregivers" on caregivers;
drop policy if exists "dev_allow_all_medications" on medications;
drop policy if exists "dev_allow_all_medication_logs" on medication_logs;
drop policy if exists "dev_allow_all_recovery_trajectory" on recovery_trajectory;
drop policy if exists "dev_allow_all_protocol_tasks" on protocol_tasks;
drop policy if exists "dev_allow_all_appointments" on appointments;
drop policy if exists "dev_allow_all_caregiver_alerts" on caregiver_alerts;
drop policy if exists "dev_allow_all_journal_entries" on journal_entries;

create policy "dev_allow_all_patients" on patients for all using (true) with check (true);
create policy "dev_allow_all_caregivers" on caregivers for all using (true) with check (true);
create policy "dev_allow_all_medications" on medications for all using (true) with check (true);
create policy "dev_allow_all_medication_logs" on medication_logs for all using (true) with check (true);
create policy "dev_allow_all_recovery_trajectory" on recovery_trajectory for all using (true) with check (true);
create policy "dev_allow_all_protocol_tasks" on protocol_tasks for all using (true) with check (true);
create policy "dev_allow_all_appointments" on appointments for all using (true) with check (true);
create policy "dev_allow_all_caregiver_alerts" on caregiver_alerts for all using (true) with check (true);
create policy "dev_allow_all_journal_entries" on journal_entries for all using (true) with check (true);
