import type { ReactNode } from "react";
import { ChevronDown } from "./icons";

/** Native disclosure semantics, with an explicit visual affordance. */
export function SharingDisclosure({
  label,
  summary,
  children,
  open,
  icon,
}: {
  label: string;
  summary?: string;
  children: ReactNode;
  open?: boolean;
  icon?: ReactNode;
}) {
  return (
    <details open={open} className="sharing-disclosure group rounded-2xl border border-border px-3">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        {icon && (
          <span aria-hidden="true" className="shrink-0 text-muted-foreground">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span>{label}</span>
          {summary && <span className="mt-1 block text-xs font-normal text-muted-foreground">{summary}</span>}
        </span>
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 group-open:rotate-180" />
      </summary>
      <div className="pb-3 space-y-3">{children}</div>
    </details>
  );
}
