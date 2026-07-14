import React, { useEffect } from "react";
import { motion } from "motion/react";
import type { AppLanguage } from "../../types";
import { BrandLockup } from "./OnboardingBrand";

export function SplashScreen({ onDone, language }: { onDone: () => void; language: AppLanguage }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2500);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const arabic = language === "ar";

  return (
    <div className="flex h-full flex-col items-center justify-between bg-background" role="status" aria-live="polite" aria-label="Loading Azkar">
      <motion.div
        className="flex flex-1 flex-col items-center justify-center pb-16"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <BrandLockup />
        <div className="my-7 h-px w-20 bg-primary" />
        <p
          className="text-[14px] font-medium uppercase tracking-[0.56px] text-muted-foreground"
          style={arabic ? { fontFamily: "'IBM Plex Sans Arabic', sans-serif" } : undefined}
          dir={arabic ? "rtl" : "ltr"}
        >
          {arabic ? "الذكر اليومي للمسلم" : "Daily Remembrance"}
        </p>
      </motion.div>

      <div className="flex flex-col items-center gap-3 pb-14">
        <div className="h-1 w-40 overflow-hidden rounded-full bg-card" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: 100 }} transition={{ duration: 2.3, ease: "easeInOut" }} />
        </div>
        <p className="text-[10px] font-medium text-muted-foreground/50">v2.0</p>
      </div>
    </div>
  );
}
