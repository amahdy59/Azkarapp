import { useEffect, useState } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";

export function ScreenFallback({ language }: { language?: AppLanguage }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 15_000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="flex h-full min-h-[50vh] w-full flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
          aria-hidden="true"
        />
        <p role="status" aria-live="polite" aria-busy={!slow} className="text-sm font-semibold text-muted-foreground">
          {t(language ?? "en", slow ? "common.loadingSlow" : "common.loading")}
        </p>
        {slow && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-11 rounded-lg border border-border px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t(language ?? "en", "common.refreshApp")}
          </button>
        )}
      </div>
    </div>
  );
}
