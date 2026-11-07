import { lazy, Suspense, useState, type MouseEvent } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const EvidenceSheet = lazy(() => import("./EvidenceSheet").then((module) => ({ default: module.EvidenceSheet })));

export interface EvidenceDetails {
  title: string;
  quotation: string;
  reference: string;
  context?: string;
  grade?: string;
  sourceUrl?: string;
  textLanguage?: AppLanguage;
}

export function EvidenceSource({
  language,
  details,
  className = "",
  testId,
  label,
}: {
  language: AppLanguage;
  details: EvidenceDetails;
  className?: string;
  testId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const Control = details.sourceUrl ? "a" : "button";
  const activate = (event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setOpen(true);
  };
  return (
    <>
      <Control
        type={details.sourceUrl ? undefined : "button"}
        href={details.sourceUrl}
        className={`inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${className}`}
        data-testid={testId}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={activate}
      >
        {label ?? t(language, "notifications.sourceDetails")}
      </Control>
      {open && (
        <Suspense fallback={<p role="status">{t(language, "common.loading")}</p>}>
          <EvidenceSheet language={language} details={details} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
