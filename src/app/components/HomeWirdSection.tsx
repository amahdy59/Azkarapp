import { BookOpen, Calendar, Check, ChevronNext, Info, MoonStar, Sunrise, Sunset } from "./icons";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, CategoryId } from "../types";
import type { GardenSummary } from "../progress";
import type { QuranWirdTile } from "./ProgressViews";
import "./home-wird.css";
import { useId, useState } from "react";

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
  const [showPalmInfo, setShowPalmInfo] = useState(false);
  const palmInfoId = useId();
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
          <button
            type="button"
            aria-label={t(language, "garden.explanationLabel")}
            aria-expanded={showPalmInfo}
            aria-controls={palmInfoId}
            onClick={() => setShowPalmInfo((value) => !value)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <Info size={18} aria-hidden="true" />
          </button>
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
      {showPalmInfo && (
        <div
          id={palmInfoId}
          role="tooltip"
          className="mb-3 rounded-xl border border-border bg-popover p-3 text-sm text-popover-foreground"
        >
          {t(language, "garden.explanationWithQuran")}
        </div>
      )}
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
            data-images={showImages ? "true" : "false"}
            className={`home-wird-tile ${showImages ? "home-wird-photo" : onGlass ? "hero-glass home-glass-surface" : "home-wird-solid"}`}
          >
            {showImages && (
              <img
                src={`${import.meta.env.BASE_URL}assets/cards/${image}`}
                alt=""
                loading="lazy"
                className="home-wird-photo-image"
              />
            )}
            <div
              className={`home-wird-caption ${showImages ? (onGlass ? "hero-glass home-glass-surface" : "home-wird-photo-solid") : ""}`}
            >
              <Icon size={28} className="home-wird-icon" aria-hidden="true" />
              <span className="text-base font-bold">{name}</span>
              <span className="text-sm home-wird-status">{status}</span>
              <span className="mt-1 flex items-center gap-2">
                {complete && <Check size={18} aria-hidden="true" />}
                <ChevronNext size={18} data-rtl-flip aria-hidden="true" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
