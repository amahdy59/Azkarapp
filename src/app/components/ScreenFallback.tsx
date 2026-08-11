import type { AppLanguage } from "../types";
import { t } from "../i18n";

export function ScreenFallback({ language }: { language?: AppLanguage }) {
  return (
    <div
      className="flex h-full items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-muted-foreground">{t(language ?? "en", "common.loading")}</p>
      </div>
    </div>
  );
}
