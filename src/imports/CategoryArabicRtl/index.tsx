import { motion } from "motion/react";
import svgPaths from "./svg-8j2nxannuq";

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

function Icon() {
  return <div className="relative shrink-0 size-[40px]" data-name="icon" />;
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

function IconWrapper() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[24px]" data-name="icon-wrapper">
      <ArrowLeft />
    </div>
  );
}

function Icon1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[40px]" data-name="icon">
      <IconWrapper />
    </div>
  );
}

function ScreenHeader() {
  return (
    <div className="relative shrink-0 w-full" data-name="screen-header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[16px] py-[12px] relative size-full">
          <Icon />
          <p className="[word-break:break-word] flex-[1_0_0] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] min-w-px not-italic relative text-[#f5f0e8] text-[17px] text-center" dir="auto">
            أذكار الصباح
          </p>
          <Icon1 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-end not-italic relative shrink-0 text-right whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]" dir="auto">
        ١٢ من ١٥
      </p>
      <p className="font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] relative shrink-0 text-[#9290b0] text-[14px]" dir="auto">
        تقدم يومي
      </p>
    </div>
  );
}

function ProgressBar() {
  return (
    <div className="bg-[#0a1228] content-stretch flex h-[8px] items-start overflow-clip relative rounded-[4px] shrink-0 w-full" data-name="progress-bar">
      <div className="bg-[#c8941a] h-full relative shrink-0 w-[274px]" data-name="progress-bar" />
    </div>
  );
}

function ProgressCard() {
  return (
    <div className="bg-[#111b35] relative rounded-[24px] shrink-0 w-full" data-name="progress-card">
      <div className="content-stretch flex flex-col gap-[20px] items-start p-[24px] relative size-full">
        <Frame3 />
        <ProgressBar />
      </div>
    </div>
  );
}

function Check() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="check">
          <path d={svgPaths.p27200700} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[14px]" data-name="icon-wrapper">
      <Check />
    </div>
  );
}

function Icon3() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[24px]" data-name="icon">
      <IconWrapper1 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[28px]" data-name="icon">
      <Icon3 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#9290b0] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        الفاتحة
      </p>
    </div>
  );
}

function ZikrItem() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon2 />
          <Frame5 />
        </div>
      </div>
    </div>
  );
}

function Check1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="check">
          <path d={svgPaths.p27200700} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[14px]" data-name="icon-wrapper">
      <Check1 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[24px]" data-name="icon">
      <IconWrapper2 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[28px]" data-name="icon">
      <Icon5 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#9290b0] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        آية الكرسي
      </p>
    </div>
  );
}

function ZikrItem1() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon4 />
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Check2() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="check">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="check">
          <path d={svgPaths.p27200700} id="Vector" stroke="var(--stroke-0, #F5F0E8)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[14px]" data-name="icon-wrapper">
      <Check2 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="bg-[#c8941a] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[24px]" data-name="icon">
      <IconWrapper3 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 size-[28px]" data-name="icon">
      <Icon7 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#9290b0] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        الإخلاص
      </p>
    </div>
  );
}

function ZikrItem2() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon6 />
          <Frame7 />
        </div>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="icon">
          <circle cx="14" cy="14" id="icon_2" r="11" stroke="var(--stroke-0, #111B35)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#f5f0e8] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        الفلق
      </p>
    </div>
  );
}

function Frame9() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[6px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#111b35] text-[14px] whitespace-nowrap" dir="auto">
        ×٣
      </p>
    </div>
  );
}

function ZikrItem3() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon8 />
          <Frame8 />
          <Frame9 />
        </div>
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="icon">
          <circle cx="14" cy="14" id="icon_2" r="11" stroke="var(--stroke-0, #111B35)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#f5f0e8] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        الناس
      </p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[6px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#111b35] text-[14px] whitespace-nowrap" dir="auto">
        ×٣
      </p>
    </div>
  );
}

function ZikrItem4() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon9 />
          <Frame10 />
          <Frame11 />
        </div>
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="icon">
          <circle cx="14" cy="14" id="icon_2" r="11" stroke="var(--stroke-0, #111B35)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#f5f0e8] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        الاستغفار
      </p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[6px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#111b35] text-[14px] whitespace-nowrap" dir="auto">
        ×٣٣
      </p>
    </div>
  );
}

function ZikrItem5() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon10 />
          <Frame12 />
          <Frame13 />
        </div>
      </div>
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="icon">
          <circle cx="14" cy="14" id="icon_2" r="11" stroke="var(--stroke-0, #111B35)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-w-px relative" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic overflow-hidden relative shrink-0 text-[#f5f0e8] text-[17px] text-ellipsis text-right whitespace-nowrap" dir="auto">
        صلاة الضحى
      </p>
    </div>
  );
}

function Frame15() {
  return (
    <div className="bg-[#1a7060] content-stretch flex items-start px-[8px] py-[4px] relative rounded-[6px] shrink-0" data-name="Frame">
      <p className="[word-break:break-word] font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#111b35] text-[14px] whitespace-nowrap" dir="auto">
        ×٢
      </p>
    </div>
  );
}

function ZikrItem6() {
  return (
    <div className="bg-[#111b35] relative rounded-[16px] shrink-0 w-full" data-name="zikr-item">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center p-[16px] relative size-full">
          <Icon11 />
          <Frame14 />
          <Frame15 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Frame">
      <ZikrItem />
      <ZikrItem1 />
      <ZikrItem2 />
      <ZikrItem3 />
      <ZikrItem4 />
      <ZikrItem5 />
      <ZikrItem6 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Frame">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[20px] relative size-full">
        <ProgressCard />
        <Frame4 />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <motion.div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame">
      <StatusBar />
      <ScreenHeader />
      <Frame2 />
    </motion.div>
  );
}

function BtnPrimary() {
  return (
    <div className="bg-[#c8941a] content-stretch flex flex-[1_0_0] h-[56px] items-center justify-center min-w-px relative rounded-[16px]" data-name="btn-primary">
      <p className="[word-break:break-word] font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[24px] not-italic relative shrink-0 text-[#0a1228] text-[17px] whitespace-nowrap" dir="auto">
        استمرار الجلسة
      </p>
    </div>
  );
}

function CategoryCard() {
  return (
    <div className="relative shrink-0 w-full" data-name="category-card">
      <div className="content-stretch flex items-start p-[20px] relative size-full">
        <BtnPrimary />
      </div>
    </div>
  );
}

function Cog() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="cog">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g clipPath="url(#clip0_11_4411)" id="cog">
          <path d={svgPaths.p34f76600} id="icon" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <defs>
          <clipPath id="clip0_11_4411">
            <rect fill="white" height="22" width="22" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function IconWrapper4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[22px]" data-name="icon-wrapper">
      <Cog />
    </div>
  );
}

function TabSettings() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[130px]" data-name="tab-settings">
      <IconWrapper4 />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9290b0] text-[10px] whitespace-nowrap" dir="auto">
        الإعدادات
      </p>
    </div>
  );
}

function ActivePill() {
  return <div className="-translate-x-1/2 absolute bg-[#c8941a] h-[24px] left-1/2 rounded-[999px] top-[-6px] w-[56px]" data-name="active-pill" />;
}

function BookOpen() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="book-open">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="book-open">
          <path d={svgPaths.p36698480} id="icon" stroke="var(--stroke-0, #C8941A)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper5() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[22px]" data-name="icon-wrapper">
      <BookOpen />
    </div>
  );
}

function TabAzkar() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[130px]" data-name="tab-azkar">
      <ActivePill />
      <IconWrapper5 />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#c8941a] text-[10px] whitespace-nowrap" dir="auto">
        الأذكار
      </p>
    </div>
  );
}

function Home() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="home">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="home">
          <path d={svgPaths.p36edb400} id="icon" stroke="var(--stroke-0, #9290B0)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function IconWrapper6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[22px]" data-name="icon-wrapper">
      <Home />
    </div>
  );
}

function TabHome() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[130px]" data-name="tab-home">
      <IconWrapper6 />
      <p className="[word-break:break-word] font-['Inter:Medium','Noto_Sans_Arabic:Medium',sans-serif] font-medium leading-[14px] not-italic relative shrink-0 text-[#9290b0] text-[10px] whitespace-nowrap" dir="auto">
        الرئيسية
      </p>
    </div>
  );
}

function TabsRow() {
  return (
    <div className="content-stretch flex h-[49px] items-center relative shrink-0 w-full" data-name="tabs-row">
      <TabSettings />
      <TabAzkar />
      <TabHome />
    </div>
  );
}

function HomeIndicatorContainer() {
  return (
    <div className="content-stretch flex flex-col h-[34px] items-center justify-center relative shrink-0 w-full" data-name="home-indicator-container">
      <div className="bg-[#f5f0e8] h-[5px] opacity-30 relative rounded-[100px] shrink-0 w-[134px]" data-name="progress-bar" />
    </div>
  );
}

function BottomNav() {
  return (
    <div className="bg-[#111b35] content-stretch flex flex-col h-[83px] items-start relative shrink-0 w-full" data-name="bottom-nav">
      <div aria-hidden className="absolute border-[#111b35] border-solid border-t inset-0 pointer-events-none" />
      <TabsRow />
      <HomeIndicatorContainer />
    </div>
  );
}

function Frame16() {
  return (
    <motion.div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Frame">
      <CategoryCard />
      <BottomNav />
    </motion.div>
  );
}

export default function CategoryArabicRtl() {
  return (
    <div className="bg-[#0a1228] content-stretch flex flex-col items-start justify-between relative size-full" data-name="Category - Arabic RTL">
      <Frame />
      <Frame16 />
    </div>
  );
}