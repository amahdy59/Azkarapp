import { FeatureCheck, WelcomeArtwork } from "./OnboardingBrand";

export function EnglishOnboarding1Screen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <div className="h-[360px] shrink-0">
        <WelcomeArtwork />
      </div>
      <div className="flex flex-1 flex-col items-center gap-7 px-6 pb-7 pt-5">
        <h1 className="text-center text-[1.75rem] font-extrabold leading-9 tracking-[-0.28px] text-foreground">
          Your Daily
          <br />
          Companion for Dhikr
        </h1>
        <div className="flex w-full flex-col gap-4">
          <FeatureCheck>Morning, evening &amp; sleep sessions</FeatureCheck>
          <FeatureCheck>Tap-to-count with haptic feedback</FeatureCheck>
          <FeatureCheck>Works fully offline</FeatureCheck>
        </div>
        <div className="flex-1" />
        <button
          data-testid="onboarding-get-started"
          onClick={onNext}
          className="h-[52px] w-full rounded-2xl border-2 border-white/10 bg-primary text-[1.0625rem] font-bold text-primary-foreground shadow-[inset_0_-2px_0_rgba(10,13,18,0.12)] transition-transform active:scale-[0.98]"
        >
          Get Started
        </button>
        <button onClick={onSkip} className="sr-only">
          Skip onboarding
        </button>
      </div>
    </div>
  );
}
