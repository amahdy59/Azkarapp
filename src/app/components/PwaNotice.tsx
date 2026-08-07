import { Button } from "./ui/button";

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
        <Button type="button" variant="ghost" size="sm" onClick={onDismiss} className="text-[0.8125rem]">
          {dismissLabel}
        </Button>
        <Button
          type="button"
          onClick={onAction}
          disabled={isActionLoading}
          className="text-[0.8125rem] disabled:cursor-not-allowed"
        >
          {isActionLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
          )}
          {actionLabel}
        </Button>
      </div>
    </aside>
  );
}
