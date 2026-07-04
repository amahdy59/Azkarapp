import React from "react";
import { Check, Flame, Share2 } from "lucide-react";
import { CATEGORIES } from "../content/categories";
import { getAzkarByCategory } from "../content/azkar";
import type { CategoryId } from "../types";

export function CompletionScreen({ catId, sessionStart, currentStreak, onHome, onRepeat }:
  { catId: CategoryId; sessionStart: number; currentStreak: number; onHome: () => void; onRepeat: () => void }) {
  const cat = CATEGORIES.find(c => c.id === catId)!;
  const azkar = getAzkarByCategory(catId);
  const elapsedMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
  const totalReps = azkar.reduce((s, z) => s + z.repetitionCount, 0);

  return (
    <div className="flex flex-col h-full items-center justify-between px-6 py-8 slide-up bg-background">
      <div />

      <div className="flex flex-col items-center gap-6 w-full">
        {/* Gold checkmark circle */}
        <div className="relative flex items-center justify-center w-[120px] h-[120px]" aria-hidden="true">
          <svg className="absolute inset-0" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" stroke="var(--primary)" strokeWidth="2" fill="none" opacity=".15" />
            <circle cx="60" cy="60" r="56" stroke="var(--primary)" strokeWidth="2.5" fill="none"
              strokeDasharray="352" strokeDashoffset="0" />
          </svg>
          <div className="flex items-center justify-center rounded-full w-[80px] h-[80px] bg-primary">
            <Check size={36} className="text-background" style={{ strokeWidth: 3 }} />
          </div>
        </div>

        {/* Arabic celebration */}
        <div className="text-center">
          <h1 className="text-[34px] text-primary font-bold leading-[48px]" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
            مَاشَاءَ اللَّه
          </h1>
          <p className="text-[22px] text-foreground font-sans font-extrabold mt-1">
            Masha&apos;Allah!
          </p>
          <p className="text-[14px] text-muted-foreground font-sans mt-1.5">
            You completed {cat.name}
          </p>
        </div>

        {/* Stats grid */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { value: azkar.length, label: "azkar" },
            { value: totalReps,    label: "repetitions" },
            { value: elapsedMin,   label: "minutes" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl p-4 text-center bg-card border border-border">
              <p className="text-[26px] font-extrabold text-primary leading-[32px]" style={{ fontFamily: "DM Mono, monospace" }}>{value}</p>
              <p className="text-[10px] text-muted-foreground font-sans mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Streak callout */}
        <div className="w-full rounded-xl px-4 py-3 flex items-center gap-3 border"
          style={{ background: "color-mix(in srgb, var(--primary) 10%, transparent)", borderColor: "color-mix(in srgb, var(--primary) 30%, transparent)" }}>
          <Flame size={20} className="text-primary" />
          <div>
            <p className="text-[13px] font-bold text-primary font-sans">
              {currentStreak}-day streak maintained!
            </p>
            <p className="text-[11px] text-muted-foreground font-sans">Consistency is a form of worship.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        <button
          disabled
          aria-label="Share Progress Soon"
          className="w-full rounded-xl flex items-center justify-center gap-2 h-12 bg-card border border-border text-[15px] font-sans font-semibold opacity-50 cursor-not-allowed">
          <Share2 size={16} className="text-secondary-foreground" /> <span className="text-secondary-foreground">Share Progress Soon</span>
        </button>
        <button onClick={onHome}
          className="w-full rounded-xl font-bold transition-all active:scale-95 h-[52px] bg-primary text-background text-[16px] font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Return Home
        </button>
      </div>
    </div>
  );
}
