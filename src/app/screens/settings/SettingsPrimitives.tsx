import React from "react";
import { ArrowPrevious, ChevronNext } from "../../components/icons";
import type { AppLanguage } from "../../types";

export function SubHeader({
  title,
  onBack,
  right,
  language = "en",
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  language?: AppLanguage;
}) {
  return (
    <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 56 }}>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center rounded-full active:scale-95 transition-all"
        style={{ width: 44, height: 44 }}
        aria-label={language === "ar" ? "رجوع" : "Back"}
      >
        <ArrowPrevious size={24} className="text-foreground" />
      </button>
      <h1 className="text-[18px] font-semibold text-foreground font-sans leading-[24px]">{title}</h1>
      <div style={{ width: 44 }} className="flex justify-end items-center">
        {right}
      </div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <h2 className="text-[13px] font-semibold text-muted-foreground font-sans leading-[18px]">{label}</h2>
    </div>
  );
}

export interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  labelColor?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  hasDivider?: boolean;
}

export function SettingsRowItem({
  icon,
  iconBg = "var(--muted)",
  label,
  labelColor = "text-foreground",
  right,
  onPress,
  hasDivider = true,
}: SettingsRowProps) {
  const content = (
    <>
      <div
        className="flex items-center justify-center rounded-xl shrink-0"
        style={{ width: 36, height: 36, background: iconBg }}
      >
        {icon}
      </div>
      <p className={`flex-1 text-start text-[16px] font-semibold ${labelColor} font-sans`}>{label}</p>
      {right}
    </>
  );

  return (
    <div className="relative">
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          className="w-full flex items-center gap-4 px-4 transition-all active:opacity-70 bg-card h-[60px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {content}
        </button>
      ) : (
        <div className="w-full flex items-center gap-4 px-4 bg-card h-[60px]">{content}</div>
      )}
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 68 }} />}
    </div>
  );
}

export function RowChevron() {
  return <ChevronNext size={18} className="text-foreground/70" />;
}

export function RowValue({ value, withChevron = true }: { value: string; withChevron?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <p className="text-[15px] text-foreground/90 font-sans">{value}</p>
      {withChevron && <RowChevron />}
    </div>
  );
}

function ToggleTrack({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-[26px] w-11 rounded-full border-2 transition-colors"
      style={{
        background: checked ? "var(--primary)" : "var(--card)",
        borderColor: checked ? "var(--primary)" : "var(--border)",
      }}
    >
      <span
        className="absolute top-0 h-[22px] w-[22px] rounded-full shadow-md transition-all duration-200"
        style={{
          insetInlineStart: checked ? 18 : 0,
          background: checked ? "var(--primary-foreground)" : "var(--foreground)",
        }}
      />
    </span>
  );
}

export function SettingsToggleRow({
  icon,
  iconBg = "var(--muted)",
  label,
  checked,
  onChange,
  hasDivider = true,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  hasDivider?: boolean;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="flex h-[60px] w-full items-center gap-4 bg-card px-4 text-start transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
        <span className="flex-1 font-sans text-[16px] font-semibold text-foreground">{label}</span>
        <ToggleTrack checked={checked} />
      </button>
      {hasDivider && <div className="absolute bottom-0 right-0 h-px bg-border" style={{ insetInlineStart: 68 }} />}
    </div>
  );
}
