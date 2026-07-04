import svgPaths from "./svg-cwct0obxmr";

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
    <div className="relative shrink-0 size-[24px]" data-name="chevron-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="chevron-left">
          <path d="M15 18L9 12L15 6" id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
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
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] whitespace-nowrap">About Azkar</p>
          <Icon />
        </div>
      </div>
    </div>
  );
}

function AzkarLogo() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="azkar-logo">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g id="azkar-logo">
          <ellipse cx="12" cy="16" fill="var(--fill-0, #C8941A)" id="Ellipse" rx="12" ry="8" />
          <ellipse cx="20" cy="16" fill="var(--fill-0, #C8941A)" id="Ellipse_2" rx="12" ry="8" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-center not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#f5f0e8] text-[22px] tracking-[-0.11px]">Azkar</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] relative shrink-0 text-[#9290b0] text-[13px]">Daily Islamic Remembrance</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] opacity-60 relative shrink-0 text-[#9290b0] text-[11px]">Version 2.0.1</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="Frame">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-center p-[24px] relative size-full">
          <AzkarLogo />
          <Frame2 />
        </div>
      </div>
    </div>
  );
}

function Book() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="book">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="book">
          <path d={svgPaths.p11e58200} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <Book />
    </div>
  );
}

function Icon1() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon2 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="Frame">
      <div className="[word-break:break-word] content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[2px] items-start leading-[22px] not-italic pr-[8px] relative size-full text-[14px] whitespace-nowrap">
        <p className="relative shrink-0 text-[#f5f0e8]">Hisnul Muslim</p>
        <p className="relative shrink-0 text-[#9290b0]">All azkar verified from authentic sources</p>
      </div>
    </div>
  );
}

function Info() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="info">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_11_5273)" id="info">
          <path d={svgPaths.p1298de00} id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5273">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <Info />
    </div>
  );
}

function CategoryCard1() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div aria-hidden className="absolute border-[#182540] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon1 />
          <Frame4 />
          <Icon3 />
        </div>
      </div>
    </div>
  );
}

function Star() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="star">
          <path d={svgPaths.p1eebb470} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <Star />
    </div>
  );
}

function Icon4() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon5 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal gap-[2px] items-start leading-[22px] min-w-px not-italic relative text-[14px] whitespace-nowrap" data-name="Frame">
      <p className="relative shrink-0 text-[#f5f0e8]">Hadith References</p>
      <p className="relative shrink-0 text-[#9290b0]">{`Bukhari, Muslim, Tirmidhi & more`}</p>
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

function Icon6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ChevronRight />
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="screen-header">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon4 />
          <Frame5 />
          <Icon6 />
        </div>
      </div>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <CategoryCard1 />
      <ScreenHeader />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#c8941a] text-[10px] whitespace-nowrap">CONTENT SOURCE</p>
      <CategoryCard />
    </div>
  );
}

function MessageSquare() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="message-square">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="message-square">
          <path d={svgPaths.p3fe85d00} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon8() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <MessageSquare />
    </div>
  );
}

function Icon7() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon8 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Send Feedback</p>
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

function Icon9() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ChevronRight1 />
    </div>
  );
}

function CategoryCard2() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div aria-hidden className="absolute border-[#182540] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon7 />
          <Frame8 />
          <Icon9 />
        </div>
      </div>
    </div>
  );
}

function HelpCircle() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="help-circle">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_11_5261)" id="help-circle">
          <path d={svgPaths.p1fb62380} id="icon" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5261">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon11() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <HelpCircle />
    </div>
  );
}

function Icon10() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon11 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Frequently Asked Questions</p>
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

function Icon12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ChevronRight2 />
    </div>
  );
}

function ScreenHeader1() {
  return (
    <div className="relative shrink-0 w-full" data-name="screen-header">
      <div aria-hidden className="absolute border-[#182540] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon10 />
          <Frame9 />
          <Icon12 />
        </div>
      </div>
    </div>
  );
}

function Globe() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="globe">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_11_5258)" id="globe">
          <path d={svgPaths.p16bd2100} id="icon" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_5258">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon14() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <Globe />
    </div>
  );
}

function Icon13() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon14 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Visit Website</p>
    </div>
  );
}

function ExternalLink() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="external-link">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="external-link">
          <path d={svgPaths.p74d7380} id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon15() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ExternalLink />
    </div>
  );
}

function CategoryCard3() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon13 />
          <Frame10 />
          <Icon15 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Frame">
      <CategoryCard2 />
      <ScreenHeader1 />
      <CategoryCard3 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#c8941a] text-[10px] whitespace-nowrap">SUPPORT</p>
      <Frame7 />
    </div>
  );
}

function Shield() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="shield">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="shield">
          <path d={svgPaths.p6147300} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon17() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <Shield />
    </div>
  );
}

function Icon16() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon17 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Privacy Policy</p>
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

function Icon18() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ChevronRight3 />
    </div>
  );
}

function CategoryCard5() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div aria-hidden className="absolute border-[#182540] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon16 />
          <Frame12 />
          <Icon18 />
        </div>
      </div>
    </div>
  );
}

function FileText() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="file-text">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="file-text">
          <path d={svgPaths.p27efcb00} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon20() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <FileText />
    </div>
  );
}

function Icon19() {
  return (
    <div className="bg-[#182540] content-stretch flex items-center justify-center relative rounded-[8px] shrink-0 size-[36px]" data-name="icon">
      <Icon20 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Terms of Service</p>
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

function Icon21() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ChevronRight4 />
    </div>
  );
}

function ScreenHeader2() {
  return (
    <div className="relative shrink-0 w-full" data-name="screen-header">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0)] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon19 />
          <Frame13 />
          <Icon21 />
        </div>
      </div>
    </div>
  );
}

function CategoryCard4() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <CategoryCard5 />
      <ScreenHeader2 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#c8941a] text-[10px] whitespace-nowrap">LEGAL</p>
      <CategoryCard4 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex items-start justify-center py-[12px] relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">Made with ♥ for the Muslim community</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[20px] relative size-full">
        <Frame1 />
        <Frame3 />
        <Frame6 />
        <Frame11 />
        <Frame14 />
      </div>
    </div>
  );
}

export default function AboutHelp() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="About & Help">
      <StatusBar />
      <Header />
      <Frame />
    </div>
  );
}