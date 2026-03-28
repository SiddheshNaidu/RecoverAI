/**
 * ErrorState.jsx — Error display with retry action
 * ui-ux-pro-max: error color from MD3, accessible role=alert
 */
export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 min-h-[200px] px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <span
        className="material-symbols-outlined text-error"
        style={{ fontSize: 40 }}
        aria-hidden="true"
      >
        error_outline
      </span>
      <p className="text-on-surface text-sm font-medium leading-relaxed max-w-xs">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-full text-sm font-semibold cursor-pointer hover:bg-primary-container transition-colors duration-200 active:scale-95"
          aria-label="Retry"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden="true">
            refresh
          </span>
          Try again
        </button>
      )}
    </div>
  );
}
