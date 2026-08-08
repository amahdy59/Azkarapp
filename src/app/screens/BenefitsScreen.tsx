/* The scroll region is intentionally keyboard-focusable so Page Down/arrow
   scrolling works before a user reaches its first link. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { Share2, Sparkles } from "../components/icons";
import { ALL_AZKAR, getAzkarByCategory, registerLazyCollection } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);

const BENEFITS_BATCH_SIZE = 20;

export function buildWhatsAppBenefitUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
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
  const isArabic = language === "ar";
  const benefits = useMemo(() => {
    const seen = new Set<string>();
    return [...ALL_AZKAR, ...getAzkarByCategory("comprehensive_duas")]
      .filter((zikr) => !zikr.isCollectionIntroduction)
      .flatMap((zikr) => {
        const benefit = getLocalizedZikrBenefit(zikr, language).trim();
        const source = getLocalizedSourceReference(zikr, language).trim();
        const identity = `${benefit}\u0000${source}`;
        if (!benefit || seen.has(identity)) return [];
        seen.add(identity);
        return [{ zikr, benefit, source }];
      });
  }, [language]);
  const [visibleCount, setVisibleCount] = useState(BENEFITS_BATCH_SIZE);
  const visibleBenefits = benefits.slice(0, visibleCount);

  useEffect(() => setVisibleCount(BENEFITS_BATCH_SIZE), [language]);

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

        <div className="grid gap-3.5 lg:grid-cols-2" data-testid="benefits-list">
          {visibleBenefits.map(({ zikr, benefit, source }) => {
            const category = CATEGORIES.find((item) => item.id === zikr.category)!;
            const categoryLabel = isArabic ? category.nameArabic : category.name;
            const shareMessage = [t(language, "benefits.shareHeading"), benefit, source].join("\n\n");
            return (
              <article
                key={`${zikr.id}-${benefit}`}
                className="flex flex-col rounded-3xl border border-border/50 bg-card p-5 text-start shadow-raised"
              >
                <p className="text-[0.75rem] font-black text-primary" dir="auto">
                  {categoryLabel}
                </p>
                <h2 className="mt-2 text-[1rem] font-black leading-7 text-foreground" dir="auto">
                  {benefit}
                </h2>
                <p className="mt-3 text-[0.75rem] font-semibold leading-5 text-muted-foreground" dir="auto">
                  <span className="font-black text-foreground">{t(language, "benefits.source")}: </span>
                  {source}
                </p>
                <a
                  href={buildWhatsAppBenefitUrl(shareMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#0b6b5d] px-4 text-[0.875rem] font-black text-white transition-colors hover:bg-[#09594f] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  aria-label={t(language, "benefits.shareWhatsAppAria", { category: categoryLabel })}
                >
                  <Share2 size={17} aria-hidden="true" />
                  {t(language, "benefits.shareWhatsApp")}
                </a>
              </article>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[0.75rem] font-semibold text-muted-foreground" aria-live="polite">
          {t(language, "benefits.showing", {
            visible: formatNumerals(visibleBenefits.length, language),
            total: formatNumerals(benefits.length, language),
          })}
        </p>

        {visibleCount < benefits.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((current) => Math.min(current + BENEFITS_BATCH_SIZE, benefits.length))}
            className="mx-auto mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-5 text-[0.875rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            data-testid="benefits-load-more"
          >
            {t(language, "benefits.loadMore", {
              count: formatNumerals(Math.min(BENEFITS_BATCH_SIZE, benefits.length - visibleCount), language),
            })}
          </button>
        )}
      </div>
    </ScreenContainer>
  );
}
