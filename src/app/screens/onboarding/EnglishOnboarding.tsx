import React from "react";

export function StepDots({ active, total = 3 }: { active: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300 bg-primary"
          style={{
            width: i === active ? 24 : 8, height: 8,
            opacity: i === active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function FeatureDot({ colorClass }: { colorClass: string }) {
  return (
    <div className={`w-2 h-2 rounded-full shrink-0 mt-[7px] ${colorClass}`} />
  );
}

export function FeatureItem({ text, colorClass }: { text: string; colorClass: string }) {
  return (
    <div className="flex gap-[10px] items-start w-full">
      <FeatureDot colorClass={colorClass} />
      <p className="text-[14px] text-foreground font-sans leading-[22px] flex-1 text-start">
        {text}
      </p>
    </div>
  );
}

export function OnboardCTA({ primary, secondary, onPrimary, onSecondary }:
  { primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button onClick={onPrimary}
        className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans">
        {primary}
      </button>
      <button onClick={onSecondary}
        className="text-[14px] text-muted-foreground font-sans leading-[22px]">
        {secondary}
      </button>
    </div>
  );
}

export function EnglishOnboarding1Screen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <div className="relative shrink-0 flex items-center justify-center overflow-hidden h-[380px] bg-background">
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" className="absolute">
          <circle cx="140" cy="140" r="140" fill="currentColor" className="text-primary" fillOpacity="0.12" />
        </svg>
        {[[-60, -30], [40, -50], [-20, 40]].map(([dx, dy], i) => (
          <svg key={i} width="6" height="6" viewBox="0 0 6 6" fill="none"
            className="absolute text-primary" style={{ left: `calc(50% + ${dx}px)`, top: `calc(50% + ${dy}px)`, transform: "translate(-50%,-50%)" }}>
            <circle cx="3" cy="3" r="3" fill="currentColor" />
          </svg>
        ))}
        <div className="absolute w-[140px] h-[140px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-y-0 right-0 left-[-50%]">
            <svg width="210" height="140" viewBox="0 0 210 140" fill="none">
              <circle cx="70"  cy="70" r="70" fill="currentColor" className="text-primary" />
              <circle cx="140" cy="70" r="70" fill="currentColor" className="text-background" />
            </svg>
          </div>
        </div>
        <div className="absolute flex flex-col items-center gap-1.5 whitespace-nowrap top-[calc(50%+70px)] left-1/2 -translate-x-1/2">
          <p className="text-[44px] font-extrabold text-foreground leading-[48px]" style={{ fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif" }} dir="auto">
            أذكار
          </p>
          <p className="text-[13px] font-bold text-primary font-sans tracking-[1.04px]">
            AZKAR
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7 relative">
        <StepDots active={0} />
        <div className="text-center">
          <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px]">
            Your Daily Islamic<br />Remembrance
          </p>
        </div>
        <p className="text-center text-[14px] text-muted-foreground font-sans leading-[22px]">
          Morning · Evening · Before Sleep<br />
          Authentic azkar from Hisnul Muslim
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Authentic duas from Hisnul Muslim"        colorClass="bg-[#14B8A6]" />
          <FeatureItem text="15 morning, 15 evening, 10 sleep azkar"  colorClass="bg-primary" />
          <FeatureItem text="Works offline — no internet needed"       colorClass="bg-[#14B8A6]" />
        </div>
        <div className="flex-1" />
        <OnboardCTA primary="Get Started" secondary="Skip" onPrimary={onNext} onSecondary={onSkip} />
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
      <div className="relative shrink-0 flex items-center justify-center h-[380px] bg-background">
        <div className="absolute flex flex-col items-center gap-1 top-[60px] left-[calc(50%-30px)] -translate-x-1/2">
          <div className="relative w-[28px] h-[28px]">
            <div className="absolute" style={{ inset: "-17.86% 0 0 -17.86%" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <circle cx="19" cy="19" r="14" fill="currentColor" className="text-primary" />
                <circle cx="12" cy="12" r="12" fill="currentColor" className="text-background" />
              </svg>
            </div>
          </div>
          <p className="text-[14px] font-semibold text-foreground font-sans leading-[20px] whitespace-nowrap">
            Azkar
          </p>
        </div>

        <div className="relative flex items-center justify-center w-[220px] h-[220px]">
          {[220, 180, 140].map((d, i) => (
            <svg key={i} width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none"
              className="absolute text-primary" style={{ opacity: [0.08, 0.14, 0.2][i] }}>
              <circle cx={d/2} cy={d/2} r={d/2 - 0.5} stroke="currentColor" />
            </svg>
          ))}

          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className="absolute -rotate-90">
            <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" className="text-muted" strokeWidth="10" fill="none" />
            <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" className="text-primary" strokeWidth="10" fill="none"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
          </svg>

          <div className="absolute flex flex-col items-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px]">
              {demoCount}
            </p>
            <p className="text-[14px] text-primary font-sans leading-[22px]">
              of {demoTotal}
            </p>
          </div>

          <div className="absolute flex items-center justify-center rounded-full px-2 py-1 bg-[#14B8A6] -top-[10px] -right-[10px]">
            <p className="text-[9px] font-bold text-white font-sans leading-[13px] tracking-[0.72px]">
              +1
            </p>
          </div>
        </div>

        <p className="absolute text-[9px] font-bold text-primary font-sans tracking-[0.72px] uppercase top-[calc(50%-130px)] left-1/2 -translate-x-1/2 whitespace-nowrap">
          TAP TO COUNT
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7 relative">
        <StepDots active={1} />
        <div className="text-center">
          <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px]">
            Count Every<br />Remembrance
          </p>
        </div>
        <p className="text-center text-[14px] text-muted-foreground font-sans leading-[22px]">
          Tap anywhere on screen — the whole screen is your counter. Haptic feedback on every tap.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Auto-advances when count is complete"  colorClass="bg-primary" />
          <FeatureItem text="Progress saved — never lose your place" colorClass="bg-[#14B8A6]" />
          <FeatureItem text="Swipe to navigate between azkar"        colorClass="bg-primary" />
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
      <div className="relative shrink-0 flex items-center justify-center h-[380px] bg-background">
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

        <div className="relative flex items-center justify-center w-[232px] h-[160px]">
          <div className="absolute flex items-center justify-center rounded-xl w-[104px] h-[160px] bg-card border border-primary -rotate-6 left-0">
            <p className="text-center px-3 text-[15px] font-bold text-foreground leading-[26px]" dir="rtl" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              اللَّهُمَّ إِنِّي أَسْأَلُكَ
            </p>
          </div>
          <div className="absolute flex items-center justify-center rounded-xl w-[104px] h-[160px] bg-card border border-primary rotate-6 right-0">
            <p className="text-center px-3 text-[15px] font-bold text-foreground leading-[26px]" dir="rtl" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              اللَّهُمَّ إِنِّي أَسْأَلُكَ
            </p>
          </div>
        </div>

        <div className="absolute flex items-center justify-center rounded-full px-3 py-2 bg-[#14B8A6] bottom-[52px]">
          <p className="text-[9px] font-bold text-white font-sans tracking-[0.72px] whitespace-nowrap">
            Hisnul Muslim · Authenticated
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7">
        <StepDots active={2} />
        <p className="text-[28px] font-extrabold text-foreground font-sans leading-[36px] tracking-[-0.28px] text-center">
          Know the Benefit<br />of Every Zikr
        </p>
        <p className="text-center text-[14px] text-muted-foreground font-sans leading-[22px]">
          Hadith-cited spiritual rewards shown for each remembrance. Understand WHY you recite.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Source reference for every azkar"              colorClass="bg-primary" />
          <FeatureItem text="Spiritual reward and virtue explained"         colorClass="bg-[#14B8A6]" />
          <FeatureItem text="Light & dark mode · Arabic RTL support"        colorClass="bg-primary" />
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-3 w-full">
          <button onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95 h-[52px] bg-primary text-[17px] font-semibold text-primary-foreground font-sans">
            Begin Your Journey
          </button>
          <p className="text-[14px] text-muted-foreground font-sans leading-[22px]">
            Already have an account? <span className="text-primary font-semibold">Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}
