import React from "react";
import { ChevronLeft, Home, BookOpen, Settings } from "lucide-react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function Header({ title, subtitle, onBack, right }:
  { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 shrink-0 border-b border-border h-14">
      {onBack && (
        <button onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center rounded-full transition-colors w-11 h-11 min-w-[44px] hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft size={22} className="text-foreground rtl:-scale-x-100" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-[17px] leading-6 text-foreground font-sans">{title}</p>
        {subtitle && <p className="text-[12px] text-muted-foreground font-sans leading-[18px]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function BottomNav({ active, onChange, isArabic = false }: {
  active: "home" | "azkar" | "settings";
  onChange: (t: "home" | "azkar" | "settings") => void;
  isArabic?: boolean;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = [
    { id: "home" as const, label: t(language, "common.home"), Icon: Home },
    { id: "azkar" as const, label: t(language, "common.azkar"), Icon: BookOpen },
    { id: "settings" as const, label: t(language, "common.settings"), Icon: Settings },
  ];
  return (
    <nav aria-label="Bottom Navigation" className="flex shrink-0 border-t border-border bg-background h-[83px] pb-5">
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            aria-label={label}
            aria-current={on ? "page" : undefined}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
            <Icon size={22} className={on ? "text-primary" : "text-muted-foreground"} />
            <span className={`text-[12px] font-medium font-sans leading-[16px] ${on ? "text-primary" : "text-muted-foreground"}`}>
              {label}
            </span>
            {on && <div className="rounded-full w-1 h-1 bg-primary -mt-[2px]" />}
          </button>
        );
      })}
    </nav>
  );
}
