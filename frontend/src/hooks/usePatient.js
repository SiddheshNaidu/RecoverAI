import { useState, useEffect } from "react";
import { api } from "../api/client";

// Temporary mock hook so the old PatientHomePage compiles during Phase 2 review.
export function usePatient(patientId) {
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [recoveryDay, setRecoveryDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fake load
    setTimeout(() => {
      setPatient({ name: "Mock Patient", surgery_type: "KNEE" });
      setMedications([{ name: "Amoxicillin", status: "PENDING" }]);
      setRecoveryDay(3);
      setLoading(false);
    }, 500);
  }, [patientId]);

  return { patient, medications, recoveryDay, loading, error, refetch: () => {} };
}

export default usePatient;
