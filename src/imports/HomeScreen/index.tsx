import { motion } from "motion/react";
import svgPaths from "./svg-5q1wqk0shb";

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

function Frame1() {
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
          <Frame1 />
        </div>
      </div>
    </div>
  );
}

function BtnPrimary() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start not-italic relative shrink-0 whitespace-nowrap" data-name="btn-primary">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">Good morning,</p>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#f5f0e8] text-[22px] tracking-[-0.11px]">Assalamu Alaikum</p>
    </div>
  );
}

function Avatar() {
  return (
    <div className="relative shrink-0 size-[44px]" data-name="avatar">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 44 44">
        <g id="avatar">
          <g clipPath="url(#clip0_11_4379)">
            <rect fill="var(--fill-0, #111B35)" height="44" rx="22" width="44" />
            <rect fill="url(#paint0_linear_11_4379)" height="44" id="bg-gradient" width="44" />
            <circle cx="22" cy="20" fill="var(--fill-0, #E6C29C)" id="face" r="14" />
            <circle cx="12" cy="10" fill="var(--fill-0, #2F2F2F)" id="hair-left" r="5" />
            <circle cx="32" cy="10" fill="var(--fill-0, #2F2F2F)" id="hair-right" r="5" />
            <ellipse cx="22" cy="8" fill="var(--fill-0, #2F2F2F)" id="hair-top" rx="6" ry="3" />
            <circle cx="18" cy="20" fill="var(--fill-0, #111827)" id="eye-left" r="1.5" />
            <circle cx="26" cy="20" fill="var(--fill-0, #111827)" id="eye-right" r="1.5" />
            <ellipse cx="22" cy="28" fill="var(--fill-0, #2F2F2F)" id="beard" rx="3" ry="1" />
            <ellipse cx="22" cy="24" fill="var(--fill-0, #111827)" id="mouth" rx="2" ry="0.5" />
          </g>
          <rect height="42" rx="21" stroke="var(--stroke-0, #C8941A)" strokeWidth="2" width="42" x="1" y="1" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_11_4379" x1="0" x2="44" y1="0" y2="0">
            <stop stopColor="#0A1228" />
            <stop offset="1" stopColor="#111B35" />
          </linearGradient>
          <clipPath id="clip0_11_4379">
            <rect fill="white" height="44" rx="22" width="44" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[24px] pt-[20px] px-[24px] relative size-full">
          <BtnPrimary />
          <Avatar />
        </div>
      </div>
    </div>
  );
}

function Sun() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="sun">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_11_4405)" id="sun">
          <path d={svgPaths.p23414e00} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4405">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconWrapper() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <Sun />
    </div>
  );
}

function Icon() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="icon">
      <IconWrapper />
    </div>
  );
}

function Frame4() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Morning Azkar</p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]" dir="auto">
        أذكار الصباح
      </p>
    </div>
  );
}

function BtnPrimary1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="btn-primary">
      <Icon />
      <Frame4 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">12 of 15</p>
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="bg-[#0a1228] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[2px] shrink-0 w-full" data-name="progress-bar">
      <div className="bg-[#c8941a] h-full relative shrink-0 w-[160px]" data-name="progress-bar" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Frame">
      <Frame6 />
      <ProgressBar />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px relative" data-name="Frame">
      <BtnPrimary1 />
      <Frame5 />
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="chevron-right">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <ChevronRight />
    </div>
  );
}

function CategoryCard2() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative size-full">
          <Frame3 />
          <IconWrapper1 />
        </div>
      </div>
    </div>
  );
}

function CategoryCard1() {
  return (
    <div className="bg-[#111b35] content-stretch flex items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-name="category-card">
      <div className="bg-[#c8941a] relative self-stretch shrink-0 w-[4px]" data-name="Rectangle" />
      <CategoryCard2 />
    </div>
  );
}

function MoonStar() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="moon-star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="moon-star">
          <path d={svgPaths.p3467b100} id="Vector" stroke="var(--stroke-0, #1A7060)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <MoonStar />
    </div>
  );
}

function Icon1() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="icon">
      <IconWrapper2 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Evening Azkar</p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]" dir="auto">
        أذكار المساء
      </p>
    </div>
  );
}

function BtnPrimary2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="btn-primary">
      <Icon1 />
      <Frame8 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">0 of 15</p>
    </div>
  );
}

function ProgressBar1() {
  return (
    <div className="bg-[#0a1228] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[2px] shrink-0 w-full" data-name="progress-bar">
      <div className="bg-[#1a7060] h-full relative shrink-0 w-0" data-name="Rectangle" />
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Frame">
      <Frame10 />
      <ProgressBar1 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px relative" data-name="Frame">
      <BtnPrimary2 />
      <Frame9 />
    </div>
  );
}

function ChevronRight1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="chevron-right">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <ChevronRight1 />
    </div>
  );
}

function CategoryCard4() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative size-full">
          <Frame7 />
          <IconWrapper3 />
        </div>
      </div>
    </div>
  );
}

function CategoryCard3() {
  return (
    <div className="bg-[#111b35] content-stretch flex items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-name="category-card">
      <div className="bg-[#1a7060] relative self-stretch shrink-0 w-[4px]" data-name="Rectangle" />
      <CategoryCard4 />
    </div>
  );
}

function Sparkles() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="sparkles">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_11_4399)" id="sparkles">
          <path d={svgPaths.p1bbba4f0} id="icon" stroke="var(--stroke-0, #9F7AEA)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4399">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconWrapper4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <Sparkles />
    </div>
  );
}

function Icon2() {
  return (
    <div className="bg-[rgba(159,122,234,0.15)] content-stretch flex items-center justify-center relative rounded-[20px] shrink-0 size-[40px]" data-name="icon">
      <IconWrapper4 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">Before Sleep</p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]" dir="auto">
        أذكار النوم
      </p>
    </div>
  );
}

function BtnPrimary3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="btn-primary">
      <Icon2 />
      <Frame12 />
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] whitespace-nowrap">0 of 10</p>
    </div>
  );
}

function ProgressBar2() {
  return (
    <div className="bg-[#0a1228] content-stretch flex h-[4px] items-start overflow-clip relative rounded-[2px] shrink-0 w-full" data-name="progress-bar">
      <div className="bg-[#9f7aea] h-full relative shrink-0 w-0" data-name="Rectangle" />
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Frame">
      <Frame14 />
      <ProgressBar2 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[12px] items-start min-w-px relative" data-name="Frame">
      <BtnPrimary3 />
      <Frame13 />
    </div>
  );
}

function ChevronRight2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="chevron-right">
          <path d="M7.5 15L12.5 10L7.5 5" id="Vector" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper5() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[20px]" data-name="icon-wrapper">
      <ChevronRight2 />
    </div>
  );
}

function CategoryCard6() {
  return (
    <div className="flex-[1_0_0] min-w-px relative" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between p-[20px] relative size-full">
          <Frame11 />
          <IconWrapper5 />
        </div>
      </div>
    </div>
  );
}

function CategoryCard5() {
  return (
    <div className="bg-[#111b35] content-stretch flex items-start overflow-clip relative rounded-[16px] shrink-0 w-full" data-name="category-card">
      <div className="bg-[#9f7aea] relative self-stretch shrink-0 w-[4px]" data-name="Rectangle" />
      <CategoryCard6 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[24px] relative size-full">
        <CategoryCard1 />
        <CategoryCard3 />
        <CategoryCard5 />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <motion.div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame">
      <StatusBar />
      <CategoryCard />
      <Frame2 />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] text-center w-full">🔥 7-day streak — keep going!</p>
    </motion.div>
  );
}

function Home() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="home">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="home">
          <path d={svgPaths.p36edb400} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ActivePill() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-col items-center justify-center relative rounded-[14px] shrink-0 size-[28px]" data-name="active-pill">
      <Home />
    </div>
  );
}

function TabHome() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-full items-center justify-center relative shrink-0 w-[130px]" data-name="tab-home">
      <ActivePill />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#c8941a] text-[10px] whitespace-nowrap">Home</p>
    </div>
  );
}

function BookOpen() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="book-open">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="book-open">
          <path d={svgPaths.p36698480} id="icon" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function TabAzkar() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-full items-center justify-center relative shrink-0 w-[130px]" data-name="tab-azkar">
      <BookOpen />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9290b0] text-[10px] whitespace-nowrap">Azkar</p>
    </div>
  );
}

function Settings() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="settings">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="settings">
          <path d={svgPaths.p708d300} id="icon" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function TabSettings() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] h-full items-center justify-center relative shrink-0 w-[130px]" data-name="tab-settings">
      <Settings />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9290b0] text-[10px] whitespace-nowrap">Settings</p>
    </div>
  );
}

function Tabs() {
  return (
    <div className="flex-[1_0_0] min-h-px relative w-full" data-name="tabs">
      <div className="content-stretch flex items-start pt-[12px] relative size-full">
        <TabHome />
        <TabAzkar />
        <TabSettings />
      </div>
    </div>
  );
}

function HomeIndicatorContainer() {
  return (
    <div className="content-stretch flex flex-col h-[8px] items-center justify-center relative shrink-0 w-full" data-name="home-indicator-container">
      <div className="bg-[#f5f0e8] h-[5px] opacity-30 relative rounded-[100px] shrink-0 w-[134px]" data-name="progress-bar" />
    </div>
  );
}

function BottomNav() {
  return (
    <motion.div className="bg-[#0a1228] content-stretch flex flex-col h-[83px] items-start relative shrink-0 w-full" data-name="bottom-nav">
      <div aria-hidden className="absolute border-[#111b35] border-solid border-t inset-0 pointer-events-none" />
      <Tabs />
      <HomeIndicatorContainer />
    </motion.div>
  );
}

export default function HomeScreen() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start justify-between relative size-full" data-name="Home Screen">
      <Frame />
      <BottomNav />
    </div>
  );
}