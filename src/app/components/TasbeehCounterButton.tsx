import React from "react";
import { ArrowLeft, ArrowRight } from "./icons";
import { t } from "../i18n";
import { vibrateIfEnabled } from "../motionPreferences";
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
  hapticFeedback = true,
}: {
  onClick: () => void;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  hapticFeedback?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        vibrateIfEnabled(hapticFeedback, 12);
        onClick();
      }}
      dir={direction}
      className="interactive-elem group relative mx-auto flex min-h-16 w-full max-w-[80rem] items-center justify-between rounded-2xl border border-white/40 bg-card/65 p-3 text-foreground shadow-sm backdrop-blur-xl transition-[background-color,border-color,box-shadow,transform] duration-standard hover:border-primary/50 hover:bg-card/75 hover:shadow-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:min-h-[4.5rem] sm:rounded-3xl sm:p-4 md:p-5 dark:border-white/15 dark:bg-black/55 dark:hover:bg-black/65 cursor-pointer"
      aria-label={t(language, "counter.tasbeehTitle")}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary backdrop-blur-md transition-transform duration-standard group-hover:scale-105 sm:size-11 sm:rounded-2xl">
          <TasbeehIcon size={24} className="shrink-0" />
        </div>
        <span className="text-base md:text-title font-black tracking-tight text-foreground truncate">
          {t(language, "counter.tasbeehTitle")}
        </span>
      </div>
      {direction === "rtl" ? (
        <ArrowLeft
          size={20}
          className="shrink-0 text-muted-foreground transition-transform duration-standard group-hover:-translate-x-1 group-hover:text-foreground"
          aria-hidden="true"
        />
      ) : (
        <ArrowRight
          size={20}
          className="shrink-0 text-muted-foreground transition-transform duration-standard group-hover:translate-x-1 group-hover:text-foreground"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
