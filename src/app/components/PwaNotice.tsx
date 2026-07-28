export function PwaNotice({
  title,
  body,
  actionLabel,
  dismissLabel,
  onAction,
  onDismiss,
  isActionLoading,
}: {
  title: string;
  body: string;
  actionLabel: string;
  dismissLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  isActionLoading?: boolean;
}) {
  return (
    <aside className="mx-4 rounded-2xl border border-primary/30 bg-card p-4 shadow-lg" role="status" aria-live="polite">
      <p className="text-[0.9375rem] font-bold text-foreground">{title}</p>
      <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{body}</p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-11 rounded-xl px-3 text-[0.8125rem] font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {dismissLabel}
        </button>
        <button
          type="button"
          onClick={onAction}
          disabled={isActionLoading}
          className="min-h-11 rounded-xl bg-primary px-4 text-[0.8125rem] font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isActionLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          )}
          {actionLabel}
        </button>
      </div>
    </aside>
  );
}
