import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import supabase, { isSupabaseConfigured } from "../api/db";

export default function SOSPage() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const { currentPatient } = useApp();
  const [hospital, setHospital] = useState({ hospital_name: "", hospital_phone: "" });
  const [caregiver, setCaregiver] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    async function fetchHospitalContact() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const pid = user?.id || paramId || currentPatient?.id;
        if (!pid) {
          setLoading(false);
          return;
        }

        const [{ data: pat }, { data: cg }] = await Promise.all([
          supabase.from("patients").select("hospital_name, hospital_phone").eq("id", pid).maybeSingle(),
          supabase.from("caregivers").select("name, phone").eq("patient_id", pid).maybeSingle(),
        ]);

        if (pat) {
          setHospital({
            hospital_name: pat.hospital_name || "",
            hospital_phone: pat.hospital_phone || "",
          });
        }
        if (cg) {
          setCaregiver({ name: cg.name || "Caregiver", phone: cg.phone || "" });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchHospitalContact();
  }, [paramId, currentPatient?.id]);

  const hospitalDirective = "Go to the hospital immediately. Do not wait.";
  const contacts = [
    { name: "Emergency Services", number: "112", role: "Ambulance", icon: "airport_shuttle" },
    ...(hospital.hospital_name
      ? [
          {
            name: hospital.hospital_name,
            number: hospital.hospital_phone?.replace(/\s/g, "") || "—",
            role: "Hospital",
            icon: "local_hospital",
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-[#fffcfc] flex flex-col pt-8 pb-32 px-6 md:px-12 lg:px-24">
      <div className="max-w-[700px] mx-auto w-full flex flex-col gap-10">
        <header className="flex items-center justify-between mb-4 mt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-ink shadow-sm hover:shadow-ambient transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <span className="font-heading text-sm font-bold uppercase tracking-widest text-error">Emergency Support</span>
          <div className="w-12 h-12" />
        </header>

        <section className="flex flex-col items-center justify-center animate-fade-up">
          <a
            href="tel:112"
            className="group relative w-64 h-64 md:w-72 md:h-72 rounded-full bg-error flex items-center justify-center shadow-[0_0_60px_rgba(186,26,26,0.3)] hover:shadow-[0_0_100px_rgba(186,26,26,0.5)] hover:scale-105 transition-all duration-500 cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full border-[10px] border-error/30 animate-pulse-slow mix-blend-multiply" />
            <div className="absolute -inset-4 rounded-full border border-error/20 animate-spin-slow" />

            <div className="flex flex-col items-center justify-center text-white z-10 gap-2">
              <span className="material-symbols-outlined text-[64px] mb-2">emergency</span>
              <span className="font-heading text-[2.5rem] font-bold leading-none">CALL</span>
              <span className="font-heading text-[2.5rem] font-bold leading-none">SOS</span>
            </div>
          </a>
        </section>

        <section className="bg-error/10 rounded-[2rem] p-8 mt-4 text-center border border-error/20 animate-fade-up-delay">
          <h2 className="font-heading text-sm font-bold uppercase tracking-widest text-error mb-3">
            Latest Clinical Directive
          </h2>
          <p className="font-heading text-[1.75rem] leading-tight text-[#8c2a2a] font-medium">
            &quot;{hospitalDirective}&quot;
          </p>
        </section>

        <section className="animate-fade-up-delay" style={{ animationDelay: "200ms" }}>
          {caregiver.phone ? (
            <a
              href={`tel:${String(caregiver.phone).replace(/\s/g, "")}`}
              className="bg-white rounded-[2rem] p-6 flex items-center justify-between shadow-sm hover:shadow-ambient transition-all duration-300 group cursor-pointer border border-transparent hover:border-outline-variant/30"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[#fdfae7] text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-[28px]">family_star</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-inter text-sm text-ink-muted mb-1">Call Caregiver</span>
                  <span className="font-heading text-xl font-bold text-ink">{caregiver.name}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center group-hover:bg-[#fdfae7] transition-colors">
                <span className="material-symbols-outlined text-primary text-[24px]">call</span>
              </div>
            </a>
          ) : (
            !loading && (
              <p className="font-inter text-sm text-ink-muted text-center">
                No caregiver phone on file. Add one in your patient record.
              </p>
            )
          )}
        </section>

        <section className="animate-fade-up-delay flex flex-col gap-4" style={{ animationDelay: "300ms" }}>
          <h3 className="font-heading text-xl font-bold text-ink mb-2">Emergency Contacts</h3>

          {contacts.map((contact, idx) => (
            <a
              key={`${contact.name}-${idx}`}
              href={contact.number !== "—" ? `tel:${contact.number}` : undefined}
              className="bg-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm hover:shadow-ambient transition-all cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold text-ink">{contact.name}</span>
                <span className="font-inter text-sm text-ink-muted flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-[16px]">{contact.icon}</span>
                  {contact.role}
                </span>
              </div>
              <span className="font-inter font-medium text-ink bg-surface-low px-4 py-2 rounded-full">{contact.number}</span>
            </a>
          ))}
        </section>

        <section className="text-center mt-4">
          <button
            type="button"
            className="font-inter font-medium text-primary hover:text-primary-dim transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            <span className="material-symbols-outlined text-[20px]">share_location</span>
            Share my current location via WhatsApp
          </button>
        </section>
      </div>
    </main>
  );
}
