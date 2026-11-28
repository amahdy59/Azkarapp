import { benefitEvidenceCitation } from "../benefitEvidencePresentation";
import { localizeBenefitText, type BenefitEvidence } from "../content/zikrBenefits";
import { t } from "../i18n";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import type { AppLanguage } from "../types";
import { Lightbulb } from "./icons";
import { QuranVerseText } from "./QuranVerseText";
import { Button } from "./ui/button";

export function CompletionReflectionCard({
  evidence,
  language,
  onExplore,
}: {
  evidence: BenefitEvidence;
  language: AppLanguage;
  onExplore?: () => void;
}) {
  const isQuran = evidence.kind === "quran";
  const text = isQuran ? evidence.text.ar : localizeBenefitText(evidence.text, language);
  return (
    <section
      className="completion-reflection rounded-3xl border border-border bg-card text-center shadow-raised"
      aria-label={t(language, "completion.virtue")}
      data-testid="completion-reflection"
      data-evidence-id={evidence.id}
    >
      <div className="completion-reflection-body">
        <h2 className="completion-reflection-heading flex items-center justify-center gap-3 text-sm font-bold text-primary">
          <span className="min-w-0 break-words">{t(language, "completion.virtue")}</span>
        </h2>
        <div
          className="completion-reflection-reading rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset"
          role="region"
          aria-label={t(language, "completion.reminderText")}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The named native quotation region must be keyboard-scrollable.
          tabIndex={0}
          data-testid="completion-reflection-reading"
        >
          <blockquote className="completion-reflection-quotation m-0">
            {!isQuran && language === "ar" && (
              <p className="mb-4 text-sm text-muted-foreground">{t(language, "completion.propheticAttribution")}</p>
            )}
            <p
              className={`text-foreground ${isQuran || language === "ar" ? "zikr-text text-xl leading-[1.9]" : "break-words text-base leading-7"}`}
              style={isQuran ? QURAN_TEXT_STYLE : undefined}
              lang={isQuran ? "ar" : language}
              dir={isQuran || language === "ar" ? "rtl" : "ltr"}
              data-testid="completion-reflection-text"
            >
              {isQuran ? <QuranVerseText text={text} language={language} canonicalKey={evidence.id} /> : text}
            </p>
            {isQuran && language === "en" && (
              <p className="mt-5 text-sm leading-7 text-muted-foreground" lang="en" dir="ltr">
                {evidence.text.en}
              </p>
            )}
          </blockquote>
        </div>
        <div className="flex justify-center">
          <a
            href={evidence.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl px-2 py-3 text-xs font-semibold leading-6 text-muted-foreground underline decoration-primary/40 underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            dir="auto"
            data-testid="completion-reflection-source"
          >
            <cite className="not-italic">{benefitEvidenceCitation(evidence, language)}</cite>
          </a>
        </div>
      </div>
      {onExplore && (
        <div className="completion-reflection-explore border-t border-border py-2">
          <Button variant="ghost" className="min-h-12 w-full text-muted-foreground" onClick={onExplore}>
            <Lightbulb size={18} aria-hidden="true" />
            {t(language, "completion.moreBenefits")}
          </Button>
        </div>
      )}
    </section>
  );
}
