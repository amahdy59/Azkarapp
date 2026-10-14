import { PEER_TAB_SELECTED } from "../components/ui/controlStyles";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { QuranVerseText } from "../components/QuranVerseText";
/* The scroll region is intentionally keyboard-focusable so Page Down/arrow
   scrolling works before a user reaches its first link. */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { TabList, tabPanelProps } from "../components/Tabs";
import { Share2 } from "../components/icons";
import type { ShareItem } from "../share/shareLayout";
import {
  HADITH_DHIKR_EVIDENCE,
  QURAN_DHIKR_EVIDENCE,
  localizeBenefitText,
  type BenefitEvidence,
} from "../content/zikrBenefits";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const CollectionShareModal = lazy(() =>
  import("../components/CollectionShareModal").then((module) => ({ default: module.CollectionShareModal })),
);

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

export function benefitEvidenceToShareItem(item: BenefitEvidence, language: AppLanguage): ShareItem {
  const isQuran = item.kind === "quran";
  const title = localizeBenefitText(item.title, language);
  const text = isQuran ? item.text.ar : localizeBenefitText(item.text, language);
  const meaning = isQuran && language === "en" ? item.text.en : undefined;
  const source = isQuran ? quranCitation(item, language) : localizeBenefitText(item.source, language);

  return {
    id: item.id,
    canonicalKey: isQuran ? item.id : undefined,
    arabicText: text,
    quranText: isQuran,
    title: item.kind === "hadith" ? title : undefined,
    translation: meaning,
    sourceReference: source,
    readingUrl: item.sourceUrl,
    language,
  };
}

function EvidenceCard({
  item,
  language,
  onShare,
}: {
  item: BenefitEvidence;
  language: AppLanguage;
  onShare: (item: BenefitEvidence) => void;
}) {
  const title = localizeBenefitText(item.title, language);
  const text = item.kind === "quran" ? item.text.ar : localizeBenefitText(item.text, language);
  const meaning = item.kind === "quran" && language === "en" ? item.text.en : "";
  const source = item.kind === "quran" ? quranCitation(item, language) : localizeBenefitText(item.source, language);

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-5 text-start shadow-raised sm:p-6">
      {item.kind === "hadith" && (
        <h2 className="text-base font-black leading-7 text-foreground" dir="auto">
          {title}
        </h2>
      )}
      <p
        className={`font-semibold text-foreground ${item.kind === "quran" ? "zikr-text text-lg leading-[2.05]" : "mt-3 text-subtitle leading-7"}`}
        style={item.kind === "quran" ? QURAN_TEXT_STYLE : undefined}
        dir={item.kind === "quran" ? "rtl" : "auto"}
        lang={item.kind === "quran" ? "ar" : undefined}
      >
        {item.kind === "quran" ? <QuranVerseText text={text} language={language} canonicalKey={item.id} /> : text}
      </p>
      {meaning && <p className="mt-3 text-sm font-semibold leading-7 text-muted-foreground">{meaning}</p>}
      <footer className="mt-auto flex items-center justify-between gap-3 pt-4">
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 rounded text-xs font-bold leading-5 text-muted-foreground underline decoration-primary/45 underline-offset-4 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          dir="auto"
        >
          {source}
        </a>
        <button
          type="button"
          onClick={() => onShare(item)}
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          aria-label={t(language, "benefits.shareBenefitAria", { category: title })}
          title={t(language, "benefits.shareBenefit")}
        >
          <Share2 size={18} aria-hidden="true" />
        </button>
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
  const [sharingEvidence, setSharingEvidence] = useState<BenefitEvidence | null>(null);
  const [sharingAllTab, setSharingAllTab] = useState(false);
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
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col min-h-screen">
        <Header
          pageGutters
          title={t(language, "benefits.title")}
          subtitle={t(language, "benefits.subtitle")}
          onBack={onBack}
          language={language}
        />

        {/* The filter sits outside the scroll region, not sticky inside it.
            Sticky put it in the same scroll box as the cards, which meant its
            background had to be stretched back over the region's gutters and its
            top padding to hide them — and both of those bleeds were measured
            against a 20px gutter the region only has on a phone. From the small
            tier up the gutter is 24px and the top padding was never covered at
            all, so cards surfaced in a strip above the filter and down both
            sides of it. A sibling of the scroll region cannot be scrolled over
            at any width, and needs no bleed to prove it. */}
        <div
          className="w-full shrink-0 px-page pb-3 pt-3 flex flex-wrap sm:flex-nowrap items-center gap-2"
          data-testid="benefits-filter-bar"
        >
          <div className="flex-1 min-w-0">
            <TabList
              value={activeSection}
              onChange={setActiveSection}
              tabs={tabs}
              direction={direction}
              idPrefix="benefits"
              aria-label={t(language, "benefits.sectionsLabel")}
              indicatorClassName="bg-primary/10"
              className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-card p-1"
              itemClassName={(selected) =>
                `min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  selected ? PEER_TAB_SELECTED : "text-muted-foreground hover:bg-muted"
                }`
              }
            />
          </div>
          <button
            type="button"
            data-testid="share-benefits-collection-button"
            onClick={() => setSharingAllTab(true)}
            className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-btn border border-border bg-card px-3 text-label font-bold text-foreground shadow-xs transition-[color,background-color,border-color,box-shadow,transform] hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label={t(language, "benefits.shareTabCollectionAria", {
              tab: t(language, `benefits.${activeSection}Tab`, { count: formatNumerals(total, language) }),
            })}
            title={t(language, "benefits.shareTabCollection")}
          >
            <Share2 size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t(language, "benefits.shareTabCollection")}</span>
          </button>
        </div>

        <div
          role="region"
          aria-label={t(language, "benefits.title")}
          tabIndex={0}
          className="w-full min-h-0 flex-1 overflow-y-auto px-page pb-8 pt-1 outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
          data-testid="benefits-scroll-region"
        >
          <section
            {...tabPanelProps("benefits", activeSection)}
            className="rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            data-testid={`benefits-panel-${activeSection}`}
          >
            <div className="grid gap-3.5 lg:grid-cols-2" data-testid="benefits-list">
              {visibleEvidence.map((item) => (
                <EvidenceCard key={item.id} item={item} language={language} onShare={(ev) => setSharingEvidence(ev)} />
              ))}
            </div>

            <p className="mt-4 text-center text-xs font-semibold text-muted-foreground" aria-live="polite">
              {t(language, "benefits.showing", {
                visible: formatNumerals(Math.min(visibleCount, total), language),
                total: formatNumerals(total, language),
              })}
            </p>

            {visibleCount < total && (
              <button
                type="button"
                onClick={() => setVisibleCount((current) => Math.min(current + BENEFITS_BATCH_SIZE, total))}
                className="mx-auto mt-3 flex min-h-11 items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-5 text-sm font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                data-testid="benefits-load-more"
              >
                {t(language, "benefits.loadMore", {
                  count: formatNumerals(Math.min(BENEFITS_BATCH_SIZE, total - visibleCount), language),
                })}
              </button>
            )}
          </section>
        </div>

        {(sharingEvidence || sharingAllTab) && (
          <Suspense fallback={null}>
            <CollectionShareModal
              open
              onClose={() => {
                setSharingEvidence(null);
                setSharingAllTab(false);
              }}
              single={Boolean(sharingEvidence)}
              collectionTitle={t(language, "benefits.title")}
              collectionTitleArabic="فضائل الذكر"
              collectionTitleEnglish="Virtues of Remembrance"
              collectionSubtitle={
                sharingEvidence
                  ? sharingEvidence.kind === "quran"
                    ? quranCitation(sharingEvidence, language)
                    : localizeBenefitText(sharingEvidence.source, language)
                  : t(language, `benefits.${activeSection}Heading`)
              }
              items={[]}
              shareItems={
                sharingEvidence
                  ? [benefitEvidenceToShareItem(sharingEvidence, language)]
                  : visibleEvidence.map((ev) => benefitEvidenceToShareItem(ev, language))
              }
              language={language}
            />
          </Suspense>
        )}
      </div>
    </ScreenContainer>
  );
}
