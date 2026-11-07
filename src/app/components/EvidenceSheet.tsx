import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import type { EvidenceDetails } from "./EvidenceSource";

export function EvidenceSheet({
  language,
  details,
  onClose,
}: {
  language: AppLanguage;
  details: EvidenceDetails;
  onClose: () => void;
}) {
  const textLanguage = details.textLanguage ?? language;
  return (
    <ResponsiveSheet
      open
      onClose={onClose}
      title={details.title}
      language={language}
      direction={language === "ar" ? "rtl" : "ltr"}
      testId="evidence-source-sheet"
      dialogClassName="evidence-source-surface"
      drawerClassName="evidence-source-surface"
      focusOnOpen
    >
      <div className="flex min-h-0 flex-col overflow-hidden">
        <SheetHeader title={details.title} language={language} onClose={onClose} />
        <div className="min-h-0 space-y-4 overflow-y-auto p-5">
          {details.context && <p className="text-sm text-muted-foreground">{details.context}</p>}
          <blockquote
            className="text-lg leading-loose text-foreground"
            lang={textLanguage}
            dir={textLanguage === "ar" ? "rtl" : "ltr"}
          >
            {details.quotation}
          </blockquote>
          {(details.reference || details.grade) && (
            <p className="text-sm text-muted-foreground" dir="auto">
              {[details.reference, details.grade].filter(Boolean).join(" · ")}
            </p>
          )}
          {details.sourceUrl && (
            <Button asChild variant="outline">
              <a href={details.sourceUrl} target="_blank" rel="noopener noreferrer">
                {t(language, "notifications.fullSource")}
              </a>
            </Button>
          )}
        </div>
      </div>
    </ResponsiveSheet>
  );
}
