import svgPaths from "./svg-z9htvc4qgb";

function Crescent() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="crescent">
      <div className="absolute inset-[-17.86%_0_0_-17.86%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 33">
          <g id="crescent">
            <circle cx="19" cy="19" fill="var(--fill-0, #C8941A)" id="main-ellipse" r="14" />
            <circle cx="12" cy="12" fill="var(--fill-0, #0A1228)" id="carving-ellipse" r="12" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function AzkarLogoMark() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex flex-col gap-[4px] items-center left-[calc(50%-30px)] top-[60px]" data-name="azkar-logo-mark">
      <Crescent />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-center whitespace-nowrap">Azkar</p>
    </div>
  );
}

function PlusOne() {
  return (
    <div className="absolute bg-[#1a7060] content-stretch flex items-center justify-center px-[8px] py-[4px] right-[-10px] rounded-[999px] top-[-10px]" data-name="plus-one">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13px] not-italic relative shrink-0 text-[#0a1228] text-[9px] tracking-[0.72px] whitespace-nowrap">+1</p>
    </div>
  );
}

function CounterRing() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[220px]" data-name="counter-ring">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[220px] top-1/2" data-name="pulse-1">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 220">
          <circle cx="110" cy="110" id="pulse-1" opacity="0.08" r="109.5" stroke="var(--stroke-0, #C8941A)" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[180px] top-1/2" data-name="pulse-2">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 180 180">
          <circle cx="90" cy="90" id="pulse-2" opacity="0.14" r="89.5" stroke="var(--stroke-0, #C8941A)" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[140px] top-1/2" data-name="pulse-3">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 140 140">
          <circle cx="70" cy="70" id="pulse-3" opacity="0.2" r="69.5" stroke="var(--stroke-0, #C8941A)" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[120px] top-1/2" data-name="arc-ring">
        <div className="absolute bottom-[9.55%] left-1/2 right-0 top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 108.541">
            <g id="arc-ring">
              <mask fill="white" id="path-1-inside-1_10_1825">
                <path d={svgPaths.p816e00} />
              </mask>
              <path d={svgPaths.p816e00} mask="url(#path-1-inside-1_10_1825)" stroke="var(--stroke-0, #C8941A)" strokeWidth="12" />
            </g>
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] absolute font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] left-[calc(50%-8.5px)] not-italic text-[#f5f0e8] text-[28px] top-[calc(50%-28px)] tracking-[-0.28px] whitespace-nowrap">7</p>
      <p className="[word-break:break-word] absolute font-['Inter:Regular',sans-serif] font-normal leading-[22px] left-[calc(50%-18px)] not-italic text-[#c8941a] text-[14px] top-[calc(50%+7px)] whitespace-nowrap">of 33</p>
      <p className="[word-break:break-word] absolute font-['Inter:Bold',sans-serif] font-bold leading-[13px] left-[72px] not-italic opacity-90 right-[72px] text-[#c8941a] text-[9px] text-center top-[-24px] tracking-[0.72px]">TAP TO COUNT</p>
      <PlusOne />
    </div>
  );
}

function IllustrationZone() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col h-[380px] items-center justify-center relative shrink-0 w-full" data-name="illustration-zone">
      <AzkarLogoMark />
      <CounterRing />
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[8px] items-center left-1/2 top-[8px]" data-name="step-indicator">
      <div className="bg-[#9290b0] opacity-40 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#c8941a] h-[8px] relative rounded-[4px] shrink-0 w-[24px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-40 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
    </div>
  );
}

function Feature() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="feature-1">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #C8941A)" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Auto-advances when count is complete</p>
    </div>
  );
}

function Feature1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="feature-2">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #1A7060)" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Progress saved - never lose your place</p>
    </div>
  );
}

function Feature2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="feature-3">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #C8941A)" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Swipe to navigate between azkar</p>
    </div>
  );
}

function Features() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="features">
      <Feature />
      <Feature1 />
      <Feature2 />
    </div>
  );
}

function Spacer() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function BtnPrimary() {
  return (
    <div className="bg-[#c8941a] content-stretch flex h-[52px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="btn-primary">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap">Next</p>
    </div>
  );
}

function Cta() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="cta">
      <BtnPrimary />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Back</p>
    </div>
  );
}

function TextCtaZone() {
  return (
    <div className="h-[464px] relative shrink-0 w-full" data-name="text-cta-zone">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center pb-[28px] pt-[8px] px-[28px] relative size-full">
          <StepIndicator />
          <div className="[word-break:break-word] font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[0] min-w-full not-italic relative shrink-0 text-[#f5f0e8] text-[28px] text-center tracking-[-0.28px] w-[min-content]">
            <p className="leading-[36px] mb-0">Count Every</p>
            <p className="leading-[36px]">Rememembrance</p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-full not-italic relative shrink-0 text-[#9290b0] text-[14px] text-center w-[min-content]">Tap anywhere on screen - the whole screen is your counter. Haptic feedback on every tap.</p>
          <Features />
          <Spacer />
          <Cta />
        </div>
      </div>
    </div>
  );
}

export default function Onboarding2Counter() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Onboarding 2 - Counter">
      <IllustrationZone />
      <TextCtaZone />
    </div>
  );
}