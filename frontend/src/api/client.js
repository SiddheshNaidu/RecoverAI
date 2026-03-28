/**
 * Offline-first mock API client for RecoverAI
 * Intercepts fetch requests to serve mock data while the backend is being built.
 */

const LATENCY = 800; // Simulate network delay

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_DB = {
  patients: [
    {
      id: "pat_001",
      name: "Arthur Pendelton",
      status: "Stable",
      risk_level: "LOW",
      recovery_day: 4,
      trend_direction: "up",
      trend_delta: "+12",
      adherence_pct: 100,
      wound_status: "Healing well",
      ai_insight: "Recovery is progressing faster than expected.",
      phone: "+1 555-0102"
    },
    {
      id: "pat_002",
      name: "Maria Gonzalez",
      status: "Critical",
      risk_level: "CRITICAL",
      recovery_day: 2,
      trend_direction: "down",
      trend_delta: "-15",
      adherence_pct: 60,
      wound_status: "Redness reported",
      ai_insight: "High pain score detected in voice logs. Intervention recommended.",
      phone: "+1 555-0199"
    }
  ],
  plan: {
    tasks: [
      { id: 1, title: "Take Amoxicillin 500mg", time: "8:00 AM", completed: true },
      { id: 2, title: "Change dressing (Upload photo optional)", time: "10:00 AM", completed: false },
      { id: 3, title: "Light walking (10 mins)", time: "2:00 PM", completed: false },
    ],
    medications: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "2x daily" },
      { name: "Ibuprofen", dosage: "400mg", frequency: "As needed for pain" }
    ]
  }
};

export const api = {
  async login(role, credentials) {
    await delay(LATENCY);
    if (role === 'receptionist') {
      if (credentials.password === 'admin') {
        return { success: true, user: { name: "Sarah Jenkins", role: "receptionist", hospital: "Mercy General" }};
      }
      throw new Error("Invalid staff credentials");
    }
    
    // Patient mock login
    return { success: true, user: MOCK_DB.patients[0] };
  },

  async getPatients() {
    await delay(LATENCY);
    return { success: true, data: MOCK_DB.patients };
  },

  async getPatientPlan(patientId) {
    await delay(LATENCY);
    return { success: true, data: MOCK_DB.plan };
  },

  async submitCheckin(patientId, formData) {
    await delay(1500); // Simulate Gemini processing
    return { 
      success: true, 
      ai_response: "I heard you're feeling a bit more pain today around the incision. I've updated your chart to alert the nurses, and I recommend taking your next dose of Ibuprofen early." 
    };
  }
};
