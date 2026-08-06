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

  const completedTitle = isArabic ? `أكملت ${categoryName}` : `Completed ${categoryName}`;
  const completedSubtitle = t(language, "home.completedSubtitle");
  const reviewLabel = t(language, "home.reviewAction", { name: categoryName });

  return (
    <section aria-label={completedTitle} className="mb-5">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Title & Subtitle */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-white" dir="auto">
            {completedTitle}
          </h2>
          <p className="text-[0.8125rem] font-normal text-white/70" dir="auto">
            {completedSubtitle}
          </p>
        </div>

        {/* Diamond Separator */}
        <div className="flex w-full items-center gap-3 opacity-60">
          <div className="h-px flex-1 bg-border-subtle" />
          <div className="flex items-center gap-1.5 text-primary">
            <span className="size-2 rotate-45 bg-primary" />
            <span className="size-2 rotate-45 bg-primary" />
          </div>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        {/* Quranic Quote Card */}
        <div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-center backdrop-blur-md">
          <p className="text-[0.9375rem] font-medium leading-relaxed text-white" dir="auto">
            «{isArabic ? todayQuote.arabic : todayQuote.english}»
          </p>
          <span className="text-[0.75rem] font-normal text-white/50" dir="auto">
            {todayQuote.reference}
          </span>
        </div>

        {/* Re-read Golden Button */}
        <button
          type="button"
          onClick={() => onReview(categoryId)}
          dir={direction}
          className="interactive-elem group flex h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[0.9375rem] font-bold text-primary-foreground shadow-lg hover:bg-amber-400 active:scale-[0.99] transition-all"
          aria-label={reviewLabel}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span className="font-sans">{reviewLabel}</span>
        </button>
      </div>
    </section>
  );
}
