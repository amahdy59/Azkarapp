import React from "react";

export function RepBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-center text-[11px] font-bold leading-[14px] ${done ? "border-primary/40 bg-primary/20 text-primary" : "border-secondary/50 bg-secondary/25 text-secondary"}`}
      style={{ fontFamily: "DM Mono, monospace" }}
    >
      x{label}
    </span>
  );
}

export function PulseRings({ trigger }: { trigger: number }) {
  return (
    <div key={trigger} className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {[0, 120, 240].map((delay, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-primary pulse-ring"
          style={{
            width: `${148 + i * 44}px`,
            height: `${148 + i * 44}px`,
            animationDuration: "700ms",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
            animationFillMode: "forwards",
            animationDelay: `${delay}ms`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

export function CounterRing({ count, total, size = 160 }: { count: number; total: number; size?: number }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? count / total : 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
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
