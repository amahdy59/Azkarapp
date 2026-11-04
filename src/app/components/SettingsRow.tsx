import "./toggle-track.css";
import "./card-action.css";
import "./settings-rows.css";
import React, { useId } from "react";
import { ChevronDown, ChevronNext } from "./icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  description?: string;
  labelColor?: string;
  right?: React.ReactNode;
  onPress?: React.MouseEventHandler<HTMLButtonElement>;
  hasDivider?: boolean;
  current?: boolean;
  testId?: string;
}

export function SettingsRowItem({
  icon,
  iconBg = "var(--muted)",
  label,
  description,
  labelColor = "text-foreground",
  right,
  onPress,
  hasDivider = false,
  current = false,
  testId,
}: SettingsRowProps) {
  const content = (
    <>
      <div
        className="surface-control-finish control-cue flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`min-w-0 flex-1 [overflow-wrap:anywhere] text-start font-sans text-subtitle md:text-base leading-snug ${current ? "font-bold text-primary" : "font-semibold text-foreground"}`}
          style={{ color: current ? undefined : labelColor === "text-foreground" ? "var(--foreground)" : undefined }}
        >
          {label}
        </p>
        {description && (
          <p className="mt-0.5 [overflow-wrap:anywhere] text-start text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {right}
    </>
  );

  return (
    <div className="settings-row-item relative">
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          data-card-action
          data-testid={testId}
          aria-current={current ? "page" : undefined}
          className="relative flex min-h-16 w-full items-center gap-3 bg-card px-4 py-3 text-start transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
          style={{ backgroundColor: current ? "color-mix(in srgb, var(--primary) 10%, var(--card))" : undefined }}
        >
          {current && <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-primary" />}
          {content}
        </button>
      ) : (
        <div className="flex min-h-16 w-full items-center gap-3 bg-card px-4 py-3">{content}</div>
      )}
      {hasDivider && (
        <div
          aria-hidden="true"
          className="settings-row-divider absolute bottom-0 h-px bg-border"
          style={{ insetInlineStart: 68, insetInlineEnd: 0 }}
        />
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
  hasDivider = false,
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
    <div className="settings-row-item relative">
      <div
        data-card-action
        className="settings-select-control group relative flex min-h-16 w-full items-center gap-3 bg-card px-4 py-3 focus-within:z-10 focus-within:outline-none focus-within:ring-[3px] focus-within:ring-inset focus-within:ring-ring"
      >
        <span
          aria-hidden="true"
          className="surface-control-finish control-cue flex size-10 shrink-0 items-center justify-center rounded-[var(--ds-radius-control)]"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </span>
        <span
          id={labelId}
          className="min-w-0 flex-1 [overflow-wrap:anywhere] text-start font-sans text-base font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {label}
        </span>
        <div className="settings-row-value flex min-w-0 max-w-[50%] shrink items-center gap-1.5">
          <p
            className="min-w-0 [overflow-wrap:anywhere] font-sans text-subtitle"
            style={{ color: "var(--foreground)", opacity: 0.9 }}
            title={value}
          >
            {value}
          </p>
          <ChevronDown
            aria-hidden="true"
            size={18}
            className="shrink-0"
            style={{ color: "var(--foreground)", opacity: 0.7 }}
          />
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
          className="settings-row-divider absolute bottom-0 h-px bg-border"
          style={{ insetInlineStart: 68, insetInlineEnd: 0 }}
        />
      )}
    </div>
  );
}

export function RowChevron() {
  return <ChevronNext size={18} className="block shrink-0 text-foreground/70" />;
}

export function RowValue({ value, withChevron = true }: { value: string; withChevron?: boolean }) {
  return (
    <div className="settings-row-value flex min-w-0 max-w-[50%] shrink items-center gap-1.5">
      <p
        className="min-w-0 [overflow-wrap:anywhere] text-subtitle font-sans"
        style={{ color: "var(--foreground)", opacity: 0.9 }}
        title={value}
      >
        {value}
      </p>
      {withChevron && <RowChevron />}
    </div>
  );
}

export function ToggleTrack({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="settings-toggle-track relative block h-[26px] w-11 shrink-0 rounded-full border-2 transition-colors duration-standard"
      data-checked={checked}
      style={{
        background: checked ? "var(--primary)" : "var(--card)",
        borderColor: checked ? "var(--primary)" : "var(--border-control)",
      }}
    >
      <span
        className="settings-toggle-thumb absolute top-0 h-[22px] w-[22px] rounded-full shadow-md"
        style={{
          insetInlineStart: 0,
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
  hasDivider = false,
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
    <div className="settings-row-item settings-toggle-row relative">
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        data-card-action
        onClick={onChange}
        className="settings-toggle-control flex min-h-16 w-full items-center gap-3 bg-card px-4 py-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className="surface-control-finish control-cue flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 break-words">
          <span className="block font-sans text-base font-semibold text-foreground">{label}</span>
          {description && <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>}
        </span>
        <ToggleTrack checked={checked} />
      </button>
      {hasDivider && (
        <div
          aria-hidden="true"
          className="settings-row-divider absolute bottom-0 h-px bg-border"
          style={{ insetInlineStart: 68, insetInlineEnd: 0 }}
        />
      )}
    </div>
  );
}
