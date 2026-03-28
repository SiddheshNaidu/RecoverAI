/**
 * LoadingState.jsx — Full-area centered loading indicator
 * ui-ux-pro-max: 60fps spin via transform only, reducedMotion respected
 */
export default function LoadingState({ message = "Loading…", fullScreen = false }) {
  const cls = fullScreen
    ? "min-h-screen bg-surface"
    : "min-h-[200px] bg-transparent";

  return (
    <div
      className={`${cls} flex flex-col items-center justify-center gap-3`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <span
        className="material-symbols-outlined text-primary motion-safe:animate-spin"
        style={{ fontSize: 36 }}
        aria-hidden="true"
      >
        progress_activity
      </span>
      <p className="text-on-surface-variant text-sm font-medium font-body">
        {message}
      </p>
    </div>
  );
}
