import { motion } from "motion/react";
import svgPaths from "./svg-90lyzr4nav";

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
    <div className="content-stretch flex flex-col items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="back-btn">
      <ChevronLeft />
    </div>
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
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] text-center whitespace-nowrap">Settings</p>
          <RightAction />
        </div>
      </div>
    </div>
  );
}

function SectionLabel() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Preferences</p>
    </div>
  );
}

function Globe() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="globe">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_5321)" id="globe">
          <path d={svgPaths.p3b306c80} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5321">
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
      <Globe />
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

function RightSide() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">English</p>
      <ChevronRight />
    </div>
  );
}

function SettingsRow() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Language</p>
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

function MoonStar() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="moon-star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="moon-star">
          <path d={svgPaths.p1a7a8500} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg1() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <MoonStar />
    </div>
  );
}

function ChevronRight1() {
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

function RightSide1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Dark Mode</p>
      <ChevronRight1 />
    </div>
  );
}

function SettingsRow1() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg1 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Display Theme</p>
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

function Text() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="text">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="text">
          <path d={svgPaths.p2ace4a80} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg2() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Text />
    </div>
  );
}

function ChevronRight2() {
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
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Medium</p>
      <ChevronRight2 />
    </div>
  );
}

function SettingsRow2() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg2 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Text Size</p>
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

function BellDot() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="bell-dot">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="bell-dot">
          <path d={svgPaths.p2185c0b0} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg3() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <BellDot />
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

function RightSide3() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <Toggle />
    </div>
  );
}

function SettingsRow3() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg3 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Notifications</p>
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

function SectionLabel1() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Content</p>
    </div>
  );
}

function Headphones() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="headphones">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="headphones">
          <path d={svgPaths.pb67f980} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg4() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Headphones />
    </div>
  );
}

function ChevronRight3() {
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

function RightSide4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">High</p>
      <ChevronRight3 />
    </div>
  );
}

function SettingsRow4() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg4 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Audio Quality</p>
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

function DownloadCloud() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="download-cloud">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="download-cloud">
          <path d={svgPaths.pb197380} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg5() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <DownloadCloud />
    </div>
  );
}

function ChevronRight4() {
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
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">3 categories</p>
      <ChevronRight4 />
    </div>
  );
}

function SettingsRow5() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg5 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Offline Downloads</p>
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

function Database() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="database">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="database">
          <path d={svgPaths.p10c45e80} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg6() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <Database />
    </div>
  );
}

function ChevronRight5() {
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

function RightSide6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="right-side">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">24.3 MB</p>
      <ChevronRight5 />
    </div>
  );
}

function SettingsRow6() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg6 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Storage Used</p>
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

function SectionLabel2() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Accessibility</p>
    </div>
  );
}

function UserRound() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="user-round">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="user-round">
          <path d={svgPaths.p1be63f60} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg7() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <UserRound />
    </div>
  );
}

function ChevronRight6() {
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

function RightSide7() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <ChevronRight6 />
    </div>
  );
}

function SettingsRow7() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg7 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Accessibility</p>
          <RightSide7 />
        </div>
      </div>
    </div>
  );
}

function RowWrap7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow7 />
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

function ArrowDownNarrowWide() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="arrow-down-narrow-wide">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="arrow-down-narrow-wide">
          <path d={svgPaths.p1fe5bb00} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg8() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <ArrowDownNarrowWide />
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

function RightSide8() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <Toggle1 />
    </div>
  );
}

function SettingsRow8() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg8 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">Reduce Motion</p>
          <RightSide8 />
        </div>
      </div>
    </div>
  );
}

function RowWrap8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow8 />
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
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Account</p>
    </div>
  );
}

function ChartColumn() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="chart-column">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="chart-column">
          <path d={svgPaths.p1a331600} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg9() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <ChartColumn />
    </div>
  );
}

function ChevronRight7() {
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

function RightSide9() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="right-side">
      <ChevronRight7 />
    </div>
  );
}

function SettingsRow9() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg9 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px]">My Progress</p>
          <RightSide9 />
        </div>
      </div>
    </div>
  );
}

function RowWrap9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow9 />
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

function LogOut() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="log-out">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="log-out">
          <path d={svgPaths.p2014ca00} id="Vector" stroke="var(--stroke-0, #C0392B)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconBg10() {
  return (
    <div className="bg-[#c0392b] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[32px]" data-name="icon-bg">
      <LogOut />
    </div>
  );
}

function RightSide10() {
  return <div className="relative shrink-0 size-[100px]" data-name="right-side" />;
}

function SettingsRow10() {
  return (
    <div className="bg-[#111b35] h-[56px] relative shrink-0 w-full" data-name="settings-row">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <IconBg10 />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#c0392b] text-[17px]">Sign Out</p>
          <RightSide10 />
        </div>
      </div>
    </div>
  );
}

function RowWrap10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="row-wrap">
      <SettingsRow10 />
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

function Footer() {
  return (
    <div className="content-stretch flex flex-col items-center py-[40px] relative shrink-0 w-full" data-name="footer">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] whitespace-nowrap">Azkar v2.0.1</p>
    </div>
  );
}

function MainContent() {
  return (
    <motion.div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="main-content">
      <StatusBar />
      <Header />
      <SectionLabel />
      <RowWrap />
      <RowWrap1 />
      <RowWrap2 />
      <RowWrap3 />
      <SectionLabel1 />
      <RowWrap4 />
      <RowWrap5 />
      <RowWrap6 />
      <SectionLabel2 />
      <RowWrap7 />
      <RowWrap8 />
      <SectionLabel3 />
      <RowWrap9 />
      <RowWrap10 />
      <Footer />
    </motion.div>
  );
}

function IndicatorArea() {
  return (
    <motion.div className="content-stretch flex items-start justify-center pb-[8px] pt-[21px] relative shrink-0 w-full" data-name="indicator-area">
      <div className="bg-[#f5f0e8] h-[5px] opacity-30 relative rounded-[10px] shrink-0 w-[134px]" data-name="bar" />
    </motion.div>
  );
}

export default function SettingsRoot() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Settings Root">
      <MainContent />
      <IndicatorArea />
    </div>
  );
}