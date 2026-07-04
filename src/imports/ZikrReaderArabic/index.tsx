import svgPaths from "./svg-la68zu52rt";

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
    <div className="content-stretch flex gap-[6px] items-start relative shrink-0" data-name="Frame">
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
          <Frame />
        </div>
      </div>
    </div>
  );
}

function Bookmark() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="bookmark">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="bookmark">
          <path d={svgPaths.p24c8ac0} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]" data-name="icon-wrapper">
      <Bookmark />
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-start px-[12px] py-[6px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#c8941a] text-[14px] whitespace-nowrap" dir="auto">
        ٤ من ١٥
      </p>
    </div>
  );
}

function ArrowLeft() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="arrow-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="arrow-left">
          <path d={svgPaths.p177d0d00} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]" data-name="icon-wrapper">
      <ArrowLeft />
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="screen-header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] py-[12px] relative size-full">
          <IconWrapper />
          <Frame1 />
          <IconWrapper1 />
        </div>
      </div>
    </div>
  );
}

function ScreenHeader1() {
  return (
    <div className="content-stretch flex flex-col font-semibold gap-[12px] items-start leading-[24px] relative shrink-0 text-[17px] text-right w-full" data-name="screen-header">
      <p className="font-['Inter:Semi_Bold',sans-serif] relative shrink-0 text-[#9290b0] w-full">{`Allāhumma innī as'aluka al-ʿafwa wal-ʿāfiyah`}</p>
      <p className="font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] relative shrink-0 text-[#f5f0e8] w-full" dir="auto">
        اللهم إني أسألك العفو والعافية في الدنيا والآخرة
      </p>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[24px] items-center not-italic relative shrink-0 w-full" data-name="category-card">
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#f5f0e8] text-[28px] text-center tracking-[-0.28px] w-full" dir="auto">
        اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ
      </p>
      <ScreenHeader1 />
    </div>
  );
}

function ChevronDown() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-down">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-down">
          <path d="M4 6L8 10L12 6" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon-wrapper">
      <ChevronDown />
    </div>
  );
}

function Star() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_11_4439)" id="star">
          <path d={svgPaths.p397b9d00} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4439">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconWrapper3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon-wrapper">
      <Star />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap" dir="auto">
        الفائدة والفضيلة
      </p>
      <IconWrapper3 />
    </div>
  );
}

function BtnPrimary() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="btn-primary">
      <div aria-hidden className="absolute border border-[#111b35] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <IconWrapper2 />
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function Play() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="play">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="play">
          <path d={svgPaths.p19931f00} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <Play />
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="icon">
      <IconWrapper4 />
    </div>
  );
}

function Waveform() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] h-[24px] items-center min-w-px relative" data-name="waveform">
      <div className="bg-[#1a7060] h-[10px] relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#1a7060] h-[18px] relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#1a7060] h-[14px] relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#1a7060] h-[24px] relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#1a7060] h-[16px] relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#1a7060] h-[20px] relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[12px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[18px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[14px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[22px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[10px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[16px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[20px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[14px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[18px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[12px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[20px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[16px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[24px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[14px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[18px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[10px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[14px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#9290b0] h-[18px] opacity-30 relative rounded-[1.5px] shrink-0 w-[3px]" data-name="Rectangle" />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[10px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#1a7060] text-[14px] whitespace-nowrap" dir="auto">
        ١×
      </p>
    </div>
  );
}

function AudioPlayer() {
  return (
    <div className="bg-[#1a7060] relative rounded-[20px] shrink-0 w-full" data-name="audio-player">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon />
          <Waveform />
          <Frame4 />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[32px] items-start pt-[32px] px-[24px] relative size-full">
        <CategoryCard />
        <BtnPrimary />
        <AudioPlayer />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-center not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#f5f0e8] text-[28px] tracking-[-0.28px]">٧</p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#c8941a] text-[14px]" dir="auto">
        من ٣٣
      </p>
    </div>
  );
}

function RingContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[180px]" data-name="ring-container">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[160px] top-1/2" data-name="counter-ring">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 160">
          <circle cx="80" cy="80" id="counter-ring" opacity="0.1" r="78" stroke="var(--stroke-0, #9290B0)" strokeWidth="4" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[160px] top-1/2" data-name="counter-ring">
        <div className="absolute bottom-[61.2%] left-1/2 right-[1.41%] top-0">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 77.7437 62.0776">
            <g id="counter-ring">
              <mask fill="white" id="path-1-inside-1_11_4437">
                <path d={svgPaths.p3e7c1800} />
              </mask>
              <path d={svgPaths.p3e7c1800} mask="url(#path-1-inside-1_11_4437)" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="12" />
            </g>
          </svg>
        </div>
      </div>
      <Frame5 />
    </div>
  );
}

function HomeIndicatorContainer() {
  return (
    <div className="content-stretch flex items-start justify-center py-[8px] relative shrink-0 w-full" data-name="home-indicator-container">
      <div className="bg-[#f5f0e8] h-[5px] opacity-30 relative rounded-[100px] shrink-0 w-[134px]" data-name="progress-bar" />
    </div>
  );
}

function CounterZone() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col h-[321px] items-center justify-between pt-[20px] relative rounded-tl-[40px] rounded-tr-[40px] shrink-0 w-full" data-name="counter-zone">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap" dir="auto">
        انقر في أي مكان للعد
      </p>
      <RingContainer />
      <HomeIndicatorContainer />
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="settings">
          <path d={svgPaths.p6e61700} id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function NavItemSettings() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0" data-name="nav-item-settings">
      <Settings />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap" dir="auto">
        الإعدادات
      </p>
    </div>
  );
}

function Bookmark1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="bookmark">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="bookmark">
          <path d={svgPaths.p24c8ac0} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function NavItemAzkarActive() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0" data-name="nav-item-azkar-active">
      <Bookmark1 />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap" dir="auto">
        الأذكار
      </p>
    </div>
  );
}

function Home() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="home">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="home">
          <path d={svgPaths.p2b741c00} id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function NavItemHome() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center justify-center relative shrink-0" data-name="nav-item-home">
      <Home />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap" dir="auto">
        الرئيسية
      </p>
    </div>
  );
}

function BottomNav() {
  return (
    <div className="bg-[#0a1228] h-[96px] relative shrink-0 w-full" data-name="bottom-nav">
      <div aria-hidden className="absolute border-[#182540] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[24px] pt-[12px] px-[24px] relative size-full">
          <NavItemSettings />
          <NavItemAzkarActive />
          <NavItemHome />
        </div>
      </div>
    </div>
  );
}

export default function ZikrReaderArabic() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Zikr Reader - Arabic">
      <StatusBar />
      <ScreenHeader />
      <Frame2 />
      <CounterZone />
      <BottomNav />
    </div>
  );
}