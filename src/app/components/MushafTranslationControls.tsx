import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { X } from "./icons";

export function MushafTranslationControls({
  language,
  pane,
  onSelect,
  onExit,
}: {
  language: AppLanguage;
  pane: "arabic" | "english";
  onSelect: (pane: "arabic" | "english") => void;
  onExit: () => void;
}) {
  return (
    <div className="mushaf-translation-controls" dir="ltr">
      <fieldset className="quran-pane-selector">
        <legend className="sr-only">{t(language, "quranListening.readingLanguage")}</legend>
        {(["arabic", "english"] as const).map((choice) => (
          <label key={choice} className="quran-pane-choice">
            <input
              type="radio"
              name="compact-mushaf-pane"
              value={choice}
              checked={pane === choice}
              onChange={() => onSelect(choice)}
            />
            <span lang={choice === "arabic" ? "ar" : "en"} dir={choice === "arabic" ? "rtl" : "ltr"}>
              {t(language, choice === "arabic" ? "quranListening.arabicAutonym" : "quranListening.englishAutonym")}
            </span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        onClick={onExit}
        data-testid="mushaf-exit-translation"
        aria-label={t(language, "quranListening.exitTranslation")}
        title={t(language, "quranListening.exitTranslation")}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
