/**
 * EmptyState — Generic empty state with icon, message, and optional CTA
 */
export default function EmptyState({ icon = 'inbox', title = 'Nothing here yet', description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-high flex items-center justify-center">
        <span className="material-symbols-outlined text-ink-muted text-[40px]">{icon}</span>
      </div>
      <div className="flex flex-col gap-2 max-w-xs">
        <h3 className="font-heading text-xl font-bold text-ink">{title}</h3>
        {description && <p className="font-inter text-ink-muted text-base">{description}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="btn-gradient px-8 py-3 mt-2">
          {action}
        </button>
      )}
    </div>
  );
}
