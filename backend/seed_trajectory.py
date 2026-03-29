import os
from database import get_supabase
from datetime import date

def seed_trajectories():
    print("Starting trajectory seeding...")
    sb = get_supabase()
    
    # 1. Fetch all patients
    res = sb.table("patients").select("id, name, recovery_total_days, recovery_current_day").execute()
    patients = res.data or []
    print(f"Found {len(patients)} patients.")
    
    for p in patients:
        pid = p["id"]
        total_days = p.get("recovery_total_days") or 14
        current_day = p.get("recovery_current_day") or 1
        
        print(f"Seeding for {p['name']} ({pid})...")
        
        # Check if already has trajectory
        check = sb.table("recovery_trajectory").select("id").eq("patient_id", pid).limit(1).execute()
        if check.data:
            print(f"Skipping {p['name']} - trajectory already exists.")
            continue
            
        trajectory_points = []
        for d in range(1, total_days + 1):
            # Simple linear recovery model: start at 8, go down to 2
            expected = max(2, 8 - (d - 1) * (6 / total_days))
            
            # Actual pain only for days up to current_day
            actual = None
            if d < current_day:
                # Slight variation from expected
                import random
                actual = max(1, min(10, expected + random.uniform(-1, 1)))
            elif d == current_day:
                actual = expected
                
            trajectory_points.append({
                "patient_id": pid,
                "day_number": d,
                "expected_pain": round(expected, 1),
                "actual_pain": round(actual, 1) if actual is not None else None
            })
            
        if trajectory_points:
            sb.table("recovery_trajectory").insert(trajectory_points).execute()
            print(f"Inserted {len(trajectory_points)} points for {p['name']}.")

if __name__ == "__main__":
    seed_trajectories()
