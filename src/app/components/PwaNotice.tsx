import { useId } from "react";
import { Button } from "./ui/button";

export function PwaNotice({
  title,
  body,
  items,
  actionLabel,
  dismissLabel,
  onAction,
  onDismiss,
  isActionLoading,
  statusMessage,
  errorMessage,
}: {
  title: string;
  body?: string;
  items?: readonly string[];
  actionLabel: string;
  dismissLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  isActionLoading?: boolean;
  statusMessage?: string;
  errorMessage?: string;
}) {
  const titleId = useId();

  return (
    <aside
      className="mx-4 rounded-2xl border border-primary/30 bg-card p-4 shadow-lg"
      aria-busy={isActionLoading || undefined}
      aria-labelledby={titleId}
    >
      <p id={titleId} className="text-[0.9375rem] font-bold text-foreground">
        {title}
      </p>
      {body && <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">{body}</p>}
      {items && (
        <ul className="mt-2 list-disc space-y-1 ps-5 text-[0.8125rem] leading-5 text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {statusMessage && !errorMessage && (
        <p className="mt-2 text-[0.8125rem] font-semibold text-primary" role="status" aria-live="polite">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p className="mt-2 text-[0.8125rem] font-semibold text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          disabled={isActionLoading}
          className="text-[0.8125rem]"
        >
          {dismissLabel}
        </Button>
        <Button
          type="button"
          onClick={onAction}
          disabled={isActionLoading}
          className="text-[0.8125rem] disabled:cursor-not-allowed"
        >
          {isActionLoading && (
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
              aria-hidden="true"
            />
          )}
          {actionLabel}
        </Button>
      </div>
    </aside>
  );
}
