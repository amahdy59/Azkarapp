import { homeArtworkUrl } from "./azkar-backgrounds";
import { BookOpen, Calendar, Check, ChevronNext, Info, MoonStar, Sunrise, Sunset } from "./icons";
import { formatNumerals, formatRatio } from "../formatting";
import { THIMAR_PER_ROUTINE, TOTAL_DAILY_THIMAR } from "../oasis/oasisModel";
import { t } from "../i18n";
import type { AppLanguage, CategoryId } from "../types";
import type { GardenSummary } from "../progress";
import type { QuranWirdTile } from "./ProgressViews";
import "./home-wird.css";

const ROUTINES = [
  { id: "morning", label: "progress.morningAzkar", Icon: Sunrise, image: "wird-morning.jpg" },
  { id: "evening", label: "progress.eveningAzkar", Icon: Sunset, image: "wird-evening.jpg" },
  { id: "before_sleep", label: "progress.sleepAzkar", Icon: MoonStar, image: "wird-sleep.jpg" },
] as const;

/** Home-only presentation; all completion and reading actions remain owned by the screen. */
export function HomeWirdSection({
  summary,
  language,
  onSelectCategory,
  onOpenWirdBenefits,
  quranWird,
  recommendedCategoryId,
  showImages = false,
  onGlass = false,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  onSelectCategory: (category: CategoryId) => void;
  onOpenWirdBenefits?: () => void;
  quranWird: QuranWirdTile;
  showImages?: boolean;
  recommendedCategoryId?: CategoryId;
  onGlass?: boolean;
}) {
  const items = [
    ...ROUTINES.map(({ id, label, Icon, image }) => ({
      id,
      name: t(language, label),
      Icon,
      image,
      complete: summary.today.completedCategories.includes(id),
      status: t(
        language,
        summary.today.completedCategories.includes(id) ? "progress.completed" : "progress.notCompleted",
      ),
      onPress: () => onSelectCategory(id),
    })),
    {
      id: "quran",
      name: t(language, "mushaf.wirdTitle"),
      Icon: BookOpen,
      image: "wird-quran.jpg",
      complete: quranWird.complete,
      status: quranWird.active
        ? t(language, "mushaf.wirdProgress", {
            read: formatNumerals(quranWird.progress, language),
            goal: formatNumerals(quranWird.goal, language),
          })
        : t(language, "mushaf.freeReadingActive"),
      onPress: quranWird.onPress,
    },
  ];
  const completedCount = items.filter((item) => item.complete).length;
  return (
    <section
      data-testid="today-garden-card"
      className={`home-wird-section ${onGlass ? "home-glass-surface" : ""}`}
      aria-labelledby="home-wird-heading"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="home-wird-heading"
          data-testid="progress-primary-heading"
          className="flex items-center gap-2 text-xl font-bold"
        >
          <Calendar size={22} aria-hidden="true" />
          {t(language, "progress.todayWird")}
        </h2>
        {onOpenWirdBenefits && (
          <button
            type="button"
            data-testid="open-wird-benefits"
            onClick={onOpenWirdBenefits}
            className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Info size={20} aria-hidden="true" />
            {t(language, "wirdBenefits.openCta")}
          </button>
        )}
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-label font-semibold" data-testid="home-wird-summary">
        <span className="rounded-full border border-current/20 px-3 py-1.5">
          <span className="sr-only">
            {t(language, "prayerActions.completedCount", {
              count: formatNumerals(completedCount, language),
              total: formatNumerals(items.length, language),
            })}
          </span>
          <bdi aria-hidden="true">{formatRatio(completedCount, items.length, language)}</bdi>
        </span>
        <span className="rounded-full border border-current/20 px-3 py-1.5" data-testid="thimar-progress-badge">
          <span aria-hidden="true">🌱 </span>
          <bdi>
            {t(language, "progress.todayThimarProgress", {
              earned: formatNumerals(completedCount * THIMAR_PER_ROUTINE, language),
              total: formatNumerals(TOTAL_DAILY_THIMAR, language),
            })}
          </bdi>
        </span>
      </div>
      <div className="home-wird-grid">
        {items.map(({ id, name, Icon, image, complete, status, onPress }) => (
          <button
            key={id}
            type="button"
            onClick={onPress}
            aria-label={
              id === recommendedCategoryId && !complete
                ? `${name} - ${t(language, "progress.startNow")} - ${status}`
                : `${name} - ${status}`
            }
            data-recommended-now={id === recommendedCategoryId && !complete ? "true" : undefined}
            data-testid="wird-category-card"
            data-category={id}
            data-complete={complete ? "true" : undefined}
            data-images={showImages ? "true" : "false"}
            className={`home-wird-tile focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${showImages ? "home-wird-photo" : onGlass ? "hero-glass home-glass-surface" : "border border-border bg-card text-foreground"}`}
          >
            {showImages && (
              <picture>
                <source
                  type="image/avif"
                  srcSet={`${homeArtworkUrl(`assets/cards/${image.replace(".jpg", "-360.avif")}`)} 360w, ${homeArtworkUrl(`assets/cards/${image.replace(".jpg", "-720.avif")}`)} 720w`}
                  sizes="(min-width: 1280px) 240px, 50vw"
                />
                <source
                  type="image/webp"
                  srcSet={`${homeArtworkUrl(`assets/cards/${image.replace(".jpg", "-360.webp")}`)} 360w, ${homeArtworkUrl(`assets/cards/${image.replace(".jpg", "-720.webp")}`)} 720w`}
                  sizes="(min-width: 1280px) 240px, 50vw"
                />
                <img
                  src={`${import.meta.env.BASE_URL}assets/cards/${image.replace(".jpg", "-720.webp")}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                  className="home-wird-photo-image"
                />
              </picture>
            )}
            {complete && (
              <span className="home-wird-completed-badge" aria-hidden="true">
                <Check size={16} strokeWidth={3} />
              </span>
            )}
            <div
              className={`home-wird-caption ${showImages ? `home-wird-photo-caption ${onGlass ? "" : "home-wird-photo-solid"}` : ""}`}
            >
              <Icon
                size={28}
                className={onGlass || showImages ? "text-on-media-accent" : "text-primary"}
                aria-hidden="true"
              />
              <span className="flex w-full min-w-0 items-center justify-between gap-2">
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="text-base font-bold">{name}</span>
                  <span className="text-sm text-muted-foreground">{status}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2" aria-hidden="true">
                  <ChevronNext size={18} data-rtl-flip />
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
