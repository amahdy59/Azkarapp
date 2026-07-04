import svgPaths from "./svg-xmh74o5lmu";

function IosSignal() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="ios-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="ios-signal">
          <path clipRule="evenodd" d={svgPaths.pc062070} fill="var(--fill-0, #F5F0E8)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosWifiSignal() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="ios-wifi-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="ios-wifi-signal">
          <path clipRule="evenodd" d={svgPaths.p3b876d80} fill="var(--fill-0, #F5F0E8)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosBatteryFull() {
  return (
    <div className="h-[16px] relative shrink-0 w-[24px]" data-name="ios-battery-full">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 16">
        <g id="ios-battery-full">
          <path d={svgPaths.p1731e380} fill="var(--fill-0, #F5F0E8)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icons() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="icons">
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
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">9:41</p>
          <Icons />
        </div>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <a className="block cursor-pointer relative shrink-0 size-[24px]" data-name="chevron-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron-left">
          <path d="M15 18L9 12L15 6" id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </a>
  );
}

function Header() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] relative size-full">
          <ChevronLeft />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] whitespace-nowrap">Sign In</p>
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#9290b0] text-[17px] whitespace-nowrap">Skip</p>
        </div>
      </div>
    </div>
  );
}

function BtnPrimary() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start not-italic relative shrink-0 w-full" data-name="btn-primary">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#f5f0e8] text-[22px] tracking-[-0.11px] w-full">Enter Your Number</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#9290b0] text-[13px] w-full">{`We'll send a one-time code to verify`}</p>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="chevron-down">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center px-[12px] py-[6px] relative rounded-[8px] shrink-0" data-name="Frame">
      <div aria-hidden className="absolute border border-[#1a7060] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">🇸🇦 +966</p>
      <ChevronDown />
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="bg-[#111b35] h-[60px] relative rounded-[12px] shrink-0 w-full" data-name="screen-header">
      <div aria-hidden className="absolute border-[#c8941a] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <Frame2 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">50 123 4567</p>
        </div>
      </div>
    </div>
  );
}

function Globe() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="globe">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_10_2300)" id="globe">
          <path d={svgPaths.p33a0abc0} id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_10_2300">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[14px]" data-name="Frame">
      <Globe />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <Frame4 />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">We support 190+ countries</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[32px] items-start p-[24px] relative size-full">
        <BtnPrimary />
        <ScreenHeader />
        <Frame3 />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame">
      <StatusBar />
      <Header />
      <Frame1 />
    </div>
  );
}

function Btn() {
  return (
    <div className="bg-[#c8941a] content-stretch flex h-[52px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="btn">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap">Send Verification Code</p>
    </div>
  );
}

function ContentCard() {
  return (
    <div className="relative shrink-0 w-full" data-name="content-card">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-center p-[24px] relative size-full">
          <Btn />
          <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[0] min-w-full not-italic relative shrink-0 text-[#7b789a] text-[0px] text-center w-[min-content]">
            <span className="leading-[14px] text-[10px]">{`By continuing you agree to our `}</span>
            <span className="leading-[14px] text-[#c8941a] text-[10px]">Terms of Service</span>
            <span className="leading-[14px] text-[10px]">{` and `}</span>
            <span className="leading-[14px] text-[#c8941a] text-[10px]">Privacy Policy</span>
          </p>
          <div className="bg-[#f5f0e8] h-[5px] relative rounded-[100px] shrink-0 w-[134px]" data-name="progress-bar" />
        </div>
      </div>
    </div>
  );
}

export default function PhoneInput() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start justify-between relative size-full" data-name="Phone Input">
      <Frame />
      <ContentCard />
    </div>
  );
}