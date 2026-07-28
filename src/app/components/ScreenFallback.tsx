import type { AppLanguage } from "../types";
import { t } from "../i18n";

export function ScreenFallback({ language }: { language?: AppLanguage }) {
  return (
    <div
      className="flex h-full items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label={t(language ?? "en", "common.loading")}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}
