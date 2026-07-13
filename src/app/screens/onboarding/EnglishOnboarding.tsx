import React from "react";

export function StepDots({ active, total = 3 }: { active: number; total?: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Onboarding, step ${active + 1} of ${total}`} role="img">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300 bg-primary"
          style={{
            width: i === active ? 24 : 8,
            height: 8,
            opacity: i === active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function FeatureDot({ colorClass }: { colorClass: string }) {
  return <div aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 mt-[7px] ${colorClass}`} />;
}

export function FeatureItem({ text, colorClass }: { text: string; colorClass: string }) {
  return (
    <div className="flex gap-[10px] items-start w-full">
      <FeatureDot colorClass={colorClass} />
      <p className="text-[14px] text-foreground font-sans leading-[22px] flex-1 text-start">{text}</p>
    </div>
  );
}

export function OnboardCTA({
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button
        onClick={onPrimary}
        className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans"
      >
        {primary}
      </button>
      <button
        onClick={onSecondary}
        className="min-h-11 px-4 text-[15px] text-muted-foreground font-sans leading-[22px]"
      >
        {secondary}
      </button>
    </div>
  );
}

export function EnglishOnboarding1Screen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <div className="relative shrink-0 flex items-center justify-center overflow-hidden h-[360px] bg-background">
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" className="absolute">
          <circle cx="140" cy="140" r="140" fill="currentColor" className="text-primary" fillOpacity="0.12" />
        </svg>
        {[
          [-60, -30],
          [40, -50],
          [-20, 40],
        ].map(([dx, dy], i) => (
          <svg
            key={i}
            width="6"
            height="6"
            viewBox="0 0 6 6"
            fill="none"
            className="absolute text-primary"
            style={{ left: `calc(50% + ${dx}px)`, top: `calc(50% + ${dy}px)`, transform: "translate(-50%,-50%)" }}
          >
            <circle cx="3" cy="3" r="3" fill="currentColor" />
          </svg>
        ))}
        <div className="absolute w-[140px] h-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-y-0 right-0 left-[-50%]">
            <svg width="210" height="140" viewBox="0 0 210 140" fill="none">
              <circle cx="70" cy="70" r="70" fill="currentColor" className="text-primary" />
              <circle cx="140" cy="70" r="70" fill="currentColor" className="text-background" />
            </svg>
          </div>
        </div>
        <div className="absolute flex flex-col items-center gap-1.5 whitespace-nowrap top-[calc(50%+70px)] left-1/2 -translate-x-1/2">
          <p
            className="text-[44px] font-extrabold text-foreground leading-[48px]"
            style={{ fontFamily: "'Noto Sans Arabic', 'Inter', sans-serif" }}
            dir="auto"
          >
            {"\u0623\u0630\u0643\u0627\u0631"}
          </p>
          <p className="text-[13px] font-bold text-primary font-sans tracking-[1.04px]">AZKAR</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7 relative">
        <StepDots active={0} />
        <div className="text-center">
          <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px]">
            Your daily Islamic
            <br />
            remembrance
          </p>
        </div>
        <p className="text-center text-[14px] text-muted-foreground font-sans leading-[22px]">
          Authentic du&apos;as from Hisn al-Muslim
          <br />
          Morning, evening, and sleep adhkar
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Authentic du'as from Hisn al-Muslim" colorClass="bg-secondary" />
          <FeatureItem text="15 morning, 15 evening, 10 sleep adhkar" colorClass="bg-primary" />
          <FeatureItem text="Works offline - no internet needed" colorClass="bg-secondary" />
        </div>
        <div className="flex-1" />
        <OnboardCTA primary="Get started" secondary="Skip" onPrimary={onNext} onSecondary={onSkip} />
      </div>
    </div>
  );
}

export function EnglishOnboarding2Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const demoCount = 7;
  const demoTotal = 33;
  const size = 120;
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = demoCount / demoTotal;

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <div className="relative shrink-0 flex items-center justify-center h-[360px] bg-background">
        <div className="absolute flex flex-col items-center gap-1 top-[60px] left-[calc(50%-30px)] -translate-x-1/2">
          <div className="relative w-[28px] h-[28px]">
            <div className="absolute" style={{ inset: "-17.86% 0 0 -17.86%" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <circle cx="19" cy="19" r="14" fill="currentColor" className="text-primary" />
                <circle cx="12" cy="12" r="12" fill="currentColor" className="text-background" />
              </svg>
            </div>
          </div>
          <p className="text-[14px] font-semibold text-foreground font-sans leading-[20px] whitespace-nowrap">Azkar</p>
        </div>

        <div className="relative flex items-center justify-center w-[220px] h-[220px]">
          {[220, 180, 140].map((d, i) => (
            <svg
              key={i}
              width={d}
              height={d}
              viewBox={`0 0 ${d} ${d}`}
              fill="none"
              className="absolute text-primary"
              style={{ opacity: [0.08, 0.14, 0.2][i] }}
            >
              <circle cx={d / 2} cy={d / 2} r={d / 2 - 0.5} stroke="currentColor" />
            </svg>
          ))}

          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            className="absolute -rotate-90"
            aria-label={`${demoCount} of ${demoTotal}`}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="currentColor"
              className="text-card-foreground/30"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke="currentColor"
              className="text-primary"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
            />
          </svg>

          <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px]">
              {demoCount}
            </p>
            <p className="text-[14px] text-primary font-sans leading-[22px]">of {demoTotal}</p>
          </div>

          <div className="absolute flex items-center justify-center rounded-full px-3 py-1.5 bg-secondary text-secondary-foreground -top-[10px] -right-[10px]">
            <p className="text-[10px] font-bold font-sans leading-[14px] tracking-[0.4px]">+1</p>
          </div>
        </div>

        <p className="absolute text-[11px] font-bold text-primary font-sans tracking-[0.4px] top-[calc(50%-128px)] left-1/2 -translate-x-1/2 whitespace-nowrap">
          Tap Count
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7 relative">
        <StepDots active={1} />
        <div className="text-center">
          <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px]">
            Count Every
            <br />
            Remembrance
          </p>
        </div>
        <p className="text-center text-[14px] text-muted-foreground font-sans leading-[22px]">
          Tap the counter to keep your place. You can also use haptic feedback on each tap.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Auto-advances when the count is complete" colorClass="bg-primary" />
          <FeatureItem text="Your progress is saved" colorClass="bg-secondary" />
          <FeatureItem text="Swipe or use Next and Back to move between adhkar" colorClass="bg-primary" />
        </div>
        <div className="flex-1" />
        <OnboardCTA primary="Next" secondary="Back" onPrimary={onNext} onSecondary={onBack} />
      </div>
    </div>
  );
}

export function EnglishOnboarding3Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <div className="relative shrink-0 flex items-center justify-center h-[360px] bg-background">
        <div className="absolute flex flex-col items-center gap-1 top-[58px] left-1/2 -translate-x-1/2">
          <div className="relative w-[28px] h-[28px]">
            <div className="absolute" style={{ inset: "-17.86% 0 0 -17.86%" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <circle cx="19" cy="19" r="14" fill="currentColor" className="text-primary" />
                <circle cx="12" cy="12" r="12" fill="currentColor" className="text-background" />
              </svg>
            </div>
          </div>
          <p className="text-[14px] font-semibold text-foreground font-sans leading-[20px] whitespace-nowrap">Azkar</p>
        </div>

        <div className="absolute top-[118px] left-[calc(50%+60px)] text-primary">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <line x1="11" y1="2" x2="11" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="11" x2="20" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.4" y1="4.4" x2="17.6" y2="17.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="17.6" y1="4.4" x2="4.4" y2="17.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="relative flex items-center justify-center w-[232px] h-[168px]">
          <div className="absolute flex items-center justify-center rounded-xl w-[110px] h-[168px] bg-card border border-primary -rotate-3 left-1">
            <p className="zikr-text px-4 text-center text-[15px] font-bold leading-[28px] text-foreground" dir="rtl">
              {
                "\u0627\u0644\u0644\u064e\u0651\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e"
              }
            </p>
          </div>
          <div className="absolute flex items-center justify-center rounded-xl w-[110px] h-[168px] bg-card border border-primary rotate-3 right-1">
            <p className="zikr-text px-4 text-center text-[15px] font-bold leading-[28px] text-foreground" dir="rtl">
              {
                "\u0627\u0644\u0644\u064e\u0651\u0647\u064f\u0645\u064e\u0651 \u0625\u0650\u0646\u0650\u0651\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e"
              }
            </p>
          </div>
        </div>

        <div className="absolute flex items-center justify-center rounded-full px-3 py-2 bg-secondary text-secondary-foreground bottom-[46px]">
          <p className="text-[10px] font-bold font-sans tracking-[0.3px] whitespace-nowrap">
            Hisn al-Muslim · Authenticated
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7">
        <StepDots active={2} />
        <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px] text-center">
          Know the benefit
          <br />
          of every dhikr
        </p>
        <p className="text-center text-[14px] text-muted-foreground font-sans leading-[22px]">
          See the source, meaning, and reported virtue for each remembrance.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Source reference for every dhikr" colorClass="bg-primary" />
          <FeatureItem text="Meaning and virtue explained" colorClass="bg-secondary" />
          <FeatureItem text="Arabic RTL and dark mode support" colorClass="bg-primary" />
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans"
          >
            Start using Azkar
          </button>
          <p className="text-[14px] text-muted-foreground font-sans leading-[22px]">
            Already have an account? <span className="text-primary font-semibold">Sign in</span>
          </p>
        </div>
      </div>
    </div>
  );
}
