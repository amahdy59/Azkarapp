import type { CSSProperties } from "react";
import { t } from "../i18n";
import type { AppLanguage, RoutineMode } from "../types";
import { formatNumerals } from "../formatting";
import { Card } from "./Card";
import { SegmentedControl } from "./SegmentedControl";
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Building, ChevronDown, Clock, Sparkles } from "./icons";

export type HomeSavedSource = "main" | "comprehensive" | "friday";

export interface HomeSavedCardItem {
  id: string;
  categoryLabel: string;
  displayText: string;
  source: HomeSavedSource;
}

function DirectionArrow({ direction, size = 18 }: { direction: "ltr" | "rtl"; size?: number }) {
  return direction === "rtl" ? (
    <ArrowLeft size={size} className="shrink-0" aria-hidden="true" />
  ) : (
    <ArrowRight size={size} className="shrink-0" aria-hidden="true" />
  );
}

export function PrayerRoutineCard({
  language,
  direction,
  nextPrayerName,
  nextPrayerTime24,
  nextPrayerTimeLabel,
  nextPrayerCountdown,
  categoryName,
  description,
  mode,
  onModeChange,
  completedCount,
  totalCount,
  estimatedMinutes,
  ctaLabel,
  onOpen,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  nextPrayerName: string;
  nextPrayerTime24: string;
  nextPrayerTimeLabel: string;
  nextPrayerCountdown: string;
  categoryName: string;
  description: string;
  mode: RoutineMode;
  onModeChange: (mode: RoutineMode) => void;
  completedCount: number;
  totalCount: number;
  estimatedMinutes: number;
  ctaLabel: string;
  onOpen: () => void;
}) {
  const isArabic = language === "ar";
  const progressId = "home-routine-progress";
  const modeHintId = "home-routine-mode-hint";
  const progress = totalCount > 0 ? Math.min(1, Math.max(0, completedCount / totalCount)) : 0;

  return (
    <section
      aria-labelledby="current-zikr-heading"
      className="flex flex-col justify-between transition-all lg:col-span-3"
    >
      <div className="flex flex-1 flex-col gap-4 rounded-[30px] border border-white/12 bg-black/24 px-5 pb-5 pt-6 text-start shadow-2xl backdrop-blur-lg md:p-6">
        <div className="flex w-full flex-col items-start gap-2 px-1">
          <div
            data-testid="next-prayer"
            className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] font-semibold leading-5 text-white/82"
          >
            <Clock className="size-[15px] shrink-0 text-on-media-accent" aria-hidden="true" />
            <span>{t(language, "home.nextPrayer")}</span>
            <strong className="font-extrabold text-white" dir="auto">
              {nextPrayerName}
            </strong>
            <span className="text-white/45" aria-hidden="true">
              •
            </span>
            <time data-testid="next-prayer-time" className="font-extrabold text-white" dateTime={nextPrayerTime24}>
              {nextPrayerTimeLabel}
            </time>
            <span className="rounded-full bg-white/10 px-2 py-0.5 font-bold text-on-media-accent" dir="ltr">
              {nextPrayerCountdown}
            </span>
          </div>

          <h2
            id="current-zikr-heading"
            className="text-4xl font-black tracking-tight text-on-media-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-5xl"
            dir="auto"
            style={{ lineHeight: "1.25" }}
          >
            {categoryName}
          </h2>
          <p className="max-w-[52ch] text-[0.875rem] font-semibold leading-6 text-white/88" dir="auto">
            {description}
          </p>
        </div>

        <div>
          <SegmentedControl
            value={mode}
            onChange={onModeChange}
            direction={direction}
            aria-label={t(language, "home.routineMode")}
            aria-describedby={modeHintId}
            className="flex min-h-[48px] w-full items-center rounded-2xl border border-white/16 bg-black/45 p-1"
            itemClassName={(selected) =>
              `flex min-h-[44px] flex-1 items-center justify-center rounded-xl px-3 text-[0.875rem] font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                selected ? "bg-primary text-primary-foreground shadow-xs" : "text-white/95 hover:bg-white/8"
              }`
            }
            options={[
              { value: "complete", label: t(language, "home.routineComplete") },
              { value: "core", label: t(language, "home.routineAbbreviated") },
            ]}
          />
          <p id={modeHintId} className="mt-2 px-1 text-xs font-medium leading-5 text-white/72" dir="auto">
            {t(language, mode === "complete" ? "home.routineCompleteHint" : "home.routineAbbreviatedHint")}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="mt-1 flex w-full flex-col gap-2">
            <div
              id={progressId}
              className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[0.8125rem] font-bold text-on-media"
              dir="auto"
            >
              <span>
                {formatNumerals(completedCount, language)} {t(language, "home.ofSeparator")}{" "}
                {formatNumerals(totalCount, language)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-[14px] text-on-media-accent" aria-hidden="true" />
                {isArabic ? `${formatNumerals(estimatedMinutes, language)} دقائق تقريباً` : `~${estimatedMinutes} mins`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/30" aria-hidden="true">
              <div
                className={`h-full w-full rounded-full bg-primary transition-[transform] duration-500 ease-out ${
                  direction === "rtl" ? "origin-right" : "origin-left"
                }`}
                style={{ transform: `scaleX(${progress})` } as CSSProperties}
              />
            </div>
          </div>
        )}

        <button
          type="button"
          data-testid="home-primary-cta"
          aria-describedby={progressId}
          onClick={onOpen}
          className="group mt-2 flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 text-[1.0625rem] font-black text-primary-foreground shadow-lg transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>{ctaLabel}</span>
          <DirectionArrow direction={direction} size={20} />
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
          <p className="text-[0.75rem] font-black uppercase tracking-wide text-primary">
            {t(language, "home.savedEyebrow")}
          </p>
          <h2 id="home-saved-heading" className="mt-1 text-[1.125rem] font-black text-foreground">
            {t(language, "home.savedTitle")}
          </h2>
        </div>
        <span
          className="flex min-h-11 min-w-11 items-center justify-center rounded-2xl bg-primary/10 px-3 text-[0.875rem] font-black text-primary"
          aria-label={t(language, "home.savedCount", { count: formatNumerals(count, language) })}
        >
          {formatNumerals(count, language)}
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
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.6875rem] font-bold text-primary">
                      <span>{item.categoryLabel}</span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.625rem]">{sourceLabel}</span>
                    </span>
                    <span
                      className={`mt-0.5 block truncate text-[0.875rem] font-bold text-foreground ${
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
        <p className="mt-4 text-start text-[0.8125rem] font-semibold leading-6 text-muted-foreground">
          {t(language, "home.savedEmpty")}
        </p>
      )}

      {onOpenLibrary && (
        <button
          type="button"
          onClick={onOpenLibrary}
          className="mt-auto flex min-h-11 w-full items-center justify-center rounded-2xl border border-primary/35 bg-primary/10 px-4 py-3 text-[0.875rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
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
  canPreview,
  onTogglePreview,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  expanded: boolean;
  status: "start" | "continue" | "review";
  onOpen?: () => void;
  canPreview: boolean;
  onTogglePreview: () => void;
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
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building size={24} aria-hidden="true" />
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
          {canPreview && (
            <button
              type="button"
              onClick={onTogglePreview}
              className="min-h-11 rounded-2xl border border-border px-4 text-xs font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {t(language, "home.previewFriday")}
            </button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card as="section" aria-labelledby="friday-card-heading" className="overflow-hidden p-0">
      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[6rem_minmax(0,1fr)_19rem] xl:items-center">
        <div className="flex size-20 items-center justify-center self-center rounded-2xl bg-primary/12 text-primary sm:size-24">
          <Building size={40} aria-hidden="true" />
        </div>

        <div className="min-w-0 text-start">
          <p className="text-xs font-black uppercase tracking-wide text-primary">
            {t(language, "home.fridayWindowLabel")}
          </p>
          <h3 id="friday-card-heading" className="mt-1 text-xl font-black text-foreground md:text-2xl" dir="auto">
            {t(language, "home.kahfMerit")}
          </h3>
          <p className="mt-3 max-w-[62ch] text-[0.875rem] font-medium leading-7 text-muted-foreground" dir="auto">
            {t(language, "friday.kahfHadith")}
          </p>
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-[0.9375rem] font-black text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:w-fit"
            >
              {actionLabel}
              <DirectionArrow direction={direction} />
            </button>
          )}
        </div>

        <details className="group w-full rounded-2xl bg-muted/45 p-4 text-start">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl font-black text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            <span>{t(language, "home.fridayMoreVirtues")}</span>
            <ChevronDown
              className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ul className="mt-3 flex list-disc flex-col gap-2 ps-5 text-xs font-semibold leading-5 text-foreground">
            <li>{t(language, "home.fridayVirtueFajr")}</li>
            <li>{t(language, "home.fridayVirtueEarly")}</li>
            <li>{t(language, "home.fridayVirtueDua")}</li>
          </ul>
          <p className="mt-3 border-t border-border/60 pt-3 text-xs font-semibold leading-5 text-muted-foreground">
            {t(language, "home.fridayReadingSource")}
          </p>
        </details>
      </div>
      {canPreview && (
        <button
          type="button"
          onClick={onTogglePreview}
          className="mx-5 mb-5 min-h-11 rounded-2xl border border-border px-4 text-xs font-bold text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:mx-6 sm:mb-6"
        >
          {t(language, "home.hideFridayPreview")}
        </button>
      )}
    </Card>
  );
}
