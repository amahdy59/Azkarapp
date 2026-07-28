import { useMemo } from "react";
import type { AppLanguage, CategoryId } from "../types";
import { CATEGORIES } from "../content/categories";
import { t } from "../i18n";

interface TranquilityCompletionCardProps {
  categoryId: CategoryId;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onReview: (category: CategoryId) => void;
}

const REFLECTION_QUOTES = [
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    english: "So remember Me; I will remember you. And be grateful to Me and do not deny Me. (Al-Baqarah: 152)",
    reference: "سورة البقرة: ١٥٢",
  },
  {
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    english: "Unquestionably, by the remembrance of Allah do hearts find rest. (Ar-Ra'd: 28)",
    reference: "سورة الرعد: ٢٨",
  },
  {
    arabic: "وَالذَّاكِرِينَ اللَّهَ كَثِيرًا وَالذَّاكِرَاتِ أَعَدَّ اللَّهُ لَهُم مَّغْفِرَةً وَأَجْرًا عَظِيمًا",
    english:
      "and the men who remember Allah often and the women who do so - Allah has prepared for them forgiveness and a great reward. (Al-Ahzab: 35)",
    reference: "سورة الأحزاب: ٣٥",
  },
  {
    arabic:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ النَّبِيُّ ﷺ: «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ»",
    english:
      "The Prophet ﷺ said: 'Two words are light on the tongue, heavy on the scale: Glory be to Allah and Praise Him, Glory be to Allah the Supreme.'",
    reference: "صحيح البخاري",
  },
];

export function TranquilityCompletionCard({
  categoryId,
  language,
  direction,
  onReview,
}: TranquilityCompletionCardProps) {
  const isArabic = language === "ar";
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const categoryName = isArabic ? (category?.nameArabic ?? "") : (category?.name ?? "");

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    );
    const quote = REFLECTION_QUOTES[dayOfYear % REFLECTION_QUOTES.length];
    return quote ?? REFLECTION_QUOTES[0]!;
  }, []);

  const completedTitle = t(language, "home.completedTitle", { name: categoryName });
  const completedSubtitle = t(language, "home.completedSubtitle");
  const reviewLabel = t(language, "home.reviewAction", { name: categoryName });

  return (
    <section aria-label={completedTitle} className="mb-4">
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/15 p-5 shadow-md transition-all dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-teal-950/30">
        {/* Subtle Decorative Mosque Arch Watermark */}
        <div className="pointer-events-none absolute -bottom-6 -end-6 opacity-10 dark:opacity-15" aria-hidden="true">
          <svg className="size-40 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L10 5H14L12 2ZM12 6C8 6 5 9 5 13V21H19V13C19 9 16 6 12 6ZM12 8C14.5 8 16.5 10 17 13H7C7.5 10 9.5 8 12 8ZM9 15H15V21H9V15Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col gap-4 text-start" dir={direction}>
          {/* Header Row: Mosque Icon + Acceptance Prayer */}
          <div className="flex items-start gap-3.5">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-[1.4rem] shadow-xs dark:bg-emerald-500/30"
              aria-hidden="true"
            >
              🕌
            </div>
            <div>
              <h2 className="text-[1.125rem] font-black tracking-wide text-emerald-950 dark:text-emerald-100">
                {completedTitle}
              </h2>
              <p className="mt-0.5 text-[0.8125rem] font-semibold leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
                {completedSubtitle}
              </p>
            </div>
          </div>

          {/* Daily Spiritual Reflection / Quote Card */}
          <div className="rounded-2xl border border-emerald-500/20 bg-background/60 p-3.5 backdrop-blur-xs dark:bg-slate-900/50">
            <div className="flex items-center gap-1.5 text-[0.75rem] font-extrabold text-emerald-700 dark:text-emerald-400">
              <span aria-hidden="true">✨</span>
              <span>{isArabic ? "نفحة من الذكر" : "Daily Spiritual Reflection"}</span>
            </div>
            <p className="mt-1.5 text-[0.875rem] font-bold leading-relaxed text-foreground">
              «{isArabic ? todayQuote.arabic : todayQuote.english}»
            </p>
            <span className="mt-1 block text-[0.75rem] font-semibold text-muted-foreground">
              — {todayQuote.reference}
            </span>
          </div>

          {/* Action Row: Review Button */}
          <div className="flex items-center justify-start pt-1">
            <button
              type="button"
              onClick={() => onReview(categoryId)}
              className="interactive-elem group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-2.5 text-[0.875rem] font-black text-emerald-950 hover:bg-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/30"
              aria-label={reviewLabel}
            >
              <span>{reviewLabel}</span>
              <span className="text-[1.125rem] leading-none transition-transform" aria-hidden="true">
                🔄
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
