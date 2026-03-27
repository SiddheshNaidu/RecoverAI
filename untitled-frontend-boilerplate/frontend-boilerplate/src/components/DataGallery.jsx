/**
 * components/DataGallery.jsx — Team UNTITLED | Build-it ON
 * List/grid of DataCards. Handles empty, loading, error states.
 *
 * Props:
 *   items: Item[]
 *   loading: boolean
 *   error: string | null
 *   onRetry: () => void
 *   layout?: "list" | "grid"   — default "list"
 */

import DataCard from "./DataCard";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";
import { useApp } from "../context/AppContext";
import { Inbox } from "lucide-react";

// Skeleton placeholder card
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 animate-pulse">
      <div className="h-5 w-24 bg-gray-100 rounded" />
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-3/4 bg-gray-100 rounded" />
      <div className="h-3 w-1/2 bg-gray-100 rounded" />
    </div>
  );
}

export default function DataGallery({ items = [], loading, error, onRetry, layout = "list" }) {
  const { PS_CONFIG } = useApp();

  if (loading) {
    return (
      <div className={layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
        <Inbox size={40} strokeWidth={1.2} className="mb-3" />
        <p className="text-sm">No {PS_CONFIG.PRIMARY_LABEL}s yet</p>
        <p className="text-xs mt-1">Submit something above to see results here</p>
      </div>
    );
  }

  const gridClass = layout === "grid"
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    : "space-y-3";

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <DataCard key={item.id} item={item} compact={layout === "grid"} />
      ))}
    </div>
  );
}
