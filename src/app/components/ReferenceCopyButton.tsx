import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Check, Copy } from "./icons";

export function ReferenceCopyButton({
  text,
  language,
  ariaLabel,
}: {
  text: string;
  language: AppLanguage;
  ariaLabel?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const pending = useRef(false);
  const label =
    status === "copied"
      ? t(language, "reader.referenceCopied")
      : status === "copying"
        ? t(language, "reader.referenceCopying")
        : (ariaLabel ?? t(language, "reader.copyHadith"));
  useEffect(() => {
    if (status !== "copied") return;
    const timer = setTimeout(() => setStatus("idle"), 1600);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={async () => {
          if (pending.current) return;
          pending.current = true;
          setStatus("copying");
          try {
            await navigator.clipboard.writeText(text);
            setStatus("copied");
          } catch {
            setStatus("error");
          } finally {
            pending.current = false;
          }
        }}
        aria-label={label}
        title={label}
        aria-busy={status === "copying"}
        aria-disabled={status === "copying"}
        className="flex size-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {status === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <span role="status" className="sr-only">
        {status === "copied"
          ? t(language, "reader.referenceCopied")
          : status === "copying"
            ? t(language, "reader.referenceCopying")
            : ""}
      </span>
      {status === "error" && (
        <p role="alert" className="max-w-40 text-sm text-destructive">
          {t(language, "reader.copyError")}
        </p>
      )}
    </div>
  );
}
