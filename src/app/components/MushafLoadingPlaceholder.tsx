import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Reserve one or two equal reading leaves while the first page pair resolves. */
export function MushafLoadingPlaceholder({ language, spread }: { language: AppLanguage; spread: boolean }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      role="status"
      aria-busy="true"
      data-testid="mushaf-loading"
    >
      <span className="sr-only">{t(language, "common.loading")}</span>
      <div
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center"
        style={{ gap: spread ? "clamp(24px, 3vw, 48px)" : 0, padding: "3.25rem 1.25rem" }}
      >
        {Array.from({ length: spread ? 2 : 1 }, (_, page) => (
          <div
            key={page}
            data-testid="mushaf-loading-leaf"
            className="flex h-full min-w-0 flex-1 flex-col justify-between"
            style={{ maxWidth: "32rem", padding: "1rem" }}
          >
            {Array.from({ length: 15 }, (_, line) => (
              <span
                key={line}
                className="rounded-full bg-muted"
                style={{ height: "0.65rem", width: line === 14 ? "65%" : "100%", alignSelf: "center" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
