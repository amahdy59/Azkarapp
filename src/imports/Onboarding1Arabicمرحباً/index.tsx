import svgPaths from "./svg-f40z8r9j61";

function IosSignal() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="ios-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="ios-signal">
          <path clipRule="evenodd" d={svgPaths.p2bb6eb80} fill="var(--fill-0, #F5F0E8)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosWifiSignal() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="ios-wifi-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="ios-wifi-signal">
          <path clipRule="evenodd" d={svgPaths.p646c5c0} fill="var(--fill-0, #F5F0E8)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosBatteryFull() {
  return (
    <div className="h-[20px] relative shrink-0 w-[28px]" data-name="ios-battery-full">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 20">
        <g id="ios-battery-full">
          <path d={svgPaths.p66c9640} fill="var(--fill-0, #F5F0E8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Frame">
      <IosSignal />
      <IosWifiSignal />
      <IosBatteryFull />
    </div>
  );
}

function StatusBar() {
  return (
    <div className="h-[44px] relative shrink-0 w-full" data-name="status-bar">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">9:41</p>
          <Frame />
        </div>
      </div>
    </div>
  );
}

function MoonContainer() {
  return (
    <div className="relative shrink-0 size-[180px]" data-name="moon-container">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 180 180">
        <g id="moon-container">
          <circle cx="90" cy="90" fill="var(--fill-0, #C8941A)" id="moon-base" r="70" />
          <circle cx="105" cy="65" fill="var(--fill-0, #0A1228)" id="moon-mask" r="65" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="-translate-x-1/2 [word-break:break-word] absolute bottom-[40px] content-stretch flex flex-col gap-[4px] items-center left-1/2 not-italic whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[#f5f0e8] text-[44px] tracking-[-0.88px]" dir="auto">
        أذكار
      </p>
      <p className="font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[13px] relative shrink-0 text-[#c8941a] text-[9px] tracking-[0.72px]" dir="auto">
        أذكـار
      </p>
    </div>
  );
}

function IllustrationZone() {
  return (
    <div className="content-stretch flex flex-col h-[380px] items-center justify-center relative shrink-0 w-full" data-name="illustration-zone">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[240px] top-1/2" data-name="Ellipse">
        <div className="absolute inset-[-33.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 400 400">
            <g filter="url(#filter0_f_10_2316)" id="Ellipse" opacity="0.15">
              <circle cx="200" cy="200" fill="var(--fill-0, #C8941A)" r="120" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="400" id="filter0_f_10_2316" width="400" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_10_2316" stdDeviation="40" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <MoonContainer />
      <div className="absolute left-[80px] size-[4px] top-[100px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 4">
          <circle cx="2" cy="2" fill="var(--fill-0, #C8941A)" id="Ellipse" r="2" />
        </svg>
      </div>
      <div className="absolute left-[300px] size-[3px] top-[150px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3 3">
          <circle cx="1.5" cy="1.5" fill="var(--fill-0, #C8941A)" id="Ellipse" r="1.5" />
        </svg>
      </div>
      <div className="absolute left-[240px] size-[5px] top-[60px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 5">
          <circle cx="2.5" cy="2.5" fill="var(--fill-0, #C8941A)" id="Ellipse" r="2.5" />
        </svg>
      </div>
      <Frame1 />
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full" data-name="step-indicator">
      <div className="bg-[#c8941a] h-[8px] relative rounded-[4px] shrink-0 w-[24px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-30 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-30 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-center not-italic relative shrink-0 text-center w-full" data-name="Frame">
      <p className="font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#f5f0e8] text-[28px] whitespace-nowrap" dir="auto">
        ذكرك الإسلامي اليومي
      </p>
      <div className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[0] min-w-full relative shrink-0 text-[#9290b0] text-[14px] w-[min-content]">
        <p className="leading-[22px] mb-0" dir="auto">
          أذكار الصباح · المساء · قبل النوم
        </p>
        <p className="leading-[22px]" dir="auto">
          أذكار موثقة من حصن المسلم
        </p>
      </div>
    </div>
  );
}

function FeatureRow() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        أدعية موثقة من حصن المسلم
      </p>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function FeatureRow1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        ١٥ صباح، ١٥ مساء، ١٠ أذكار النوم
      </p>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #24A08A)" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function FeatureRow2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        يعمل بدون إنترنت — متاح دائماً
      </p>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Frame">
      <FeatureRow />
      <FeatureRow1 />
      <FeatureRow2 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Frame">
      <StepIndicator />
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function PrimaryButton() {
  return (
    <div className="bg-[#c8941a] content-stretch flex h-[52px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="primary-button">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap" dir="auto">
        ابدأ الآن
      </p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="Frame">
      <PrimaryButton />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap" dir="auto">
        تخطي
      </p>
    </div>
  );
}

function TextZone() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="text-zone">
      <div className="content-stretch flex flex-col items-start justify-between pb-[20px] px-[28px] relative size-full">
        <Frame2 />
        <Frame5 />
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="content-stretch flex h-[34px] items-center justify-center relative shrink-0 w-full" data-name="home-indicator">
      <div className="bg-[#f5f0e8] h-[5px] opacity-30 relative rounded-[100px] shrink-0 w-[134px]" data-name="Rectangle" />
    </div>
  );
}

export default function Onboarding1Arabic() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Onboarding 1 — Arabic (مرحباً)">
      <StatusBar />
      <IllustrationZone />
      <TextZone />
      <HomeIndicator />
    </div>
  );
}