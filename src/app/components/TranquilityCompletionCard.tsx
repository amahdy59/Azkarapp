import type { AppLanguage, CategoryId } from "../types";
import { CATEGORIES } from "../content/categories";
import { t } from "../i18n";
import { Check } from "./icons";

interface TranquilityCompletionCardProps {
  categoryId: CategoryId;
  language: AppLanguage;
  isExiting?: boolean;
}

export function TranquilityCompletionCard({ categoryId, language, isExiting = false }: TranquilityCompletionCardProps) {
  const isArabic = language === "ar";
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const categoryName = isArabic ? (category?.nameArabic ?? "") : (category?.name ?? "");

  const completedTitle = t(language, "completion.completedCategory", { category: categoryName });
  const completedSubtitle = t(language, "home.completedSubtitle");

  return (
    <section
      role="status"
      aria-label={completedTitle}
      aria-live="polite"
      className={`tranquility-completion grid w-full ${isExiting ? "is-exiting" : "is-entering"}`}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="hero-glass tranquility-completion-card flex flex-col items-center gap-5 rounded-3xl px-5 py-6 text-center sm:px-6 sm:py-7">
          <div className="tranquility-completion-icon flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_20px_35px_color-mix(in_srgb,var(--primary)_32%,transparent)] sm:size-28">
            <Check size={34} strokeWidth={2.8} aria-hidden="true" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2
              className="tranquility-completion-title text-[1.75rem] font-black tracking-tight text-on-media sm:text-[1.95rem]"
              dir="auto"
            >
              {completedTitle}
            </h2>
            <p
              className="tranquility-completion-subtitle max-w-[34ch] text-[0.9375rem] font-medium leading-7 text-on-media-muted sm:text-[1rem]"
              dir="auto"
            >
              {completedSubtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
