import { motion } from "motion/react";
import svgPaths from "./svg-qqikadd8ch";

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

function Header() {
  return (
    <div className="h-[56px] relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[20px] relative size-full">
          <ChevronLeft />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] whitespace-nowrap">​</p>
          <Bookmark />
        </div>
      </div>
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="bg-[#111b35] relative shrink-0 w-full" data-name="screen-header">
      <div className="content-stretch flex flex-col items-start p-[24px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[30px] not-italic relative shrink-0 text-[#f5f0e8] text-[22px] text-right tracking-[-0.11px] w-full" dir="auto">
          اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ
        </p>
      </div>
    </div>
  );
}

function TopPortion() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="top-portion">
      <Header />
      <ScreenHeader />
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

function Icon() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <Star />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <Icon />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-left whitespace-nowrap">{`Benefit & Virtue`}</p>
    </div>
  );
}

function ChevronUp() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-up">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-up">
          <path d="M12 10L8 6L4 10" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[16px]" data-name="icon">
      <ChevronUp />
    </div>
  );
}

function StatusBar1() {
  return (
    <a className="cursor-pointer h-[48px] relative shrink-0 w-full" data-name="status-bar">
      <div aria-hidden className="absolute border-[#1a7060] border-l-4 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
          <Frame />
          <Icon1 />
        </div>
      </div>
    </a>
  );
}

function Frame3() {
  return (
    <div className="bg-[#182540] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#c8941a] text-[10px] whitespace-nowrap">Al-Bukhari · Hadith 6362</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[10px] py-[4px] relative rounded-[6px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#f5f0e8] text-[10px] whitespace-nowrap">⭐ High Reward</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[8px] items-start relative shrink-0" data-name="Frame">
      <Frame3 />
      <Frame4 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[20px] items-start pb-[24px] px-[24px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[20px] min-w-full not-italic relative shrink-0 text-[#f5f0e8] text-[13px] w-[min-content]" dir="auto">
          The Prophet ﷺ said: Whoever recites Ayat al-Kursi after every obligatory prayer, nothing will prevent him from entering Paradise except death. [Al-Bukhari]
        </p>
        <Frame2 />
      </div>
    </div>
  );
}

function BenefitExpanded1() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="benefit-expanded">
      <StatusBar1 />
      <Frame1 />
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

function Icon2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon">
      <Play />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[3px] items-center min-w-px relative" data-name="Frame">
      <div className="bg-[#f5f0e8] h-[4px] relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[12px] relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[8px] relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[16px] relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[20px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[14px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[8px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[4px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[10px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[18px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
      <div className="bg-[#f5f0e8] h-[6px] opacity-30 relative rounded-[2px] shrink-0 w-[3px]" data-name="Rectangle" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="bg-[#1a7060] h-[52px] relative shrink-0 w-full" data-name="Frame">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[16px] items-center px-[24px] relative size-full">
          <Icon2 />
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-center not-italic relative shrink-0 text-left whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#f5f0e8] text-[28px] tracking-[-0.28px]">7</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#c8941a] text-[14px]">of 33</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-start left-[calc(50%+60px)] opacity-80 top-[calc(50%-60px)]" data-name="icon">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#1a7060] text-[17px] text-left whitespace-nowrap">+1</p>
    </div>
  );
}

function RingContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[300px]" data-name="ring-container">
      <motion.div className="absolute left-1/2 size-[180px] top-1/2" data-name="counter-ring">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 180 180">
          <circle cx="90" cy="90" fill="var(--fill-0, #C8941A)" id="counter-ring" opacity="0.05" r="90" />
        </svg>
      </motion.div>
      <motion.div className="absolute left-1/2 size-[160px] top-1/2" data-name="counter-ring">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160 160">
          <circle cx="80" cy="80" fill="var(--fill-0, #C8941A)" id="counter-ring" opacity="0.1" r="80" />
        </svg>
      </motion.div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[140px] top-1/2" data-name="counter-ring">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 140 140">
          <circle cx="70" cy="70" id="counter-ring" r="66" stroke="var(--stroke-0, #182540)" strokeWidth="8" />
        </svg>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 size-[140px] top-1/2" data-name="counter-ring">
        <div className="absolute inset-[-11.43%_-10.02%_48.59%_38.57%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100.026 87.9687">
            <g filter="url(#filter0_d_11_4306)" id="counter-ring">
              <mask fill="white" id="path-1-inside-1_11_4306">
                <path d={svgPaths.p33e68e00} />
              </mask>
              <path d={svgPaths.p33e68e00} mask="url(#path-1-inside-1_11_4306)" shapeRendering="crispEdges" stroke="var(--stroke-0, #C8941A)" strokeWidth="16" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="87.9687" id="filter0_d_11_4306" width="100.026" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset />
                <feGaussianBlur stdDeviation="8" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.784314 0 0 0 0 0.580392 0 0 0 0 0.101961 0 0 0 0.25098 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_11_4306" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_11_4306" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <Frame7 />
      <Icon3 />
    </div>
  );
}

function CounterZone() {
  return (
    <motion.a className="bg-[#0d1530] cursor-pointer flex-[1_0_0] min-h-px relative w-full" data-name="counter-zone">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center pt-[32px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13px] not-italic relative shrink-0 text-[#c8941a] text-[9px] text-left tracking-[0.72px] whitespace-nowrap">TAP ANYWHERE TO COUNT</p>
          <RingContainer />
        </div>
      </div>
    </motion.a>
  );
}

export default function BenefitExpanded() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Benefit Expanded">
      <StatusBar />
      <TopPortion />
      <BenefitExpanded1 />
      <Frame5 />
      <CounterZone />
    </div>
  );
}