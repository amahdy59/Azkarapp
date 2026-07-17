import { AlignRight, Contrast, Eye, Info, Pause, Smartphone, TypeIcon } from "../../components/icons";
import type { ColorBlindSupport, TextSizeOption } from "../../types";
import { RowValue, SectionLabel, SettingsRowItem, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

function formatColorBlindSupport(value: ColorBlindSupport) {
  switch (value) {
    case "deuteranopia":
      return "Deuteranopia";
    case "protanopia":
      return "Protanopia";
    case "tritanopia":
      return "Tritanopia";
    default:
      return "None";
  }
}

function PanelOptionButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-11 flex-1 rounded-xl border px-3 py-3 text-[13px] font-semibold transition-all active:scale-[0.98] ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function AccessibilityPanel({
  textSize,
  highContrast,
  boldText,
  reduceMotion,
  hapticFeedback,
  forceRtl,
  colorBlindSupport,
  onTextSizeChange,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onColorBlindSupportChange,
  onBack,
}: {
  textSize: TextSizeOption;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  colorBlindSupport: ColorBlindSupport;
  onTextSizeChange: (value: TextSizeOption) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onColorBlindSupportChange: (value: ColorBlindSupport) => void;
  onBack: () => void;
}) {
  const colorBlindOptions: ColorBlindSupport[] = ["none", "deuteranopia", "protanopia", "tritanopia"];

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="Accessibility" onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label="Visual" />

        {/* Text Size Slider */}
        <div className="mx-4 mb-6 mt-2 flex flex-col items-center">
          <div className="relative flex w-[75%] items-center justify-between">
            <span className="absolute -left-8 font-semibold text-foreground">A</span>
            <span className="absolute -right-8 text-xl font-bold text-foreground">A</span>

            <div className="relative flex h-1.5 w-full items-center rounded-full bg-border">
              {/* Thumbs */}
              <button
                type="button"
                onClick={() => onTextSizeChange("small")}
                aria-pressed={textSize === "small"}
                className="absolute left-0 -ml-[22px] flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Small text size"
              >
                <span
                  aria-hidden="true"
                  className={`h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                    textSize === "small" ? "border-foreground bg-background" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange("medium")}
                aria-pressed={textSize === "medium"}
                className="absolute left-1/2 -ml-[22px] flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Medium text size"
              >
                <span
                  aria-hidden="true"
                  className={`h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                    textSize === "medium" ? "border-foreground bg-background" : ""
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => onTextSizeChange("large")}
                aria-pressed={textSize === "large"}
                className="absolute right-0 -mr-[22px] flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Large text size"
              >
                <span
                  aria-hidden="true"
                  className={`h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                    textSize === "large" ? "border-foreground bg-background" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-4 flex w-[85%] justify-between text-[13px] font-semibold">
            <span className={textSize === "small" ? "text-primary" : "text-muted-foreground"}>Small</span>
            <span className={textSize === "medium" ? "text-primary" : "text-muted-foreground"}>Medium</span>
            <span className={textSize === "large" ? "text-primary" : "text-muted-foreground"}>Large</span>
          </div>
        </div>

        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Contrast size={20} className="text-primary" />}
            label="High Contrast Mode"
            checked={highContrast}
            onChange={() => onHighContrastChange(!highContrast)}
          />
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<TypeIcon size={20} className="text-primary" />}
            label="Bold Text"
            checked={boldText}
            onChange={() => onBoldTextChange(!boldText)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Eye size={20} className="text-primary" />}
            label="Color Blind Support"
            right={<RowValue value={formatColorBlindSupport(colorBlindSupport)} withChevron={false} />}
            hasDivider={false}
          />
        </div>
        <div className="mx-4 mt-3 grid grid-cols-2 gap-2" aria-label="Color blind support options">
          {colorBlindOptions.map((option) => (
            <PanelOptionButton
              key={option}
              active={colorBlindSupport === option}
              label={formatColorBlindSupport(option)}
              onClick={() => onColorBlindSupportChange(option)}
            />
          ))}
        </div>

        <SectionLabel label="Motion" />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Pause size={20} className="text-primary" />}
            label="Reduce Motion"
            checked={reduceMotion}
            onChange={() => onReduceMotionChange(!reduceMotion)}
          />
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Smartphone size={20} className="text-primary" />}
            label="Haptic Feedback"
            checked={hapticFeedback}
            onChange={() => onHapticFeedbackChange(!hapticFeedback)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="Reading" />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsToggleRow
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<AlignRight size={20} className="text-primary" />}
            label="Right-to-Left Layout"
            checked={forceRtl}
            onChange={() => onForceRtlChange(!forceRtl)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Info size={20} className="text-primary" />}
            label="Screen reader support"
            right={<RowValue value="Always on" withChevron={false} />}
            hasDivider={false}
          />
        </div>
      </div>
    </div>
  );
}
