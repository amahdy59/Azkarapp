import React, { useState } from "react";
import { motion } from "motion/react";
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
  height = 76,
  count = 0,
  total = 1,
}: {
  trigger: number;
  size?: number;
  height?: number;
  count?: number;
  total?: number;
}) {
  const isComplete = total > 0 && count >= total;
  const isHighProgress = total > 0 && count / total >= 0.8;
  const ringColor = isComplete ? "border-green-500" : isHighProgress ? "border-yellow-500" : "border-primary/60";

  return (
    <div key={trigger} className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className={`absolute rounded-2xl border ${ringColor} pulse-ring`}
        style={{
          width: `${size - 8}px`,
          height: `${height - 8}px`,
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
        strokeLinecap={count === 0 ? "butt" : "round"}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        opacity={count === 0 ? 0 : 1}
        style={{ transition: "stroke-dashoffset 180ms cubic-bezier(0.4,0,0.2,1), opacity 180ms" }}
      />
    </svg>
  );
}

export function AdaptiveCounterTrack({ count, total }: { count: number; total: number }) {
  const progress = total > 0 ? Math.min(1, count / total) : 0;

  return (
    <span className="adaptive-counter-track" aria-hidden="true">
      <span className="adaptive-counter-progress" style={{ width: `${progress * 100}%` }} />
    </span>
  );
}

export interface ZikrCounterSurfaceProps {
  count: number;
  total: number;
  complete?: boolean;
  justCompleted?: boolean;
  onTap: () => void;
  language: AppLanguage;
  instructionText?: string;
  className?: string;
  disabled?: boolean;
  testId?: string;
}

export function ZikrCounterSurface({
  count,
  total,
  complete = false,
  justCompleted = false,
  onTap,
  language,
  instructionText,
  className = "",
  disabled = false,
  testId = "counter-surface",
}: ZikrCounterSurfaceProps) {
  const isArabic = language === "ar";
  const [isPressed, setIsPressed] = useState(false);
  const defaultInstruction = isArabic ? "اضغط للتسبيح" : "Tap to count";
  const activeInstruction = instructionText || defaultInstruction;

  const localizedCount = formatNumerals(count, language);
  const localizedTotal = formatNumerals(total, language);
  const localizedRatio = total > 0 ? `${localizedCount} / ${localizedTotal}` : localizedCount;

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

  const handlePointerCancel = () => {
    setIsPressed(false);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (disabled || complete) return;
    onTap();
  };

  return (
    <motion.button
      type="button"
      data-testid={testId}
      data-counter-shape="rectangle"
      disabled={disabled || complete}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled && !complete) onTap();
        }
      }}
      aria-disabled={disabled || complete}
      aria-label={accessibleName}
      className={`adaptive-counter-surface ${count === 0 && !complete ? "counter-ring-ready" : ""} ${isPressed ? "is-pressed" : ""} ${className}`}
      initial={false}
      whileTap={complete ? undefined : { scale: 0.985 }}
    >
      <div className="adaptive-counter-content">
        {complete ? (
          <div
            className={justCompleted ? "counter-complete-cue" : "counter-complete-static"}
            data-testid={justCompleted ? "counter-completion-cue" : "counter-complete-state"}
          >
            <span className="counter-check-mark">
              <Check size={24} strokeWidth={2.5} />
            </span>
          </div>
        ) : (
          <p
            className="text-[1.75rem] font-black leading-none text-foreground"
            dir="ltr"
            style={{
              fontFamily: counterNumeralFontFamily(language),
              fontVariantNumeric: "tabular-nums lining-nums",
            }}
          >
            <span className="counter-number" key={count}>
              {localizedCount}
            </span>
            {total > 0 && <span> / {localizedTotal}</span>}
          </p>
        )}
      </div>
      <AdaptiveCounterTrack count={count} total={total} />
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
