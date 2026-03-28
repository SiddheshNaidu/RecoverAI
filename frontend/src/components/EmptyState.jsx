/**
 * EmptyState.jsx — Zero-data placeholder
 * ui-ux-pro-max: muted palette, clear CTA if provided
 */
export default function EmptyState({ icon = "inbox", title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[180px] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center">
        <span
          className="material-symbols-outlined text-outline"
          style={{ fontSize: 32 }}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-on-surface font-semibold text-sm">{title}</p>
        {description && (
          <p className="text-on-surface-variant text-xs leading-relaxed max-w-[200px]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 px-4 py-2 bg-primary-container text-on-primary-container rounded-full text-sm font-semibold cursor-pointer hover:opacity-90 transition-opacity duration-200 active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
