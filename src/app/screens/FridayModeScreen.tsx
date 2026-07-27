import { useState } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import { Sparkles, BookOpen, Heart, CheckCircle2, RotateCcw } from "../components/icons";

export function FridayModeScreen({
  isArabic,
  direction,
  onBack,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  onBack: () => void;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const [salawatCount, setSalawatCount] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("azkarapp_salawat_friday_count");
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [surahKahfRead, setSurahKahfRead] = useState<boolean>(() => {
    try {
      return localStorage.getItem("azkarapp_surah_kahf_complete") === "true";
    } catch {
      return false;
    }
  });

  const handleIncrementSalawat = () => {
    const next = salawatCount + 1;
    setSalawatCount(next);
    try {
      localStorage.setItem("azkarapp_salawat_friday_count", next.toString());
    } catch {
      // ignore storage errors
    }
  };

  const handleResetSalawat = () => {
    setSalawatCount(0);
    try {
      localStorage.setItem("azkarapp_salawat_friday_count", "0");
    } catch {
      // ignore
    }
  };

  const handleToggleKahf = () => {
    const next = !surahKahfRead;
    setSurahKahfRead(next);
    try {
      localStorage.setItem("azkarapp_surah_kahf_complete", next ? "true" : "false");
    } catch {
      // ignore
    }
  };

  const milestones = [100, 500, 1000];

  return (
    <ScreenContainer dir={direction} className="px-0">
      <Header
        onBack={onBack}
        title={isArabic ? "فضائل يوم الجمعة" : "Friday Special Virtues"}
        subtitle={isArabic ? "الصلاة على النبي وسورة الكهف" : "Salawat & Surah Al-Kahf"}
      />

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4 space-y-6">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-start shadow-md dark:bg-amber-500/15">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-[1.125rem] font-black text-foreground">
                {isArabic ? "يوم الجمعة عيد الأسبوع" : "Blessed Friday Routine"}
              </h2>
              <p className="mt-0.5 text-[0.8125rem] font-semibold text-muted-foreground">
                {isArabic
                  ? "«إِنَّ مِنْ أَفْضَلِ أَيَّامِكُمْ يَوْمَ الْجُمُعَةِ، فَأَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِيهِ»"
                  : "Multiply prayers upon Prophet Muhammad ﷺ on Friday"}
              </p>
            </div>
          </div>
        </div>

        {/* Salawat Counter Card */}
        <section aria-labelledby="salawat-heading" className="rounded-3xl border border-border bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-rose-500 fill-rose-500/20" />
              <h3 id="salawat-heading" className="text-[1rem] font-black text-foreground">
                {isArabic ? "عداد الصلاة على النبي ﷺ" : "Salawat Counter ﷺ"}
              </h3>
            </div>
            {salawatCount > 0 && (
              <button
                type="button"
                onClick={handleResetSalawat}
                className="flex items-center gap-1 text-[0.75rem] font-extrabold text-muted-foreground hover:text-destructive transition-colors"
                aria-label={isArabic ? "إعادة تعيين العداد" : "Reset Counter"}
              >
                <RotateCcw size={14} />
                <span>{isArabic ? "تصفير" : "Reset"}</span>
              </button>
            )}
          </div>

          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground text-start">
            {isArabic
              ? "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ"
              : "Allahumma salli wa sallim 'ala Nabiyyina Muhammad"}
          </p>

          {/* Interactive Counter Circle Button */}
          <div className="my-6 flex justify-center">
            <button
              type="button"
              onClick={handleIncrementSalawat}
              aria-label={
                isArabic
                  ? `الصلاة على النبي. العداد الحالي: ${formatNumerals(salawatCount, language)}`
                  : `Salawat. Current count: ${salawatCount}`
              }
              className="group relative flex size-36 flex-col items-center justify-center rounded-full border-4 border-amber-500/80 bg-amber-500/10 shadow-xl active:scale-95 transition-all hover:bg-amber-500/20 dark:bg-amber-500/15"
            >
              <span className="text-[2.25rem] font-black text-amber-600 dark:text-amber-400">
                {formatNumerals(salawatCount, language)}
              </span>
              <span className="text-[0.75rem] font-black text-muted-foreground group-hover:text-foreground">
                {isArabic ? "اضغط للزيادة" : "Tap to Count"}
              </span>
            </button>
          </div>

          {/* Milestones Progress */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {milestones.map((target) => {
              const reached = salawatCount >= target;
              return (
                <div
                  key={target}
                  className={`rounded-2xl border p-2.5 transition-all ${
                    reached
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border/70 bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <span className="block text-[0.875rem] font-black">{formatNumerals(target, language)}</span>
                  <span className="block text-[0.6875rem] font-bold">
                    {reached ? (isArabic ? "مكتمل ✓" : "Done ✓") : isArabic ? "هدف" : "Target"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Surah Al-Kahf Card */}
        <section aria-labelledby="kahf-heading" className="rounded-3xl border border-border bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-amber-500" />
              <h3 id="kahf-heading" className="text-[1rem] font-black text-foreground">
                {isArabic ? "قراءة سورة الكهف" : "Surah Al-Kahf"}
              </h3>
            </div>

            <button
              type="button"
              onClick={handleToggleKahf}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.75rem] font-black transition-all ${
                surahKahfRead
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <CheckCircle2 size={15} />
              <span>
                {surahKahfRead ? (isArabic ? "تمت القراءة" : "Completed") : isArabic ? "تحديد كمكتمل" : "Mark Done"}
              </span>
            </button>
          </div>

          <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground text-start">
            {isArabic
              ? "«مَنْ قَرَأَ سُورَةَ الْكَهْفِ فِي يَوْمِ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ»"
              : "Whoever reads Surah Al-Kahf on Friday, a light will shine for him between the two Fridays."}
          </p>
        </section>
      </div>
    </ScreenContainer>
  );
}
