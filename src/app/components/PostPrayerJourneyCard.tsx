import { Card } from "./Card";
import { Check, BookOpen } from "./icons";
import type { PrayerName } from "../types";
import { hasPrayerSunnah } from "../content/prayerSunnah";

export function PostPrayerJourneyCard({
  direction,
  prayer,
  prayed,
  adhkarDone,
  sunnahDone,
  onOpenAdhkar,
  onGlass = false,
}: {
  direction: "ltr" | "rtl";
  prayer: PrayerName;
  prayed: boolean;
  adhkarDone: boolean;
  sunnahDone: boolean;
  onOpenAdhkar: () => void;
  onGlass?: boolean;
}) {
  const hasSunnah = hasPrayerSunnah(prayer);

  const Surface = onGlass ? "section" : Card;
  const surfaceProps = onGlass
    ? { className: "hero-glass flex min-h-0 flex-1 flex-col justify-between gap-5 rounded-3xl p-5 sm:p-6" }
    : {
        as: "section" as const,
        elevation: "flat" as const,
        className: "flex flex-col justify-between gap-5 p-5 sm:p-6 h-full",
      };

  const isRtl = direction === "rtl";

  return (
    <Surface dir={direction} {...surfaceProps}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={`text-xl font-black ${onGlass ? "text-on-media-accent" : "text-primary"}`}>
            {"رحلتك بعد الصلاة"}
          </h2>
          <p className={`mt-1 text-sm font-medium ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}>
            {"أكمل ما بعد الصلاة لنيل المزيد من الأجر"}
          </p>
        </div>
      </div>

      <div className="relative mb-2 mt-2">
        <div className="relative z-10 flex justify-between" dir={direction}>
          {/* Step 1: Prayer */}
          <div className="relative flex flex-1 flex-col items-center gap-2">
            <span className={`text-sm font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>١</span>
            <div
              className={`flex size-10 items-center justify-center rounded-full border-2 ${
                prayed
                  ? "border-[#22c55e] bg-[#22c55e] text-white"
                  : onGlass
                    ? "border-on-media/30 bg-transparent text-transparent"
                    : "border-muted-foreground/30 bg-transparent text-transparent"
              }`}
            >
              <Check size={20} className={prayed ? "opacity-100" : "opacity-0"} />
            </div>
            <div className="mt-1 text-center">
              <p className={`text-sm font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>{"الصلاة"}</p>
              <p className={`mt-0.5 text-xs ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}>
                {prayed ? "صليت في المسجد" : "أتمم الصلاة"}
              </p>
            </div>
            {/* Connecting line to next step */}
            <div
              className={`absolute top-8 ${isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"} -z-10 h-0.5 w-[calc(100%-2.5rem)] border-t-[2px] border-dashed ${onGlass ? "border-on-media/20" : "border-muted-foreground/20"}`}
            />
          </div>

          {/* Step 2: Adhkar */}
          <div className="relative flex flex-1 flex-col items-center gap-2">
            <span className={`text-sm font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>٢</span>
            <div
              className={`flex size-10 items-center justify-center rounded-full border-2 ${
                adhkarDone
                  ? "border-[#22c55e] bg-[#22c55e] text-white"
                  : prayed
                    ? onGlass
                      ? "border-on-media/60 bg-transparent"
                      : "border-primary bg-transparent"
                    : onGlass
                      ? "border-on-media/30 bg-transparent"
                      : "border-muted-foreground/30 bg-transparent"
              }`}
            >
              {adhkarDone && <Check size={20} />}
            </div>
            <div className="mt-1 text-center">
              <p className={`text-sm font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>
                {"أذكار ما بعد الصلاة"}
              </p>
              <p className={`mt-0.5 text-xs ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}>
                {adhkarDone ? "مكتملة" : "اقرأ أو استمع"}
              </p>
            </div>
            {/* Connecting line to next step */}
            {hasSunnah && (
              <div
                className={`absolute top-8 ${isRtl ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"} -z-10 h-0.5 w-[calc(100%-2.5rem)] border-t-[2px] border-dashed ${onGlass ? "border-on-media/20" : "border-muted-foreground/20"}`}
              />
            )}
          </div>

          {/* Step 3: Sunnah (Optional depending on prayer) */}
          {hasSunnah && (
            <div className="flex flex-1 flex-col items-center gap-2">
              <span className={`text-sm font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>٣</span>
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 ${
                  sunnahDone
                    ? "border-[#22c55e] bg-[#22c55e] text-white"
                    : adhkarDone
                      ? onGlass
                        ? "border-on-media/60 bg-transparent"
                        : "border-primary bg-transparent"
                      : onGlass
                        ? "border-on-media/30 bg-transparent"
                        : "border-muted-foreground/30 bg-transparent"
                }`}
              >
                {sunnahDone && <Check size={20} />}
              </div>
              <div className="mt-1 text-center">
                <p className={`text-sm font-bold ${onGlass ? "text-on-media" : "text-foreground"}`}>{"صلاة الراتبة"}</p>
                <p className={`mt-0.5 text-xs ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}>
                  {sunnahDone ? "مكتملة" : "صلّ إن أمكن"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {(!adhkarDone || (hasSunnah && !sunnahDone)) && (
        <button
          onClick={onOpenAdhkar}
          className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-subtitle font-black text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <BookOpen size={20} />
          {"افتح الأذكار"}
        </button>
      )}
    </Surface>
  );
}
