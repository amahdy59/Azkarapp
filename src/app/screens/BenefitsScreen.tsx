/* The scroll region is intentionally keyboard-focusable so Page Down/arrow
   scrolling works before a user reaches its first link. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { TabList, tabPanelProps } from "../components/Tabs";
import { Share2, Sparkles } from "../components/icons";
import {
  DERIVED_ZIKR_BENEFITS,
  HADITH_DHIKR_EVIDENCE,
  QURAN_DHIKR_EVIDENCE,
  getBenefitEvidence,
  localizeBenefitText,
  type BenefitEvidence,
  type BenefitSection,
  type DerivedBenefitGroup,
  type DerivedZikrBenefit,
} from "../content/zikrBenefits";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const BENEFITS_BATCH_SIZE = 15;
const SECTION_ORDER: readonly BenefitSection[] = ["quran", "hadith", "derived"];
const DERIVED_GROUP_ORDER: readonly DerivedBenefitGroup[] = [
  "forgiveness",
  "reward",
  "protection",
  "paradise",
  "heart",
];

export function buildWhatsAppBenefitUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function ShareLink({ language, label, message }: { language: AppLanguage; label: string; message: string }) {
  return (
    <a
      href={buildWhatsAppBenefitUrl(message)}
      target="_blank"
      rel="noreferrer"
      className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b6b5d] px-4 text-[0.875rem] font-black text-white transition-colors hover:bg-[#09594f] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      aria-label={t(language, "benefits.shareWhatsAppAria", { category: label })}
    >
      <Share2 size={17} aria-hidden="true" />
      {t(language, "benefits.shareWhatsApp")}
    </a>
  );
}

function EvidenceCard({ item, language }: { item: BenefitEvidence; language: AppLanguage }) {
  const title = localizeBenefitText(item.title, language);
  const text = item.kind === "quran" ? item.text.ar : localizeBenefitText(item.text, language);
  const meaning = item.kind === "quran" && language === "en" ? item.text.en : "";
  const source = localizeBenefitText(item.source, language);
  const shareMessage = [t(language, "benefits.shareHeading"), title, text, meaning, source]
    .filter(Boolean)
    .join("\n\n");

  return (
    <article className="flex flex-col rounded-3xl border border-border/50 bg-card p-5 text-start shadow-raised">
      <p className="text-[0.75rem] font-black text-primary">{t(language, `benefits.${item.kind}Badge`)}</p>
      <h2 className="mt-2 text-[1rem] font-black leading-7 text-foreground" dir="auto">
        {title}
      </h2>
      <p
        className={`mt-3 font-semibold text-foreground ${item.kind === "quran" ? "font-arabic text-[1.125rem] leading-9" : "text-[0.9375rem] leading-7"}`}
        dir={item.kind === "quran" ? "rtl" : "auto"}
      >
        {text}
      </p>
      {meaning && <p className="mt-2 text-[0.875rem] font-semibold leading-6 text-muted-foreground">{meaning}</p>}
      <p className="mt-3 text-[0.75rem] font-semibold leading-5 text-muted-foreground" dir="auto">
        <span className="font-black text-foreground">{t(language, "benefits.source")}: </span>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded underline decoration-primary/45 underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {source}
        </a>
      </p>
      <ShareLink language={language} label={title} message={shareMessage} />
    </article>
  );
}

function DerivedCard({ item, language }: { item: DerivedZikrBenefit; language: AppLanguage }) {
  const evidence = getBenefitEvidence(item.evidenceId);
  if (!evidence) return null;

  const zikr = localizeBenefitText(item.zikr, language);
  const benefit = localizeBenefitText(item.benefit, language);
  const source = localizeBenefitText(evidence.source, language);
  const shareMessage = [t(language, "benefits.shareHeading"), zikr, benefit, source].join("\n\n");

  return (
    <article className="flex flex-col rounded-3xl border border-border/50 bg-card p-5 text-start shadow-raised">
      <p className="text-[0.75rem] font-black text-primary" dir="auto">
        {zikr}
      </p>
      <h3 className="mt-2 text-[1rem] font-black leading-7 text-foreground" dir="auto">
        {benefit}
      </h3>
      <p className="mt-3 text-[0.75rem] font-semibold leading-5 text-muted-foreground" dir="auto">
        <span className="font-black text-foreground">{t(language, "benefits.derivedFrom")}: </span>
        <a
          href={evidence.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded underline decoration-primary/45 underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {source}
        </a>
      </p>
      <ShareLink language={language} label={zikr} message={shareMessage} />
    </article>
  );
}

export function BenefitsScreen({
  language,
  direction,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState<BenefitSection>("quran");
  const [visibleCount, setVisibleCount] = useState(BENEFITS_BATCH_SIZE);
  const evidenceItems = activeSection === "quran" ? QURAN_DHIKR_EVIDENCE : HADITH_DHIKR_EVIDENCE;
  const total = activeSection === "derived" ? DERIVED_ZIKR_BENEFITS.length : evidenceItems.length;
  const visibleEvidence = evidenceItems.slice(0, visibleCount);
  const visibleDerived = DERIVED_ZIKR_BENEFITS.slice(0, visibleCount);
  const tabs = useMemo(
    () =>
      SECTION_ORDER.map((section) => ({
        value: section,
        label: t(language, `benefits.${section}Tab`, {
          count: formatNumerals(
            section === "quran"
              ? QURAN_DHIKR_EVIDENCE.length
              : section === "hadith"
                ? HADITH_DHIKR_EVIDENCE.length
                : DERIVED_ZIKR_BENEFITS.length,
            language,
          ),
        }),
        testId: `benefits-tab-${section}`,
      })),
    [language],
  );

  useEffect(() => setVisibleCount(BENEFITS_BATCH_SIZE), [activeSection, language]);

  return (
    <ScreenContainer dir={direction} className="relative !pb-0" screenName={t(language, "benefits.title")}>
      <Header
        title={t(language, "benefits.title")}
        subtitle={t(language, "benefits.subtitle")}
        onBack={onBack}
        language={language}
      />

      <div
        role="region"
        aria-label={t(language, "benefits.title")}
        tabIndex={0}
        className="page-content-center min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-3 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        data-testid="benefits-scroll-region"
      >
        <div className="mb-4 flex items-start gap-3 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-start">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <Sparkles size={22} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-[0.9375rem] font-black text-foreground">{t(language, "benefits.reviewedHeading")}</h2>
            <p className="mt-1 text-[0.8125rem] font-semibold leading-6 text-muted-foreground">
              {t(language, "benefits.reviewedDescription")}
            </p>
          </div>
        </div>

        <TabList
          value={activeSection}
          onChange={setActiveSection}
          tabs={tabs}
          direction={direction}
          idPrefix="benefits"
          aria-label={t(language, "benefits.sectionsLabel")}
          className="mb-5 grid grid-cols-1 gap-2 rounded-3xl border border-border/50 bg-card/95 p-2 sm:grid-cols-3"
          itemClassName={(selected) =>
            `min-h-11 rounded-2xl px-3 py-2 text-[0.8125rem] font-black transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
              selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
            }`
          }
        />

        <section
          {...tabPanelProps("benefits", activeSection)}
          className="rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          data-testid={`benefits-panel-${activeSection}`}
        >
          <div className="mb-4 text-start">
            <h2 className="text-[1.125rem] font-black text-foreground">
              {t(language, `benefits.${activeSection}Heading`)}
            </h2>
            <p className="mt-1 text-[0.8125rem] font-semibold leading-6 text-muted-foreground">
              {t(language, `benefits.${activeSection}Description`)}
            </p>
          </div>

          {activeSection !== "derived" ? (
            <div className="grid gap-3.5 lg:grid-cols-2" data-testid="benefits-list">
              {visibleEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} language={language} />
              ))}
            </div>
          ) : (
            <div data-testid="benefits-list" className="space-y-6">
              {DERIVED_GROUP_ORDER.map((group) => {
                const items = visibleDerived.filter((item) => item.group === group);
                if (items.length === 0) return null;
                return (
                  <section key={group} aria-labelledby={`benefits-group-${group}`}>
                    <h3 id={`benefits-group-${group}`} className="mb-3 text-[0.9375rem] font-black text-primary">
                      {t(language, `benefits.group${group[0]!.toUpperCase()}${group.slice(1)}`)}
                    </h3>
                    <div className="grid gap-3.5 lg:grid-cols-2">
                      {items.map((item) => (
                        <DerivedCard key={item.id} item={item} language={language} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-center text-[0.75rem] font-semibold text-muted-foreground" aria-live="polite">
            {t(language, "benefits.showing", {
              visible: formatNumerals(Math.min(visibleCount, total), language),
              total: formatNumerals(total, language),
            })}
          </p>

          {visibleCount < total && (
            <button
              type="button"
              onClick={() => setVisibleCount((current) => Math.min(current + BENEFITS_BATCH_SIZE, total))}
              className="mx-auto mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-5 text-[0.875rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              data-testid="benefits-load-more"
            >
              {t(language, "benefits.loadMore", {
                count: formatNumerals(Math.min(BENEFITS_BATCH_SIZE, total - visibleCount), language),
              })}
            </button>
          )}
        </section>
      </div>
    </ScreenContainer>
  );
}
