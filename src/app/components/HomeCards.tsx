import type { CSSProperties } from "react";
import { t } from "../i18n";
import type { DailyEvidence } from "../dailyEvidence";
import type { AppLanguage, RoutineMode } from "../types";
import { formatNumerals } from "../formatting";
import { Card } from "./Card";
import { ProductImage } from "./ProductImage";
import { SegmentedControl } from "./SegmentedControl";
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Clock, Sparkles, Heart, Sun, MoonStar, Moon } from "./icons";
import { HadithWeakChainBadge } from "./ZikrComponents";

export type HomeSavedSource = "main" | "comprehensive" | "friday";

export interface HomeSavedCardItem {
  id: string;
  categoryLabel: string;
  displayText: string;
  source: HomeSavedSource;
}

function DirectionArrow({
  direction,
  size = 18,
  className,
}: {
  direction: "ltr" | "rtl";
  size?: number;
  className?: string;
}) {
  return direction === "rtl" ? (
    <ArrowLeft size={size} className={`shrink-0${className ? ` ${className}` : ""}`} aria-hidden="true" />
  ) : (
    <ArrowRight size={size} className={`shrink-0${className ? ` ${className}` : ""}`} aria-hidden="true" />
  );
}

export function PrayerRoutineCard({
  language,
  direction,
  categoryId,
  categoryName,
  description,
  mode,
  showModeSelector = true,
  onModeChange,
  completedCount,
  totalCount,
  estimatedMinutes,
  showEstimate = true,
  ctaLabel,
  onOpen,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  categoryId?: string;
  categoryName: string;
  description: string;
  mode: RoutineMode;
  showModeSelector?: boolean;
  onModeChange: (mode: RoutineMode) => void;
  completedCount: number;
  totalCount: number;
  estimatedMinutes: number;
  showEstimate?: boolean;
  ctaLabel: string;
  onOpen: () => void;
}) {
  const progressId = "home-routine-progress";
  const progress = totalCount > 0 ? Math.min(1, Math.max(0, completedCount / totalCount)) : 0;

  // Determine icon based on categoryId
  let CategoryIcon = Sparkles;
  if (categoryId === "morning") CategoryIcon = Sun;
  else if (categoryId === "evening") CategoryIcon = MoonStar;
  else if (categoryId === "sleep") CategoryIcon = Moon;

  return (
    <section
      aria-labelledby="current-zikr-heading"
      data-testid="home-routine-card"
      className="flex h-full min-w-0 flex-col justify-between transition-colors"
    >
      <div className="hero-glass flex flex-1 flex-col gap-5 rounded-3xl px-5 py-6 text-start sm:px-6 sm:py-7 md:p-7">
        
        {/* Header Row: "It is time for" + Mode Selector */}
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-on-media-muted" dir="auto">
            <span>{t(language, "home.timeFor")}</span>
            <CategoryIcon className="size-5 text-on-media-accent" aria-hidden="true" />
          </div>
          <div className="w-fit min-w-[140px]">
            {showModeSelector && (
              <SegmentedControl
                value={mode}
                onChange={onModeChange}
                direction={direction}
                aria-label={t(language, "home.routineMode")}
                className="flex min-h-[42px] items-center rounded-[20px] border border-on-media/16 bg-black/35 p-1 backdrop-blur-md"
                itemClassName={(selected) =>
                  `flex min-h-[36px] flex-1 items-center justify-center rounded-2xl px-4 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    selected ? "bg-primary text-primary-foreground shadow-sm" : "text-on-media-muted hover:bg-on-media/8 hover:text-on-media"
                  }`
                }
                options={[
                  { value: "complete", label: t(language, "home.routineComplete") },
                  { value: "core", label: t(language, "home.routineAbbreviated") },
                ]}
              />
            )}
          </div>
        </div>

        {/* Titles */}
        <div className="flex w-full flex-col items-start gap-3 px-1 mt-2">
          <h2
            id="current-zikr-heading"
            className="block max-w-full truncate whitespace-nowrap text-[clamp(1.75rem,5vw,2.25rem)] font-black tracking-tight text-on-media-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-5xl"
            dir="auto"
            style={{ lineHeight: "1.25" }}
          >
            {categoryName}
          </h2>
          <p className="max-w-[52ch] text-sm font-semibold leading-7 text-on-media-muted" dir="auto">
            {description}
          </p>
        </div>

        <div className="flex-1" />

        {/* Progress & CTA */}
        {totalCount > 0 && (
          <div className="flex w-full flex-col gap-3 mt-4">
            <div
              id={progressId}
              className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm font-bold text-on-media"
              dir="auto"
            >
              {showEstimate ? (
                <span className="flex items-center gap-1.5 text-on-media-muted">
                  <Clock className="size-[16px] text-on-media-accent" aria-hidden="true" />
                  {t(language, "home.estimatedMinutes", {
                    count: formatNumerals(estimatedMinutes, language),
                  })}
                </span>
              ) : (
                <span />
              )}
              <span>
                {formatNumerals(completedCount, language)} {t(language, "home.ofSeparator")}{" "}
                {formatNumerals(totalCount, language)}
              </span>
            </div>

            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 shadow-inner"
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
              aria-labelledby={progressId}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          data-testid="home-primary-cta"
          aria-describedby={progressId}
          onClick={onOpen}
          className="group mt-3 flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 text-title font-black text-primary-foreground shadow-raised transition-transform hover:brightness-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>{ctaLabel}</span>
          <DirectionArrow direction={direction} size={20} className="transition-transform group-hover:scale-110" />
        </button>
      </div>
    </section>
  );
}

function SavedSourceIcon({ source }: { source: HomeSavedSource }) {
  if (source === "friday") return <BookOpen size={18} aria-hidden="true" />;
  if (source === "comprehensive") return <Sparkles size={18} aria-hidden="true" />;
  return <Bookmark size={18} className="fill-current" aria-hidden="true" />;
}

function savedSourceLabel(language: AppLanguage, source: HomeSavedSource) {
  if (source === "friday") return t(language, "home.savedSourceFriday");
  if (source === "comprehensive") return t(language, "home.savedSourceComprehensive");
  return t(language, "home.savedSourceMain");
}

export function SavedZikrCard({
  language,
  direction,
  count,
  items,
  loadingId,
  errorId,
  onOpenItem,
  onOpenLibrary,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  count: number;
  items: HomeSavedCardItem[];
  loadingId: string | null;
  errorId: string | null;
  onOpenItem: (id: string) => void;
  onOpenLibrary?: () => void;
}) {
  return (
    <Card
      as="section"
      elevation="flat"
      aria-labelledby="home-saved-heading"
      className="flex h-full flex-col"
      data-testid="home-saved-section"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-start">
          <p className="text-xs font-black uppercase tracking-wide text-primary">{t(language, "home.savedEyebrow")}</p>
          <h3 id="home-saved-heading" className="mt-1 text-lg font-black text-foreground">
            {t(language, "home.savedTitle")}
          </h3>
        </div>
        <span className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-primary/10 px-3 text-sm font-black text-primary">
          <span aria-hidden="true">{formatNumerals(count, language)}</span>
          <span className="sr-only">{t(language, "home.savedCount", { count: formatNumerals(count, language) })}</span>
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-2.5">
          {items.map((item) => {
            const sourceLabel = savedSourceLabel(language, item.source);
            const isLoading = loadingId === item.id;
            const spokenExcerpt =
              item.displayText.length > 72 ? `${item.displayText.slice(0, 72).trimEnd()}…` : item.displayText;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => onOpenItem(item.id)}
                  disabled={isLoading}
                  aria-busy={isLoading || undefined}
                  aria-label={t(language, "home.openSavedItem", {
                    source: sourceLabel,
                    category: item.categoryLabel,
                    text: spokenExcerpt,
                  })}
                  className="interactive-elem flex min-h-14 w-full items-center gap-3 rounded-2xl bg-muted/35 px-3 py-2.5 text-start transition-colors hover:bg-muted/65 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <SavedSourceIcon source={item.source} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-micro font-bold text-primary">
                      <span>{item.categoryLabel}</span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-micro">{sourceLabel}</span>
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-sm font-bold text-foreground ${
                        language === "ar" ? "zikr-text" : ""
                      }`}
                      dir="auto"
                      lang={language === "ar" ? "ar" : undefined}
                    >
                      {item.displayText}
                    </span>
                  </span>
                  <DirectionArrow direction={direction} size={17} />
                </button>
                {isLoading && (
                  <p role="status" className="mt-1 px-2 text-xs font-semibold text-muted-foreground">
                    {t(language, "home.savedLoading")}
                  </p>
                )}
                {errorId === item.id && (
                  <p role="alert" className="mt-1 px-2 text-xs font-semibold text-destructive">
                    {t(language, "home.savedError")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex min-h-[5.5rem] items-center gap-3 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 px-4 py-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
            <Heart size={20} />
          </div>
          <p className="text-start text-sm font-bold leading-snug text-muted-foreground">
            {t(language, "home.savedEmpty")}
          </p>
        </div>
      )}

      {onOpenLibrary && (
        <button
          type="button"
          onClick={onOpenLibrary}
          className="mt-auto flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-4 py-3 text-sm font-black text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {count > 0
            ? t(language, "home.openSavedCount", { count: formatNumerals(count, language) })
            : t(language, "home.browseAzkar")}
        </button>
      )}
    </Card>
  );
}

export function FridayHomeCard({
  language,
  direction,
  expanded,
  status,
  onOpen,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  expanded: boolean;
  status: "start" | "continue" | "review";
  onOpen?: () => void;
}) {
  const actionLabel = t(language, `home.friday${status[0]!.toUpperCase()}${status.slice(1)}`);

  if (!expanded) {
    return (
      <Card
        as="section"
        aria-labelledby="friday-card-heading"
        elevation="flat"
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <ProductImage name="mosque_prophet" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0 flex-1 text-start">
          <h3 id="friday-card-heading" className="text-lg font-black text-foreground">
            {t(language, "friday.title")}
          </h3>
          <p className="mt-1 max-w-[65ch] text-sm font-medium leading-6 text-muted-foreground">
            {t(language, "home.fridayCompactBody")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {actionLabel}
              <DirectionArrow direction={direction} />
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card as="section" aria-labelledby="friday-card-heading" className="overflow-hidden p-0">
      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[14rem_minmax(0,1fr)_19rem] xl:items-center">
        <div className="relative flex h-44 w-full items-center justify-center self-center overflow-hidden rounded-2xl border border-primary/20 bg-primary/10 text-primary sm:h-52 xl:h-48">
          <ProductImage name="mosque_prophet" className="absolute inset-0 h-full w-full object-cover" />
        </div>

        <div className="min-w-0 text-start">
          <p className="text-xs font-black uppercase tracking-wide text-primary">
            {t(language, "home.fridayWindowLabel")}
          </p>
          <h3 id="friday-card-heading" className="mt-1 text-xl font-black text-foreground md:text-2xl" dir="auto">
            {t(language, "home.kahfMerit")}
          </h3>
          <p className="mt-3 max-w-[62ch] text-sm font-medium leading-7 text-muted-foreground" dir="auto">
            {t(language, "friday.kahfHadith")}
          </p>
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-subtitle font-black text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:w-fit"
            >
              {actionLabel}
              <DirectionArrow direction={direction} />
            </button>
          )}
        </div>

        <div className="hidden w-full rounded-2xl bg-muted p-4 text-start md:block">
          <div>
            <h4 className="text-sm font-black text-foreground">{t(language, "home.fridayVirtues")}</h4>
            <ul className="mt-3 flex list-disc flex-col gap-2 ps-5 text-xs font-semibold leading-5 text-foreground">
              <li>{t(language, "home.fridayVirtueFajr")}</li>
              <li>{t(language, "home.fridayVirtueEarly")}</li>
              <li>{t(language, "home.fridayVirtueDua")}</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * One reviewed narration a day, with its grading and what the practice is for.
 *
 * The evidence already existed on every zikr and was only reachable by opening
 * one and then its reference sheet. The grading is not decoration here: a card
 * that showed a narration without saying who recorded and graded it would be
 * the only place in the app making a claim it could not support, so
 * {@link getDailyEvidence} will not return an entry that lacks one.
 */
export function DailyEvidenceCard({
  language,
  direction,
  evidence,
  onGlass = false,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  evidence: DailyEvidence;
  /**
   * Rendered over the hero photograph rather than on the page ground.
   *
   * Two things change together and must not drift apart: the surface becomes
   * `hero-glass`, which already carries the blur, the wash and the opaque
   * fallback for a reader who has asked for less transparency; and the text
   * moves to the `on-media` tokens, which are light in every theme because
   * the ground is a photograph rather than a theme colour. Glass without the
   * second half is the version that fails contrast.
   */
  onGlass?: boolean;
}) {
  const Surface = onGlass ? "section" : Card;
  const surfaceProps = onGlass
    ? { className: "hero-glass flex min-h-0 flex-1 flex-col gap-3 rounded-3xl p-5" }
    : { as: "section" as const, elevation: "flat" as const, className: "flex flex-col gap-3" };

  return (
    <Surface
      aria-labelledby="home-evidence-heading"
      data-testid="home-daily-evidence"
      dir={direction}
      {...surfaceProps}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
            onGlass ? "bg-white/15 text-on-media-accent" : "bg-primary/10 text-primary"
          }`}
          aria-hidden="true"
        >
          <BookOpen size={18} />
        </span>
        <h2
          id="home-evidence-heading"
          className={`text-subtitle font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}
        >
          {t(language, "home.dailyEvidence")}
        </h2>
      </div>

      {/* The narration leads, in the reader's language where one was reviewed.
          This card had been showing the Arabic to an English reader under an
          English heading — the reference sheet's own defect, one screen over.
          `lang` and `dir` follow the text that is actually rendered, and the
          Arabic face is only applied when the text is Arabic. */}
      <blockquote
        className={`text-title font-medium leading-[2] ${onGlass ? "text-on-media" : "text-foreground"} ${
          evidence.hadithInArabic ? "zikr-text" : ""
        }`}
        dir={evidence.hadithInArabic ? "rtl" : "ltr"}
        lang={evidence.hadithInArabic ? "ar" : "en"}
        data-testid="daily-evidence-hadith"
      >
        {evidence.hadith}
      </blockquote>

      <p
        className={`text-label leading-relaxed ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
        dir="auto"
      >
        {evidence.benefit}
      </p>

      <footer
        className={`mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-3 ${
          onGlass ? "border-white/15" : "border-border/40"
        }`}
      >
        <span
          className={`text-xs font-semibold ${onGlass ? "text-on-media-accent" : "text-primary/90"}`}
          dir="auto"
          data-testid="daily-evidence-grading"
        >
          {evidence.authenticity}
        </span>
        {evidence.authenticityLevel === "weak" && <HadithWeakChainBadge language={language} />}
        {evidence.sourceReference && (
          <span className={`text-xs ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`} dir="auto">
            {evidence.sourceReference}
          </span>
        )}
      </footer>
    </Surface>
  );
}
