import svgPaths from "./svg-f00v6rbcf1";

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

function Star() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[28px] top-[calc(50%-70px)]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="star">
          <path d={svgPaths.p372c6b00} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function PageLeft() {
  return (
    <div className="flex h-[169.994px] items-center justify-center relative shrink-0 w-[120.155px]">
      <div className="-rotate-6 flex-none">
        <div className="bg-[#111b35] content-stretch flex flex-col h-[160px] items-center justify-center px-[16px] py-[18px] relative rounded-[12px] w-[104px]" data-name="page-left">
          <div aria-hidden className="absolute border border-[#c8941a] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[16px] text-center whitespace-nowrap" dir="auto">
            اللَّهُمَّ إِنِّي أَسْأَلُكَ
          </p>
        </div>
      </div>
    </div>
  );
}

function PageRight() {
  return (
    <div className="flex h-[169.994px] items-center justify-center relative shrink-0 w-[120.155px]">
      <div className="flex-none rotate-6">
        <div className="bg-[#111b35] content-stretch flex flex-col h-[160px] items-center justify-center px-[16px] py-[18px] relative rounded-[12px] w-[104px]" data-name="page-right">
          <div aria-hidden className="absolute border border-[#c8941a] border-solid inset-0 pointer-events-none rounded-[12px]" />
          <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[16px] text-center whitespace-nowrap" dir="auto">
            اللَّهُمَّ إِنِّي أَسْأَلُكَ
          </p>
        </div>
      </div>
    </div>
  );
}

function Book() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[12px] h-[160px] items-center left-1/2 top-1/2 w-[220px]" data-name="book">
      <PageLeft />
      <PageRight />
    </div>
  );
}

function Chip() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#1a7060] content-stretch flex items-center left-1/2 px-[12px] py-[8px] rounded-[999px] top-[calc(50%+90px)]" data-name="chip">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13px] not-italic relative shrink-0 text-[#0a1228] text-[9px] tracking-[0.72px] whitespace-nowrap">Hisnul Muslim · Authenticated</p>
    </div>
  );
}

function IllustrationZone() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col h-[380px] items-center justify-center relative shrink-0 w-full" data-name="illustration-zone">
      <AzkarLogoMark />
      <Star />
      <Book />
      <Chip />
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="-translate-x-1/2 absolute content-stretch flex gap-[8px] items-center left-1/2 top-[8px]" data-name="step-indicator">
      <div className="bg-[#9290b0] opacity-40 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-40 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#c8941a] h-[8px] relative rounded-[4px] shrink-0 w-[24px]" data-name="Rectangle" />
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
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Source reference for every azkar</p>
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
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Spiritual reward and virtue explained</p>
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
      <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">{`Light & dark mode · Arabic RTL support`}</p>
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
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap">Begin Your Journey</p>
    </div>
  );
}

function Cta() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="cta">
      <BtnPrimary />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">
        <span className="leading-[22px]">{`Already have an account? `}</span>
        <span className="leading-[22px] text-[#c8941a]">Sign In</span>
      </p>
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
            <p className="leading-[36px] mb-0">Know the Benefit</p>
            <p className="leading-[36px]">of Every Zikr</p>
          </div>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-full not-italic relative shrink-0 text-[#9290b0] text-[14px] text-center w-[min-content]">Hadith-cited spiritual rewards shown for each remembrance. Understand WHY you recite.</p>
          <Features />
          <Spacer />
          <Cta />
        </div>
      </div>
    </div>
  );
}

export default function Onboarding3Benefits() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Onboarding 3 - Benefits">
      <IllustrationZone />
      <TextCtaZone />
    </div>
  );
}