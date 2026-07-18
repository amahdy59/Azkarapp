import React, { useId } from "react";
import { IconButton } from "../../components/LayoutShells";
import { ArrowPrevious, ChevronDown, ChevronNext } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

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
      <IconButton onClick={onBack} label={t(language, "common.back")}>
        <ArrowPrevious size={20} className="text-foreground" />
      </IconButton>
      <h1 className="text-[1.125rem] font-semibold text-foreground font-sans leading-[24px]">{title}</h1>
      <div style={{ width: 44 }} className="flex justify-end items-center">
        {right}
      </div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <h2 className="text-[0.8125rem] font-semibold text-muted-foreground font-sans leading-[18px]">{label}</h2>
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
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: iconBg }}>
        {icon}
      </div>
      <p className={`min-w-0 flex-1 text-start text-[1rem] font-semibold ${labelColor} font-sans`}>{label}</p>
      {right}
    </>
  );

  return (
    <div className="relative">
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          className="flex min-h-16 w-full items-center gap-3 bg-card px-4 transition-all active:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
        >
          {content}
        </button>
      ) : (
        <div className="flex min-h-16 w-full items-center gap-3 bg-card px-4">{content}</div>
      )}
      {hasDivider && (
        <div className="absolute bottom-0 h-px bg-border" style={{ insetInlineStart: 68, insetInlineEnd: 0 }} />
      )}
    </div>
  );
}

export function SettingsSelectRow({
  icon,
  iconBg = "var(--muted)",
  label,
  selectedValue,
  value,
  options,
  onChange,
  direction,
  testId,
  hasDivider = true,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  selectedValue: string;
  value: string;
  options: Array<{ value: string; label: string; language?: string; direction?: "ltr" | "rtl" }>;
  onChange: (value: string) => void;
  direction: "ltr" | "rtl";
  testId?: string;
  hasDivider?: boolean;
}) {
  const labelId = useId();

  return (
    <div className="relative">
      <div className="group relative flex min-h-16 w-full items-center gap-3 bg-card px-4 focus-within:z-10 focus-within:outline-none focus-within:ring-[3px] focus-within:ring-inset focus-within:ring-ring">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)]"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
        <span id={labelId} className="min-w-0 flex-1 text-start font-sans text-[1rem] font-semibold text-foreground">
          {label}
        </span>
        <div className="flex min-w-0 max-w-[50%] shrink items-center gap-1.5">
          <p className="truncate font-sans text-[0.9375rem] text-foreground/90" title={value}>
            {value}
          </p>
          <ChevronDown aria-hidden="true" size={18} className="shrink-0 text-foreground/70" />
        </div>
        <Select value={selectedValue} onValueChange={onChange} dir={direction}>
          <SelectTrigger
            data-testid={testId}
            aria-labelledby={labelId}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                lang={option.language}
                dir={option.direction}
                className={option.direction === "rtl" ? "text-right" : "text-left"}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasDivider && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 h-px bg-border"
          style={{ insetInlineStart: 68, insetInlineEnd: 0 }}
        />
      )}
    </div>
  );
}

export function RowChevron() {
  return <ChevronNext size={18} className="text-foreground/70" />;
}

export function RowValue({ value, withChevron = true }: { value: string; withChevron?: boolean }) {
  return (
    <div className="flex min-w-0 max-w-[50%] shrink items-center gap-1.5">
      <p className="truncate text-[0.9375rem] text-foreground/90 font-sans" title={value}>
        {value}
      </p>
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
        borderColor: checked ? "var(--primary)" : "var(--border-control)",
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
  description,
  checked,
  onChange,
  hasDivider = true,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  description?: string;
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
        className="flex min-h-16 w-full items-center gap-3 bg-card px-4 py-3 text-start transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-sans text-[1rem] font-semibold text-foreground">{label}</span>
          {description && (
            <span className="mt-1 block text-[0.75rem] leading-5 text-muted-foreground">{description}</span>
          )}
        </span>
        <ToggleTrack checked={checked} />
      </button>
      {hasDivider && (
        <div className="absolute bottom-0 h-px bg-border" style={{ insetInlineStart: 68, insetInlineEnd: 0 }} />
      )}
    </div>
  );
}
