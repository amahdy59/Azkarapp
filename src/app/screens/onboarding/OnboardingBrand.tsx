import React from "react";
import { CrescentMark } from "../../components/CrescentMark";
import { Check } from "../../components/icons";
import { t } from "../../i18n";

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 text-primary">
      <CrescentMark size={compact ? 44 : 96} />
      <p
        className={`arabic-ui ${compact ? "text-xl font-bold leading-7" : "text-[2.625rem] font-bold leading-[56px]"}`}
        lang="ar"
        dir="rtl"
      >
        {t("ar", "common.appName")}
      </p>
      <p
        lang="en"
        dir="ltr"
        className={
          compact
            ? "text-[0.5625rem] font-bold tracking-[0.72px] text-foreground"
            : "text-title font-bold tracking-[1.4px] text-foreground"
        }
      >
        {t("en", "common.appName")}
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
        <CrescentMark size={arabic ? 108 : 120} />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-primary">
        <p className="arabic-ui text-[2.375rem] font-bold leading-[44px]" lang="ar">
          {t("ar", "common.appName")}
        </p>
        <p className="text-micro font-bold tracking-[1.2px]" lang="en" dir="ltr">
          {t("en", "common.appName")}
        </p>
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
      <p className="flex-1 text-start text-sm font-medium leading-[22px] text-foreground">{children}</p>
    </div>
  );
}
