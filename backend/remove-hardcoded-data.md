# RecoverAI — Remove ALL Hardcoded Frontend Data

> **Give this entire file to Claude Code.**  
> Instruction: *"Follow every step in this file exactly. Remove all hardcoded data from the frontend and replace with efficient Supabase fetches. Do not skip any section."*

---

## Tech Stack Context

- **Frontend:** React + Vite (`frontend/src/`)
- **Backend/DB:** Supabase (client already initialised — `DatabaseManager` singleton exists)
- **State:** local `useState` + `useEffect` per page (upgrade to context/hook as needed)
- **Auth:** Supabase Auth (patient id and staff id come from session)

---

## Step 0 — Create a shared Supabase API layer

Before touching any page, create one file that all pages import from.  
**Create `frontend/src/api/db.js`** (if it doesn't already exist or is empty):

```js
// frontend/src/api/db.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
```

Ensure `.env` (local, gitignored) and `.env.example` (committed) both contain:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Step 1 — Supabase Table Schema Required

Make sure these tables exist in Supabase (create via SQL editor if not present).  
**Do NOT seed with hardcoded data — use Supabase dashboard or migrations.**

```sql
-- Patients
create table patients (
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
create table caregivers (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  name text,
  phone text,
  relation text
);

-- Medications
create table medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  name text,
  dose text
);

-- Medication logs (one row per day per medication)
create table medication_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid references medications(id),
  patient_id uuid references patients(id),
  log_date date,
  status text check (status in ('taken','missed','upcoming'))
);

-- Recovery trajectory (pain scores over days)
create table recovery_trajectory (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  day_number int,
  expected_pain numeric,
  actual_pain numeric
);

-- Protocol tasks (today's plan items)
create table protocol_tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  task_name text,
  time_slot text,   -- 'morning', 'afternoon', 'evening'
  icon_type text,   -- 'mic', 'bandage', 'walk' (used for icon mapping in UI)
  task_date date
);

-- Appointments
create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  appt_date date,
  appt_time text,
  reason text,
  doctor_name text
);

-- Caregiver alert history (WhatsApp log)
create table caregiver_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  alert_date date,
  message text
);

-- Journal entries
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id),
  entry_date date,
  ai_summary text,
  raw_input text
);

-- 7-day adherence summary view (optional, for efficiency)
create or replace view medication_adherence_7day as
select
  ml.patient_id,
  ml.medication_id,
  m.name as medication_name,
  m.dose,
  ml.log_date,
  ml.status,
  row_number() over (partition by ml.medication_id order by ml.log_date) as day_number
from medication_logs ml
join medications m on m.id = ml.medication_id
where ml.log_date >= current_date - interval '6 days';
```

---

## Step 2 — `ReceptionistDashboardPage.jsx`

### Remove

```js
// DELETE these entire blocks:
const PATIENTS = [
  { id: '1', name: 'Robert Chen', procedure: 'Hip Replacement', day: 4, total: 30, risk... },
  ...
];

const APPOINTMENTS = [
  { date: 'Mar 29', time: '10:00 AM', name: 'Ramesh Patil', reason: 'Day 7 Wound Check'... },
  ...
];
```

### Replace with

```js
import { useEffect, useState } from 'react';
import supabase from '../api/db';

export default function ReceptionistDashboardPage() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [{ data: pats, error: pErr }, { data: appts, error: aErr }] = await Promise.all([
          supabase
            .from('patients')
            .select('id, name, procedure, recovery_current_day, recovery_total_days, risk_level')
            .order('risk_level', { ascending: false }), // CRITICAL first
          supabase
            .from('appointments')
            .select('id, appt_date, appt_time, reason, patients(name)')
            .eq('appt_date', new Date().toISOString().split('T')[0])
            .order('appt_time')
        ]);
        if (pErr) throw pErr;
        if (aErr) throw aErr;
        setPatients(pats);
        setAppointments(appts);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error)   return <div className="p-8 text-red-500">Error: {error}</div>;

  // rest of JSX uses `patients` and `appointments` arrays
}
```

---

## Step 3 — `ReceptionistPatientView.jsx` (Patient Detail Page)

### Remove all hardcoded values for:
- Discharge date, recovery day, risk level
- Phone numbers (patient + caregiver)
- Recovery trajectory data points
- 7-day medication adherence grid
- WhatsApp caregiver alert history

### Replace with a single parallel fetch on mount:

```js
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../api/db';

export default function ReceptionistPatientView() {
  const { id } = useParams(); // patient id from URL e.g. /receptionist/patient/:id
  const [patient, setPatient]           = useState(null);
  const [caregiver, setCaregiver]       = useState(null);
  const [trajectory, setTrajectory]     = useState([]);
  const [medications, setMedications]   = useState([]);
  const [alerts, setAlerts]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!id) return;
    async function fetchPatientDetail() {
      try {
        const [
          { data: pat,   error: e1 },
          { data: cg,    error: e2 },
          { data: traj,  error: e3 },
          { data: meds,  error: e4 },
          { data: alts,  error: e5 }
        ] = await Promise.all([
          supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single(),

          supabase
            .from('caregivers')
            .select('name, phone, relation')
            .eq('patient_id', id)
            .limit(1)
            .single(),

          supabase
            .from('recovery_trajectory')
            .select('day_number, expected_pain, actual_pain')
            .eq('patient_id', id)
            .order('day_number'),

          supabase
            .from('medication_adherence_7day')   // use the view
            .select('medication_name, dose, day_number, log_date, status')
            .eq('patient_id', id)
            .order('medication_name')
            .order('day_number'),

          supabase
            .from('caregiver_alerts')
            .select('alert_date, message')
            .eq('patient_id', id)
            .order('alert_date', { ascending: false })
            .limit(10)
        ]);

        if (e1) throw e1;
        if (e2 && e2.code !== 'PGRST116') throw e2; // ignore "no rows" for caregiver
        if (e3) throw e3;
        if (e4) throw e4;
        if (e5) throw e5;

        setPatient(pat);
        setCaregiver(cg ?? null);
        setTrajectory(traj);
        setMedications(groupMedicationsByName(meds)); // helper below
        setAlerts(alts);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPatientDetail();
  }, [id]);

  // Group flat medication rows into { name, dose, days: [{day, status}] }
  function groupMedicationsByName(rows) {
    const map = {};
    rows.forEach(r => {
      if (!map[r.medication_name]) {
        map[r.medication_name] = { name: r.medication_name, dose: r.dose, days: [] };
      }
      map[r.medication_name].days.push({ day: r.day_number, status: r.status });
    });
    return Object.values(map);
  }

  if (loading) return <div className="p-8 text-center">Loading patient...</div>;
  if (error)   return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!patient) return <div className="p-8">Patient not found.</div>;

  // JSX renders patient.name, patient.discharge_date, patient.risk_level,
  // trajectory[], medications[], caregiver.phone, alerts[] — NO hardcoded values
}
```

---

## Step 4 — `PatientHomePage.jsx`

### Remove all hardcoded values for:
- Patient name, procedure name
- Recovery progress (X of Y days), phase, phase label
- Today's protocol task list
- 7-day adherence summary

### Replace with:

```js
import { useEffect, useState } from 'react';
import supabase from '../api/db';

export default function PatientHomePage() {
  const [patient, setPatient]     = useState(null);
  const [tasks, setTasks]         = useState([]);
  const [adherence, setAdherence] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    async function fetchHome() {
      try {
        // Get current patient from Supabase auth session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const today = new Date().toISOString().split('T')[0];

        const [
          { data: pat,  error: e1 },
          { data: taskList, error: e2 },
          { data: meds, error: e3 }
        ] = await Promise.all([
          supabase
            .from('patients')
            .select('id, name, procedure, recovery_current_day, recovery_total_days, phase, phase_label')
            .eq('id', user.id)
            .single(),

          supabase
            .from('protocol_tasks')
            .select('task_name, time_slot, icon_type')
            .eq('patient_id', user.id)
            .eq('task_date', today)
            .order('time_slot'),

          supabase
            .from('medication_adherence_7day')
            .select('medication_name, dose, day_number, status')
            .eq('patient_id', user.id)
            .order('medication_name')
            .order('day_number')
        ]);

        if (e1) throw e1;
        if (e2) throw e2;
        if (e3) throw e3;

        setPatient(pat);
        setTasks(taskList);
        setAdherence(groupMedicationsByName(meds));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHome();
  }, []);

  function groupMedicationsByName(rows) {
    const map = {};
    rows.forEach(r => {
      if (!map[r.medication_name]) {
        map[r.medication_name] = { name: r.medication_name, dose: r.dose, days: [] };
      }
      map[r.medication_name].days.push({ day: r.day_number, status: r.status });
    });
    return Object.values(map);
  }

  if (loading) return <div className="p-8 text-center">Loading your recovery plan...</div>;
  if (error)   return <div className="p-8 text-red-500">Error: {error}</div>;

  // JSX: use patient.name, patient.procedure, patient.recovery_current_day,
  // patient.recovery_total_days, patient.phase_label, tasks[], adherence[]
}
```

---

## Step 5 — `SOSPage.jsx`

### Remove hardcoded hospital name/number

### Replace with:

```js
useEffect(() => {
  async function fetchHospitalContact() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('patients')
      .select('hospital_name, hospital_phone')
      .eq('id', user.id)
      .single();
    if (!error) setHospital(data);
  }
  fetchHospitalContact();
}, []);
```

---

## Step 6 — `HistoryPage.jsx` (Journal)

### Remove any hardcoded journal entries

### Replace with:

```js
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await supabase
  .from('journal_entries')
  .select('entry_date, ai_summary, raw_input')
  .eq('patient_id', user.id)
  .order('entry_date', { ascending: false })
  .limit(20);
```

---

## Step 7 — `RecoveryPlanPage.jsx`

### Remove any hardcoded plan/phase data

### Replace with:

```js
const { data, error } = await supabase
  .from('patients')
  .select('phase, phase_label, procedure, recovery_total_days')
  .eq('id', user.id)
  .single();
```

---

## Step 8 — `RegisterPatientPage.jsx`

### Ensure the form INSERT goes to Supabase, not a local array

```js
async function handleRegister(formData) {
  const { error } = await supabase.from('patients').insert([{
    name: formData.name,
    phone: formData.phone,
    procedure: formData.procedure,
    discharge_date: formData.dischargeDate,
    recovery_total_days: formData.totalDays,
    recovery_current_day: 1,
    risk_level: 'LOW',
    hospital_name: formData.hospitalName,
    hospital_phone: formData.hospitalPhone,
  }]);
  if (error) console.error(error);
}
```

---

## Step 9 — Enable Row Level Security (RLS) in Supabase

After data is live, protect it. Run in Supabase SQL editor:

```sql
-- Patients can only read their own row
alter table patients enable row level security;
create policy "patient_self" on patients
  for select using (auth.uid() = id);

-- Staff (receptionist) can read all patients
create policy "staff_all" on patients
  for all using (auth.role() = 'authenticated' and auth.jwt() ->> 'role' = 'staff');

-- Apply similar policies to all other tables
```

---

## Step 10 — Environment Variables Checklist

Make sure these are set in both local `.env` and your deployment platform (Vercel / Railway / etc.):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

---

## Final Checklist for Claude Code

| Page / File | Hardcoded Data Removed | Supabase Fetch Added | Loading State | Error State |
|---|---|---|---|---|
| `ReceptionistDashboardPage.jsx` | ☐ PATIENTS array | ☐ patients + appointments | ☐ | ☐ |
| `ReceptionistPatientView.jsx` | ☐ patient info, phones, chart data, meds, alerts | ☐ 5 parallel fetches | ☐ | ☐ |
| `PatientHomePage.jsx` | ☐ name, progress, tasks, adherence | ☐ 3 parallel fetches | ☐ | ☐ |
| `SOSPage.jsx` | ☐ hospital name/number | ☐ patients.hospital_* | ☐ | ☐ |
| `HistoryPage.jsx` | ☐ journal entries | ☐ journal_entries table | ☐ | ☐ |
| `RecoveryPlanPage.jsx` | ☐ phase/plan data | ☐ patients.phase | ☐ | ☐ |
| `RegisterPatientPage.jsx` | ☐ local array inserts | ☐ supabase.insert | ☐ | ☐ |
| `frontend/src/api/db.js` | — | ☐ Supabase client created | — | — |
| Supabase RLS policies | — | ☐ enabled on all tables | — | — |
