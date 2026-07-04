import svgPaths from "./svg-unx6jyh01j";

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

function Settings() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="settings">
          <path d={svgPaths.pc965540} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function RightAction() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[40px]" data-name="right-action">
      <Settings />
    </div>
  );
}

function Header() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[16px] relative size-full">
          <BackBtn />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] text-center whitespace-nowrap">Offline Downloads</p>
          <RightAction />
        </div>
      </div>
    </div>
  );
}

function CloudDownload() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="cloud-download">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="cloud-download">
          <path d={svgPaths.p1a6830a0} id="icon" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function BannerReal() {
  return (
    <div className="bg-[#1a7060] relative rounded-[12px] shrink-0 w-full" data-name="banner-real">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <CloudDownload />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#f5f0e8] text-[14px]">Download azkar for offline use — works without internet</p>
        </div>
      </div>
    </div>
  );
}

function HeroPadding() {
  return (
    <div className="relative shrink-0 w-full" data-name="hero-padding">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <BannerReal />
      </div>
    </div>
  );
}

function Btn() {
  return (
    <div className="content-stretch flex h-[48px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="btn">
      <div aria-hidden className="absolute border-[#c8941a] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#c8941a] text-[17px] whitespace-nowrap">Download All Categories</p>
    </div>
  );
}

function Actions() {
  return (
    <div className="relative shrink-0 w-full" data-name="actions">
      <div className="content-stretch flex flex-col items-start pb-[16px] px-[16px] relative size-full">
        <Btn />
      </div>
    </div>
  );
}

function SectionLabel() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Available to Download</p>
    </div>
  );
}

function Sun() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="sun">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="sun">
          <path d={svgPaths.paf87f00} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px not-italic relative whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Morning Azkar</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">15 azkar · 8.2 MB</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[12px] py-[6px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">DOWNLOAD</p>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Sun />
          <Frame />
          <Frame1 />
        </div>
      </div>
    </div>
  );
}

function CardRow() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-row">
      <div className="content-stretch flex flex-col items-start pb-[12px] px-[16px] relative size-full">
        <Card />
      </div>
    </div>
  );
}

function Moon() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="moon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="moon">
          <path d={svgPaths.p580cb80} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px not-italic relative whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Evening Azkar</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">15 azkar · 7.8 MB</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[12px] py-[6px] relative rounded-[100px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] whitespace-nowrap">DOWNLOAD</p>
    </div>
  );
}

function Card1() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Moon />
          <Frame2 />
          <Frame3 />
        </div>
      </div>
    </div>
  );
}

function CardRow1() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-row">
      <div className="content-stretch flex flex-col items-start pb-[12px] px-[16px] relative size-full">
        <Card1 />
      </div>
    </div>
  );
}

function Star() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="star">
          <path d={svgPaths.peb8f600} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start min-w-px not-italic relative whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Before Sleep</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">10 azkar · 5.1 MB</p>
    </div>
  );
}

function Pause() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="pause">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="pause">
          <g id="Vector">
            <path d={svgPaths.p742c900} stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
            <path d={svgPaths.p5305a00} stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-[#1c2642] content-stretch flex flex-col items-center justify-center relative rounded-[14px] shrink-0 size-[28px]" data-name="icon">
      <Pause />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="Frame">
      <Star />
      <Frame5 />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#1a7060] text-[14px] whitespace-nowrap">60%</p>
      <Icon />
    </div>
  );
}

function ProgressTrack() {
  return (
    <div className="bg-[#1c2642] content-stretch flex h-[6px] items-start overflow-clip relative rounded-[3px] shrink-0 w-full" data-name="progress-track">
      <div className="bg-[#1a7060] h-full relative shrink-0 w-[210px]" data-name="fill" />
    </div>
  );
}

function CardActive() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="card-active">
      <div aria-hidden className="absolute border border-[#1a7060] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative size-full">
        <Frame4 />
        <ProgressTrack />
      </div>
    </div>
  );
}

function CardRow2() {
  return (
    <div className="relative shrink-0 w-full" data-name="card-row">
      <div className="content-stretch flex flex-col items-start pb-[12px] px-[16px] relative size-full">
        <CardActive />
      </div>
    </div>
  );
}

function SectionLabel1() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Storage</p>
    </div>
  );
}

function ProgressTrack1() {
  return (
    <div className="bg-[#1c2642] content-stretch flex h-[6px] items-start overflow-clip relative rounded-[3px] shrink-0 w-full" data-name="progress-track">
      <div className="bg-[#1a7060] h-full relative shrink-0 w-[84px]" data-name="fill" />
    </div>
  );
}

function MeterBox() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0 w-full" data-name="meter-box">
      <ProgressTrack1 />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#7b789a] text-[0px] whitespace-nowrap">
        <span className="leading-[20px] text-[13px]">{`24.3 MB used · `}</span>
        <span className="leading-[20px] text-[#f5f0e8] text-[13px]">75.7 MB free</span>
      </p>
    </div>
  );
}

function ClearBtn() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center relative rounded-[12px] shrink-0 w-full" data-name="clear-btn">
      <div aria-hidden className="absolute border border-[#c0392b] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#c0392b] text-[14px] whitespace-nowrap">Clear All Downloads</p>
    </div>
  );
}

function StoragePanel() {
  return (
    <div className="relative shrink-0 w-full" data-name="storage-panel">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[16px] relative size-full">
        <MeterBox />
        <ClearBtn />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="main-content">
      <StatusBar />
      <Header />
      <HeroPadding />
      <Actions />
      <SectionLabel />
      <CardRow />
      <CardRow1 />
      <CardRow2 />
      <SectionLabel1 />
      <StoragePanel />
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

export default function DownloadManager() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Download Manager">
      <MainContent />
      <IndicatorArea />
    </div>
  );
}