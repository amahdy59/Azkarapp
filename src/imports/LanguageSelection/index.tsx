import svgPaths from "./svg-7ykb8h15yd";
import imgIcon from "./08f3ba48de2d6ed5af340efaa0071271153b3464.png";
import imgIcon1 from "./994af6ac37f57edc63625277f71db63b276520ba.png";
import imgIcon2 from "./3eb87bcc115685ca0e761f8c24892b51f99dd48f.png";
import imgIcon3 from "./5b67adb6f0b7b0754dd89690923cec0800585a88.png";
import imgIcon4 from "./dff28e24c25354e9b483dd2c12eb191b3bfddf52.png";

function IosSignal() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="ios-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="ios-signal">
          <path clipRule="evenodd" d={svgPaths.p2bb6eb80} fill="var(--fill-0, #111B35)" fillRule="evenodd" id="Vector" />
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
          <path clipRule="evenodd" d={svgPaths.p646c5c0} fill="var(--fill-0, #111B35)" fillRule="evenodd" id="Vector" />
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
          <path d={svgPaths.p66c9640} fill="var(--fill-0, #111B35)" id="Vector" />
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
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#111b35] text-[14px] whitespace-nowrap">9:41</p>
          <Frame />
        </div>
      </div>
    </div>
  );
}

function Crescent() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="crescent">
      <div className="absolute inset-[-18.75%_0_0_-18.75%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 38">
          <g id="crescent">
            <circle cx="22" cy="22" fill="var(--fill-0, #C8941A)" id="main-ellipse" r="16" />
            <circle cx="14" cy="14" fill="var(--fill-0, #0A1228)" id="carving-ellipse" r="14" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function AzkarLogoMark() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0" data-name="azkar-logo-mark">
      <Crescent />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] not-italic relative shrink-0 text-[#f5f0e8] text-[15px] text-center whitespace-nowrap">Azkar</p>
    </div>
  );
}

function LogoHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="logo-header">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-center pt-[16px] px-[24px] relative size-full">
          <AzkarLogoMark />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-full not-italic relative shrink-0 text-[#f5f0e8] text-[18px] text-center w-[min-content]">Choose Your Language</p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] min-w-full not-italic relative shrink-0 text-[#9290b0] text-[12px] text-center w-[min-content]">You can change this later in Settings</p>
        </div>
      </div>
    </div>
  );
}

function ArrowLeft() {
  return (
    <a className="block cursor-pointer relative shrink-0 size-[24px]" data-name="arrow-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-left">
          <path d={svgPaths.p177d0d00} id="Vector" stroke="var(--stroke-0, #111B35)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </a>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="icon">
          <path d="M18 6L6 18M6 6L18 18" id="Vector" stroke="var(--stroke-0, #111B35)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="screen-header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <ArrowLeft />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#111b35] text-[17px] whitespace-nowrap">Choose Language</p>
          <Icon />
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="check">
          <path d={svgPaths.p34226880} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div aria-hidden className="absolute border-[#c8941a] border-l-4 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <div className="relative shrink-0 size-[32px]" data-name="icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="32" src={imgIcon} width="32" />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">English</p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">en</p>
          <Check />
        </div>
      </div>
    </div>
  );
}

function ScreenHeader1() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="screen-header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <div className="relative shrink-0 size-[32px]" data-name="icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="32" src={imgIcon1} width="32" />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]" dir="auto">
            العربية
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">ar</p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard1() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <div className="relative shrink-0 size-[32px]" data-name="icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="32" src={imgIcon2} width="32" />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Français</p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">fr</p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard2() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <div className="relative shrink-0 size-[32px]" data-name="icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="32" src={imgIcon3} width="32" />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]" dir="auto">
            اردو
          </p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">ur</p>
        </div>
      </div>
    </div>
  );
}

function CategoryCard3() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <div className="relative shrink-0 size-[32px]" data-name="icon">
            <img alt="" className="absolute block inset-0 max-w-none size-full" height="32" src={imgIcon4} width="32" />
          </div>
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Türkçe</p>
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">tr</p>
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Frame">
      <CategoryCard />
      <ScreenHeader1 />
      <CategoryCard1 />
      <CategoryCard2 />
      <CategoryCard3 />
    </div>
  );
}

function PrimaryButton() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-[1_0_0] h-[52px] items-center justify-center min-w-px relative rounded-[12px]" data-name="primary-button">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[17px] text-black whitespace-nowrap">Continue</p>
    </div>
  );
}

function ContentCard() {
  return (
    <div className="content-stretch flex items-start pt-[40px] relative shrink-0 w-full" data-name="content-card">
      <PrimaryButton />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] text-center w-full">You can change this later in settings</p>
        <Frame2 />
        <ContentCard />
      </div>
    </div>
  );
}

export default function LanguageSelection() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Language Selection">
      <StatusBar />
      <LogoHeader />
      <ScreenHeader />
      <Frame1 />
    </div>
  );
}