import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Flags a hadith whose chain is graded weak/disputed, using reviewed authenticityLevel only. */
export function HadithWeakChainBadge({ language }: { language: AppLanguage }) {
  return (
    <span className="shrink-0 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-micro font-bold">
      {t(language, "reader.hadithGradeWeak")}
    </span>
  );
}
