import { useId, useRef, useState } from "react";
import type { AppLanguage } from "../../types";
import { getProgressDayKey, shiftProgressDayKey } from "../../progress";
import { validateProgressRange, type ProgressRange } from "../../progressDashboard";
import { dashboardText as text } from "../../i18n/progressDashboard";
import { t } from "../../i18n";
import { FormField } from "../../components/FormField";
import { Button } from "../../components/ui/button";
import { ResponsiveSheet, SheetHeader } from "../../components/ResponsiveSheet";

export function DataExportMenu({
  open,
  onClose,
  language,
  onBackup,
  onProgress,
}: {
  open: boolean;
  onClose: () => void;
  language: AppLanguage;
  onBackup: () => void;
  onProgress?: (range: ProgressRange) => Promise<void>;
}) {
  const today = getProgressDayKey(new Date(), 0);
  const id = useId();
  const [range, setRange] = useState({ startKey: shiftProgressDayKey(today, -29), endKey: today });
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState("");
  const invalidRange = Boolean(error && validateProgressRange(range, today));
  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={text(language, "exportData")}
      language={language}
      direction={language === "ar" ? "rtl" : "ltr"}
      testId="settings-export-menu"
      focusOnOpen
    >
      <SheetHeader title={text(language, "exportData")} onClose={onClose} language={language} />
      <div className="min-h-0 space-y-5 overflow-y-auto p-4">
        <section className="space-y-3">
          <h2 className="text-base font-bold">{text(language, "fullBackup")}</h2>
          <p className="text-sm text-muted-foreground">{t(language, "accountData.exportBody")}</p>
          <Button variant="outline" onClick={onBackup} disabled={busy}>
            {t(language, "accountData.exportAction")}
          </Button>
        </section>
        {onProgress && (
          <form
            className="space-y-3 border-t border-border pt-4"
            aria-busy={busy}
            noValidate
            onSubmit={async (event) => {
              event.preventDefault();
              if (pending.current) return;
              const problem = validateProgressRange(range, today);
              setError(problem ? text(language, problem) : null);
              setSaved("");
              if (problem) return;
              pending.current = true;
              setBusy(true);
              try {
                await onProgress(range);
                setSaved(`progress-${range.startKey}-${range.endKey}.json`);
              } catch {
                setError(text(language, "error"));
              } finally {
                pending.current = false;
                setBusy(false);
              }
            }}
          >
            <h2 className="text-base font-bold">{text(language, "progressExport")}</h2>
            <p className="text-sm text-muted-foreground">{text(language, "exportProgressHelp")}</p>
            <p id={`${id}-help`} className="text-xs text-muted-foreground">
              {text(language, "dateHelp")}
            </p>
            {(["startKey", "endKey"] as const).map((key) => (
              <FormField
                key={key}
                type="date"
                dir="ltr"
                label={text(language, key === "startKey" ? "start" : "end")}
                value={range[key]}
                max={today}
                disabled={busy}
                aria-invalid={invalidRange}
                aria-describedby={`${id}-help${invalidRange ? ` ${id}-error` : ""}`}
                onChange={(event) => {
                  setRange({ ...range, [key]: event.target.value });
                  setError(null);
                  setSaved("");
                }}
              />
            ))}
            {error && (
              <p id={`${id}-error`} role="alert" className="fade-in text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {text(language, busy ? "saving" : "export")}
            </Button>
            <p role="status" aria-atomic="true" className="text-sm text-muted-foreground">
              {saved && (
                <span className="fade-in block">
                  {text(language, "saved")} <bdi className="block">{saved}</bdi>
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{text(language, "exportPrivacy")}</p>
          </form>
        )}
      </div>
    </ResponsiveSheet>
  );
}
