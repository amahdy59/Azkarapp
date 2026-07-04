import React from "react";
import { ChevronLeft } from "lucide-react";

export function SubHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 56 }}>
      <button onClick={onBack} className="flex items-center justify-center rounded-full active:scale-95 transition-all" style={{ width: 44, height: 44 }} aria-label="Back">
        <ChevronLeft size={24} className="text-foreground rtl:-scale-x-100" />
      </button>
      <p className="text-[18px] font-semibold text-foreground font-sans leading-[24px]">{title}</p>
      <div style={{ width: 44 }} className="flex justify-end items-center">{right}</div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <p className="text-[13px] font-semibold text-muted-foreground font-sans leading-[18px]">{label}</p>
    </div>
  );
}

export interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  hasDivider?: boolean;
}

export function SettingsRowItem({ icon, iconBg = "var(--muted)", label, right, onPress, hasDivider = true }: SettingsRowProps) {
  return (
    <div className="relative">
      <button
        onClick={onPress}
        className="w-full flex items-center gap-4 px-4 transition-all active:opacity-70 bg-card h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 36, height: 36, background: iconBg }}>
          {icon}
        </div>
        <p className="flex-1 text-start text-[16px] font-semibold text-foreground font-sans">{label}</p>
        {right}
      </button>
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 68 }} />}
    </div>
  );
}

export function RowChevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="rtl:-scale-x-100">
      <path d="M6 13.5L10.5 9L6 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground/70" />
    </svg>
  );
}

export function RowValue({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-[15px] text-foreground/90 font-sans">{value}</p>
      <RowChevron />
    </div>
  );
}

export function RowToggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onChange();
      }}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="relative flex items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        width: 44,
        height: 26,
        background: checked ? "var(--primary)" : "var(--card)",
        border: checked ? "2px solid var(--primary)" : "2px solid var(--border)",
      }}
    >
      <span
        className="absolute rounded-full shadow-md transition-all duration-200"
        style={{
          width: 22,
          height: 22,
          top: 0,
          insetInlineStart: checked ? 18 : 0,
          background: checked ? "var(--primary-foreground)" : "var(--foreground)",
        }}
      />
    </button>
  );
}
