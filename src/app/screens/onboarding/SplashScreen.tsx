import React, { useEffect } from "react";
import { motion } from "motion/react";
import { CrescentMark } from "../../components/CrescentMark";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="flex flex-col items-center justify-between h-full bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading Azkar"
    >
      <motion.div
        className="flex flex-col items-center w-full flex-1 pt-20"
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, ease: [0.5, 0, 0.5, 1] }}
      >
        <div className="flex flex-col items-center gap-5">
          <CrescentMark size={80} />
          <div className="flex flex-col items-center gap-2">
            <p
              className="text-[40px] font-extrabold text-primary leading-[44px]"
              style={{ fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif" }}
              dir="auto"
            >
              أذكار
            </p>
            <p className="text-[18px] font-bold text-foreground font-sans tracking-[1.44px]">Azkar</p>
            <svg width="60" height="1" viewBox="0 0 60 1" fill="none">
              <line x1="0" y1="0.5" x2="60" y2="0.5" stroke="var(--primary)" />
            </svg>
          </div>
        </div>

        <p className="mt-10 text-[15px] text-muted-foreground font-sans">Daily remembrance</p>
      </motion.div>

      <div className="flex flex-col items-center gap-3 pb-12">
        <div className="rounded-full overflow-hidden w-[160px] h-1 bg-card-foreground/25" aria-hidden="true">
          <div className="h-full rounded-full bg-primary" style={{ width: 96 }} />
        </div>
        <p className="text-[11px] font-medium text-muted-foreground font-sans">Version 2.0.1</p>
      </div>
    </div>
  );
}
