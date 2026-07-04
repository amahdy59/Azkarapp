import { motion } from "motion/react";
import svgPaths from "./svg-wka8jf0q1i";

function IosSignal() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="ios-signal">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="ios-signal">
          <path clipRule="evenodd" d={svgPaths.p2bb6eb80} fill="var(--fill-0, #0A1228)" fillRule="evenodd" id="Vector" />
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
          <path clipRule="evenodd" d={svgPaths.p646c5c0} fill="var(--fill-0, #0A1228)" fillRule="evenodd" id="Vector" />
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
          <path d={svgPaths.p66c9640} fill="var(--fill-0, #0A1228)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Icons() {
  return (
    <div className="content-stretch flex gap-[6px] items-start relative shrink-0" data-name="icons">
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
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#0a1228] text-[14px] whitespace-nowrap">9:41</p>
          <Icons />
        </div>
      </div>
    </div>
  );
}

function HeaderLabel() {
  return (
    <div className="content-stretch flex flex-col items-center pt-[20px] relative shrink-0 w-full" data-name="header-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#94a3b8] text-[14px] whitespace-nowrap">Morning Session Complete</p>
    </div>
  );
}

function TopSection() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="top-section">
      <StatusBar />
      <HeaderLabel />
    </div>
  );
}

function Sparkles() {
  return (
    <div className="absolute left-[20px] size-[16px] top-[30px]" data-name="sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_11_4367)" id="sparkles">
          <path d={svgPaths.p39ddd080} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4367">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Sparkles1() {
  return (
    <div className="absolute left-[150px] size-[12px] top-[40px]" data-name="sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_11_4350)" id="sparkles">
          <path d={svgPaths.p1f813880} id="Vector" stroke="var(--stroke-0, #1A7060)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4350">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Sparkles2() {
  return (
    <div className="absolute left-[30px] size-[14px] top-[130px]" data-name="sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g clipPath="url(#clip0_11_4358)" id="sparkles">
          <path d={svgPaths.p17c90100} id="Vector" stroke="var(--stroke-0, #1A7060)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4358">
            <rect fill="white" height="14" width="14" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Sparkles3() {
  return (
    <div className="absolute left-[140px] size-[18px] top-[140px]" data-name="sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_11_4353)" id="sparkles">
          <path d={svgPaths.pc53a880} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4353">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[60px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 60">
        <g id="check">
          <path d={svgPaths.p26647e80} id="Vector" stroke="var(--stroke-0, #0A1228)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Circle() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-center justify-center relative rounded-[60px] shrink-0 size-[120px]" data-name="circle">
      <Check />
    </div>
  );
}

function BadgeContainer() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[180px]" data-name="badge-container">
      <Sparkles />
      <Sparkles1 />
      <Sparkles2 />
      <Sparkles3 />
      <div className="absolute left-0 size-[120px] top-0" data-name="glow">
        <div className="absolute inset-[-33.33%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 200">
            <g filter="url(#filter0_f_11_4356)" id="glow" opacity="0.3">
              <circle cx="100" cy="100" fill="var(--fill-0, #C8941A)" r="60" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="200" id="filter0_f_11_4356" width="200" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_11_4356" stdDeviation="20" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <Circle />
    </div>
  );
}

function CongratsText() {
  return (
    <div className="relative shrink-0 w-full" data-name="congrats-text">
      <div className="flex flex-col items-center size-full">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-center not-italic px-[40px] relative size-full text-center">
          <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px] whitespace-nowrap">{`Masha'Allah!`}</p>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] min-w-full relative shrink-0 text-[#0a1228] text-[17px] w-[min-content]">{`You've completed Morning Azkar`}</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] min-w-full relative shrink-0 text-[#94a3b8] text-[13px] w-[min-content]">{`"Every dhikr is a light in your heart"`}</p>
        </div>
      </div>
    </div>
  );
}

function StatCard() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] min-w-px relative rounded-[20px]" data-name="stat-card">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic p-[20px] relative size-full whitespace-nowrap">
        <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]">15</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] opacity-70 relative shrink-0 text-[#94a3b8] text-[14px]">Azkar Done</p>
      </div>
    </div>
  );
}

function StatCard1() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] min-w-px relative rounded-[20px]" data-name="stat-card">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic p-[20px] relative size-full whitespace-nowrap">
        <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]">8 min</p>
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] opacity-70 relative shrink-0 text-[#94a3b8] text-[14px]">Time Spent</p>
      </div>
    </div>
  );
}

function StatsRow() {
  return (
    <div className="relative shrink-0 w-full" data-name="stats-row">
      <div className="content-stretch flex gap-[16px] items-start px-[24px] relative size-full">
        <StatCard />
        <StatCard1 />
      </div>
    </div>
  );
}

function CelebrationCenter() {
  return (
    <motion.div className="content-stretch flex flex-col gap-[32px] items-center relative shrink-0 w-full" data-name="celebration-center">
      <BadgeContainer />
      <CongratsText />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic opacity-60 relative shrink-0 text-[#94a3b8] text-[14px] whitespace-nowrap">Wednesday · 2 July 2026</p>
      <StatsRow />
    </motion.div>
  );
}

function Share() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="share-2">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="share-2">
          <path d={svgPaths.p1d4e3300} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ShareBtn() {
  return (
    <div className="content-stretch flex gap-[10px] h-[56px] items-center justify-center relative rounded-[16px] shrink-0 w-full" data-name="share-btn">
      <div aria-hidden className="absolute border-[#c8941a] border-[1.5px] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Share />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#c8941a] text-[17px] whitespace-nowrap">Share Progress</p>
    </div>
  );
}

function HomeBtn() {
  return (
    <div className="bg-[#c8941a] content-stretch flex h-[56px] items-center justify-center relative rounded-[16px] shrink-0 w-full" data-name="home-btn">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap">Return Home</p>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="content-stretch flex items-start justify-center pt-[24px] relative shrink-0 w-full" data-name="home-indicator">
      <div className="bg-[#0a1228] h-[5px] opacity-30 relative rounded-[100px] shrink-0 w-[134px]" data-name="progress-bar" />
    </div>
  );
}

function ActionSection() {
  return (
    <motion.div className="relative shrink-0 w-full" data-name="action-section">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[16px] items-center pb-[40px] px-[24px] relative size-full">
          <ShareBtn />
          <HomeBtn />
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic opacity-80 relative shrink-0 text-[#94a3b8] text-[14px] whitespace-nowrap">Come back at 5:00 PM for Evening Azkar</p>
          <HomeIndicator />
        </div>
      </div>
    </motion.div>
  );
}

export default function CompletionScreen() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start justify-between relative size-full" data-name="Completion Screen">
      <TopSection />
      <CelebrationCenter />
      <ActionSection />
    </div>
  );
}