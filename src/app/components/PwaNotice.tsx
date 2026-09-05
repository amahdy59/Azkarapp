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
  actionLabel?: string;
  dismissLabel: string;
  onAction?: () => void;
  onDismiss: () => void;
  isActionLoading?: boolean;
  statusMessage?: string;
  errorMessage?: string;
}) {
  const titleId = useId();

  return (
    <aside
      /* A measure, not the whole width. This is fixed to the bottom of the
         viewport, so on a desk screen it stretched the full 1900px: the notes
         hugged one edge, the buttons the other, and a metre of empty card sat
         between the thing being read and the button answering it. Centred and
         held to a readable width, the answer stays next to the question. */
      className="mx-auto w-[calc(100%-2rem)] max-w-[40rem] rounded-2xl border border-primary/30 bg-card p-4 shadow-raised"
      aria-busy={isActionLoading || undefined}
      aria-labelledby={titleId}
    >
      <p id={titleId} className="text-subtitle font-bold text-foreground">
        {title}
      </p>
      {body && <p className="mt-1 text-label leading-5 text-muted-foreground">{body}</p>}
      {items && (
        <ul className="mt-2 list-disc space-y-1 ps-5 text-label leading-5 text-muted-foreground">
          {items.map((item, index) => (
            // The list is static and never reorders, so the position is the
            // stable identity here; two identical notes would collide on text.
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
      {statusMessage && !errorMessage && (
        <p className="mt-2 text-label font-semibold text-primary" role="status" aria-live="polite">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p className="mt-2 text-label font-semibold text-destructive" role="alert">
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
          className="text-label"
        >
          {dismissLabel}
        </Button>
        {actionLabel && onAction && (
          <Button
            type="button"
            onClick={onAction}
            disabled={isActionLoading}
            className="text-label disabled:cursor-not-allowed"
          >
            {isActionLoading && (
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                aria-hidden="true"
              />
            )}
            {actionLabel}
          </Button>
        )}
      </div>
    </aside>
  );
}
