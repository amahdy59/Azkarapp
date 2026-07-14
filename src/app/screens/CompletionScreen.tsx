import { Check, Home, Share2, Sparkles } from "../components/icons";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import { formatNumerals, numeralFontFamily } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";

export function CompletionScreen({
  catId,
  sessionStart,
  currentStreak,
  onHome,
  language,
}: {
  catId: CategoryId;
  sessionStart: number;
  currentStreak: number;
  onHome: () => void;
  onRepeat: () => void;
  language: AppLanguage;
}) {
  const cat = CATEGORIES.find((item) => item.id === catId)!;
  const azkarCount = getAzkarByCategory(catId).length;
  const elapsedMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60_000));
  const isArabic = language === "ar";
  const stats = [
    { value: elapsedMin, suffix: isArabic ? " دقائق" : " min", label: isArabic ? "المدة" : "Duration" },
    { value: azkarCount, suffix: "", label: isArabic ? "الأذكار" : "Azkar" },
    { value: 100, suffix: "%", label: isArabic ? "المعدل" : "Completion" },
    { value: currentStreak, suffix: isArabic ? " أيام" : " days", label: isArabic ? "السلسلة" : "Streak" },
  ];

  const share = async () => {
    const text = isArabic ? `أتممت ${cat.nameArabic} — ما شاء الله!` : `I completed ${cat.name} — Masha’Allah!`;
    if (navigator.share) await navigator.share({ title: "Azkar", text });
    else await navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="completion-screen-enter flex h-full flex-col overflow-y-auto bg-background px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <p className="text-[13px] text-muted-foreground">
        {isArabic ? `جلسة ${cat.nameArabic} مكتملة` : `${cat.name} session complete`}
      </p>

      <div
        className="celebration-glow celebration-pop relative mx-auto mt-7 flex h-28 w-28 items-center justify-center rounded-full bg-primary"
        aria-hidden="true"
      >
        <Check size={48} className="text-primary-foreground" strokeWidth={2} />
        <Sparkles size={18} className="absolute -left-3 bottom-4 text-secondary" />
        <Sparkles size={16} className="absolute -right-3 top-3 text-primary" />
      </div>

      <h1 className="mt-8 text-[28px] font-extrabold leading-9 text-primary">
        {isArabic ? "ما شاء الله!" : "Masha’Allah!"}
      </h1>
      <p className="mt-2 text-[17px] font-semibold text-card-foreground">
        {isArabic ? `لقد أتممت ${cat.nameArabic}` : `You completed ${cat.name}`}
      </p>
      <p className="mt-2 text-[13px] text-muted-foreground">
        {isArabic ? "كل ذكر نور في قلبك" : "Every remembrance is a light in your heart"}
      </p>

      <section className="mt-8 grid grid-cols-2 gap-3" aria-label="Session summary">
        {stats.map(({ value, suffix, label }, index) => (
          <article
            key={label}
            className="summary-item-enter flex min-h-[94px] flex-col items-center justify-center rounded-2xl bg-card p-4"
            style={{ animationDelay: `${180 + index * 55}ms` }}
          >
            <p className="text-[25px] font-extrabold text-primary" style={{ fontFamily: numeralFontFamily(language) }}>
              {formatNumerals(value, language)}
              {suffix}
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      <p className="mt-auto pt-7 text-[11px] text-muted-foreground">
        {new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-US", { dateStyle: "long" }).format(new Date())}
      </p>
      <div className="mt-3 grid gap-3">
        <button
          type="button"
          onClick={onHome}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary font-bold text-primary-foreground transition-transform duration-150 active:scale-[0.98]"
        >
          <Home size={18} /> {isArabic ? "العودة للرئيسية" : "Return home"}
        </button>
        <button
          type="button"
          onClick={() => void share()}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border bg-card font-bold text-foreground transition-transform duration-150 active:scale-[0.98]"
        >
          <Share2 size={18} /> {isArabic ? "مشاركة التقدم" : "Share progress"}
        </button>
      </div>
    </div>
  );
}
