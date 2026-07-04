import svgPaths from "./svg-7rtugrjbg7";

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

function Frame1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-center not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[13px] relative shrink-0 text-[#e8b420] text-[9px] tracking-[0.72px]" dir="auto">
        انقر للعد
      </p>
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[normal] relative shrink-0 text-[#f5f0e8] text-[56px]">٧</p>
      <p className="font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[22px] relative shrink-0 text-[#c8941a] text-[14px]" dir="auto">
        من ٣٣
      </p>
    </div>
  );
}

function IllustrationZone() {
  return (
    <div className="content-stretch flex flex-col h-[380px] items-center justify-center relative shrink-0 w-full" data-name="illustration-zone">
      <div className="relative shrink-0 size-[240px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 240 240">
          <circle cx="120" cy="120" id="Ellipse" opacity="0.1" r="119.5" stroke="var(--stroke-0, #C8941A)" />
        </svg>
      </div>
      <div className="absolute left-0 size-[190px] top-0" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 190 190">
          <circle cx="95" cy="95" id="Ellipse" opacity="0.2" r="94.5" stroke="var(--stroke-0, #C8941A)" />
        </svg>
      </div>
      <div className="absolute left-0 size-[150px] top-0" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 150 150">
          <circle cx="75" cy="75" id="Ellipse" opacity="0.3" r="74.5" stroke="var(--stroke-0, #C8941A)" />
        </svg>
      </div>
      <div className="absolute left-0 size-[120px] top-0" data-name="Ellipse">
        <div className="absolute bottom-0 left-1/4 right-0 top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 90 120">
            <g id="Ellipse">
              <mask fill="white" id="path-1-inside-1_10_2343">
                <path d={svgPaths.p6157c00} />
              </mask>
              <path d={svgPaths.p6157c00} mask="url(#path-1-inside-1_10_2343)" stroke="var(--stroke-0, #C8941A)" strokeWidth="8" />
            </g>
          </svg>
        </div>
      </div>
      <Frame1 />
      <p className="[word-break:break-word] absolute font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[normal] left-[240px] not-italic text-[#24a08a] text-[20px] top-[120px] whitespace-nowrap" dir="auto">
        +١
      </p>
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full" data-name="step-indicator">
      <div className="bg-[#9290b0] opacity-30 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#c8941a] h-[8px] relative rounded-[4px] shrink-0 w-[24px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-30 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
    </div>
  );
}

function Frame3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-center not-italic relative shrink-0 text-center w-full" data-name="Frame">
      <p className="font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#f5f0e8] text-[28px] whitespace-nowrap" dir="auto">
        عدّ كل ذكر
      </p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] min-w-full relative shrink-0 text-[#9290b0] text-[14px] w-[min-content]" dir="auto">
        انقر في أي مكان على الشاشة — كامل الشاشة هو عدادك. اهتزاز خفيف مع كل نقرة.
      </p>
    </div>
  );
}

function FeatureRow() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        يتقدم تلقائياً عند اكتمال العدد
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
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        حفظ التقدم — لن تضيع مكانك
      </p>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function FeatureRow2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        اسحب للتنقل بين الأذكار
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
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="Frame">
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
        التالي
      </p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="Frame">
      <PrimaryButton />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap" dir="auto">
        رجوع
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

export default function Onboarding2Arabic() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Onboarding 2 — Arabic (العداد)">
      <StatusBar />
      <IllustrationZone />
      <TextZone />
      <HomeIndicator />
    </div>
  );
}