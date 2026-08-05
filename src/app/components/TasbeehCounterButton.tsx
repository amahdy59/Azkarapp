import React from "react";
import { ChevronNext } from "./icons";
import type { AppLanguage } from "../types";

export function TasbeehIcon({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 13 Circular Beads in a Rosary Loop */}
      <circle cx="16" cy="4.5" r="1.4" fill="currentColor" />
      <circle cx="19.8" cy="5.4" r="1.4" fill="currentColor" />
      <circle cx="23.0" cy="7.8" r="1.4" fill="currentColor" />
      <circle cx="24.8" cy="11.2" r="1.4" fill="currentColor" />
      <circle cx="24.8" cy="15.0" r="1.4" fill="currentColor" />
      <circle cx="23.0" cy="18.4" r="1.4" fill="currentColor" />
      <circle cx="19.8" cy="20.8" r="1.4" fill="currentColor" />

      <circle cx="12.2" cy="5.4" r="1.4" fill="currentColor" />
      <circle cx="9.0" cy="7.8" r="1.4" fill="currentColor" />
      <circle cx="7.2" cy="11.2" r="1.4" fill="currentColor" />
      <circle cx="7.2" cy="15.0" r="1.4" fill="currentColor" />
      <circle cx="9.0" cy="18.4" r="1.4" fill="currentColor" />
      <circle cx="12.2" cy="20.8" r="1.4" fill="currentColor" />

      {/* Main Connector Bead / Joint */}
      <circle cx="16" cy="22.2" r="1.8" fill="currentColor" />

      {/* Tassel Cap */}
      <path d="M14.2 24 H17.8 L18.3 27 H13.7 L14.2 24 Z" fill="currentColor" />

      {/* Tassel Threads */}
      <line x1="14.5" y1="27" x2="13.8" y2="30.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="27" x2="16" y2="31" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="17.5" y1="27" x2="18.2" y2="30.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function TasbeehCounterButton({
  onClick,
  language,
  direction = "ltr",
}: {
  onClick: () => void;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";

  return (
    <button
      type="button"
      onClick={onClick}
      dir={direction}
      className="interactive-elem group relative flex min-h-[4.5rem] w-full items-center justify-between rounded-[2rem] border border-white/40 dark:border-white/15 bg-card/65 dark:bg-black/55 p-4 md:p-5 text-foreground backdrop-blur-xl shadow-sm transition-all duration-300 hover:border-amber-500/50 hover:bg-card/75 hover:shadow-md dark:hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] active:scale-[0.99] cursor-pointer"
      aria-label={isArabic ? "المسبحة الإلكترونية" : "Tasbeeh Counter"}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 backdrop-blur-md transition-transform duration-200 group-hover:scale-105">
          <TasbeehIcon size={24} className="shrink-0" />
        </div>
        <span className="text-[1rem] md:text-[1.0625rem] font-black tracking-tight text-foreground truncate">
          {isArabic ? "المسبحة الإلكترونية" : "Tasbeeh Counter"}
        </span>
      </div>
      <ChevronNext
        size={20}
        className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:scale-x-[-1] group-hover:text-foreground"
        aria-hidden="true"
      />
    </button>
  );
}
