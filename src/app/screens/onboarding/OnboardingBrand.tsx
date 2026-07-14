import React from "react";
import { Check } from "../../components/icons";

export function BrandCrescent({ size = 96 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path d="M84 57.5A35 35 0 1 1 43.3 16.8 27 27 0 0 0 84 57.5Z" fill="currentColor" />
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center text-primary" aria-label="Azkar">
      <BrandCrescent size={compact ? 44 : 96} />
      <p
        className={compact ? "-mt-1 text-[20px] font-bold leading-7" : "-mt-1 text-[42px] font-bold leading-[56px]"}
        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
        lang="ar"
        dir="rtl"
      >
        أذكار
      </p>
      <p className={compact ? "text-[9px] font-bold tracking-[0.72px] text-foreground" : "text-[17px] font-bold tracking-[1.4px] text-foreground"}>
        {compact ? "AZKAR" : "Azkar"}
      </p>
    </div>
  );
}

export function WelcomeArtwork({ arabic = false }: { arabic?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 size-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,160,32,0.13)_0%,rgba(212,160,32,0.04)_48%,transparent_72%)]" />
      {[
        ["calc(50% - 88px)", "calc(50% - 48px)"],
        ["calc(50% + 70px)", "calc(50% - 82px)"],
        ["calc(50% + 42px)", "calc(50% + 60px)"],
      ].map(([left, top], index) => (
        <span key={index} className="absolute size-[5px] rounded-full bg-primary" style={{ left, top }} />
      ))}
      <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 text-primary">
        <BrandCrescent size={arabic ? 124 : 140} />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-primary">
        <p className="text-[38px] font-bold leading-[44px]" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }} lang="ar">
          أذكار
        </p>
        <p className="text-[11px] font-bold tracking-[1.2px]">AZKAR</p>
      </div>
    </div>
  );
}

export function FeatureCheck({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full items-center gap-3">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary text-primary">
        <Check size={13} strokeWidth={2.2} />
      </span>
      <p className="flex-1 text-start text-[14px] font-medium leading-[22px] text-foreground">{children}</p>
    </div>
  );
}
