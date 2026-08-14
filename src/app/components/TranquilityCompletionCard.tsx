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
      className={`w-full transition-[opacity,transform] duration-500 ease-out ${
        isExiting ? "translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5 rounded-[28px] border border-white/10 bg-black/30 px-5 py-6 text-center shadow-[0_24px_48px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:px-6 sm:py-7">
        <div className="flex size-24 items-center justify-center rounded-full bg-[#e2a84a] text-slate-950 shadow-[0_20px_35px_rgba(226,168,74,0.32)] sm:size-28">
          <Check size={34} strokeWidth={2.8} aria-hidden="true" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[1.75rem] font-black tracking-tight text-on-media sm:text-[1.95rem]" dir="auto">
            {completedTitle}
          </h2>
          <p className="max-w-[34ch] text-[0.9375rem] font-medium leading-7 text-on-media-muted sm:text-[1rem]" dir="auto">
            {completedSubtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
