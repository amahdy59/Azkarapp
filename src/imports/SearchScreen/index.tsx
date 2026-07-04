import svgPaths from "./svg-e1g20dc2p8";

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

function Icon() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]" data-name="icon">
      <ArrowLeft />
    </div>
  );
}

function Search() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="search">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="search">
          <path d={svgPaths.peea8900} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[18px]" data-name="icon">
      <Search />
    </div>
  );
}

function Frame() {
  return <div className="flex-[1_0_0] h-[100px] min-w-px relative" data-name="Frame" />;
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="icon">
          <path d="M12 4L4 12M4 4L12 12" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <Icon3 />
    </div>
  );
}

function BtnPrimary() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] h-[48px] min-w-px relative rounded-[24px]" data-name="btn-primary">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <Icon1 />
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">Search azkar, duas...</p>
          <div className="bg-[#c8941a] h-[18px] relative shrink-0 w-[2px]" data-name="Rectangle" />
          <Frame />
          <Icon2 />
        </div>
      </div>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[20px] relative size-full">
          <Icon />
          <BtnPrimary />
        </div>
      </div>
    </div>
  );
}

function X() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="x">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="x">
          <path d="M9 3L3 9M3 3L9 9" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Frame">
      <X />
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-[#182540] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#f5f0e8] text-[13px] whitespace-nowrap">Istighfar</p>
      <Frame4 />
    </div>
  );
}

function X1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="x">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="x">
          <path d="M9 3L3 9M3 3L9 9" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Frame">
      <X1 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[#182540] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#f5f0e8] text-[13px] whitespace-nowrap">Morning Dua</p>
      <Frame6 />
    </div>
  );
}

function X2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="x">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="x">
          <path d="M9 3L3 9M3 3L9 9" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[12px]" data-name="Frame">
      <X2 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-[#182540] content-stretch flex gap-[6px] items-center px-[12px] py-[8px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#f5f0e8] text-[13px] whitespace-nowrap">Ayat al-Kursi</p>
      <Frame8 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-start flex flex-wrap gap-[8px] items-start relative shrink-0 w-full" data-name="Frame">
      <Frame3 />
      <Frame5 />
      <Frame7 />
    </div>
  );
}

function BtnPrimary1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="btn-primary">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] whitespace-nowrap">RECENT SEARCHES</p>
      <Frame2 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Al-Fatihah</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">The Opening</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#0a1228] text-[10px] whitespace-nowrap">Morning</p>
    </div>
  );
}

function CategoryCard1() {
  return (
    <div className="bg-[#111b35] h-[72px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Frame11 />
          <Frame12 />
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Istighfar</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">Seeking Forgiveness</p>
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#f5f0e8] text-[10px] whitespace-nowrap">Evening</p>
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="bg-[#111b35] h-[72px] relative rounded-[12px] shrink-0 w-full" data-name="screen-header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Frame13 />
          <Frame14 />
        </div>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Ayat al-Kursi</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">Protection</p>
    </div>
  );
}

function Frame16() {
  return (
    <div className="bg-[#4a3d6b] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#f5f0e8] text-[10px] whitespace-nowrap">Sleep</p>
    </div>
  );
}

function CategoryCard2() {
  return (
    <div className="bg-[#111b35] h-[72px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Frame15 />
          <Frame16 />
        </div>
      </div>
    </div>
  );
}

function Frame17() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Morning Remembrance</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">15 azkar · Full morning session</p>
    </div>
  );
}

function Frame18() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#0a1228] text-[10px] whitespace-nowrap">Morning</p>
    </div>
  );
}

function CategoryCard3() {
  return (
    <div className="bg-[#111b35] h-[72px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[16px] relative size-full">
          <Frame17 />
          <Frame18 />
        </div>
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="Frame">
      <CategoryCard1 />
      <ScreenHeader />
      <CategoryCard2 />
      <CategoryCard3 />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">RESULTS FOR AL-FATIHAH</p>
      <Frame10 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[20px] relative size-full">
        <BtnPrimary1 />
        <Frame9 />
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center py-[24px] relative shrink-0 w-full" data-name="list-item">
      <div className="bg-[#9290b0] h-px opacity-15 relative shrink-0 w-full" data-name="Rectangle" />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#9290b0] text-[11px] text-center w-full">Try searching by Arabic text or transliteration</p>
    </div>
  );
}

export default function SearchScreen() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Search Screen">
      <StatusBar />
      <CategoryCard />
      <Frame1 />
      <ListItem />
    </div>
  );
}