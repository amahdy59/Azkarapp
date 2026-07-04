import svgPaths from "./svg-44a5055zpy";

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

function MoonStar() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="moon-star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="moon-star">
          <path d={svgPaths.p3eb4be00} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function BrandIcon() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="brand-icon">
      <MoonStar />
    </div>
  );
}

function TopSection() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full" data-name="top-section">
      <BrandIcon />
      <p className="[word-break:break-word] font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] min-w-full not-italic relative shrink-0 text-[#f5f0e8] text-[28px] text-center tracking-[-0.28px] w-[min-content]">Welcome to Azkar</p>
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#9290b0] text-[13px] text-center w-[min-content]">Sign in to sync your progress across all your devices</p>
    </div>
  );
}

function SocialAuth() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="social-auth">
      <div className="relative rounded-[8px] shrink-0 w-full" data-name="btn-google">
        <div aria-hidden className="absolute bg-white inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[10px] relative size-full">
            <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#1a1228] text-[16px] whitespace-nowrap">Continue with Google</p>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_0px_rgba(10,13,18,0.05)]" />
        <div aria-hidden className="absolute border-0 border-solid border-white inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]" />
      </div>
      <div className="h-[52px] relative rounded-[8px] shrink-0 w-full" data-name="Social button">
        <div aria-hidden className="absolute bg-[#1c1c2e] inset-0 pointer-events-none rounded-[8px]" />
        <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex gap-[12px] items-center justify-center px-[16px] py-[10px] relative size-full">
            <div className="overflow-clip relative shrink-0 size-[24px]" data-name="Social icon">
              <div className="absolute inset-[0_11.54%_8.33%_11.25%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.531 22">
                  <path d={svgPaths.p19357d00} fill="var(--fill-0, #F5F0E8)" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Inter:Semibold',sans-serif] leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[16px] whitespace-nowrap">Continue with Apple</p>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_0px_rgba(10,13,18,0.05)]" />
        <div aria-hidden className="absolute border-[#3a3a5c] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)]" />
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="divider">
      <div className="flex-[1_0_0] h-0 min-w-px relative" data-name="Line">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 149.5 1">
            <line id="Line" stroke="var(--stroke-0, #111B35)" x2="149.5" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">or</p>
      <div className="flex-[1_0_0] h-0 min-w-px relative" data-name="Line">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 149.5 1">
            <line id="Line" stroke="var(--stroke-0, #111B35)" x2="149.5" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Phone() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="phone">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_10_2270)" id="phone">
          <path d={svgPaths.p11ad8000} id="icon" stroke="var(--stroke-0, #111B35)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_10_2270">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function PhoneIcon() {
  return (
    <div className="bg-[#1a7060] content-stretch flex flex-col items-center justify-center relative rounded-[18px] shrink-0 size-[36px]" data-name="phone-icon">
      <Phone />
    </div>
  );
}

function PhoneText() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px not-italic relative" data-name="phone-text">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20px] relative shrink-0 text-[#f5f0e8] text-[15px] w-full">Continue with Phone Number</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#9290b0] text-[11px] w-full">{`We'll send a one-time verification code`}</p>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="chevron-right">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function BtnPhone() {
  return (
    <div className="bg-[#111b35] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="btn-phone">
      <div aria-hidden className="absolute border border-[#182540] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[20px] relative size-full">
          <PhoneIcon />
          <PhoneText />
          <ChevronRight />
        </div>
      </div>
    </div>
  );
}

function BtnGuest() {
  return (
    <div className="bg-[rgba(0,0,0,0)] relative rounded-[8px] shrink-0 w-full" data-name="btn-guest">
      <div aria-hidden className="absolute border-[#c8941a] border-[1.5px] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-col items-center size-full">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-center not-italic p-[16px] relative size-full whitespace-nowrap">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#c8941a] text-[17px]">Continue as Guest</p>
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] relative shrink-0 text-[#9290b0] text-[10px]">{`⚠ Your progress won't sync across devices`}</p>
        </div>
      </div>
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="chevron-down">
          <path d="M5 7.5L10 12.5L15 7.5" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function GuestSection() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full" data-name="guest-section">
      <BtnGuest />
      <ChevronDown />
    </div>
  );
}

function Spacer() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function Footer() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="footer">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#9290b0] text-[11px] text-center w-full">
        <span className="leading-[16px]">{`By continuing you agree to our `}</span>
        <span className="leading-[16px] text-[#c8941a]">Terms</span>
        <span className="leading-[16px]">{` & `}</span>
        <span className="leading-[16px] text-[#c8941a]">Privacy Policy</span>
      </p>
    </div>
  );
}

function Content() {
  return (
    <div className="relative shrink-0 w-full" data-name="content">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[32px] items-center pb-[24px] pt-[16px] px-[28px] relative size-full">
          <TopSection />
          <SocialAuth />
          <Divider />
          <BtnPhone />
          <GuestSection />
          <Spacer />
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default function LoginGuestPremium() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Login / Guest - Premium">
      <StatusBar />
      <Content />
    </div>
  );
}