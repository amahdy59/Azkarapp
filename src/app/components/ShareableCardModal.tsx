import { useRef } from "react";
import { X, Share2 } from "../components/icons";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";

interface ShareableCardModalProps {
  palms: number;
  golden: number;
  green: number;
  dateStr: string;
  language: AppLanguage;
  onClose: () => void;
}

export function ShareableCardModal({ palms, golden, green, dateStr, language, onClose }: ShareableCardModalProps) {
  const isArabic = language === "ar";
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isArabic ? "إنجاز الأذكار اليومي" : "Daily Azkar Achievement",
          text: isArabic
            ? `تقبل الله منا ومنكم 🌴 أتممت حصني الروحي اليوم في تطبيق الأذكار!\nالنخيل: ${formatNumerals(palms, language)} | أوراق ذهبية: ${formatNumerals(golden, language)}`
            : `May Allah accept from us 🌴 Completed my daily Azkar routine!\nPalms: ${palms} | Golden Leaves: ${golden}`,
          url: window.location.origin,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback to clipboard copy
      const text = isArabic
        ? `تقبل الله منا ومنكم 🌴 أتممت حصني الروحي اليوم في تطبيق الأذكار!`
        : `Completed my daily Azkar routine!`;
      await navigator.clipboard.writeText(text);
      alert(isArabic ? "تم نسخ نص الإنجاز للحافظة!" : "Achievement text copied to clipboard!");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isArabic ? "بطاقة مشاركة الإنجاز" : "Share Achievement Card"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/30 bg-card p-6 shadow-2xl dark:border-white/10 dark:bg-[#18181B]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? "إغلاق" : "Close"}
          className="absolute top-4 left-4 z-10 flex size-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
        >
          <X size={18} />
        </button>

        {/* Shareable Card Content */}
        <div
          ref={cardRef}
          className="flex flex-col items-center rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent p-6 text-center shadow-inner dark:from-amber-500/20"
        >
          {/* Logo Badge */}
          <div className="flex items-center gap-2 text-[0.875rem] font-black tracking-wider text-amber-600 dark:text-amber-400">
            <span className="text-[1.25rem]">🌴</span>
            <span>{isArabic ? "تطبيق الأذكار" : "AzkarApp"}</span>
          </div>

          <p className="mt-4 text-[1.125rem] font-black leading-snug text-foreground">
            {isArabic ? "تقبل الله منا ومنكم" : "May Allah Accept Our Good Deeds"}
          </p>

          <p className="mt-1.5 text-[0.8125rem] font-semibold text-muted-foreground">
            {isArabic ? "أتممت حصني الروحي وأذكاري اليومية" : "Completed daily dhikr & remembrance routine"}
          </p>

          {/* Stats Badge Pill Row */}
          <div className="my-5 flex w-full items-center justify-around rounded-2xl border border-amber-500/30 bg-card/90 py-3 px-4 shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[1.25rem]">🌴</span>
              <span className="text-[0.9375rem] font-black text-amber-500">{formatNumerals(palms, language)}</span>
              <span className="text-[0.6875rem] font-bold text-muted-foreground">{isArabic ? "نخيل" : "Palms"}</span>
            </div>
            <span className="h-8 w-px bg-amber-500/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[1.25rem]">🍂</span>
              <span className="text-[0.9375rem] font-black text-amber-600 dark:text-amber-400">
                {formatNumerals(golden, language)}
              </span>
              <span className="text-[0.6875rem] font-bold text-muted-foreground">{isArabic ? "ذهبية" : "Golden"}</span>
            </div>
            <span className="h-8 w-px bg-amber-500/30" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[1.25rem]">🍃</span>
              <span className="text-[0.9375rem] font-black text-emerald-600 dark:text-emerald-400">
                {formatNumerals(green, language)}
              </span>
              <span className="text-[0.6875rem] font-bold text-muted-foreground">{isArabic ? "خضراء" : "Green"}</span>
            </div>
          </div>

          {/* Date Label */}
          <span className="text-[0.75rem] font-extrabold text-muted-foreground">{dateStr}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-[0.9375rem] font-black text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
          >
            <Share2 size={18} />
            <span>{isArabic ? "مشاركة الإنجاز" : "Share Milestone"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
