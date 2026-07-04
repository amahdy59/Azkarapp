import { motion } from "motion/react";
import svgPaths from "./svg-lm4e5yahsf";

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

function Translations() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start not-italic relative shrink-0 text-center w-full" data-name="translations">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#94a3b8] text-[17px] w-full">Asbahna wa-asbahal-mulku lillahi walhamdu lillahi, la ilaha illallahu wahdahu la sharika lahu...</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] opacity-90 relative shrink-0 text-[#d4d0e0] text-[14px] w-full">We have entered a new day and with it all dominion belongs to Allah. There is no god but Allah...</p>
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

function BenefitRow() {
  return (
    <div className="bg-[#111b35] relative rounded-[12px] shrink-0 w-full" data-name="benefit-row">
      <div className="content-stretch flex gap-[10px] items-start p-[12px] relative size-full">
        <Info />
        <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[22px] min-w-px not-italic relative text-[#94a3b8] text-[14px]">Reciting this brings peace to the heart and protection for the day ahead.</p>
      </div>
    </div>
  );
}

function Volume() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="volume-2">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="volume-2">
          <path d={svgPaths.pf7a8c00} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Track() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-[1_0_0] h-[4px] items-center min-w-px relative rounded-[2px]" data-name="track">
      <div className="bg-[#c8941a] h-[4px] relative rounded-[2px] shrink-0 w-[120px]" data-name="progress-bar" />
      <div className="relative shrink-0 size-[12px]" data-name="Ellipse">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <circle cx="6" cy="6" fill="var(--fill-0, #C8941A)" id="Ellipse" r="5" stroke="var(--stroke-0, #0A1228)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function AudioPlayer() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="audio-player">
      <Volume />
      <Track />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#94a3b8] text-[11px] whitespace-nowrap">0:45 / 1:30</p>
    </div>
  );
}

function SupplicationBody() {
  return (
    <div className="relative shrink-0 w-full" data-name="supplication-body">
      <div className="content-stretch flex flex-col gap-[28px] items-start p-[24px] relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold','Noto_Sans_Arabic:Bold',sans-serif] font-bold leading-[30px] not-italic relative shrink-0 text-[#d4d0e0] text-[22px] text-center tracking-[-0.11px] w-full" dir="auto">
          أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ للهِ وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ
        </p>
        <Translations />
        <BenefitRow />
        <AudioPlayer />
      </div>
    </div>
  );
}

function TopContent() {
  return (
    <div className="content-stretch flex flex-col h-[508px] items-start relative shrink-0 w-full" data-name="top-content">
      <StatusBar />
      <Header />
      <SupplicationBody />
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-center not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#f5f0e8] text-[28px] tracking-[-0.28px]">7</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#c8941a] text-[14px]">of 33</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex items-start left-[calc(50%+60px)] opacity-80 top-[calc(50%-60px)]" data-name="icon">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#1a7060] text-[17px] whitespace-nowrap">+1</p>
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
      <Frame />
      <Icon />
    </div>
  );
}

function CounterZone() {
  return (
    <motion.div className="bg-[#0d1530] content-stretch flex flex-col h-[281px] items-center pt-[32px] relative shrink-0 w-full" data-name="counter-zone">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[13px] not-italic relative shrink-0 text-[#c8941a] text-[9px] tracking-[0.72px] whitespace-nowrap">TAP ANYWHERE TO COUNT</p>
      <RingContainer />
    </motion.div>
  );
}

export default function CounterActiveState() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="Counter Active State">
      <TopContent />
      <CounterZone />
    </div>
  );
}