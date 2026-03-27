/**
 * components/DataCard.jsx — Team UNTITLED | Build-it ON
 * Renders any Item from Supabase as a readable card.
 * Handles arbitrary content{} shapes — never hardcodes field names.
 *
 * Props:
 *   item: Item          — Supabase item object
 *   onClick?: () => void — expand/detail view
 *   compact?: boolean   — smaller variant for gallery
 *
 * Bishnupriya: you can restyle this. Do NOT change the content rendering logic.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import StatusBadge from "./ui/StatusBadge";
import { useApp } from "../context/AppContext";
import { useDeliverWhatsApp } from "../hooks/useApi";

// ─── Field renderer — handles string, array, object, number ──────────────────

function FieldValue({ value }) {
  if (value === null || value === undefined) return <span className="text-gray-400 italic">—</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc ml-4 space-y-0.5">
        {value.map((v, i) => (
          <li key={i} className="text-sm text-gray-700">{String(v)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <pre className="text-xs bg-gray-50 rounded p-2 overflow-x-auto text-gray-600 whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return <span className="text-sm text-gray-800">{String(value)}</span>;
}

// ─── Field label formatter ────────────────────────────────────────────────────

function formatKey(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Priority fields — shown at top if present ───────────────────────────────
// PS-specific: add more keys here as needed on Mar 27
const PRIORITY_KEYS = ["title", "summary", "domain", "situation_type", "issue_type", "profile_summary"];

// ─── Main component ──────────────────────────────────────────────────────────

export default function DataCard({ item, onClick, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  const [phone, setPhone] = useState("");
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const { PS_CONFIG } = useApp();
  const deliver = useDeliverWhatsApp();

  const content = item.content || {};
  const allKeys = Object.keys(content);
  const priorityKeys = PRIORITY_KEYS.filter((k) => k in content);
  const otherKeys = allKeys.filter((k) => !PRIORITY_KEYS.includes(k));
  const orderedKeys = [...priorityKeys, ...otherKeys];

  const previewKey = priorityKeys[0] || allKeys[0];
  const previewValue = previewKey ? String(content[previewKey]).slice(0, 120) : "No content";

  async function handleDeliver() {
    if (!phone.trim()) return;
    const message = Object.entries(content)
      .map(([k, v]) => `*${formatKey(k)}:* ${Array.isArray(v) ? v.join(", ") : String(v)}`)
      .join("\n");
    await deliver.execute(phone.trim(), message);
    setShowWhatsApp(false);
    setPhone("");
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md
        ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2 gap-2">
        <div className="flex-1 min-w-0">
          <StatusBadge label={item.type} />
          {compact && (
            <p className="mt-1.5 text-sm text-gray-600 truncate">{previewValue}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((x) => !x); }}
          className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Content rows */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {orderedKeys.map((key) => (
            <div key={key}>
              <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                {formatKey(key)}
              </dt>
              <dd>
                <FieldValue value={content[key]} />
              </dd>
            </div>
          ))}

          {/* WhatsApp delivery */}
          {PS_CONFIG.WHATSAPP_ENABLED && (
            <div className="pt-2 border-t border-gray-100">
              {!showWhatsApp ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowWhatsApp(true); }}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <Send size={12} /> Send via WhatsApp
                </button>
              ) : (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91XXXXXXXXXX"
                    className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    onClick={handleDeliver}
                    disabled={deliver.loading || !phone.trim()}
                    className="px-3 py-1.5 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40 transition-colors"
                  >
                    {deliver.loading ? "…" : "Send"}
                  </button>
                  <button
                    onClick={() => setShowWhatsApp(false)}
                    className="px-2 py-1.5 rounded border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                  >
                    ✕
                  </button>
                </div>
              )}
              {deliver.error && (
                <p className="text-xs text-red-500 mt-1">{deliver.error}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Timestamp footer */}
      <div className="px-4 pb-3">
        <p className="text-[11px] text-gray-300">
          {new Date(item.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
