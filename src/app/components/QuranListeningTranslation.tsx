import { useState } from "react";
import type { QuranTranslationVerse } from "../content/quranTranslation";
import type { TextSizeOption } from "../types";
import { t } from "../i18n";
import { ChevronDown } from "./icons";
import "./quran-listening-translation.css";
import { QuranTranslationText } from "./QuranTranslationText";

export function QuranListeningTranslation({
  verses,
  activeVerseKey,
  follow,
  textSize,
  pageNumber,
}: {
  verses: readonly QuranTranslationVerse[];
  activeVerseKey: string | null;
  follow: boolean;
  textSize: TextSizeOption;
  pageNumber: number;
}) {
  const [open, setOpen] = useState(true);
  return (
    <details
      className="audio-listening-translation"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      data-testid="quran-page-translation"
    >
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring">
        <ChevronDown size={18} aria-hidden="true" />
        <span className="font-semibold">{t("en", "quranListening.translation")}</span>
        {verses.length > 0 && (
          <span className="ms-auto text-label text-muted-foreground">
            {verses[0]!.verseKey} &ndash; {verses.at(-1)!.verseKey}
          </span>
        )}
      </summary>
      {verses.length ? (
        <QuranTranslationText
          verses={verses}
          activeVerseKey={activeVerseKey}
          follow={follow && open}
          pageNumber={pageNumber}
          textSize={textSize}
          label={t("en", "quranListening.translation")}
          className="audio-listening-translation-text"
        />
      ) : (
        <p>{t("en", "quranListening.translationUnavailable")}</p>
      )}
    </details>
  );
}
