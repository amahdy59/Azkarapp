import React from "react";
import { ChevronNext } from "./icons";
import type { AppLanguage } from "../types";

export function TasbeehIcon({
  size = 26,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
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
      className="interactive-elem group relative flex h-[56px] min-h-[52px] w-full items-center justify-between rounded-full border border-amber-600/40 dark:border-amber-400/50 bg-card px-5 text-foreground transition-all duration-200 shadow-xs hover:border-amber-600/70 dark:hover:border-amber-400/80 hover:bg-amber-500/5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99]"
      aria-label={isArabic ? "المسبحة الإلكترونية" : "Tasbeeh Counter"}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <TasbeehIcon
          size={26}
          className="shrink-0 text-amber-700 dark:text-amber-400 transition-transform duration-200 group-hover:scale-110"
        />
        <span className="text-[1.0625rem] font-extrabold tracking-tight text-foreground truncate">
          {isArabic ? "المسبحة الإلكترونية" : "Tasbeeh Counter"}
        </span>
      </div>
      <ChevronNext
        size={22}
        className="shrink-0 text-amber-700 dark:text-amber-400 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
}
