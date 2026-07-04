function Crescent() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[140px] top-1/2" data-name="crescent">
      <div className="absolute inset-[0_-50%_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 210 140">
          <g id="crescent">
            <circle cx="70" cy="70" fill="var(--fill-0, #C8941A)" id="crescent-left" r="70" />
            <circle cx="140" cy="70" fill="var(--fill-0, #0A1228)" id="crescent-right" r="70" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function TitleStack() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute content-stretch flex flex-col gap-[6px] items-center left-1/2 not-italic text-center top-[calc(50%+70px)] whitespace-nowrap" data-name="title-stack">
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[48px] relative shrink-0 text-[#f5f0e8] text-[44px]" dir="auto">
        أذكار
      </p>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[16px] relative shrink-0 text-[#c8941a] text-[13px] tracking-[1.04px]">AZKAR</p>
    </div>
  );
}

function IllustrationZone() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col h-[380px] items-center justify-center relative shrink-0 w-full" data-name="illustration-zone">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[280px] top-1/2" data-name="glow">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 280 280">
          <circle cx="140" cy="140" fill="var(--fill-0, #C8941A)" fillOpacity="0.12" id="glow" r="140" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-60px)] size-[6px] top-[calc(50%-30px)]" data-name="star-dot-1">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="star-dot-1" r="3" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%+40px)] size-[6px] top-[calc(50%-50px)]" data-name="star-dot-2">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="star-dot-1" r="3" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-[calc(50%-20px)] size-[6px] top-[calc(50%+40px)]" data-name="star-dot-3">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="star-dot-1" r="3" />
        </svg>
      </div>
      <Crescent />
      <TitleStack />
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[8px] items-center left-1/2 top-[8px]" data-name="step-indicator">
      <div className="bg-[#c8941a] h-[8px] relative rounded-[4px] shrink-0 w-[24px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-40 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-40 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
    </div>
  );
}

function Feature() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="feature-1">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #1A7060)" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Authentic duas from Hisnul Muslim</p>
    </div>
  );
}

function Feature1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="feature-2">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #C8941A)" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">15 morning, 15 evening, 10 sleep azkar</p>
    </div>
  );
}

function Feature2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="feature-3">
      <div className="relative shrink-0 size-[8px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <circle cx="4" cy="4" fill="var(--fill-0, #1A7060)" id="Ellipse" r="4" />
        </svg>
      </div>
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Works offline - no internet needed</p>
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
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap">Get Started</p>
    </div>
  );
}

function Cta() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="cta">
      <BtnPrimary />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Skip</p>
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
            <p className="leading-[36px] mb-0">Your Daily Islamic</p>
            <p className="leading-[36px]">Remembrance</p>
          </div>
          <div className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#9290b0] text-[14px] text-center w-[min-content]">
            <p className="leading-[22px] mb-0">Morning · Evening · Before Sleep</p>
            <p className="leading-[22px]">Authentic azkar from Hisnul Muslim</p>
          </div>
          <Features />
          <Spacer />
          <Cta />
        </div>
      </div>
    </div>
  );
}

export default function Onboarding1Welcome() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Onboarding 1 - Welcome">
      <IllustrationZone />
      <TextCtaZone />
    </div>
  );
}