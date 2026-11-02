import { useState } from "react";
import { JUZS } from "../content/surahInfo";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { AccessibleCombobox } from "./AccessibleCombobox";
import { FormField } from "./FormField";
import { Button } from "./ui/button";
import { Download } from "./icons";

/** Selection only; verified acquisition and storage remain with the screen service. */
export function MushafDownloadSelection({
  language,
  disabled,
  active,
  onDownload,
  onCancel,
}: {
  language: AppLanguage;
  disabled: boolean;
  active: boolean;
  onDownload: (first: number, last: number) => void;
  onCancel: () => void;
}) {
  const [first, setFirst] = useState("1");
  const [last, setLast] = useState("21");
  const [juz, setJuz] = useState("pages");
  const direction = language === "ar" ? "rtl" : "ltr";
  return (
    <details className="group border-t border-border/40" data-testid="mushaf-download-selection">
      <summary className="min-h-11 cursor-pointer rounded-lg py-3 text-sm font-semibold focus-visible:ring-[3px] focus-visible:ring-ring">
        {t(language, "downloads.downloadPages")}
      </summary>
      <form
        className="space-y-3 pb-3"
        onSubmit={(event) => {
          event.preventDefault();
          const start = Number(first),
            end = Number(last);
          if (!disabled && Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end <= 604 && end >= start)
            onDownload(start, end);
        }}
      >
        <fieldset disabled={disabled} className="min-w-0 space-y-3">
          <AccessibleCombobox
            label={t(language, "common.juz")}
            value={juz}
            direction={direction}
            language={language}
            options={[
              { id: "pages", label: t(language, "downloads.customPages") },
              ...JUZS.map((item) => ({
                id: String(item.number),
                label: language === "ar" ? item.nameArabic : item.nameEnglish,
              })),
            ]}
            onChange={(value) => {
              setJuz(String(value));
              const index = JUZS.findIndex((item) => String(item.number) === value);
              if (index >= 0) {
                setFirst(String(JUZS[index]!.startPage));
                setLast(String((JUZS[index + 1]?.startPage ?? 605) - 1));
              }
            }}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label={t(language, "downloads.startPage")}
              type="number"
              min={1}
              max={604}
              required
              value={first}
              onChange={(event) => {
                setJuz("pages");
                setFirst(event.target.value);
              }}
            />
            <FormField
              label={t(language, "downloads.endPage")}
              type="number"
              min={Math.max(1, Number(first))}
              max={604}
              required
              value={last}
              onChange={(event) => {
                setJuz("pages");
                setLast(event.target.value);
              }}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={disabled}
            className="h-auto w-full min-w-0 max-w-full whitespace-normal"
          >
            <Download aria-hidden="true" size={18} />
            <span className="min-w-0 break-words">{t(language, "downloads.downloadPages")}</span>
          </Button>
        </fieldset>
        {active && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-auto w-full min-w-0 max-w-full whitespace-normal"
          >
            <span className="min-w-0 break-words">{t(language, "downloads.cancelDownload")}</span>
          </Button>
        )}
      </form>
    </details>
  );
}
