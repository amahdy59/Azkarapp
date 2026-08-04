import React, { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "./icons";
import { counterNumeralFontFamily, formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";

export function RepBadge({ label, done, language }: { label: string; done: boolean; language: AppLanguage }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-center text-[0.75rem] font-bold leading-[14px] ${
        done
          ? "border-primary/40 bg-primary/20 text-primary"
          : "border-secondary/50 bg-secondary/25 text-secondary-foreground"
      }`}
      style={{ fontFamily: counterNumeralFontFamily(language), fontVariantNumeric: "tabular-nums" }}
    >
      x{label}
    </span>
  );
}

export function PulseRings({
  trigger,
  size = 200,
  count = 0,
  total = 1,
}: {
  trigger: number;
  size?: number;
  count?: number;
  total?: number;
}) {
  const isComplete = total > 0 && count >= total;
  const isHighProgress = total > 0 && count / total >= 0.8;
  const ringColor = isComplete ? "border-green-500" : isHighProgress ? "border-yellow-500" : "border-primary/60";

  return (
    <div key={trigger} className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={`absolute rounded-full border ${ringColor} pulse-ring`}
        style={{
          width: `${size - 8}px`,
          height: `${size - 8}px`,
          animationDuration: "260ms",
          animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          animationFillMode: "forwards",
          opacity: 0,
        }}
      />
    </div>
  );
}

export function CounterRing({ count, total, size = 160 }: { count: number; total: number; size?: number }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? count / total : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: "rotate(-90deg)" }}
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--muted)" strokeWidth="10" fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--primary)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: "stroke-dashoffset 180ms cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

export function AdaptiveCounterTrack({ count, total, compact }: { count: number; total: number; compact?: boolean }) {
  const progress = total > 0 ? Math.min(1, count / total) : 0;
  const strokeWidth = compact ? 8 : 7;
  const r = 50 - strokeWidth / 2 - 2;
  const circ = 2 * Math.PI * r;

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible pointer-events-none"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle className="adaptive-counter-track" cx="50" cy="50" r={r} strokeWidth={strokeWidth} fill="none" />
      <circle
        className="adaptive-counter-progress"
        cx="50"
        cy="50"
        r={r}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - progress)}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 180ms cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

export interface ZikrCounterSurfaceProps {
  count: number;
  total: number;
  compact?: boolean;
  complete?: boolean;
  disabled?: boolean;
  onTap: () => void;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  instructionText?: string;
  testId?: string;
  className?: string;
}

export function ZikrCounterSurface({
  count,
  total,
  compact = false,
  complete = false,
  disabled = false,
  onTap,
  language,
  instructionText,
  testId = "counter-surface",
  className = "",
}: ZikrCounterSurfaceProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPressed, setIsPressed] = useState(false);
  const isArabic = language === "ar";
  const remainingCount = total > 0 ? Math.max(0, total - count) : 0;

  const defaultInstruction = isArabic ? "اضغط للتسبيح" : "Tap to count";
  const activeInstruction = instructionText || defaultInstruction;

  const localizedCount = formatNumerals(count, language);
  const localizedTotal = formatNumerals(total, language);
  const localizedRatio = total > 0 ? `${localizedCount} / ${localizedTotal}` : localizedCount;
  const remainingText = isArabic ? `${formatNumerals(remainingCount, language)} متبقٍ` : `${remainingCount} remaining`;

  // Accessible Name per Section 1 specification
  const accessibleName = complete
    ? total > 0
      ? isArabic
        ? `مكتمل ${localizedRatio}`
        : `Completed ${localizedRatio}`
      : isArabic
        ? "مكتمل"
        : "Completed"
    : total > 0
      ? `${activeInstruction} ${localizedRatio}`
      : activeInstruction;

  const handlePointerDown = () => {
    if (disabled || complete) return;
    setIsPressed(true);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
  };

  const handlePointerLeave = () => {
    setIsPressed(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || complete) return;
    onTap();
  };

  return (
    <motion.button
      type="button"
      data-testid={testId}
      data-counter-shape={compact ? "compact" : "circle"}
      disabled={disabled || complete}
      aria-disabled={disabled || complete}
      aria-label={accessibleName}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className={`adaptive-counter-surface ${count === 0 && !complete ? "counter-ring-ready" : ""} ${
        isPressed ? "is-pressed" : ""
      } ${className}`}
      initial={false}
      animate={{
        width: compact ? "100%" : 164,
        height: compact ? 76 : 164,
        borderRadius: compact ? 24 : 82,
      }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      whileTap={disabled || complete || prefersReducedMotion ? undefined : { scale: 0.985 }}
    >
      {!compact && <AdaptiveCounterTrack count={count} total={total} compact={false} />}
      <span className="adaptive-counter-pulse" aria-hidden="true" />

      <div className={`adaptive-counter-content ${compact ? "is-compact" : ""}`}>
        {compact ? (
          /* Compact Action Surface Layout: Leading Mini Ring Badge + Vertical Divider + Action Text */
          <div className="flex w-full h-full items-center justify-between gap-3.5 px-1">
            <div className="relative flex size-[54px] shrink-0 items-center justify-center rounded-full bg-primary/10">
              <AdaptiveCounterTrack count={count} total={total} compact={true} />
              {complete ? (
                <Check size={24} strokeWidth={2.5} className="text-primary" />
              ) : (
                <div className="flex flex-col items-center justify-center text-center leading-none" dir="ltr">
                  <span
                    className="text-[0.9375rem] font-extrabold text-foreground"
                    style={{
                      fontFamily: counterNumeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums lining-nums",
                    }}
                  >
                    {localizedCount}
                  </span>
                  {total > 0 && (
                    <span
                      className="text-[0.625rem] font-bold text-muted-foreground mt-0.5"
                      style={{
                        fontFamily: counterNumeralFontFamily(language),
                        fontVariantNumeric: "tabular-nums lining-nums",
                      }}
                    >
                      /{localizedTotal}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-border/60 shrink-0" aria-hidden="true" />

            <div className="flex min-w-0 flex-1 flex-col justify-center text-start">
              <p className="text-[0.9375rem] font-extrabold text-foreground truncate">
                {complete ? (isArabic ? "أتممت الهدف" : "Target completed") : activeInstruction}
              </p>
              <p className="text-[0.8125rem] font-bold text-primary mt-0.5 truncate">
                {complete
                  ? isArabic
                    ? "مكتمل ✓"
                    : "Done ✓"
                  : remainingCount > 0
                    ? remainingText
                    : isArabic
                      ? "اضغط للتسبيح"
                      : "Tap to count"}
              </p>
            </div>
          </div>
        ) : (
          /* Focused Mode Layout: Centered Circle with Count, Ratio, Divider & Instruction */
          <>
            {complete ? (
              <div className="counter-complete-cue flex flex-col items-center justify-center">
                <span className="counter-check-mark">
                  <Check size={36} strokeWidth={2.5} />
                </span>
                <span className="mt-2 text-[0.75rem] font-black text-foreground">
                  {isArabic ? "أتممت الهدف" : "Target completed"}
                </span>
              </div>
            ) : (
              <>
                <div className="adaptive-counter-numerals flex flex-col items-center" dir="ltr">
                  <p
                    className="counter-number text-[2rem] font-black leading-none text-foreground"
                    key={count}
                    style={{
                      fontFamily: counterNumeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums lining-nums",
                    }}
                  >
                    {localizedCount}
                  </p>
                  {total > 0 && (
                    <p
                      className="text-[0.75rem] font-bold text-muted-foreground mt-1"
                      style={{
                        fontFamily: counterNumeralFontFamily(language),
                        fontVariantNumeric: "tabular-nums lining-nums",
                      }}
                    >
                      {isArabic ? `من ${localizedTotal}` : `of ${localizedTotal}`}
                    </p>
                  )}
                </div>

                <div className="my-1.5 h-[1.5px] w-7 bg-border/60 rounded-full" aria-hidden="true" />

                <p className="tap-anywhere-hint font-bold text-foreground text-xs">{activeInstruction}</p>

                {remainingCount > 0 && (
                  <p
                    className="text-[0.6875rem] font-extrabold text-primary mt-0.5"
                    style={{
                      fontFamily: counterNumeralFontFamily(language),
                      fontVariantNumeric: "tabular-nums lining-nums",
                    }}
                  >
                    {remainingText}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </motion.button>
  );
}

export function WaveformBars({ active }: { active: boolean }) {
  const heights = [0.35, 0.75, 0.55, 1, 0.6, 0.8, 0.4];

  return (
    <div className="flex h-5 items-center gap-[2px]" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className="h-full w-[3px] rounded-full bg-white/70"
          style={{
            transform: `scaleY(${h})`,
            transformOrigin: "center",
            animation: active ? `waveform ${0.5 + i * 0.08}s ease-in-out ${i * 0.07}s infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}
