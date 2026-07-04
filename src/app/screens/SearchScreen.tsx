import React, { useState, useRef } from "react";
import { Search, ChevronLeft, X } from "lucide-react";
import type { CategoryId } from "../types";
import { ALL_AZKAR, getAzkarByCategory, ZIKR_LABELS } from "../content/azkar";

const RECENT_SEARCHES = ["Istighfar", "Morning Dua", "Ayat al-Kursi"];

export function CategoryBadge({ catId }: { catId: CategoryId }) {
  const cfg = {
    morning:      { label: "Morning", className: "bg-primary text-primary-foreground" },
    evening:      { label: "Evening", className: "bg-[#14B8A6] text-white" },
    before_sleep: { label: "Sleep",   className: "bg-[#4A3D6B] text-foreground" },
  }[catId];
  return (
    <div className={`flex items-center justify-center rounded-full px-2 py-1 shrink-0 ${cfg.className}`}>
      <p className="text-[10px] font-medium font-sans leading-[14px] whitespace-nowrap">
        {cfg.label}
      </p>
    </div>
  );
}

export function SearchScreen({ onBack, onZikr }:
  { onBack: () => void; onZikr: (catId: CategoryId, i: number) => void }) {
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState(RECENT_SEARCHES);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = q.trim().length < 2 ? [] : ALL_AZKAR.filter(z => {
    const lq = q.toLowerCase();
    return z.arabicText.includes(q)
      || z.translation.toLowerCase().includes(lq)
      || z.transliteration.toLowerCase().includes(lq)
      || (ZIKR_LABELS[z.id] ?? "").toLowerCase().includes(lq);
  });

  const handleSubmit = (term: string) => {
    if (!recents.includes(term)) setRecents(r => [term, ...r].slice(0, 5));
    setQ(term);
  };

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      {/* Top row: back + search input */}
      <div className="flex items-center gap-3 px-5 py-3 shrink-0">
        <button onClick={onBack} className="flex items-center justify-center w-6 h-6 shrink-0 active:scale-95 transition-all">
          <ChevronLeft size={24} className="text-foreground rtl:-scale-x-100" />
        </button>

        {/* Search pill input */}
        <div className="flex items-center gap-3 flex-1 rounded-full px-4 h-12 bg-card border border-border">
          <Search size={18} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Search azkar, duas..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && q.trim() && handleSubmit(q.trim())}
            className="flex-1 bg-transparent focus:outline-none text-[14px] text-foreground font-sans leading-[22px]"
          />
          {/* Cursor indicator (visible when empty) */}
          {!q && <div className="shrink-0 rounded-sm w-[2px] h-[18px] bg-primary animate-pulse" />}
          {q && (
            <button onClick={() => setQ("")} className="flex items-center justify-center shrink-0 w-4 h-4 text-muted-foreground">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Recent searches */}
        {!q && recents.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-[11px] text-muted-foreground font-sans leading-[16px] uppercase tracking-wider">
              RECENT SEARCHES
            </p>
            <div className="flex flex-wrap gap-2">
              {recents.map(r => (
                <button key={r} onClick={() => setQ(r)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-all active:scale-95 bg-secondary text-secondary-foreground">
                  <p className="text-[13px] font-sans leading-[20px]">{r}</p>
                  <button onClick={e => { e.stopPropagation(); setRecents(rs => rs.filter(s => s !== r)); }}
                    className="flex items-center justify-center w-3 h-3 text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {q.trim().length >= 2 && (
          <div className="flex flex-col gap-2">
            {results.length > 0 && (
              <p className="mb-1 text-[11px] text-primary font-sans leading-[16px] uppercase tracking-wider">
                RESULTS FOR {q.toUpperCase()}
              </p>
            )}
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Search size={36} className="text-muted" />
                <p className="text-[14px] text-muted-foreground font-sans">No results for &quot;{q}&quot;</p>
              </div>
            ) : (
              results.map(z => {
                const zIdx = getAzkarByCategory(z.category).findIndex(a => a.id === z.id);
                const label = ZIKR_LABELS[z.id] ?? z.transliteration.slice(0, 24);
                const subtitle = z.translation.slice(0, 40);
                return (
                  <button key={z.id} onClick={() => onZikr(z.category, zIdx)}
                    className="w-full flex items-center justify-between px-4 rounded-xl transition-all active:scale-[0.98] h-[72px] bg-card border border-border">
                    <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                      <p className="truncate w-full text-[17px] font-semibold text-foreground font-sans leading-[24px] text-start">
                        {label}
                      </p>
                      <p className="truncate w-full text-[14px] text-muted-foreground font-sans leading-[22px] text-start">
                        {subtitle}
                      </p>
                    </div>
                    <div className="rtl:mr-2 ltr:ml-2">
                      <CategoryBadge catId={z.category} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Footer hint */}
        {!q && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-full h-px opacity-15 bg-muted-foreground" />
            <p className="text-[11px] text-muted-foreground font-sans leading-[16px] text-center">
              Try searching by Arabic text or transliteration
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
