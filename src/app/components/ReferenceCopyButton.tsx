import { useEffect, useState } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Check, Copy } from "./icons";

export function ReferenceCopyButton({ text, language }: { text: string; language: AppLanguage }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
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
          try {
            await navigator.clipboard.writeText(text);
            setStatus("copied");
          } catch {
            setStatus("error");
          }
        }}
        aria-label={t(language, "reader.copyHadith")}
        className="flex size-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {status === "copied" ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      </button>
      <span role="status" className="sr-only">
        {status === "copied" ? t(language, "reader.referenceCopied") : ""}
      </span>
      {status === "error" && (
        <p role="alert" className="max-w-40 text-sm text-destructive">
          {t(language, "reader.copyError")}
        </p>
      )}
    </div>
  );
}
