import svgPaths from "./svg-kmzm792cg";

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
    <div className="relative shrink-0 size-[17px]" data-name="ios-wifi-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 17">
        <g id="ios-wifi-signal">
          <path clipRule="evenodd" d={svgPaths.p3ef30a80} fill="var(--fill-0, #F5F0E8)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IosBatteryFull() {
  return (
    <div className="h-[13px] relative shrink-0 w-[25px]" data-name="ios-battery-full">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25 13">
        <g id="ios-battery-full">
          <path d={svgPaths.p9568300} fill="var(--fill-0, #F5F0E8)" id="Vector" />
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
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] whitespace-nowrap">9:41</p>
          <Icons />
        </div>
      </div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="chevron-left">
          <path d="M12.5 15L7.5 10L12.5 5" id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function BackBtn() {
  return (
    <a className="content-stretch cursor-pointer flex flex-col items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="back-btn">
      <ChevronLeft />
    </a>
  );
}

function RightAction() {
  return <div className="relative shrink-0 size-[40px]" data-name="right-action" />;
}

function Header() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] relative size-full">
          <BackBtn />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] text-center whitespace-nowrap">Notifications</p>
          <RightAction />
        </div>
      </div>
    </div>
  );
}

function CheckCircle() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="check-circle">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_11_5392)" id="check-circle">
          <path d={svgPaths.p14571d48} id="icon" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5392">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function StatusBanner() {
  return (
    <div className="bg-[#1a7060] relative rounded-[10px] shrink-0 w-full" data-name="status-banner">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] items-center p-[12px] relative size-full">
          <CheckCircle />
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Notifications are enabled</p>
        </div>
      </div>
    </div>
  );
}

function BannerWrap() {
  return (
    <div className="relative shrink-0 w-full" data-name="banner-wrap">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <StatusBanner />
      </div>
    </div>
  );
}

function SectionLabel() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Azkar Reminders</p>
    </div>
  );
}

function Bell() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="bell">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="bell">
          <path d={svgPaths.p13cb380} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Bell />
    </div>
  );
}

function Toggle() {
  return (
    <div className="h-[24px] relative shrink-0 w-[44px]" data-name="toggle">
      <div className="absolute inset-[0_0_-4.17%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 25">
          <g id="toggle">
            <rect fill="var(--fill-0, #C8941A)" height="24" rx="12" width="44" />
            <g filter="url(#filter0_d_11_5333)" id="thumb">
              <circle cx="32" cy="12" fill="var(--fill-0, #F5F0E8)" r="10" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24" id="filter0_d_11_5333" width="24" x="20" y="1">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_11_5333" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_11_5333" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function RightSide() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">6:30 AM</p>
      <Toggle />
    </div>
  );
}

function SettingsRow() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Morning Azkar</p>
          <RightSide />
        </div>
      </div>
    </div>
  );
}

function RowWrap() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow />
      <div className="h-0 relative shrink-0 w-full" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 390 1">
            <line id="divider" stroke="var(--stroke-0, #182540)" x2="390" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-center not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]">06</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] relative shrink-0 text-[#9290b0] text-[10px]">HOUR</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-center not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]">30</p>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[14px] relative shrink-0 text-[#9290b0] text-[10px]">MIN</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col items-start p-[8px] relative rounded-[8px] shrink-0" data-name="icon">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">AM</p>
    </div>
  );
}

function TimePicker() {
  return (
    <div className="bg-[#111b35] content-stretch flex gap-[16px] h-[80px] items-center justify-center relative shrink-0 w-full" data-name="time-picker">
      <Frame />
      <p className="[word-break:break-word] font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] not-italic relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px] whitespace-nowrap">:</p>
      <Frame1 />
      <Icon />
    </div>
  );
}

function Bell1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="bell">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="bell">
          <path d={svgPaths.p13cb380} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg1() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Bell1 />
    </div>
  );
}

function Toggle1() {
  return (
    <div className="h-[24px] relative shrink-0 w-[44px]" data-name="toggle">
      <div className="absolute inset-[0_0_-4.17%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 25">
          <g id="toggle">
            <rect fill="var(--fill-0, #C8941A)" height="24" rx="12" width="44" />
            <g filter="url(#filter0_d_11_5333)" id="thumb">
              <circle cx="32" cy="12" fill="var(--fill-0, #F5F0E8)" r="10" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24" id="filter0_d_11_5333" width="24" x="20" y="1">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_11_5333" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_11_5333" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function RightSide1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">5:00 PM</p>
      <Toggle1 />
    </div>
  );
}

function SettingsRow1() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg1 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Evening Azkar</p>
          <RightSide1 />
        </div>
      </div>
    </div>
  );
}

function RowWrap1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow1 />
      <div className="h-0 relative shrink-0 w-full" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 390 1">
            <line id="divider" stroke="var(--stroke-0, #182540)" x2="390" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Bell2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="bell">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="bell">
          <path d={svgPaths.p13cb380} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg2() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Bell2 />
    </div>
  );
}

function Toggle2() {
  return (
    <div className="h-[24px] relative shrink-0 w-[44px]" data-name="toggle">
      <div className="absolute inset-[0_0_-4.17%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 25">
          <g id="toggle">
            <rect fill="var(--fill-0, #2A2D3E)" height="24" rx="12" width="44" />
            <g filter="url(#filter0_d_11_5315)" id="thumb">
              <circle cx="12" cy="12" fill="var(--fill-0, #F5F0E8)" r="10" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24" id="filter0_d_11_5315" width="24" x="0" y="1">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_11_5315" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_11_5315" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function RightSide2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Not set</p>
      <Toggle2 />
    </div>
  );
}

function SettingsRow2() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg2 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Before Sleep</p>
          <RightSide2 />
        </div>
      </div>
    </div>
  );
}

function RowWrap2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow2 />
      <div className="h-0 relative shrink-0 w-full" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 390 1">
            <line id="divider" stroke="var(--stroke-0, #182540)" x2="390" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SectionLabel1() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">General</p>
    </div>
  );
}

function Sparkles() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_5386)" id="sparkles">
          <path d={svgPaths.pc53a880} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5386">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconBg3() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Sparkles />
    </div>
  );
}

function Toggle3() {
  return (
    <div className="h-[24px] relative shrink-0 w-[44px]" data-name="toggle">
      <div className="absolute inset-[0_0_-4.17%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 25">
          <g id="toggle">
            <rect fill="var(--fill-0, #C8941A)" height="24" rx="12" width="44" />
            <g filter="url(#filter0_d_11_5333)" id="thumb">
              <circle cx="32" cy="12" fill="var(--fill-0, #F5F0E8)" r="10" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24" id="filter0_d_11_5333" width="24" x="20" y="1">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_11_5333" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_11_5333" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function RightSide3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <Toggle3 />
    </div>
  );
}

function SettingsRow3() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg3 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Completion Celebration</p>
          <RightSide3 />
        </div>
      </div>
    </div>
  );
}

function RowWrap3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow3 />
      <div className="h-0 relative shrink-0 w-full" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 390 1">
            <line id="divider" stroke="var(--stroke-0, #182540)" x2="390" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function TrendingUp() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="trending-up">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="trending-up">
          <path d={svgPaths.p39419680} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg4() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <TrendingUp />
    </div>
  );
}

function Toggle4() {
  return (
    <div className="h-[24px] relative shrink-0 w-[44px]" data-name="toggle">
      <div className="absolute inset-[0_0_-4.17%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 25">
          <g id="toggle">
            <rect fill="var(--fill-0, #2A2D3E)" height="24" rx="12" width="44" />
            <g filter="url(#filter0_d_11_5315)" id="thumb">
              <circle cx="12" cy="12" fill="var(--fill-0, #F5F0E8)" r="10" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="24" id="filter0_d_11_5315" width="24" x="0" y="1">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="1" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_11_5315" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_11_5315" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function RightSide4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <Toggle4 />
    </div>
  );
}

function SettingsRow4() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg4 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Daily Streak Reminder</p>
          <RightSide4 />
        </div>
      </div>
    </div>
  );
}

function RowWrap4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow4 />
      <div className="h-0 relative shrink-0 w-full" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 390 1">
            <line id="divider" stroke="var(--stroke-0, #182540)" x2="390" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function AudioWaveform() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="audio-waveform">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_5383)" id="audio-waveform">
          <path d={svgPaths.p1a0a700} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5383">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconBg5() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <AudioWaveform />
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-right">
          <path d="M6 12L10 8L6 4" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function RightSide5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Gentle Chime</p>
      <ChevronRight />
    </div>
  );
}

function SettingsRow5() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg5 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Notification Sound</p>
          <RightSide5 />
        </div>
      </div>
    </div>
  );
}

function RowWrap5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow5 />
      <div className="h-0 relative shrink-0 w-full" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 390 1">
            <line id="divider" stroke="var(--stroke-0, #182540)" x2="390" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="main-content">
      <StatusBar />
      <Header />
      <BannerWrap />
      <SectionLabel />
      <RowWrap />
      <TimePicker />
      <RowWrap1 />
      <RowWrap2 />
      <SectionLabel1 />
      <RowWrap3 />
      <RowWrap4 />
      <RowWrap5 />
    </div>
  );
}

function IndicatorArea() {
  return (
    <div className="content-stretch flex items-start justify-center pb-[8px] pt-[21px] relative shrink-0 w-full" data-name="indicator-area">
      <div className="bg-[#f5f0e8] h-[5px] opacity-30 relative rounded-[10px] shrink-0 w-[134px]" data-name="bar" />
    </div>
  );
}

export default function NotificationSettings() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Notification Settings">
      <MainContent />
      <IndicatorArea />
    </div>
  );
}