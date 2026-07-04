import svgPaths from "./svg-jxh7x1hdlh";

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
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] text-center whitespace-nowrap">Accessibility</p>
          <RightAction />
        </div>
      </div>
    </div>
  );
}

function SectionLabel() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Visual</p>
    </div>
  );
}

function Track() {
  return (
    <div className="bg-[#2a2d3e] content-stretch flex flex-[1_0_0] h-[4px] items-center min-w-px relative rounded-[2px]" data-name="track">
      <div className="-translate-x-1/2 absolute left-1/2 size-[24px] top-0" data-name="thumb">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" fill="var(--fill-0, #C8941A)" id="thumb" r="10" stroke="var(--stroke-0, #F5F0E8)" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}

function SliderRow() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="slider-row">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">A</p>
      <Track />
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[30px] not-italic relative shrink-0 text-[#f5f0e8] text-[22px] tracking-[-0.11px] whitespace-nowrap">A</p>
    </div>
  );
}

function Presets() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Inter:Regular',sans-serif] font-normal items-start justify-between leading-[20px] not-italic relative shrink-0 text-[13px] w-full whitespace-nowrap" data-name="presets">
      <p className="relative shrink-0 text-[#9290b0]">Small</p>
      <p className="relative shrink-0 text-[#c8941a]">Medium</p>
      <p className="relative shrink-0 text-[#9290b0]">Large</p>
    </div>
  );
}

function FontSizeSection() {
  return (
    <div className="bg-[#111b35] relative shrink-0 w-full" data-name="font-size-section">
      <div className="content-stretch flex flex-col gap-[16px] items-start p-[16px] relative size-full">
        <SliderRow />
        <Presets />
      </div>
    </div>
  );
}

function Contrast() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="contrast">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_5356)" id="contrast">
          <path d={svgPaths.p2960c000} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5356">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconBg() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Contrast />
    </div>
  );
}

function Toggle() {
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

function RightSide() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
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
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">High Contrast Mode</p>
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

function Bold() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="bold">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="bold">
          <path d={svgPaths.p386bc1e0} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg1() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Bold />
    </div>
  );
}

function Toggle1() {
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

function RightSide1() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
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
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Bold Text</p>
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

function Palette() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="palette">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_5347)" id="palette">
          <path d={svgPaths.p29421600} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5347">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconBg2() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Palette />
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

function RightSide2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">None</p>
      <ChevronRight />
    </div>
  );
}

function SettingsRow2() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg2 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Color Blind Support</p>
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
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Motion</p>
    </div>
  );
}

function ArrowsUpFromLine() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="arrows-up-from-line">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="arrows-up-from-line">
          <path d={svgPaths.p1176a300} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg3() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <ArrowsUpFromLine />
    </div>
  );
}

function Toggle2() {
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
      <Toggle2 />
    </div>
  );
}

function SettingsRow3() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg3 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Reduce Motion</p>
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

function Vibrate() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="vibrate">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="vibrate">
          <path d={svgPaths.p35bfcf00} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg4() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Vibrate />
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

function RightSide4() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <Toggle3 />
    </div>
  );
}

function SettingsRow4() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg4 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Haptic Feedback</p>
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

function SectionLabel2() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Reading</p>
    </div>
  );
}

function AlignRight() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="align-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="align-right">
          <path d={svgPaths.p28aa9216} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg5() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <AlignRight />
    </div>
  );
}

function Toggle4() {
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

function RightSide5() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <Toggle4 />
    </div>
  );
}

function SettingsRow5() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg5 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Right-to-Left Layout</p>
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

function Info() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="info">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_4308)" id="info">
          <path d={svgPaths.p1850880} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4308">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconBg6() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Info />
    </div>
  );
}

function RightSide6() {
  return <div className="relative shrink-0 size-[100px]" data-name="right-side" />;
}

function SettingsRow6() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg6 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">VoiceOver Compatible</p>
          <RightSide6 />
        </div>
      </div>
    </div>
  );
}

function RowWrap6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow6 />
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

function SectionLabel3() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Audio</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative rounded-[6px]" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] whitespace-nowrap">0.75x</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative rounded-[6px]" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#c8941a] text-[13px] whitespace-nowrap">1x</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative rounded-[6px]" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] whitespace-nowrap">1.25x</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative rounded-[6px]" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] whitespace-nowrap">1.5x</p>
    </div>
  );
}

function Segmented() {
  return (
    <div className="bg-[#1c2642] flex-[1_0_0] h-[40px] min-w-px relative rounded-[8px]" data-name="segmented">
      <div className="content-stretch flex items-start p-[3px] relative size-full">
        <Frame />
        <Frame1 />
        <Frame2 />
        <Frame3 />
      </div>
    </div>
  );
}

function SpeedControl() {
  return (
    <div className="bg-[#111b35] relative shrink-0 w-full" data-name="speed-control">
      <div className="content-stretch flex items-start p-[16px] relative size-full">
        <Segmented />
      </div>
    </div>
  );
}

function PreviewBox() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="preview-box">
      <div aria-hidden className="absolute border border-[#182540] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col items-start p-[20px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[30px] not-italic relative shrink-0 text-[#f5f0e8] text-[22px] text-right tracking-[-0.11px] w-full" dir="auto">
          اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ
        </p>
      </div>
    </div>
  );
}

function Preview() {
  return (
    <div className="relative shrink-0 w-full" data-name="preview">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#c8941a] text-[14px] whitespace-nowrap">Preview</p>
        <PreviewBox />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="main-content">
      <StatusBar />
      <Header />
      <SectionLabel />
      <FontSizeSection />
      <RowWrap />
      <RowWrap1 />
      <RowWrap2 />
      <SectionLabel1 />
      <RowWrap3 />
      <RowWrap4 />
      <SectionLabel2 />
      <RowWrap5 />
      <RowWrap6 />
      <SectionLabel3 />
      <SpeedControl />
      <Preview />
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

export default function AccessibilitySettings() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Accessibility Settings">
      <MainContent />
      <IndicatorArea />
    </div>
  );
}