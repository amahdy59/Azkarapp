import { motion } from "motion/react";
import svgPaths from "./svg-u1xgu2qz2o";

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
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#f5f0e8] text-[14px] text-left whitespace-nowrap">9:41</p>
          <Icons />
        </div>
      </div>
    </div>
  );
}

function Crescent() {
  return (
    <div className="relative shrink-0 size-[80px]" data-name="crescent">
      <div className="absolute inset-[-18.75%_0_0_-18.75%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 95 95">
          <g id="crescent">
            <circle cx="55" cy="55" fill="var(--fill-0, #C8941A)" id="main-ellipse" r="40" />
            <circle cx="35" cy="35" fill="var(--fill-0, #0A1228)" id="carving-ellipse" r="35" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function AzkarLogo() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0" data-name="azkar-logo">
      <Crescent />
      <p className="[word-break:break-word] font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[44px] not-italic relative shrink-0 text-[#c8941a] text-[40px] text-center whitespace-nowrap" dir="auto">
        أذكار
      </p>
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[24px] not-italic relative shrink-0 text-[#f5f0e8] text-[18px] text-center tracking-[1.44px] whitespace-nowrap">Azkar</p>
      <div className="h-0 relative shrink-0 w-[60px]" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 1">
            <line id="divider" stroke="var(--stroke-0, #C8941A)" x2="60" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function LogoGroup() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="logo-group">
      <AzkarLogo />
    </div>
  );
}

function Frame1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center not-italic relative shrink-0 text-left whitespace-nowrap" data-name="Frame">
      <p className="font-['Inter:Extra_Bold','Noto_Sans_Arabic:Black',sans-serif] font-extrabold leading-[36px] relative shrink-0 text-[#c8941a] text-[28px] tracking-[-0.28px]" dir="auto">
        أذكار
      </p>
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[30px] relative shrink-0 text-[#f5f0e8] text-[22px] tracking-[-0.11px]">Azkar</p>
    </div>
  );
}

function CenterContent() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-center pt-[160px] relative shrink-0 w-full" data-name="center-content">
      <LogoGroup />
      <Frame1 />
      <div className="h-0 relative shrink-0 w-[80px]" data-name="Line">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80 1">
            <line id="Line" stroke="var(--stroke-0, #C8941A)" x2="80" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[22px] not-italic relative shrink-0 text-[#9290b0] text-[14px] text-left whitespace-nowrap">Daily Remembrance</p>
    </div>
  );
}

function Frame() {
  return (
    <motion.div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Frame">
      <StatusBar />
      <CenterContent />
    </motion.div>
  );
}

function Track() {
  return (
    <div className="bg-[#182540] content-stretch flex h-[3px] items-start overflow-clip relative rounded-[100px] shrink-0 w-[160px]" data-name="track">
      <div className="bg-[#c8941a] h-full relative shrink-0 w-[96px]" data-name="fill" />
    </div>
  );
}

function BottomNav() {
  return (
    <motion.div className="content-stretch flex flex-col gap-[12px] items-center pb-[48px] relative shrink-0" data-name="bottom-nav">
      <Track />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[14px] not-italic opacity-50 relative shrink-0 text-[#9290b0] text-[10px] text-left whitespace-nowrap">v2.0</p>
    </motion.div>
  );
}

export default function SplashScreen() {
  return (
    <a className="bg-[#0a1228] content-stretch cursor-pointer flex flex-col items-center justify-between relative size-full" data-name="Splash Screen">
      <Frame />
      <BottomNav />
    </a>
  );
}