import React, { useEffect, useMemo, useState } from "react";
import { Bell, BookOpen, Download, Flame, HelpCircle, Info, Pause, Play, Settings, Volume2, Wifi, X } from "lucide-react";
import { motion } from "motion/react";
import { t } from "../../i18n";
import { LANGUAGE_LABELS, LANGUAGES_LIST } from "../onboarding/LanguageScreen";
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
  | "root"
  | "language"
  | "audio"
  | "accessibility"
  | "downloads"
  | "notifications"
  | "progress"
  | "about";

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
  return value[0].toUpperCase() + value.slice(1);
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

function PanelOptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
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
        <div className="mx-4 mb-4 flex gap-3">
          {(["small", "medium", "large"] as TextSizeOption[]).map((size) => (
            <PanelOptionButton key={size} active={textSize === size} label={formatTextSize(size)} onClick={() => onTextSizeChange(size)} />
          ))}
        </div>

        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="var(--primary)" strokeWidth="1.5" />
                <path d="M9 2A7 7 0 0 1 9 16V2Z" fill="var(--primary)" />
              </svg>
            }
            label="High Contrast Mode"
            right={<RowToggle checked={highContrast} onChange={() => onHighContrastChange(!highContrast)} label="High Contrast Mode" />}
            onPress={() => onHighContrastChange(!highContrast)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 4H9C11 4 11 7 9 7H5V4ZM5 7H10C12 7 12 11 10 11H5V7Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Bold Text"
            right={<RowToggle checked={boldText} onChange={() => onBoldTextChange(!boldText)} label="Bold Text" />}
            onPress={() => onBoldTextChange(!boldText)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="Color Support" />
        <div className="mx-4 grid grid-cols-2 gap-3">
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
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6 14V4M6 4L3 7M6 4L9 7M12 14V4M12 4L9 7M12 4L15 7" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Reduce Motion"
            right={<RowToggle checked={reduceMotion} onChange={() => onReduceMotionChange(!reduceMotion)} label="Reduce Motion" />}
            onPress={() => onReduceMotionChange(!reduceMotion)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="6" y="2" width="6" height="14" rx="1" stroke="var(--primary)" strokeWidth="1.5" />
                <path d="M3 6V12M15 6V12" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            label="Haptic Feedback"
            right={<RowToggle checked={hapticFeedback} onChange={() => onHapticFeedbackChange(!hapticFeedback)} label="Haptic Feedback" />}
            onPress={() => onHapticFeedbackChange(!hapticFeedback)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="Reading" />
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M15 5H6M15 9H9M15 13H6M3 5H3.01M3 9H3.01M3 13H3.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            label="Right-to-Left Layout"
            right={<RowToggle checked={forceRtl} onChange={() => onForceRtlChange(!forceRtl)} label="Right-to-Left Layout" />}
            onPress={() => onForceRtlChange(!forceRtl)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="var(--primary)" strokeWidth="1.5" />
                <path d="M9 13V8M9 5H9.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            label="Screen Reader Hints"
            right={<RowToggle checked={voiceOver} onChange={() => onVoiceOverChange(!voiceOver)} label="Screen Reader Hints" />}
            onPress={() => onVoiceOverChange(!voiceOver)}
            hasDivider={false}
          />
        </div>

        <div className="mx-4 mt-4 rounded-xl border border-border bg-card p-4">
          <p className="font-sans text-[15px] font-semibold text-foreground">{t(language, "settings.accessibility")}</p>
          <p className="mt-2 font-sans text-[14px] leading-[22px] text-muted-foreground">
            Text size, contrast, and motion settings apply across the app immediately and are saved to your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

