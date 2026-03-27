/**
 * pages/HomePage.jsx — Team UNTITLED | Build-it ON
 * Default landing page shell. This is the file Siddhesh reskins per PS.
 *
 * Structure: Header | UploadPanel | DataGallery
 * All three components are generic — only the headline + sub-copy changes per PS.
 */

import { useEffect } from "react";
import UploadPanel from "../components/UploadPanel";
import DataGallery from "../components/DataGallery";
import { useApp } from "../context/AppContext";
import { useListItems } from "../hooks/useApi";

export default function HomePage() {
  const { items, setAllItems, PS_CONFIG } = useApp();
  const { loading, error, execute: fetchItems } = useListItems();

  // Load existing items on mount
  useEffect(() => {
    (async () => {
      const result = await fetchItems();
      if (result) setAllItems(result.items);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header — UPDATE THESE STRINGS PER PS ── */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">
            {/* PS-SPECIFIC: replace this */}
            Team UNTITLED — Build-it ON
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {/* PS-SPECIFIC: replace this */}
            AI for Social Impact
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Upload */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {/* PS-SPECIFIC: replace this */}
            Submit Input
          </h2>
          <UploadPanel />
        </section>

        {/* Gallery */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              {PS_CONFIG.PRIMARY_LABEL}s
              {items.length > 0 && (
                <span className="ml-2 text-gray-300 font-normal normal-case tracking-normal">
                  ({items.length})
                </span>
              )}
            </h2>
            <button
              onClick={async () => {
                const result = await fetchItems();
                if (result) setAllItems(result.items);
              }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              Refresh
            </button>
          </div>
          <DataGallery
            items={items}
            loading={loading}
            error={error}
            onRetry={fetchItems}
          />
        </section>
      </main>
    </div>
  );
}
