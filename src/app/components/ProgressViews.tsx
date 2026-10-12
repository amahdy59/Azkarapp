import React, { useState } from "react";
import { formatNumerals, formatRatio } from "../formatting";
import { t } from "../i18n";
import { HomeCard } from "./HomeCard";
import type { AppLanguage, CategoryId } from "../types";
import { type GardenSummary } from "../progress";
import { Check, Calendar, Sunrise, Sunset, MoonStar, Sparkles, BookOpen, Info, ChevronNext } from "./icons";

function isAr(language: AppLanguage) {
  return language === "ar";
}

type DayGroupCardStatus = "completed" | "pending";

export interface QuranWirdTile {
  progress: number;
  goal: number;
  complete: boolean;
  active: boolean;
  onPress: () => void;
  onToggleComplete?: () => void;
}

// ─── Rich Wird Category Card (glassmorphic home routine card) ────────────────
const WIRD_CARD_CONFIG = {
  morning: {
    subtitleKey: "progress.morningCardSubtitle",
    image: "assets/cards/wird-morning.jpg",
    badgeStyle: { backgroundColor: "#f59e0b", color: "#020617" },
    btnStyle: { backgroundColor: "#f59e0b", color: "#020617" },
  },
  evening: {
    subtitleKey: "progress.eveningCardSubtitle",
    image: "assets/cards/wird-evening.jpg",
    badgeStyle: { backgroundColor: "#6366f1", color: "#ffffff" },
    btnStyle: { backgroundColor: "#6366f1", color: "#ffffff" },
  },
  before_sleep: {
    subtitleKey: "progress.sleepCardSubtitle",
    image: "assets/cards/wird-sleep.jpg",
    badgeStyle: { backgroundColor: "#3b82f6", color: "#ffffff" },
    btnStyle: { backgroundColor: "#3b82f6", color: "#ffffff" },
  },
  quran: {
    subtitleKey: "progress.quranCardSubtitle",
    image: "assets/cards/wird-quran.jpg",
    badgeStyle: { backgroundColor: "#10b981", color: "#020617" },
    btnStyle: { backgroundColor: "#10b981", color: "#020617" },
  },
} as const;

function WirdCategoryCard({
  categoryKey,
  name,
  icon,
  status,
  completedLabel,
  pendingLabel,
  subtitle,
  ctaLabel,
  onPress,
  isRecommendedNow = false,
  recommendedLabel,
}: {
  categoryKey: keyof typeof WIRD_CARD_CONFIG;
  name: string;
  icon: React.ReactNode;
  status: DayGroupCardStatus;
  completedLabel: string;
  pendingLabel: string;
  subtitle: string;
  ctaLabel: string;
  onPress?: () => void;
  isRecommendedNow?: boolean;
  recommendedLabel?: string;
}) {
  const isCompleted = status === "completed";
  const statusLabel = isCompleted ? completedLabel : pendingLabel;
  const showRecommended = isRecommendedNow && !isCompleted && Boolean(recommendedLabel);
  const config = WIRD_CARD_CONFIG[categoryKey];
  const baseUrl = import.meta.env.BASE_URL || "/";
  const imageSrc = `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}${config.image}`;

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={showRecommended ? `${name} - ${recommendedLabel} - ${statusLabel}` : `${name} - ${statusLabel}`}
      data-recommended-now={showRecommended ? "true" : undefined}
      data-category={categoryKey}
      data-testid="wird-category-card"
      className={`hero-glass home-glass-surface group relative flex min-h-48 flex-col overflow-hidden rounded-3xl border border-white/20 p-4 text-start shadow-raised transition-all duration-standard ease-standard hover:border-white/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 sm:min-h-[13.5rem] lg:min-h-[14.5rem] ${
        isCompleted ? "ring-2 ring-success/60" : ""
      }`}
    >
      {/* Visual Background Photo */}
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-out group-hover:scale-105"
        loading="lazy"
      />
      {/* Translucent Glass Scrim & Ambient Overlay — inline style avoids generating new Tailwind gradient utilities */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, rgb(0 0 0 / 0.9) 0%, rgb(0 0 0 / 0.45) 50%, rgb(0 0 0 / 0.25) 100%)",
        }}
      />

      {/* Top row: badge icon & completion checkmark */}
      <div className="relative z-10 flex w-full items-center justify-between">
        <span
          style={config.badgeStyle}
          className="flex size-10 items-center justify-center rounded-2xl shadow-md"
          aria-hidden="true"
        >
          {icon}
        </span>

        {isCompleted && (
          <span
            className="flex size-7 items-center justify-center rounded-full bg-success text-success-foreground shadow-md"
            aria-hidden="true"
          >
            <Check size={14} strokeWidth={3} />
          </span>
        )}
      </div>

      {/* Content: name, subtitle, CTA */}
      <div className="relative z-10 mt-auto flex w-full flex-col items-start gap-1 pt-4">
        <p className="text-lg font-black leading-tight text-white drop-shadow-md" dir="auto">
          {name}
        </p>
        <p className="line-clamp-2 text-xs font-semibold leading-snug text-white/80 drop-shadow-sm" dir="auto">
          {subtitle}
        </p>
        <span
          style={!isCompleted ? config.btnStyle : undefined}
          className={`mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black shadow-md transition-opacity hover:opacity-95 ${
            isCompleted ? "bg-success text-success-foreground" : ""
          }`}
        >
          {isCompleted ? (
            <>
              <Check size={13} strokeWidth={3} aria-hidden="true" />
              {completedLabel}
            </>
          ) : (
            <>
              {ctaLabel}
              <span className="inline-block text-xs leading-none rtl:rotate-180" aria-hidden="true">
                →
              </span>
            </>
          )}
        </span>
      </div>
    </button>
  );
}

function MainDhikrGroupCard({
  name,
  icon,
  status,
  completedLabel,
  pendingLabel,
  onPress,
  compact = false,
  onMedia = true,
  isRecommendedNow = false,
  recommendedLabel,
  subItems,
}: {
  name: string;
  icon: React.ReactNode;
  status: DayGroupCardStatus;
  completedLabel: string;
  pendingLabel: string;
  onPress?: () => void;
  compact?: boolean;
  /**
   * Home stacks these over the hero photograph, so they use fixed white/black
   * overlays that stay legible on any image. Progress has no image behind it,
   * where those same overlays read as a stray pane of glass and ignore the
   * active theme. `false` swaps them for ordinary theme surfaces.
   */
  onMedia?: boolean;
  /**
   * The routine the hero above is already offering to start.
   *
   * Home shows that routine twice within one screen — as the hero's call to
   * action and again as a row here — and without a mark the two read as two
   * separate things to do rather than one. The row keeps its place, because
   * removing it would leave the day's checklist with a hole in it.
   */
  isRecommendedNow?: boolean;
  recommendedLabel?: string;
  subItems?: { id: string; name: string; isCompleted: boolean }[];
}) {
  const isCompleted = status === "completed";
  const statusLabel = isCompleted ? completedLabel : pendingLabel;
  const showRecommended = isRecommendedNow && !isCompleted && Boolean(recommendedLabel);

  return (
    <button
      type="button"
      onClick={onPress}
      className={`${onMedia ? "stagger-content" : ""} group relative flex w-full rounded-2xl border transition-[background-color,border-color] duration-standard focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
        compact
          ? onMedia
            ? "min-h-[6.5rem] items-center gap-3 px-4 py-4 text-start sm:min-h-[13rem] sm:flex-col sm:justify-between sm:gap-4 sm:px-4 sm:py-5 sm:text-center lg:min-h-[11.5rem] lg:gap-2.5 lg:px-2.5 lg:py-4 xl:min-h-[11.5rem] xl:gap-3 xl:px-4 xl:py-4"
            : "min-h-[4.5rem] items-center gap-3 px-3 py-2.5 text-start"
          : "min-h-[9.5rem] flex-col items-center justify-between px-3 py-4 text-center"
      } ${
        isCompleted
          ? onMedia
            ? "hero-glass home-glass-surface border-primary/55 bg-primary/20 text-on-media shadow-raised shadow-[0_0_15px_rgba(201,155,76,0.15)]"
            : "border-primary/55 bg-primary/10 text-foreground"
          : onMedia
            ? "hero-glass home-glass-surface border-white/20 text-on-media shadow-raised hover:border-white/40"
            : "border-border bg-background text-foreground hover:border-primary/45 hover:bg-muted"
      }`}
      // The recommendation is added to the name, never substituted for the
      // status: swapping them told a screen-reader user this routine was
      // suggested while withholding whether they had already done it.
      aria-label={showRecommended ? `${name} - ${recommendedLabel} - ${statusLabel}` : `${name} - ${statusLabel}`}
      data-recommended-now={showRecommended ? "true" : undefined}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-full transition-colors ${
          compact ? (onMedia ? "size-14 border sm:size-16 lg:size-13 xl:size-14" : "size-11 border") : "size-16 border"
        } ${
          isCompleted
            ? onMedia
              ? "border-success/60 bg-success/20 text-success"
              : "border-success/40 bg-success/15 text-success"
            : onMedia
              ? "border-white/20 bg-white/10 text-on-media-accent"
              : "border-border/70 bg-muted/40 text-primary"
        }`}
      >
        {icon}
      </div>

      <div
        className={`flex min-w-0 flex-1 flex-col ${compact ? (onMedia ? "items-start sm:items-center" : "items-start") : "w-full items-center"}`}
      >
        <span
          dir="auto"
          className={`text-base font-black leading-relaxed text-inherit ${
            compact ? (onMedia ? "sm:text-title lg:text-subtitle" : "") : "sm:text-title"
          }`}
        >
          {name}
        </span>
        <span
          dir="auto"
          /* 32px clear of the name. The column used to space every child
             equally, so this gap could not grow without shoving the
             after-prayer dots down with it. */
          className={`${compact && !onMedia ? "mt-0.5" : "mt-8"} inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
            isCompleted
              ? "bg-success text-success-foreground shadow-sm"
              : showRecommended
                ? "bg-primary text-primary-foreground shadow-sm"
                : onMedia
                  ? "border border-white/20 bg-on-media-surface/60 text-on-media-muted backdrop-blur-xs"
                  : "bg-muted text-muted-foreground"
          }`}
        >
          {showRecommended ? recommendedLabel : statusLabel}
        </span>

        {subItems && subItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1">
            {subItems.map((item) => (
              <span
                key={item.id}
                role="img"
                aria-label={item.name}
                className={`inline-flex h-1.5 w-4 rounded-full ${
                  item.isCompleted ? "bg-success" : onMedia ? "bg-white/30" : "bg-muted-foreground/45"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {!onMedia && <ChevronNext size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />}
      {isCompleted && onMedia ? (
        <span
          className="absolute end-3 top-3 flex size-6 items-center justify-center rounded-full border border-success bg-success text-success-foreground shadow-md sm:-end-1.5 sm:top-auto sm:bottom-3"
          aria-hidden="true"
        >
          <Check size={13} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// DAY VIEW (WIRD CARD & DAILY ROUTINE DASHBOARD)
// ────────────────────────────────────────────────────────────────────────────
export function ProgressDayView({
  summary,
  language,
  dynamicSubtitle,
  onSelectCategory,
  visibleCategoryIds,
  headingLevel = 2,
  recommendedCategoryId,
  onOpenWirdBenefits,
  quranWird,
  onMedia = true,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  dynamicSubtitle: string;
  onSelectCategory?: (categoryId: CategoryId) => void;
  /**
   * Restricts which routines are listed. Home shows only the three
   * time-of-day routines; after-prayer azkar are getting their own card, and
   * the Progress screen still lists all four. This is display-only — palm and
   * leaf progress keep counting every main collection.
   */
  visibleCategoryIds?: readonly CategoryId[];
  /** Home nests this card below its own section heading; Progress owns an h2. */
  headingLevel?: 2 | 3;
  /** The routine the surrounding screen is already offering to start. */
  recommendedCategoryId?: CategoryId;
  /** Opens the evidence for keeping a wird. Omitted where that route is unreachable. */
  onOpenWirdBenefits?: () => void;
  /** Home's fourth daily-wird item, derived from the existing Quran plan and history. */
  quranWird?: QuranWirdTile;
  /**
   * Home renders this over the hero image and reserves a fixed height so the
   * card cannot resize under the photograph as routines complete. Progress
   * sits on a plain surface and scrolls, so the reservation there is simply
   * empty space below the routines — roughly 150px of it.
   */
  onMedia?: boolean;
}) {
  const isArabic = isAr(language);
  const completedToday = summary.today.completedCategories;

  const allCategories = [
    {
      id: "morning" as const,
      name: t(language, "progress.morningAzkar"),
      icon: <Sunrise size={28} />,
    },
    {
      id: "evening" as const,
      name: t(language, "progress.eveningAzkar"),
      icon: <Sunset size={28} />,
    },
    {
      id: "before_sleep" as const,
      name: t(language, "progress.sleepAzkar"),
      icon: <MoonStar size={28} />,
    },
    {
      id: "after_prayer" as const,
      name: t(language, "progress.postPrayerAzkar"),
      icon: <Sparkles size={20} />,
    },
  ];

  const categories = visibleCategoryIds
    ? allCategories.filter((category) => visibleCategoryIds.includes(category.id))
    : allCategories;
  const isHomeSubset = visibleCategoryIds !== undefined;
  /* Glass chrome — the black wash, the white-on-photo text, the dark pills —
     belongs to the hero photograph, not to the three-routine subset. Progress
     asks for the same subset on a plain themed surface, and keying the chrome
     off the subset gave it a card that ignored the active theme and read as a
     black pane in every mode. `onMedia` is the question actually being asked. */
  const onGlass = isHomeSubset && onMedia;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  // Keep the semantic order stable. The RTL grid places Morning at the right
  // edge while preserving the same keyboard and assistive-technology order.
  const displayCategories = categories;
  const completedCount =
    categories.filter((category) => completedToday.includes(category.id)).length + (quranWird?.complete ? 1 : 0);
  const totalCount = categories.length + (quranWird ? 1 : 0);
  const [isWirdInfoOpen, setIsWirdInfoOpen] = useState(false);

  return (
    // h-full/flex-1 let Home stretch this card to the hero's height. On the
    // Progress screen the parent has no definite height, so both resolve to
    // auto and nothing changes there.
    <div
      className={`mx-auto flex w-full flex-col gap-4 fade-in ${
        isHomeSubset ? "max-w-none" : "max-w-[44rem] xl:max-w-[80rem]"
      } ${onGlass ? "flex-1 sm:min-h-[21rem] md:min-h-[22rem]" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <HomeCard onGlass={onGlass} className={`flex-col ${onGlass ? "flex-1" : ""}`}>
        <div
          className={
            onMedia
              ? "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              : "flex flex-wrap items-center justify-between gap-3"
          }
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {onGlass && isHomeSubset && (
                <Calendar size={22} className="text-on-media-accent shrink-0" aria-hidden="true" />
              )}
              <Heading
                data-testid="progress-primary-heading"
                className={`block max-w-full truncate whitespace-nowrap text-xl font-black tracking-tight sm:text-headline md:text-2xl ${
                  onGlass
                    ? "text-on-media-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    : isHomeSubset
                      ? // Off the photograph the gold has to come from the theme rather
                        // than the fixed on-media accent, which is the same colour in
                        // every mode because its ground is an image.
                        "text-primary"
                      : "text-foreground"
                }`}
                dir="auto"
              >
                {t(language, "progress.todayWird")}
              </Heading>
              {onMedia && (
                <div>
                  <button
                    type="button"
                    aria-expanded={isWirdInfoOpen}
                    aria-label={t(language, "garden.explanationLabel")}
                    onClick={() => setIsWirdInfoOpen((open) => !open)}
                    className={`flex size-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      onGlass
                        ? "text-on-media-muted hover:bg-on-media-surface/60 hover:text-on-media"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Info size={18} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
            {isHomeSubset && onGlass ? (
              <p className="mt-1 text-label font-semibold text-white/80 sm:text-sm" dir="auto">
                {t(language, "progress.todayWirdSubtitle")}
              </p>
            ) : !onGlass && onMedia ? (
              <p className="mt-1 text-label font-semibold text-muted-foreground sm:text-sm" dir="auto">
                {dynamicSubtitle}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-label font-black ${
                onGlass
                  ? "border-white/20 bg-on-media-surface/60 text-on-media"
                  : "border-border-control bg-muted text-foreground"
              }`}
            >
              {/* Isolated: a bare ratio between Arabic siblings gets reordered
                  by the bidi algorithm and starts reading as "3 / 0". */}
              <bdi>{formatRatio(completedCount, totalCount, language)}</bdi>
            </div>
            {onMedia && (
              <div
                data-testid="thimar-progress-badge"
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-label font-bold ${
                  onGlass
                    ? "border-white/20 bg-on-media-surface/60 text-on-media"
                    : "border-primary/30 bg-primary/10 text-primary"
                }`}
                title={t(language, "progress.todayThimarProgress", {
                  earned: formatNumerals(completedCount * 5, language),
                  total: formatNumerals(totalCount * 5, language),
                })}
              >
                <span aria-hidden="true">🌱</span>
                <bdi>
                  {t(language, "progress.todayThimarProgress", {
                    earned: formatNumerals(completedCount * 5, language),
                    total: formatNumerals(totalCount * 5, language),
                  })}
                </bdi>
              </div>
            )}
          </div>
        </div>

        {isWirdInfoOpen && (
          <div
            role="tooltip"
            className={`mt-3 w-full rounded-2xl border p-3 text-label font-semibold leading-6 shadow-xs ${
              onGlass
                ? "border-white/20 bg-on-media-surface/60 text-on-media backdrop-blur-md"
                : "border-border bg-popover text-popover-foreground"
            }`}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {t(language, quranWird ? "garden.explanationWithQuran" : "garden.explanation")}
          </div>
        )}

        <div
          className={`${onMedia ? "stagger-in" : ""} mt-5 grid grid-cols-1 gap-2.5 sm:mt-6 sm:gap-3 md:gap-4 ${
            !onMedia
              ? "sm:grid-cols-2"
              : isHomeSubset
                ? "sm:grid-cols-2 lg:grid-cols-4"
                : "sm:grid-cols-2 xl:grid-cols-4"
          }`}
        >
          {displayCategories.map((col) => {
            const isDone = completedToday.includes(col.id);
            const completedPrayers = summary.today.completedAfterPrayers ?? [];
            const subItems =
              col.id === "after_prayer"
                ? [
                    {
                      id: "fajr",
                      name: t(language, "notifications.fajr"),
                      isCompleted: completedPrayers.includes("fajr"),
                    },
                    {
                      id: "dhuhr",
                      name: t(language, "notifications.dhuhr"),
                      isCompleted: completedPrayers.includes("dhuhr"),
                    },
                    {
                      id: "asr",
                      name: t(language, "notifications.asr"),
                      isCompleted: completedPrayers.includes("asr"),
                    },
                    {
                      id: "maghrib",
                      name: t(language, "notifications.maghrib"),
                      isCompleted: completedPrayers.includes("maghrib"),
                    },
                    {
                      id: "isha",
                      name: t(language, "notifications.isha"),
                      isCompleted: completedPrayers.includes("isha"),
                    },
                  ]
                : undefined;

            // Home wird row: use immersive image card. Only morning/evening/before_sleep
            // appear in HOME_WIRD_CATEGORY_IDS so after_prayer has no entry, but
            // we guard with a key check so TypeScript is satisfied.
            if (isHomeSubset && onMedia && col.id in WIRD_CARD_CONFIG) {
              const cardKey = col.id as keyof typeof WIRD_CARD_CONFIG;
              const subtitleI18nKey = WIRD_CARD_CONFIG[cardKey].subtitleKey as Parameters<typeof t>[1];
              return (
                <WirdCategoryCard
                  key={col.id}
                  categoryKey={cardKey}
                  name={col.name}
                  icon={col.icon}
                  status={isDone ? "completed" : "pending"}
                  completedLabel={t(language, "progress.completed")}
                  pendingLabel={t(language, "progress.notCompleted")}
                  subtitle={t(language, subtitleI18nKey)}
                  ctaLabel={t(language, "progress.startNow")}
                  onPress={() => onSelectCategory?.(col.id)}
                  isRecommendedNow={col.id === recommendedCategoryId}
                  recommendedLabel={t(language, "progress.startNow")}
                />
              );
            }

            return (
              <MainDhikrGroupCard
                key={col.id}
                name={col.name}
                icon={<>{col.icon}</>}
                status={isDone ? "completed" : "pending"}
                completedLabel={t(language, "progress.completed")}
                pendingLabel={t(language, "progress.notCompleted")}
                onPress={() => onSelectCategory?.(col.id)}
                compact={Boolean(visibleCategoryIds)}
                onMedia={onMedia}
                isRecommendedNow={col.id === recommendedCategoryId}
                recommendedLabel={t(language, "progress.startNow")}
                subItems={subItems}
              />
            );
          })}

          {quranWird && isHomeSubset && onMedia ? (
            <WirdCategoryCard
              categoryKey="quran"
              name={t(language, "mushaf.wirdTitle")}
              icon={<BookOpen size={20} />}
              status={quranWird.complete ? "completed" : "pending"}
              completedLabel={t(language, "progress.completed")}
              pendingLabel={
                quranWird.active
                  ? t(language, "mushaf.wirdProgress", {
                      read: formatNumerals(quranWird.progress, language),
                      goal: formatNumerals(quranWird.goal, language),
                    })
                  : t(language, "mushaf.freeReadingActive")
              }
              subtitle={t(language, "progress.quranCardSubtitle")}
              ctaLabel={t(language, "progress.startNow")}
              onPress={quranWird.onPress}
            />
          ) : quranWird ? (
            <MainDhikrGroupCard
              name={t(language, "mushaf.wirdTitle")}
              icon={<BookOpen size={28} />}
              status={quranWird.complete ? "completed" : "pending"}
              completedLabel={t(language, "progress.completed")}
              pendingLabel={
                quranWird.active
                  ? isArabic
                    ? `${formatRatio(quranWird.progress, quranWird.goal, language)} صفحة`
                    : `${formatRatio(quranWird.progress, quranWird.goal, language)} pages`
                  : t(language, "mushaf.freeReadingActive")
              }
              onPress={quranWird.onPress}
              compact
              onMedia={onMedia}
            />
          ) : null}
        </div>

        {/* The card shows whether today's wird is done; this answers why it is
            worth doing at all. It sits with the routines rather than in a menu
            because that question tends to arrive while looking at an unfinished
            row. */}
        {onOpenWirdBenefits && (
          <button
            type="button"
            onClick={onOpenWirdBenefits}
            data-testid="open-wird-benefits"
            className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-label font-black transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
              onGlass
                ? "border-white/20 bg-on-media-surface/60 text-on-media backdrop-blur-md hover:border-white/40 hover:bg-on-media-surface/60"
                : "border-primary/35 bg-primary/10 text-primary hover:bg-primary/15"
            }`}
          >
            <BookOpen size={16} aria-hidden="true" />
            {t(language, "wirdBenefits.openCta")}
          </button>
        )}
      </HomeCard>
    </div>
  );
}

export { ProgressWeekView, ProgressMonthView, ProgressYearView } from "./ProgressPeriodViews";
