/* The scroll region is intentionally keyboard-focusable so Page Down/arrow
   scrolling works before a user reaches its first link. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { TabList, tabPanelProps } from "../components/Tabs";
import { Share2 } from "../components/icons";
import {
  HADITH_DHIKR_EVIDENCE,
  QURAN_DHIKR_EVIDENCE,
  localizeBenefitText,
  type BenefitEvidence,
} from "../content/zikrBenefits";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const BENEFITS_BATCH_SIZE = 15;
type BenefitsView = "quran" | "hadith";
const SECTION_ORDER: readonly BenefitsView[] = ["quran", "hadith"];

export function buildWhatsAppBenefitUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

const QURAN_SURAH_NAMES: Readonly<Record<number, { ar: string; en: string }>> = {
  2: { ar: "البقرة", en: "Al-Baqarah" },
  3: { ar: "آل عمران", en: "Ali 'Imran" },
  8: { ar: "الأنفال", en: "Al-Anfal" },
  13: { ar: "الرعد", en: "Ar-Ra'd" },
  33: { ar: "الأحزاب", en: "Al-Ahzab" },
  62: { ar: "الجمعة", en: "Al-Jumu'ah" },
};

function quranCitation(item: BenefitEvidence, language: AppLanguage) {
  const [, surahValue, ayahValue] = item.id.split("-");
  const surah = Number(surahValue);
  const ayah = Number(ayahValue);
  const name = QURAN_SURAH_NAMES[surah]?.[language];
  if (!name || !Number.isFinite(ayah)) return localizeBenefitText(item.source, language);
  const reference = `${formatNumerals(surah, language)}:${formatNumerals(ayah, language)}`;
  return language === "ar" ? `سورة ${name} · ${reference}` : `Surah ${name} · ${reference}`;
}

function ShareLink({ language, label, message }: { language: AppLanguage; label: string; message: string }) {
  return (
    <a
      href={buildWhatsAppBenefitUrl(message)}
      target="_blank"
      rel="noreferrer"
      className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      aria-label={t(language, "benefits.shareWhatsAppAria", { category: label })}
      title={t(language, "benefits.shareWhatsApp")}
    >
      <Share2 size={18} aria-hidden="true" />
    </a>
  );
}

function EvidenceCard({ item, language }: { item: BenefitEvidence; language: AppLanguage }) {
  const title = localizeBenefitText(item.title, language);
  const text = item.kind === "quran" ? item.text.ar : localizeBenefitText(item.text, language);
  const meaning = item.kind === "quran" && language === "en" ? item.text.en : "";
  const source = item.kind === "quran" ? quranCitation(item, language) : localizeBenefitText(item.source, language);
  const shareMessage = [t(language, "benefits.shareHeading"), title, text, meaning, source]
    .filter(Boolean)
    .join("\n\n");

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-5 text-start shadow-raised sm:p-6">
      {item.kind === "hadith" && (
        <h2 className="text-[1rem] font-black leading-7 text-foreground" dir="auto">
          {title}
        </h2>
      )}
      <p
        className={`font-semibold text-foreground ${item.kind === "quran" ? "zikr-text text-[1.125rem] leading-[2.05]" : "mt-3 text-[0.9375rem] leading-7"}`}
        dir={item.kind === "quran" ? "rtl" : "auto"}
        lang={item.kind === "quran" ? "ar" : undefined}
      >
        {text}
      </p>
      {meaning && <p className="mt-3 text-[0.875rem] font-semibold leading-7 text-muted-foreground">{meaning}</p>}
      <footer className="mt-auto flex items-center justify-between gap-3 pt-4">
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 rounded text-[0.75rem] font-bold leading-5 text-muted-foreground underline decoration-primary/45 underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          dir="auto"
        >
          {source}
        </a>
        <ShareLink language={language} label={title} message={shareMessage} />
      </footer>
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
  const [activeSection, setActiveSection] = useState<BenefitsView>("quran");
  const [visibleCount, setVisibleCount] = useState(BENEFITS_BATCH_SIZE);
  const evidenceItems = activeSection === "quran" ? QURAN_DHIKR_EVIDENCE : HADITH_DHIKR_EVIDENCE;
  const total = evidenceItems.length;
  const visibleEvidence = evidenceItems.slice(0, visibleCount);
  const tabs = useMemo(
    () =>
      SECTION_ORDER.map((section) => ({
        value: section,
        label: t(language, `benefits.${section}Tab`, {
          count: formatNumerals(
            section === "quran" ? QURAN_DHIKR_EVIDENCE.length : HADITH_DHIKR_EVIDENCE.length,
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
        <TabList
          value={activeSection}
          onChange={setActiveSection}
          tabs={tabs}
          direction={direction}
          idPrefix="benefits"
          aria-label={t(language, "benefits.sectionsLabel")}
          className="mb-5 grid grid-cols-2 gap-2 rounded-3xl border border-border bg-card p-2"
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
          <div className="grid gap-3.5 lg:grid-cols-2" data-testid="benefits-list">
            {visibleEvidence.map((item) => (
              <EvidenceCard key={item.id} item={item} language={language} />
            ))}
          </div>

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
