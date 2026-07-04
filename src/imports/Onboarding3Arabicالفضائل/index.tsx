import svgPaths from "./svg-4wgv2oid19";

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
    <div className="flex h-[116.554px] items-center justify-center relative shrink-0 w-[89.283px]">
      <div className="-rotate-5 flex-none">
        <div className="bg-[#182540] h-[110px] relative rounded-bl-[4px] rounded-br-[2px] rounded-tl-[4px] rounded-tr-[2px] w-[80px]" data-name="Frame">
          <div aria-hidden className="absolute border border-[#1e3050] border-solid inset-0 pointer-events-none rounded-bl-[4px] rounded-br-[2px] rounded-tl-[4px] rounded-tr-[2px]" />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="flex h-[116.554px] items-center justify-center relative shrink-0 w-[89.283px]">
      <div className="flex-none rotate-5">
        <div className="bg-[#182540] content-stretch flex h-[110px] items-center justify-center relative rounded-bl-[2px] rounded-br-[4px] rounded-tl-[2px] rounded-tr-[4px] w-[80px]" data-name="Frame">
          <div aria-hidden className="absolute border border-[#1e3050] border-solid inset-0 pointer-events-none rounded-bl-[2px] rounded-br-[4px] rounded-tl-[2px] rounded-tr-[4px]" />
          <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#f5f0e8] text-[16px] text-center w-[60px]" dir="auto">
            اللَّهُمَّ إِنِّي أَسْأَلُكَ
          </p>
        </div>
      </div>
    </div>
  );
}

function BookContainer() {
  return (
    <div className="content-stretch flex gap-[4px] items-end relative shrink-0" data-name="book-container">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function Star() {
  return (
    <div className="absolute left-0 size-[24px] top-[80px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="star">
          <path d={svgPaths.peb8f600} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bg-[#0a2b25] content-stretch flex items-start left-0 px-[12px] py-[4px] rounded-[100px] top-[260px]" data-name="Frame">
      <div aria-hidden className="absolute border border-[#1a7060] border-solid inset-0 pointer-events-none rounded-[100px]" />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#24a08a] text-[10px] whitespace-nowrap" dir="auto">
        حصن المسلم · موثق
      </p>
    </div>
  );
}

function IllustrationZone() {
  return (
    <div className="content-stretch flex flex-col h-[380px] items-center justify-center relative shrink-0 w-full" data-name="illustration-zone">
      <BookContainer />
      <Star />
      <Frame3 />
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="content-stretch flex gap-[8px] items-start justify-center relative shrink-0 w-full" data-name="step-indicator">
      <div className="bg-[#9290b0] opacity-30 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] opacity-30 relative rounded-[4px] shrink-0 size-[8px]" data-name="Rectangle" />
      <div className="bg-[#c8941a] h-[8px] relative rounded-[4px] shrink-0 w-[24px]" data-name="Rectangle" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-center not-italic relative shrink-0 text-center w-full" data-name="Frame">
      <p className="font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[40px] relative shrink-0 text-[#f5f0e8] text-[28px] whitespace-nowrap" dir="auto">
        اعرف فضل كل ذكر
      </p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] min-w-full relative shrink-0 text-[#9290b0] text-[14px] w-[min-content]" dir="auto">
        فضل كل ذكر مذكور من الحديث النبوي الشريف. افهم لماذا تقرأ هذا الذكر.
      </p>
    </div>
  );
}

function FeatureRow() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="feature-row">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-right whitespace-nowrap" dir="auto">
        مصدر الحديث لكل ذكر
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
        الفضل والثواب الروحي موضح
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
        وضع فاتح وداكن · دعم اللغة العربية
      </p>
      <div className="relative shrink-0 size-[6px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
          <circle cx="3" cy="3" fill="var(--fill-0, #C8941A)" id="Ellipse" r="3" />
        </svg>
      </div>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Frame">
      <FeatureRow />
      <FeatureRow1 />
      <FeatureRow2 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative shrink-0 w-full" data-name="Frame">
      <StepIndicator />
      <Frame5 />
      <Frame6 />
    </div>
  );
}

function PrimaryButton() {
  return (
    <div className="bg-[#c8941a] content-stretch flex h-[52px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="primary-button">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap" dir="auto">
        ابدأ رحلتك
      </p>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="Frame">
      <PrimaryButton />
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular','Noto_Sans_Arabic:SemiBold',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#9290b0] text-[0px] text-center whitespace-nowrap" dir="auto">
        <span className="leading-[22px] text-[14px]">{`لديك حساب بالفعل؟ `}</span>
        <span className="font-['Inter:Semi_Bold','Noto_Sans_Arabic:Regular','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[22px] text-[#c8941a] text-[14px]">تسجيل الدخول</span>
      </p>
    </div>
  );
}

function TextZone() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="text-zone">
      <div className="content-stretch flex flex-col items-start justify-between pb-[20px] px-[28px] relative size-full">
        <Frame4 />
        <Frame7 />
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

export default function Onboarding3Arabic() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Onboarding 3 — Arabic (الفضائل)">
      <StatusBar />
      <IllustrationZone />
      <TextZone />
      <HomeIndicator />
    </div>
  );
}