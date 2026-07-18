import React from "react";
import { FeatureCheck, WelcomeArtwork } from "./OnboardingBrand";

export function ArabicWelcomeScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex h-full flex-col bg-background slide-in-from-right" dir="rtl">
      <div className="h-[320px] shrink-0">
        <WelcomeArtwork arabic />
      </div>
      <div
        className="flex flex-1 flex-col items-center gap-7 px-6 pb-7 pt-5"
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
      >
        <h1 className="text-center text-[1.625rem] font-bold leading-9 text-foreground">رفيقك اليومي للذكر</h1>
        <div className="flex w-full flex-col gap-4">
          <FeatureCheck>أذكار الصباح والمساء والنوم بتصميم مريح</FeatureCheck>
          <FeatureCheck>عدّاد تفاعلي بلمسة واحدة مع اهتزاز تفاعلي</FeatureCheck>
          <FeatureCheck>تصفّح كامل الأذكار دون الحاجة للاتصال بالإنترنت</FeatureCheck>
        </div>
        <div className="flex-1" />
        <button
          data-testid="onboarding-get-started"
          onClick={onNext}
          className="h-[52px] w-full rounded-2xl border-2 border-white/10 bg-primary text-[1rem] font-bold text-primary-foreground shadow-[inset_0_-2px_0_rgba(10,13,18,0.12)] transition-transform active:scale-[0.98]"
        >
          ابدأ الآن
        </button>
        <button onClick={onSkip} className="sr-only">
          تخطي
        </button>
      </div>
    </div>
  );
}
