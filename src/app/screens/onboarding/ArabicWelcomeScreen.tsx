import React from "react";
import { FeatureCheck, WelcomeArtwork } from "./OnboardingBrand";
import { t } from "../../i18n";
import { PreAppLayout } from "../../components/PreAppLayout";

export function ArabicWelcomeScreen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <PreAppLayout className="slide-in-from-right" contentClassName="pre-app-flow-centered relative" dir="rtl">
      <button
        data-testid="onboarding-skip"
        onClick={onSkip}
        className="absolute end-4 top-4 z-10 min-h-11 rounded-xl px-3 text-sm font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {t("ar", "onboarding.skip")}
      </button>
      <div className="h-[clamp(13rem,40dvh,20rem)] shrink-0">
        <WelcomeArtwork arabic />
      </div>
      <div className="arabic-ui flex flex-col items-center gap-5 px-6 pb-7 pt-4" lang="ar">
        <h1 className="text-center text-[1.625rem] font-bold leading-9 text-foreground">
          {t("ar", "onboarding.title")}
        </h1>
        <div className="flex w-full flex-col gap-3" data-testid="onboarding-feature-list">
          <FeatureCheck>{t("ar", "onboarding.feature1")}</FeatureCheck>
          <FeatureCheck>{t("ar", "onboarding.feature2")}</FeatureCheck>
          <FeatureCheck>{t("ar", "onboarding.feature3")}</FeatureCheck>
        </div>
        <button
          data-testid="onboarding-get-started"
          onClick={onNext}
          className="h-[52px] w-full rounded-2xl border-2 border-white/10 bg-primary text-base font-bold text-primary-foreground shadow-[inset_0_-2px_0_rgba(10,13,18,0.12)] transition-transform"
        >
          {t("ar", "onboarding.getStarted")}
        </button>
      </div>
    </PreAppLayout>
  );
}
