import svgPaths from "./svg-heqx7zzs6p";

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

function Icon() {
  return <div className="relative shrink-0 size-[24px]" data-name="icon" />;
}

function Header() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] relative size-full">
          <ChevronLeft />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] whitespace-nowrap">Verify Number</p>
          <Icon />
        </div>
      </div>
    </div>
  );
}

function Clock() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="clock">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_10_2311)" id="clock">
          <path d={svgPaths.p3da783c0} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_10_2311">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[14px]" data-name="Frame">
      <Clock />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Frame">
      <Frame3 />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#c8941a] text-[13px] whitespace-nowrap">Code expires in 4:32</p>
    </div>
  );
}

function BtnPrimary() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="btn-primary">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#7b789a] text-[0px] w-[min-content]">
        <span className="leading-[20px] text-[13px]">{`Enter the 6-digit code sent to `}</span>
        <span className="leading-[20px] text-[#f5f0e8] text-[13px]">+966 ●●● ●●● 789</span>
      </p>
      <Frame2 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="h-[60px] relative shrink-0 w-[52px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 60">
        <g id="Frame">
          <rect fill="var(--fill-0, #111B35)" height="60" rx="8" width="52" />
          <circle cx="26" cy="30" fill="var(--fill-0, #F5F0E8)" id="Ellipse" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="h-[60px] relative shrink-0 w-[52px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 60">
        <g id="Frame">
          <rect fill="var(--fill-0, #111B35)" height="60" rx="8" width="52" />
          <circle cx="26" cy="30" fill="var(--fill-0, #F5F0E8)" id="Ellipse" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="h-[60px] relative shrink-0 w-[52px]" data-name="Frame">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 60">
        <g id="Frame">
          <rect fill="var(--fill-0, #111B35)" height="60" rx="8" width="52" />
          <circle cx="26" cy="30" fill="var(--fill-0, #F5F0E8)" id="Ellipse" r="4" />
        </g>
      </svg>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col h-[60px] items-center justify-center relative rounded-[8px] shrink-0 w-[52px]" data-name="Frame">
      <div aria-hidden className="absolute border-2 border-[#c8941a] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-[#c8941a] h-[24px] relative shrink-0 w-[2px]" data-name="Rectangle" />
    </div>
  );
}

function Frame8() {
  return (
    <div className="bg-[#182540] h-[60px] relative rounded-[8px] shrink-0 w-[52px]" data-name="Frame">
      <div aria-hidden className="absolute border-2 border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-[#182540] h-[60px] relative rounded-[8px] shrink-0 w-[52px]" data-name="Frame">
      <div aria-hidden className="absolute border-2 border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="content-stretch flex gap-[10px] items-start justify-center relative shrink-0 w-full" data-name="screen-header">
      <Frame4 />
      <Frame5 />
      <Frame6 />
      <Frame7 />
      <Frame8 />
      <Frame9 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[6px] items-start justify-center leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] w-full whitespace-nowrap" data-name="Frame">
      <p className="relative shrink-0">{`Didn't receive a code?`}</p>
      <p className="relative shrink-0">Resend in 60s</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[32px] items-start p-[24px] relative size-full">
        <BtnPrimary />
        <ScreenHeader />
        <Frame10 />
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
    <div className="bg-[#c8941a] content-stretch flex h-[52px] items-center justify-center opacity-50 relative rounded-[12px] shrink-0 w-full" data-name="btn">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap">Verify</p>
    </div>
  );
}

function Btn1() {
  return (
    <div className="bg-[rgba(0,0,0,0)] content-stretch flex h-[52px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="btn">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#c8941a] text-[17px] whitespace-nowrap">Try a different number</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-center p-[24px] relative size-full">
          <Btn />
          <Btn1 />
          <div className="bg-[#f5f0e8] h-[5px] relative rounded-[100px] shrink-0 w-[134px]" data-name="progress-bar" />
        </div>
      </div>
    </div>
  );
}

export default function OtpVerification() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start justify-between relative size-full" data-name="OTP Verification">
      <Frame />
      <Frame11 />
    </div>
  );
}