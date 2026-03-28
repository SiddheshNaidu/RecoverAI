/**
 * context/AppContext.jsx — Team UNTITLED | Build-it ON
 * Global state: items list, active view, PS-specific config flags.
 * PS-specific fields get filled at 12:30AM Mar 27.
 *
 * NO localStorage. All state resets on page refresh — that's fine.
 */

import { createContext, useContext, useState, useCallback } from "react";

// ─── PS config (fill at 12:30AM Mar 27) ────────────────────────────────────
// Kaushik updates these after reading the PS. Controls which tabs/features show.
export const PS_CONFIG = {
  PROMPT_TYPE: "knowledge",      // archetype key sent to /api/process-text
  AUDIO_ENABLED: true,           // show Audio tab in UploadPanel
  FILE_ENABLED: false,           // show File (image) tab in UploadPanel
  WHATSAPP_ENABLED: false,       // show WhatsApp delivery button on cards
  PRIMARY_LABEL: "Item",         // label used in empty states + headings
};

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [items, setItems] = useState([]);        // all items from Supabase / just processed
  const [activeItem, setActiveItem] = useState(null); // item currently in focus
  const [view, setView] = useState("gallery");   // "gallery" | "detail" | "upload"

  // Prepend a new item to the list (called after any process-* success)
  const addItem = useCallback((item) => {
    setItems((prev) => [item, ...prev]);
    setActiveItem(item);
  }, []);

  // Replace entire list (called after GET /api/items)
  const setAllItems = useCallback((list) => {
    setItems(list);
  }, []);

  const value = {
    items,
    activeItem,
    view,
    setView,
    setActiveItem,
    addItem,
    setAllItems,
    PS_CONFIG,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
