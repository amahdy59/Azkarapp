/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Lightbulb } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { HadithWeakChainBadge } from "./ZikrComponents";
import { ReferenceCard } from "./ReferenceCard";

function ReferenceContent({
  zikr,
  language,
  direction,
  onClose,
}: {
  zikr: Zikr;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
}) {
  const isArabic = language === "ar";
  const sourceReference = getLocalizedSourceReference(zikr, language);
  const benefit = getLocalizedZikrBenefit(zikr, language);

  /**
   * The narration to show, and the language it is actually in.
   *
   * These are one decision, not two: the fallback means an English reader can
   * still be looking at Arabic, and `lang`/`dir` have to describe the text on
   * screen rather than the interface around it.
   */
  const narration = isArabic ? zikr.hadithText : (zikr.hadithTextEnglish ?? zikr.hadithText);
  const inArabic = isArabic || !zikr.hadithTextEnglish;

  return (
    <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
      <SheetHeader
        title={t(language, "reader.referencesButton")}
        icon={<Lightbulb size={20} aria-hidden="true" />}
        onClose={onClose}
        closeAriaLabel={t(language, "reader.closeReference")}
        language={language}
        direction={direction}
        descriptionId="reader-reference-description"
        description={t(language, "reader.referenceTitle")}
      />

      <div
        role="region"
        aria-label={t(language, "reader.referencesButton")}
        className="reference-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        tabIndex={0}
        dir={direction}
      >
        <div className="reference-sheet-content flex flex-col gap-3.5 pb-4">
          {benefit && (
            <ReferenceCard
              title={t(language, "reader.benefitLabel")}
              titleHeadingId="reference-benefit-heading"
              body={benefit}
              language={language}
              direction={direction}
              isArabicText={isArabic}
            />
          )}
          {narration && (
            <ReferenceCard
              title={t(language, "reader.hadithLabel")}
              titleBadge={zikr.authenticityLevel === "weak" ? <HadithWeakChainBadge language={language} /> : undefined}
              titleHeadingId="reference-evidence-heading"
              body={narration}
              bodyTestId="reference-hadith"
              copyable={true}
              copyText={narration}
              copyAriaLabel={t(language, "reader.copyHadith")}
              sourceText={sourceReference}
              sourceTestId="reference-source"
              sourceHeadingId="reference-source-heading"
              language={language}
              direction={direction}
              isArabicText={inArabic}
            />
          )}
          {!narration && (
            <section aria-labelledby="reference-source-heading">
              <h3 id="reference-source-heading" className="text-subtitle font-bold text-primary">
                {t(language, "reader.sourceLabel")}
              </h3>
              <p
                data-testid="reference-source"
                className="mt-2 text-label font-black text-primary"
                dir={direction}
                lang={language}
              >
                {sourceReference}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReaderReferenceSheet({
  open,
  zikr,
  language,
  direction,
  onClose,
}: {
  open: boolean;
  zikr: Zikr;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
  onAnnouncement: (message: string) => void;
}) {
  if (!open || !zikr) return null;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t(language, "reader.referencesButton")}
      direction={direction}
      testId="reference-sheet"
      describedById="reader-reference-description"
      // `.reference-sheet` carries the sheet height rules in ReaderScreen.css.
      drawerClassName="reference-sheet"
    >
      <ReferenceContent zikr={zikr} language={language} direction={direction} onClose={onClose} />
    </ResponsiveSheet>
  );
}
