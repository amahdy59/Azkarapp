/* The scroll region is intentionally keyboard-focusable so Page Down/arrow
   scrolling works before a user reaches its first link. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { TabList, tabPanelProps } from "../components/Tabs";
import { Share2 } from "../components/icons";
import { localizeBenefitText } from "../content/zikrBenefits";
import {
  WIRD_EVIDENCE_BY_SECTION,
  WIRD_SECTION_ORDER,
  type WirdBenefitSection,
  type WirdEvidence,
} from "../content/wirdBenefits";
import { buildWhatsAppBenefitUrl } from "./BenefitsScreen";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const WIRD_BATCH_SIZE = 15;

function ShareLink({ language, label, message }: { language: AppLanguage; label: string; message: string }) {
  return (
    <a
      href={buildWhatsAppBenefitUrl(message)}
      target="_blank"
      rel="noreferrer"
      className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      aria-label={t(language, "benefits.shareWhatsAppAria", { category: label })}
      title={t(language, "benefits.shareWhatsApp")}
    >
      <Share2 size={17} aria-hidden="true" />
    </a>
  );
}

function WirdEvidenceCard({ item, language }: { item: WirdEvidence; language: AppLanguage }) {
  const title = localizeBenefitText(item.title, language);
  // Qur'an is always shown in Arabic; its English is a rendering of the meaning
  // beneath, never a replacement for the verse.
  const text = item.kind === "quran" ? item.text.ar : localizeBenefitText(item.text, language);
  const meaning = item.kind === "quran" && language === "en" ? item.text.en : "";
  const source = localizeBenefitText(item.source, language);
  const attribution = item.attribution ? localizeBenefitText(item.attribution, language) : "";
  const shareMessage = [t(language, "wirdBenefits.shareHeading"), title, text, meaning, attribution, source]
    .filter(Boolean)
    .join("\n\n");

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-5 text-start shadow-raised sm:p-6">
      {item.kind !== "quran" && (
        <h2 className="text-[1rem] font-black leading-7 text-foreground" dir="auto">
          {title}
        </h2>
      )}
      <p
        className={`font-semibold text-foreground ${
          item.kind === "quran" ? "zikr-text text-[1.125rem] leading-[2.05]" : "mt-3 text-[0.9375rem] leading-7"
        }`}
        dir={item.kind === "quran" ? "rtl" : "auto"}
        lang={item.kind === "quran" ? "ar" : undefined}
      >
        {text}
      </p>
      {meaning && <p className="mt-3 text-[0.875rem] font-semibold leading-7 text-muted-foreground">{meaning}</p>}
      {attribution && (
        <p className="mt-3 text-[0.8125rem] font-black text-primary" dir="auto">
          {attribution}
        </p>
      )}
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

export function WirdBenefitsScreen({
  language,
  direction,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState<WirdBenefitSection>("quran");
  const [visibleCount, setVisibleCount] = useState(WIRD_BATCH_SIZE);

  const evidenceItems = WIRD_EVIDENCE_BY_SECTION[activeSection];
  const total = evidenceItems.length;
  const visibleEvidence = evidenceItems.slice(0, visibleCount);

  const tabs = useMemo(
    () =>
      WIRD_SECTION_ORDER.map((section) => ({
        value: section,
        label: t(language, `wirdBenefits.${section}`),
      })),
    [language],
  );

  useEffect(() => setVisibleCount(WIRD_BATCH_SIZE), [activeSection, language]);

  return (
    <ScreenContainer dir={direction} className="relative !pb-0" screenName={t(language, "wirdBenefits.title")}>
      <Header
        title={t(language, "wirdBenefits.title")}
        subtitle={t(language, "wirdBenefits.subtitle")}
        onBack={onBack}
        language={language}
      />

      <div
        role="region"
        aria-label={t(language, "wirdBenefits.title")}
        tabIndex={0}
        className="page-content-center min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-3 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
        data-testid="wird-benefits-scroll-region"
      >
        {/* Same sticky treatment as the Zikr benefits index: the filter belongs
            to the scroll region, not to the first card, so it stays reachable
            after scrolling. */}
        <div
          className="sticky top-0 z-10 -mx-5 -mt-3 mb-5 bg-background px-5 pb-3 pt-3"
          data-testid="wird-benefits-filter-bar"
        >
          <TabList
            value={activeSection}
            onChange={setActiveSection}
            tabs={tabs}
            direction={direction}
            idPrefix="wird-benefits"
            aria-label={t(language, "wirdBenefits.sectionsLabel")}
            className="grid grid-cols-3 gap-2 rounded-3xl border border-border bg-card p-2"
            itemClassName={(selected) =>
              `min-h-11 rounded-2xl px-2 py-2 text-[0.8125rem] font-black transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                selected ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              }`
            }
          />
        </div>

        <section
          {...tabPanelProps("wird-benefits", activeSection)}
          className="rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          data-testid={`wird-benefits-panel-${activeSection}`}
        >
          <div className="grid gap-3.5 lg:grid-cols-2" data-testid="wird-benefits-list">
            {visibleEvidence.map((item) => (
              <WirdEvidenceCard key={item.id} item={item} language={language} />
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
              onClick={() => setVisibleCount((current) => Math.min(current + WIRD_BATCH_SIZE, total))}
              className="mx-auto mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-5 text-[0.875rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              data-testid="wird-benefits-load-more"
            >
              {t(language, "benefits.loadMore", {
                count: formatNumerals(Math.min(WIRD_BATCH_SIZE, total - visibleCount), language),
              })}
            </button>
          )}
        </section>
      </div>
    </ScreenContainer>
  );
}
