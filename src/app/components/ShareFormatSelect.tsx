import { useId } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { SHARE_DIMENSIONS, type ShareFormat } from "../share/shareLayout";
import { ChevronDown } from "./icons";
import { FIELD_LABEL_CLASS } from "./FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export const SHARE_FORMATS = ["story", "square", "portrait", "tall"] as const;

function PlatformTags({ format, language }: { format: ShareFormat; language: AppLanguage }) {
  return (
    <span data-testid="share-format-platforms" className="mt-1 flex flex-wrap gap-1">
      {([1, 2] as const).map((index) => (
        <span
          key={index}
          className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium leading-relaxed text-muted-foreground"
        >
          {t(language, `shareStudio.${format}Platform${index}`)}
        </span>
      ))}
    </span>
  );
}

/** One size vocabulary and destination guidance across every generated-image studio. */
export function ShareFormatSelect({
  value,
  onChange,
  language,
  disabled,
  compatibleFormats,
}: {
  value: ShareFormat;
  onChange: (value: ShareFormat) => void;
  language: AppLanguage;
  disabled?: boolean;
  compatibleFormats?: readonly ShareFormat[] | null;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const unavailable = compatibleFormats != null && compatibleFormats.length < SHARE_FORMATS.length;
  const dimensions = (format: ShareFormat) => (
    <bdi dir="ltr">
      {formatNumerals(`${SHARE_DIMENSIONS[format].width} × ${SHARE_DIMENSIONS[format].height}`, language)}
    </bdi>
  );
  return (
    <div className="min-w-0 space-y-2" data-testid="share-format-select">
      <label className={FIELD_LABEL_CLASS} id={`${id}-label`} htmlFor={id}>
        {t(language, "shareStudio.format")}
      </label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as ShareFormat)}
        disabled={disabled}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <SelectTrigger
          className="sharing-select-trigger"
          aria-haspopup="listbox"
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={hintId}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[110]">
          {SHARE_FORMATS.map((format) => (
            <SelectItem
              key={format}
              value={format}
              textValue={t(language, `shareStudio.${format}`)}
              aria-label={t(language, `shareStudio.${format}`)}
              disabled={compatibleFormats != null && !compatibleFormats.includes(format)}
              description={
                <span className="mt-1 block text-xs text-muted-foreground">
                  {dimensions(format)}
                  <PlatformTags format={format} language={language} />
                </span>
              }
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-6 shrink-0 rounded border border-current"
                  style={{ aspectRatio: `${SHARE_DIMENSIONS[format].width} / ${SHARE_DIMENSIONS[format].height}` }}
                />
                <span dir="auto">{t(language, `shareStudio.${format}`)}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <details className="sharing-size-guide">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 text-sm text-muted-foreground">
          {t(language, "shareStudio.sizeGuide")}
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        </summary>
        <div className="text-xs text-muted-foreground">
          {dimensions(value)}
          <PlatformTags format={value} language={language} />
        </div>
        <p id={hintId} className={`text-sm ${unavailable ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
          {t(language, unavailable ? "shareStudio.compatibilityHint" : "shareStudio.sizeHint")}
        </p>
      </details>
    </div>
  );
}
