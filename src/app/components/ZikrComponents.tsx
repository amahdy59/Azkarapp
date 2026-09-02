import React, { useState } from "react";
import "./ZikrComponents.css";
import { Check } from "./icons";
import { counterNumeralFontFamily, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { shouldReduceMotion } from "../motionPreferences";
import type { AppLanguage } from "../types";

export const tapRippleStyle: React.CSSProperties = {
  position: "absolute",
  width: "1rem",
  height: "1rem",
  margin: "-0.5rem",
  borderRadius: 999,
  background: "color-mix(in srgb, var(--primary) 28%, transparent)",
};

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

export function CounterOutlineProgress({ count, total }: { count: number; total: number }) {
  const progress = total > 0 ? Math.min(1, count / total) : 0;

  return (
    <span className="counter-outline-progress" aria-hidden="true">
      <span
        className="counter-progress-fill"
        style={{ inlineSize: `${progress * 100}%`, borderInlineEndWidth: progress > 0 ? 2 : 0 }}
      />
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
  reduceMotion?: boolean;
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
  reduceMotion = false,
}: ZikrCounterSurfaceProps) {
  /**
   * A zikr said once has nothing to tally.
   *
   * "٠ / ١" is a counter that can only ever reach one — a completion button
   * drawn as a score, taking the tallest control on the screen to say something
   * a line could say. The long surahs are all like this, and they are exactly
   * the readings that need the room for their text.
   */
  const isSingleAction = total === 1;
  const isArabic = language === "ar";
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const defaultInstruction = t(language, "reader.tapToCount");
  const activeInstruction = instructionText || defaultInstruction;
  const reducedMotion = shouldReduceMotion(reduceMotion);

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

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || complete) return;
    if (!reducedMotion) setIsPressed(true);
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setRipples((current) => [
      ...current.slice(-3),
      { id: Date.now() + Math.random(), x: event.clientX - rect.left, y: event.clientY - rect.top },
    ]);
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
    <button
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
      data-counter-variant={isSingleAction ? "action" : "tally"}
      className={`adaptive-counter-surface ${isSingleAction ? "adaptive-counter-surface--action" : ""} ${count === 0 && !complete ? "counter-ring-ready" : ""} ${isPressed ? "is-pressed" : ""} ${complete ? "is-complete" : ""} ${justCompleted ? "just-completed" : ""} ${className}`}
    >
      {/* Keyed on the face it shows so React swaps the node — the number face
          and the completed face each play a 180ms fade/rise instead of
          snapping, which is also what carries the eye to the next zikr. */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="tap-ripple"
          style={{
            ...tapRippleStyle,
            left: ripple.x,
            top: ripple.y,
          }}
          aria-hidden="true"
          onAnimationEnd={() => setRipples((current) => current.filter((item) => item.id !== ripple.id))}
        />
      ))}
      <div className="adaptive-counter-content counter-face-swap" key={complete ? "complete" : "counting"}>
        {complete ? (
          <div
            className={justCompleted ? "counter-complete-cue" : "counter-complete-static"}
            data-testid={justCompleted ? "counter-completion-cue" : "counter-complete-state"}
          >
            <span className="counter-check-mark">
              <Check size={19} strokeWidth={3} />
            </span>
            <span className="counter-complete-label" dir="auto">
              {t(language, "counter.done")}
            </span>
          </div>
        ) : isSingleAction ? (
          <span className="text-[1.0625rem] font-bold leading-none text-foreground" dir="auto">
            {activeInstruction}
          </span>
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
      <CounterOutlineProgress count={count} total={total} />
    </button>
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

/** One hint: the keycaps to press, and what pressing them does. */
export interface CounterShortcut {
  /** Rendered side by side, so an either-key hint is one entry: ["→", "←"]. */
  keys: readonly string[];
  label: string;
}

/**
 * The keyboard-shortcut pill shown under a counter on pointer-capable screens.
 *
 * The Reader, the Masbaha, and the Salawat counter each carried their own copy
 * of this markup, and the copies had drifted: two paddings, two inner gaps, and
 * only the Reader's version announced itself as a group. Any keycap restyle had
 * to be made in three places and, in practice, was not.
 *
 * The row is forced LTR so entries always read keycap-then-label in the same
 * order, while each label keeps the app's own direction — otherwise an Arabic
 * label drags its keycap to the far side of the entry.
 */
export function CounterShortcutHints({
  shortcuts,
  ariaLabel,
  language,
  direction,
  testId,
}: {
  shortcuts: readonly CounterShortcut[];
  ariaLabel: string;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  testId?: string;
}) {
  if (shortcuts.length === 0) return null;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
      dir="ltr"
      lang={language}
      className="mx-auto mt-5 hidden w-fit max-w-full flex-wrap items-center justify-center gap-3 rounded-full border border-border/40 bg-muted/60 px-4 py-1.5 text-[0.75rem] font-medium text-muted-foreground md:flex"
    >
      {shortcuts.map((shortcut, index) => (
        <React.Fragment key={shortcut.label}>
          {index > 0 && <span className="h-3 w-px bg-border/60" aria-hidden="true" />}
          <span className="flex items-center gap-1" dir={direction}>
            {shortcut.keys.map((key) => (
              <kbd
                key={key}
                className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[0.6875rem] font-bold text-foreground shadow-2xs"
              >
                {key}
              </kbd>
            ))}
            <span>{shortcut.label}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
