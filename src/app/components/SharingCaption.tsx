import { useEffect, useRef, useState } from "react";
import { Copy } from "./icons";
import { Button } from "./ui/button";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

interface SharingCaptionProps {
  language: AppLanguage;
  included: boolean;
  onIncludedChange: (included: boolean) => void;
  text: string;
  readingLink?: string;
  busy: boolean;
  disabled?: boolean;
  canCopy: boolean;
  onCopy: (value: string) => Promise<boolean>;
  artwork?: boolean;
  onSaveText?: (value: string) => void;
}

/** Presentation only; the studio owns the prepared text and clipboard operation. */
export function SharingCaption({
  language,
  included,
  onIncludedChange,
  text,
  readingLink,
  busy,
  disabled,
  canCopy,
  onCopy,
  artwork,
  onSaveText,
}: SharingCaptionProps) {
  const [pending, setPending] = useState(false);
  const [manual, setManual] = useState<"text" | "link" | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (manual) {
      field.current?.focus();
      field.current?.select();
    }
  }, [manual]);
  const copy = async (kind: "text" | "link") => {
    if (pending || busy) return;
    const value = kind === "link" ? readingLink! : text;
    setPending(true);
    try {
      if (!canCopy || !(await onCopy(value))) {
        setManual(kind);
        if (manual === kind) {
          field.current?.focus();
          field.current?.select();
        }
      }
    } catch {
      setManual(kind);
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="sharing-caption space-y-2">
      <label className="sharing-choice text-sm font-semibold">
        <input
          type="checkbox"
          checked={included}
          disabled={busy || pending || disabled}
          onChange={(event) => onIncludedChange(event.target.checked)}
        />
        {t(language, "shareStudio.includeCaption")}
      </label>
      {artwork && <p className="text-xs text-muted-foreground">{t(language, "shareStudio.artworkCaption")}</p>}
      {(included || manual === "text") && (
        <label className="block space-y-1 text-sm">
          <span>{t(language, "shareStudio.captionPreview")}</span>
          <textarea
            ref={manual === "text" ? field : undefined}
            readOnly
            rows={3}
            value={text}
            dir="auto"
            className="w-full resize-y rounded-xl border border-border bg-background p-2 text-sm leading-relaxed"
          />
        </label>
      )}
      {manual === "link" && (
        <label className="block space-y-1 text-sm">
          <span>{t(language, "shareStudio.readingLink")}</span>
          <textarea
            ref={field}
            readOnly
            rows={2}
            value={readingLink}
            dir="ltr"
            className="w-full resize-y rounded-xl border border-border bg-background p-2 text-sm leading-relaxed"
          />
        </label>
      )}
      {included && <p className="text-xs text-muted-foreground">{t(language, "shareStudio.captionHint")}</p>}
      {(included || manual === "text") && onSaveText && (
        <Button
          variant="ghost"
          className="min-h-11 h-auto gap-1 px-2 whitespace-normal"
          disabled={busy || pending || disabled}
          onClick={() => onSaveText(text)}
        >
          {t(language, "shareStudio.saveText")}
        </Button>
      )}
      {manual && (
        <p role="status" className="text-sm text-muted-foreground">
          {t(language, "shareStudio.selectToCopy")}
        </p>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-2">
        <Button
          variant="outline"
          className="min-h-11 h-auto gap-1 px-2 whitespace-normal"
          disabled={busy || pending || disabled}
          onClick={() => void copy("text")}
        >
          <Copy aria-hidden="true" />
          {t(language, "shareStudio.copyText")}
        </Button>
        {readingLink && (
          <Button
            variant="outline"
            className="min-h-11 h-auto gap-1 px-2 whitespace-normal"
            disabled={busy || pending}
            title={readingLink}
            onClick={() => void copy("link")}
          >
            <Copy aria-hidden="true" />
            {t(language, "shareStudio.copyReadingLink")}
          </Button>
        )}
      </div>
    </div>
  );
}
