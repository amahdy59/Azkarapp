import React, { useEffect, useMemo, useState } from "react";
import {
  AlignRight,
  Bell,
  BookOpen,
  Contrast,
  Download,
  Flame,
  HelpCircle,
  Info,
  Smartphone,
  TypeIcon,
  Pause,
  Play,
  Settings,
  Volume2,
  Wifi,
  X,
} from "../../components/icons";
import { motion } from "motion/react";
import { t } from "../../i18n";
import { LANGUAGE_LABELS, LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage, AudioQuality, CategoryId, ColorBlindSupport, TextSizeOption } from "../../types";
import { CATEGORIES } from "../../content/categories";
import { CatIcon } from "../../components/CatIcon";
import { CrescentMark } from "../../components/CrescentMark";
import { RowChevron, RowToggle, RowValue, SectionLabel, SettingsRowItem, SubHeader } from "./SettingsPrimitives";

const SITE_URL = "https://amahdy59.github.io/Azkarapp/";
const REPO_URL = "https://github.com/amahdy59/Azkarapp";
const FEEDBACK_URL = "https://github.com/amahdy59/Azkarapp/issues/new/choose";

type DownloadState = "idle" | "downloading" | "paused" | "done";

export type SettingsSubScreen =
  "root" | "language" | "audio" | "accessibility" | "downloads" | "notifications" | "progress" | "about";

function openExternal(url: string) {
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function openMailto(email: string, subject: string) {
  if (typeof window !== "undefined") {
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  }
}

function formatTextSize(value: TextSizeOption) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatAudioQuality(value: AudioQuality) {
  return value === "high" ? "High" : "Standard";
}

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
      className={`flex-1 rounded-xl border px-3 py-3 text-[13px] font-semibold transition-all active:scale-[0.98] ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function AccessibilityPanel({
  language,
  textSize,
  highContrast,
  boldText,
  reduceMotion,
  hapticFeedback,
  forceRtl,
  voiceOver,
  colorBlindSupport,
  onTextSizeChange,
  onHighContrastChange,
  onBoldTextChange,
  onReduceMotionChange,
  onHapticFeedbackChange,
  onForceRtlChange,
  onVoiceOverChange,
  onColorBlindSupportChange,
  onBack,
}: {
  language: AppLanguage;
  textSize: TextSizeOption;
  highContrast: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  hapticFeedback: boolean;
  forceRtl: boolean;
  voiceOver: boolean;
  colorBlindSupport: ColorBlindSupport;
  onTextSizeChange: (value: TextSizeOption) => void;
  onHighContrastChange: (value: boolean) => void;
  onBoldTextChange: (value: boolean) => void;
  onReduceMotionChange: (value: boolean) => void;
  onHapticFeedbackChange: (value: boolean) => void;
  onForceRtlChange: (value: boolean) => void;
  onVoiceOverChange: (value: boolean) => void;
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
                className={`absolute left-0 -ml-2.5 h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                  textSize === "small" ? "border-foreground bg-background" : ""
                }`}
                aria-label="Small text size"
              />
              <button
                type="button"
                onClick={() => onTextSizeChange("medium")}
                className={`absolute left-1/2 -ml-3 h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                  textSize === "medium" ? "border-foreground bg-background" : ""
                }`}
                aria-label="Medium text size"
              />
              <button
                type="button"
                onClick={() => onTextSizeChange("large")}
                className={`absolute right-0 -mr-2.5 h-6 w-6 rounded-full border-[4px] border-background bg-muted shadow-md transition-all ${
                  textSize === "large" ? "border-foreground bg-background" : ""
                }`}
                aria-label="Large text size"
              />
            </div>
          </div>

          <div className="mt-4 flex w-[85%] justify-between text-[13px] font-semibold">
            <span className={textSize === "small" ? "text-primary" : "text-muted-foreground"}>Small</span>
            <span className={textSize === "medium" ? "text-primary" : "text-muted-foreground"}>Medium</span>
            <span className={textSize === "large" ? "text-primary" : "text-muted-foreground"}>Large</span>
          </div>
        </div>

        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Contrast size={20} className="text-primary" />}
            label="High Contrast Mode"
            right={
              <RowToggle
                checked={highContrast}
                onChange={() => onHighContrastChange(!highContrast)}
                label="High Contrast Mode"
              />
            }
            onPress={() => onHighContrastChange(!highContrast)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<TypeIcon size={20} className="text-primary" />}
            label="Bold Text"
            right={<RowToggle checked={boldText} onChange={() => onBoldTextChange(!boldText)} label="Bold Text" />}
            onPress={() => onBoldTextChange(!boldText)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Flame size={20} className="text-primary" />} // Replaced with a generic placeholder since Palette isn't available
            label="Color Blind Support"
            right={<RowValue value={formatColorBlindSupport(colorBlindSupport)} />}
            onPress={() => {}}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="Motion" />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Pause size={20} className="text-primary" />}
            label="Reduce Motion"
            right={
              <RowToggle
                checked={reduceMotion}
                onChange={() => onReduceMotionChange(!reduceMotion)}
                label="Reduce Motion"
              />
            }
            onPress={() => onReduceMotionChange(!reduceMotion)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Smartphone size={20} className="text-primary" />}
            label="Haptic Feedback"
            right={
              <RowToggle
                checked={hapticFeedback}
                onChange={() => onHapticFeedbackChange(!hapticFeedback)}
                label="Haptic Feedback"
              />
            }
            onPress={() => onHapticFeedbackChange(!hapticFeedback)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="Reading" />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<AlignRight size={20} className="text-primary" />}
            label="Right-to-Left Layout"
            right={
              <RowToggle checked={forceRtl} onChange={() => onForceRtlChange(!forceRtl)} label="Right-to-Left Layout" />
            }
            onPress={() => onForceRtlChange(!forceRtl)}
          />
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Info size={20} className="text-primary" />}
            label="VoiceOver Compatible"
            right={
              <RowToggle
                checked={voiceOver}
                onChange={() => onVoiceOverChange(!voiceOver)}
                label="VoiceOver Compatible"
              />
            }
            onPress={() => onVoiceOverChange(!voiceOver)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="Audio" />
        <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card p-1">
          <div className="flex h-[44px] items-center rounded-xl bg-background p-1">
            {["0.75x", "1x", "1.25x", "1.5x"].map((speed, i) => (
              <button
                key={speed}
                type="button"
                className={`flex-1 rounded-lg text-[13px] font-semibold transition-colors ${
                  i === 1 ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ height: 36 }}
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
