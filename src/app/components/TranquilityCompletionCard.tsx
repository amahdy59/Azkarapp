import type { AppLanguage, CategoryId } from "../types";
import { CATEGORIES } from "../content/categories";
import { t } from "../i18n";
import { ArrowLeft, ArrowRight, Check } from "./icons";

interface TranquilityCompletionCardProps {
  categoryId: CategoryId;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onContinue: () => void;
  onReview: (category: CategoryId) => void;
}

export function TranquilityCompletionCard({
  categoryId,
  language,
  direction,
  onContinue,
  onReview,
}: TranquilityCompletionCardProps) {
  const isArabic = language === "ar";
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const categoryName = isArabic ? (category?.nameArabic ?? "") : (category?.name ?? "");

  const completedTitle = t(language, "completion.completedCategory", { category: categoryName });
  const completedSubtitle = t(language, "home.completedSubtitle");
  const continueLabel = t(language, "home.continueWird");
  const reviewLabel = t(language, "home.reviewAction", { name: categoryName });

  return (
    <section aria-label={completedTitle} className="w-full">
      <div className="flex flex-col items-center gap-5 rounded-[28px] border border-white/10 bg-black/30 px-5 py-6 text-center shadow-[0_24px_48px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:px-6 sm:py-7">
        <div className="flex size-24 items-center justify-center rounded-full bg-[#e2a84a] text-slate-950 shadow-[0_20px_35px_rgba(226,168,74,0.32)] sm:size-28">
          <Check size={34} strokeWidth={2.8} aria-hidden="true" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[1.75rem] font-black tracking-tight text-white sm:text-[1.95rem]" dir="auto">
            {completedTitle}
          </h2>
          <p className="max-w-[34ch] text-[0.9375rem] font-medium leading-7 text-white/80 sm:text-[1rem]" dir="auto">
            {completedSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinue}
          dir={direction}
          className="interactive-elem group flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[24px] bg-[#e2a84a] px-5 text-[1rem] font-black text-slate-950 shadow-[0_16px_30px_rgba(226,168,74,0.25)] transition-all hover:bg-[#e6b85f] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>{continueLabel}</span>
          {direction === "rtl" ? (
            <ArrowLeft
              size={20}
              className="shrink-0 transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
          ) : (
            <ArrowRight
              size={20}
              className="shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => onReview(categoryId)}
          className="inline-flex items-center gap-2 text-[0.9375rem] font-bold text-white/75 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={reviewLabel}
        >
          <span>{reviewLabel}</span>
        </button>
      </div>
    </section>
  );
}
