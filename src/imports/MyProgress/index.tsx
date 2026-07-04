import { motion } from "motion/react";
import svgPaths from "./svg-vp2mb5gdtw";

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
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[17px] text-center whitespace-nowrap">My Progress</p>
          <RightAction />
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px not-italic relative whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]">Total Azkar Completed</p>
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]">1,247</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#9290b0] text-[11px]">Since July 2026</p>
    </div>
  );
}

function BarChartBig() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="bar-chart-big">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="bar-chart-big" opacity="0.2">
          <path d={svgPaths.p2f075000} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Card() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="card">
      <div aria-hidden className="absolute border-[#c8941a] border-l-4 border-solid inset-0 pointer-events-none rounded-[16px]" />
      <div className="content-stretch flex items-start p-[24px] relative size-full">
        <Frame />
        <BarChartBig />
      </div>
    </div>
  );
}

function HeroStat() {
  return (
    <div className="relative shrink-0 w-full" data-name="hero-stat">
      <div className="content-stretch flex flex-col items-start p-[16px] relative size-full">
        <Card />
      </div>
    </div>
  );
}

function Flame() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="flame">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="flame">
          <path d={svgPaths.p2ddae700} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Frame">
      <Flame />
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#9290b0] text-[13px] whitespace-nowrap">Current Streak</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0 whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]">7 days</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#9290b0] text-[11px]">Best: 21 days</p>
    </div>
  );
}

function BarChart() {
  return (
    <div className="content-stretch flex gap-[4px] h-[40px] items-end relative shrink-0 w-full" data-name="bar-chart">
      <div className="bg-[#1c2642] flex-[1_0_0] h-[20px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="Rectangle" />
      <div className="bg-[#1c2642] flex-[1_0_0] h-[30px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="Rectangle" />
      <div className="bg-[#1c2642] flex-[1_0_0] h-[15px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="Rectangle" />
      <div className="bg-[#1c2642] flex-[1_0_0] h-[45px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="icon" />
      <div className="bg-[#1c2642] flex-[1_0_0] h-[25px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="Rectangle" />
      <div className="bg-[#1c2642] flex-[1_0_0] h-[35px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="icon" />
      <div className="bg-[#c8941a] flex-[1_0_0] h-[50px] min-w-px relative rounded-tl-[2px] rounded-tr-[2px]" data-name="Rectangle" />
    </div>
  );
}

function Days() {
  return (
    <div className="[word-break:break-word] content-stretch flex font-['Inter:Medium',sans-serif] font-medium items-start justify-between leading-[14px] not-italic relative shrink-0 text-[10px] w-full whitespace-nowrap" data-name="days">
      <p className="relative shrink-0 text-[#9290b0]">M</p>
      <p className="relative shrink-0 text-[#9290b0]">T</p>
      <p className="relative shrink-0 text-[#9290b0]">W</p>
      <p className="relative shrink-0 text-[#9290b0]">T</p>
      <p className="relative shrink-0 text-[#9290b0]">F</p>
      <p className="relative shrink-0 text-[#9290b0]">S</p>
      <p className="relative shrink-0 text-[#c8941a]">S</p>
    </div>
  );
}

function StreakCard() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] min-w-px relative rounded-[16px]" data-name="streak-card">
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative size-full">
        <Frame1 />
        <Frame2 />
        <BarChart />
        <Days />
      </div>
    </div>
  );
}

function StreakRow() {
  return (
    <div className="relative shrink-0 w-full" data-name="streak-row">
      <div className="content-stretch flex items-start px-[16px] relative size-full">
        <StreakCard />
      </div>
    </div>
  );
}

function SectionLabel() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Category Breakdown</p>
    </div>
  );
}

function CatCard() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] min-w-px relative rounded-[12px]" data-name="cat-card">
      <div className="flex flex-col items-center size-full">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center not-italic p-[12px] relative size-full whitespace-nowrap">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#c8941a] text-[11px]">Morning</p>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">487</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#9290b0] text-[11px]">100%</p>
        </div>
      </div>
    </div>
  );
}

function CatCard1() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] min-w-px relative rounded-[12px]" data-name="cat-card">
      <div className="flex flex-col items-center size-full">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center not-italic p-[12px] relative size-full whitespace-nowrap">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#c8941a] text-[11px]">Evening</p>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">430</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#9290b0] text-[11px]">88%</p>
        </div>
      </div>
    </div>
  );
}

function CatCard2() {
  return (
    <div className="bg-[#111b35] flex-[1_0_0] min-w-px relative rounded-[12px]" data-name="cat-card">
      <div className="flex flex-col items-center size-full">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center not-italic p-[12px] relative size-full whitespace-nowrap">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#c8941a] text-[11px]">Sleep</p>
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] relative shrink-0 text-[#f5f0e8] text-[17px]">330</p>
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] relative shrink-0 text-[#9290b0] text-[11px]">67%</p>
        </div>
      </div>
    </div>
  );
}

function Categories() {
  return (
    <div className="relative shrink-0 w-full" data-name="categories">
      <div className="content-stretch flex gap-[8px] items-start px-[16px] relative size-full">
        <CatCard />
        <CatCard1 />
        <CatCard2 />
      </div>
    </div>
  );
}

function SectionLabel1() {
  return (
    <div className="content-stretch flex items-start pb-[8px] pl-[16px] pt-[24px] relative shrink-0" data-name="section-label">
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#c8941a] text-[11px] whitespace-nowrap">Recent Sessions</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal gap-[2px] items-start leading-[22px] min-w-px not-italic relative text-[14px] whitespace-nowrap" data-name="Frame">
      <p className="relative shrink-0 text-[#f5f0e8]">Thursday, Jan 29</p>
      <p className="relative shrink-0 text-[#9290b0]">15 azkar · 8 min</p>
    </div>
  );
}

function Star() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="star">
          <path d={svgPaths.p2d98d000} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <Frame3 />
          <Star />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal gap-[2px] items-start leading-[22px] min-w-px not-italic relative text-[14px] whitespace-nowrap" data-name="Frame">
      <p className="relative shrink-0 text-[#f5f0e8]">Wednesday, Jan 28</p>
      <p className="relative shrink-0 text-[#9290b0]">12 azkar · 6 min</p>
    </div>
  );
}

function Star1() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="star">
          <path d={svgPaths.p2d98d000} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="screen-header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <Frame4 />
          <Star1 />
        </div>
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col font-['Inter:Regular',sans-serif] font-normal gap-[2px] items-start leading-[22px] min-w-px not-italic relative text-[14px] whitespace-nowrap" data-name="Frame">
      <p className="relative shrink-0 text-[#f5f0e8]">Tuesday, Jan 27</p>
      <p className="relative shrink-0 text-[#9290b0]">18 azkar · 10 min</p>
    </div>
  );
}

function Star2() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="star">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="star">
          <path d={svgPaths.p2d98d000} id="Vector" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function CategoryCard1() {
  return (
    <div className="bg-[#111b35] h-[64px] relative rounded-[12px] shrink-0 w-full" data-name="category-card">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] relative size-full">
          <Frame5 />
          <Star2 />
        </div>
      </div>
    </div>
  );
}

function Sessions() {
  return (
    <div className="relative shrink-0 w-full" data-name="sessions">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[16px] relative size-full">
        <CategoryCard />
        <ScreenHeader />
        <CategoryCard1 />
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <motion.div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="main-content">
      <StatusBar />
      <Header />
      <HeroStat />
      <StreakRow />
      <SectionLabel />
      <Categories />
      <SectionLabel1 />
      <Sessions />
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

export default function MyProgress() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start relative size-full" data-name="My Progress">
      <MainContent />
      <IndicatorArea />
    </div>
  );
}