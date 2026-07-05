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

export function SettingsRootPanel({
  onNav,
  language,
  darkMode,
  languageLabel,
  phoneAuthEnabled,
  audioQuality,
  textSize,
  isGuest,
  isSyncing,
  onToggleDark,
  onActivateAccount,
  onSignOut,
}: {
  onNav: (screen: SettingsSubScreen) => void;
  language: AppLanguage;
  darkMode: boolean;
  languageLabel: string;
  phoneAuthEnabled: boolean;
  audioQuality: AudioQuality;
  textSize: TextSizeOption;
  isGuest: boolean;
  isSyncing: boolean;
  onToggleDark: () => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
}) {
  return (
    <motion.div
      className="flex-1 overflow-y-auto pb-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 1, 1], y: [8, 0, 0] }}
      transition={{
        opacity: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" },
        y: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" },
      }}
    >
      <SectionLabel label={t(language, "settings.preferences")} />
      <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
              <path
                d="M10 2C10 2 7 6 7 10s3 8 3 8M10 2c0 0 3 4 3 8s-3 8-3 8M2 10h16"
                stroke="currentColor"
                className="text-foreground"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          }
          label={t(language, "settings.language")}
          right={<RowValue value={languageLabel} />}
          onPress={() => onNav("language")}
        />
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
              <path d="M10 3v14M3 10h14" stroke="currentColor" className="text-foreground" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label={t(language, "settings.displayTheme")}
          right={
            <div className="flex items-center gap-2">
              <p className="font-sans text-[14px] text-foreground/90">{darkMode ? t(language, "common.dark") : t(language, "common.light")}</p>
              <RowToggle checked={darkMode} onChange={onToggleDark} label={t(language, "settings.displayTheme")} />
            </div>
          }
          onPress={onToggleDark}
        />
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M7 7h6M7 13h4" stroke="currentColor" className="text-foreground" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label={t(language, "settings.textSize")}
          right={<RowValue value={formatTextSize(textSize)} />}
          onPress={() => onNav("accessibility")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.content")} />
      <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Volume2 size={18} className="text-foreground" />}
          label={t(language, "settings.audioQuality")}
          right={<RowValue value={formatAudioQuality(audioQuality)} />}
          onPress={() => onNav("audio")}
        />
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Download size={18} className="text-foreground" />}
          label={t(language, "settings.offlineDownloads")}
          right={<RowChevron />}
          onPress={() => onNav("downloads")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.accessibility")} />
      <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Settings size={18} className="text-foreground" />}
          label={t(language, "settings.accessibility")}
          right={<RowChevron />}
          onPress={() => onNav("accessibility")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.account")} />
      <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Bell size={18} className="text-foreground" />}
          label={t(language, "settings.notifications")}
          right={<RowChevron />}
          onPress={() => onNav("notifications")}
        />
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Flame size={18} className="text-foreground" />}
          label={t(language, "settings.myProgress")}
          right={<RowChevron />}
          onPress={() => onNav("progress")}
        />
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Info size={18} className="text-foreground" />}
          label={t(language, "settings.aboutHelp")}
          right={<RowChevron />}
          onPress={() => onNav("about")}
          hasDivider={false}
        />
      </div>

      {isGuest ? (
        <>
          <SectionLabel label={t(language, "settings.sync")} />
          <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
            <SettingsRowItem
              iconBg="color-mix(in srgb, var(--primary) 18%, transparent)"
              icon={<Wifi size={18} className="text-primary" />}
              label={t(language, "settings.activateAccount")}
              right={<RowChevron />}
              onPress={onActivateAccount}
            />
            <div className="px-4 pb-4 pt-3">
              <p className="font-sans text-[13px] leading-[20px] text-muted-foreground">
                {phoneAuthEnabled ? t(language, "settings.syncHint") : t(language, "auth.phoneDisabled")}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <SectionLabel label={t(language, "settings.sync")} />
          <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
            <SettingsRowItem
              iconBg="var(--muted)"
              icon={<Wifi size={18} className="text-foreground" />}
              label={t(language, "settings.accountSync")}
              right={<RowValue value={isSyncing ? t(language, "common.syncing") : t(language, "common.connected")} withChevron={false} />}
            />
            <SettingsRowItem
              iconBg="color-mix(in srgb, var(--destructive) 20%, transparent)"
              icon={<X size={18} className="text-destructive" />}
              label={t(language, "common.signOut")}
              right={<RowChevron />}
              onPress={onSignOut}
              hasDivider={false}
            />
          </div>
        </>
      )}
    </motion.div>
  );
}

export function LanguagePanel({
  language,
  selectedLanguage,
  onChange,
  onBack,
}: {
  language: AppLanguage;
  selectedLanguage: AppLanguage;
  onChange: (value: AppLanguage) => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "settings.language")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-3">
        <div className="flex flex-col gap-2">
          {LANGUAGES_LIST.map((item) => {
            const active = selectedLanguage === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => onChange(item.code as AppLanguage)}
                className="flex h-[64px] w-full items-center gap-3 rounded-xl border bg-card px-4 text-start transition-all active:scale-[0.98]"
                style={{
                  borderInlineStart: active ? "4px solid var(--primary)" : "4px solid transparent",
                  borderColor: active ? "color-mix(in srgb, var(--primary) 40%, transparent)" : "var(--border)",
                }}
              >
                <span className="text-[26px] leading-none">{item.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[16px] font-semibold text-foreground" dir="auto">
                    {item.native}
                  </p>
                  <p className="font-sans text-[12px] text-muted-foreground">{LANGUAGE_LABELS[item.code as AppLanguage]}</p>
                </div>
                {active && (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 text-primary">
                    <path d="M4 10L8.5 14.5L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AudioPanel({
  language,
  audioQuality,
  onChange,
  onBack,
}: {
  language: AppLanguage;
  audioQuality: AudioQuality;
  onChange: (value: AudioQuality) => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "settings.audioQuality")} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <SectionLabel label="Streaming Quality" />
        <div className="mx-0 flex gap-3">
          <PanelOptionButton active={audioQuality === "standard"} label="Standard" onClick={() => onChange("standard")} />
          <PanelOptionButton active={audioQuality === "high"} label="High" onClick={() => onChange("high")} />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="font-sans text-[15px] font-semibold text-foreground">Current quality</p>
          <p className="mt-2 font-sans text-[14px] leading-[22px] text-muted-foreground">
            {audioQuality === "high"
              ? "Higher fidelity recitation audio with a larger download size."
              : "Smaller files for lighter data usage and faster downloads."}
          </p>
        </div>
      </div>
    </div>
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

export function DownloadsPanel({ onBack }: { onBack: () => void }) {
  const catMeta = useMemo(
    () => [
      { id: "morning" as CategoryId, icon: "sun", label: "Morning Azkar", size: "8.2 MB" },
      { id: "evening" as CategoryId, icon: "crescent", label: "Evening Azkar", size: "7.8 MB" },
      { id: "before_sleep" as CategoryId, icon: "stars", label: "Before Sleep", size: "5.1 MB" },
    ],
    [],
  );

  const [downloads, setDownloads] = useState<Record<CategoryId, DownloadState>>({
    morning: "idle",
    evening: "idle",
    before_sleep: "done",
  });
  const [progress, setProgress] = useState<Record<CategoryId, number>>({
    morning: 0,
    evening: 0,
    before_sleep: 100,
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((current) => {
        let changed = false;
        const next = { ...current };

        for (const categoryId of Object.keys(next) as CategoryId[]) {
          if (downloads[categoryId] !== "downloading") {
            continue;
          }

          changed = true;
          next[categoryId] = Math.min(100, next[categoryId] + 10);
        }

        if (!changed) {
          return current;
        }

        return next;
      });
    }, 500);

    return () => window.clearInterval(timer);
  }, [downloads]);

  useEffect(() => {
    setDownloads((current) => {
      let changed = false;
      const next = { ...current };

      for (const categoryId of Object.keys(progress) as CategoryId[]) {
        if (progress[categoryId] >= 100 && next[categoryId] === "downloading") {
          next[categoryId] = "done";
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [progress]);

  const startDownload = (categoryId: CategoryId) => {
    setDownloads((current) => ({ ...current, [categoryId]: "downloading" }));
    setProgress((current) => ({ ...current, [categoryId]: current[categoryId] >= 100 ? 0 : current[categoryId] }));
  };

  const pauseDownload = (categoryId: CategoryId) => {
    setDownloads((current) => ({ ...current, [categoryId]: "paused" }));
  };

  const clearDownload = (categoryId: CategoryId) => {
    setDownloads((current) => ({ ...current, [categoryId]: "idle" }));
    setProgress((current) => ({ ...current, [categoryId]: 0 }));
  };

  const handleDownloadAll = () => {
    setDownloads({
      morning: "downloading",
      evening: "downloading",
      before_sleep: "downloading",
    });
    setProgress((current) => ({
      morning: current.morning >= 100 ? 0 : current.morning,
      evening: current.evening >= 100 ? 0 : current.evening,
      before_sleep: current.before_sleep >= 100 ? 0 : current.before_sleep,
    }));
  };

  const handleClearAll = () => {
    setDownloads({
      morning: "idle",
      evening: "idle",
      before_sleep: "idle",
    });
    setProgress({
      morning: 0,
      evening: 0,
      before_sleep: 0,
    });
  };

  const usedStorage = Object.values(progress).reduce((sum, value, index) => sum + (value / 100) * [8.2, 7.8, 5.1][index], 0);

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="Offline Downloads" onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 flex items-center gap-3 rounded-xl bg-[#1A4F44] px-4 py-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white">
            <path d="M12 16L7 11M12 16L17 11M12 16V4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="flex-1 font-sans text-[14px] leading-[22px] text-white">Download azkar for offline use and keep the reader available without internet.</p>
        </div>

        <div className="px-4 pb-2 pt-4">
          <button
            type="button"
            onClick={handleDownloadAll}
            className="h-[52px] w-full rounded-xl border-[1.5px] border-primary bg-transparent transition-all active:scale-95"
          >
            <p className="font-sans text-[16px] font-semibold text-primary">Download All Categories</p>
          </button>
        </div>

        <SectionLabel label="Available to Download" />
        <div className="flex flex-col gap-3 px-4">
          {catMeta.map(({ id, icon, label, size }) => {
            const state = downloads[id];
            const amount = progress[id];
            const actionLabel =
              state === "downloading" ? "Pause" : state === "paused" ? "Resume" : state === "done" ? "Remove" : "Download";
            const action = () => {
              if (state === "downloading") {
                pauseDownload(id);
              } else if (state === "paused") {
                startDownload(id);
              } else if (state === "done") {
                clearDownload(id);
              } else {
                startDownload(id);
              }
            };

            return (
              <div key={id} className={`overflow-hidden rounded-xl border bg-card ${state === "downloading" ? "border-primary" : "border-border"}`}>
                <div className="flex items-center gap-3 px-4 py-4">
                  <CatIcon type={icon} size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-[17px] font-semibold leading-[24px] text-foreground">{label}</p>
                    <p className="font-sans text-[13px] leading-[20px] text-muted-foreground">
                      {CATEGORIES.find((category) => category.id === id)?.totalCount} azkar · {size}
                    </p>
                    {(state === "downloading" || state === "paused") && (
                      <div className="mt-3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[#14B8A6]" style={{ width: `${amount}%` }} />
                        </div>
                        <p className="mt-2 font-sans text-[12px] text-primary">{Math.round(amount)}% complete</p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={action}
                    className={`flex min-w-[88px] items-center justify-center rounded-full px-4 py-2 text-[13px] font-medium transition-all active:scale-95 ${
                      state === "done" ? "bg-muted text-foreground" : "bg-[#1A4F44] text-white"
                    }`}
                  >
                    {state === "downloading" ? <Pause size={14} className="mr-1" /> : state === "paused" ? <Play size={14} className="mr-1" /> : null}
                    {actionLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <SectionLabel label="Storage" />
        <div className="mx-4 mb-6 flex flex-col gap-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-[#14B8A6]" style={{ width: `${Math.min(100, (usedStorage / 21.1) * 100)}%` }} />
          </div>
          <p className="font-sans text-[13px] text-muted-foreground">
            {usedStorage.toFixed(1)} MB used · <span className="text-foreground">{(96 - usedStorage).toFixed(1)} MB free</span>
          </p>
        </div>

        <div className="px-4 pb-8">
          <button
            type="button"
            onClick={handleClearAll}
            className="h-[52px] w-full rounded-xl border-[1.5px] border-destructive bg-transparent text-[16px] font-semibold text-destructive transition-all active:scale-95"
          >
            Clear All Downloads
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel({ onBack }: { onBack: () => void }) {
  const [morningOn, setMorningOn] = useState(true);
  const [eveningOn, setEveningOn] = useState(true);
  const [sleepOn, setSleepOn] = useState(false);
  const [celebration, setCelebration] = useState(true);
  const [streak, setStreak] = useState(false);
  const [notificationSoundIndex, setNotificationSoundIndex] = useState(0);
  const [times, setTimes] = useState({
    morning: "6:30 AM",
    evening: "5:00 PM",
    before_sleep: "9:30 PM",
  });

  const soundOptions = ["Gentle Chime", "Soft Oud", "Calm Bell"];
  const timeOptions: Record<CategoryId, string[]> = {
    morning: ["5:45 AM", "6:30 AM", "7:15 AM"],
    evening: ["4:30 PM", "5:00 PM", "6:15 PM"],
    before_sleep: ["9:30 PM", "10:00 PM", "10:30 PM"],
  };

  const cycleTime = (categoryId: CategoryId) => {
    setTimes((current) => {
      const options = timeOptions[categoryId];
      const index = options.indexOf(current[categoryId]);
      return {
        ...current,
        [categoryId]: options[(index + 1) % options.length],
      };
    });
  };

  const ReminderRow = ({
    label,
    categoryId,
    enabled,
    onToggle,
    hasDivider = true,
  }: {
    label: string;
    categoryId: CategoryId;
    enabled: boolean;
    onToggle: () => void;
    hasDivider?: boolean;
  }) => (
    <div>
      <div className="flex h-[56px] items-center gap-3 bg-card px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Bell size={18} className="text-primary" />
        </div>
        <p className="flex-1 font-sans text-[17px] font-semibold text-foreground">{label}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => enabled && cycleTime(categoryId)}
            disabled={!enabled}
            className="font-sans text-[14px] text-muted-foreground disabled:opacity-50"
          >
            {enabled ? times[categoryId] : "Not set"}
          </button>
          <RowToggle checked={enabled} onChange={onToggle} label={label} />
        </div>
      </div>
      {hasDivider && <div className="mx-4 h-px bg-border" style={{ marginLeft: 56 }} />}
    </div>
  );

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 flex items-center gap-3 rounded-xl bg-[#1A4F44] px-4 py-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12.5L11 15.5L16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="font-sans text-[14px] text-white">Notification preferences are saved for your reminder flow.</p>
        </div>

        <SectionLabel label="Azkar Reminders" />
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <ReminderRow label="Morning Azkar" categoryId="morning" enabled={morningOn} onToggle={() => setMorningOn((value) => !value)} />
          <ReminderRow label="Evening Azkar" categoryId="evening" enabled={eveningOn} onToggle={() => setEveningOn((value) => !value)} />
          <ReminderRow label="Before Sleep" categoryId="before_sleep" enabled={sleepOn} onToggle={() => setSleepOn((value) => !value)} hasDivider={false} />
        </div>

        <SectionLabel label="General" />
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
                <path d="M9 1l2 5 5 .5-3.5 3.5 1 5L9 13l-4.5 2 1-5L2 6.5 7 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Completion Celebration"
            right={<RowToggle checked={celebration} onChange={() => setCelebration((value) => !value)} label="Completion Celebration" />}
            onPress={() => setCelebration((value) => !value)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
                <path d="M3 14h12M4 10l3-3 3 3 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Daily Streak Reminder"
            right={<RowToggle checked={streak} onChange={() => setStreak((value) => !value)} label="Daily Streak Reminder" />}
            onPress={() => setStreak((value) => !value)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
                <path d="M4 9h2v4H4V9zm4-4h2v8H8V5zm4 2h2v6h-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            label="Notification Sound"
            right={<RowValue value={soundOptions[notificationSoundIndex]} withChevron={false} />}
            onPress={() => setNotificationSoundIndex((index) => (index + 1) % soundOptions.length)}
            hasDivider={false}
          />
        </div>
      </div>
    </div>
  );
}

export function ProgressPanel({ onBack }: { onBack: () => void }) {
  const barHeights = [15, 25, 10, 45, 20, 30, 50];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const sessions = [
    { date: "Thursday, Jan 29", count: 15, mins: 8 },
    { date: "Wednesday, Jan 28", count: 12, mins: 6 },
    { date: "Tuesday, Jan 27", count: 18, mins: 10 },
  ];

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="My Progress" onBack={onBack} />
      <motion.div
        className="flex-1 overflow-y-auto pb-8"
        initial={{ opacity: 0, scaleX: 0.85, scaleY: 0.85, y: 10 }}
        animate={{ opacity: [0, 1, 1], scaleX: [0.85, 1, 1], scaleY: [0.85, 1, 1], y: [10, 0, 0] }}
        transition={{
          opacity: { duration: 0.63, times: [0, 0.7143, 1], ease: "easeOut" },
          scaleX: { duration: 0.63, times: [0, 0.7143, 1], ease: [[0.34, 1.56, 0.64, 1], "linear"] },
          scaleY: { duration: 0.63, times: [0, 0.7143, 1], ease: [[0.34, 1.56, 0.64, 1], "linear"] },
          y: { duration: 0.63, times: [0, 0.7143, 1], ease: "easeOut" },
        }}
      >
        <div className="px-4 pt-4">
          <div className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-card">
            <div className="w-[4px] shrink-0 bg-primary" />
            <div className="flex flex-1 items-start justify-between p-5">
              <div className="flex flex-col gap-1">
                <p className="font-sans text-[14px] leading-[22px] text-muted-foreground">Total Azkar Completed</p>
                <p className="font-sans text-[28px] font-bold leading-[36px] text-primary">1,247</p>
                <p className="mt-1 font-sans text-[12px] text-muted-foreground">Since July 2026</p>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-muted-foreground opacity-60">
                <rect x="36" y="22" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="24" y="12" width="10" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-muted-foreground" />
              <p className="font-sans text-[14px] text-muted-foreground">Current Streak</p>
            </div>
            <div>
              <p className="font-sans text-[28px] font-bold text-primary">7 days</p>
              <p className="mt-1 font-sans text-[12px] text-muted-foreground">Best: 21 days</p>
            </div>
            <div className="mt-2 flex h-[60px] items-end gap-1.5">
              {barHeights.map((height, index) => (
                <div key={index} className={`flex-1 ${index === 6 ? "bg-primary" : "bg-foreground"}`} style={{ height }} />
              ))}
            </div>
            <div className="mt-1 flex justify-between">
              {days.map((day, index) => (
                <p key={index} className={`flex-1 text-center font-sans text-[11px] font-medium ${index === 6 ? "text-primary" : "text-muted-foreground"}`}>
                  {day}
                </p>
              ))}
            </div>
          </div>
        </div>

        <SectionLabel label="Category Breakdown" />
        <div className="flex gap-3 px-4">
          {[{ label: "Morning", count: 487, pct: "100%" }, { label: "Evening", count: 430, pct: "88%" }, { label: "Sleep", count: 330, pct: "67%" }].map(
            ({ label, count, pct }) => (
              <div key={label} className="flex-1 rounded-xl border border-border bg-card p-4">
                <p className="font-sans text-[12px] text-primary">{label}</p>
                <p className="mt-2 font-sans text-[22px] font-bold text-foreground">{count}</p>
                <p className="mt-1 font-sans text-[12px] text-muted-foreground">{pct}</p>
              </div>
            ),
          )}
        </div>

        <SectionLabel label="Recent Sessions" />
        <div className="flex flex-col gap-3 px-4">
          {sessions.map(({ date, count, mins }) => (
            <div key={date} className="flex h-[72px] items-center gap-3 rounded-xl border border-border bg-card px-5">
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-sans text-[15px] font-medium leading-[22px] text-foreground">{date}</p>
                <p className="font-sans text-[14px] text-muted-foreground">{count} azkar · {mins} min</p>
              </div>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-primary rtl:-scale-x-100">
                <path d="M10 2l2.4 5 5.6.8-4 4.1.9 5.6-5-2.6-5 2.6.9-5.6-4-4.1 5.6-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AboutRow({
  icon,
  label,
  sub,
  right = <RowChevron />,
  hasDivider = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  hasDivider?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon}
      <div className="flex flex-1 flex-col items-start gap-0.5">
        <p className="font-sans text-[15px] font-medium leading-[22px] text-foreground">{label}</p>
        {sub && <p className="font-sans text-[14px] text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </>
  );

  return (
    <div className="relative">
      {onPress ? (
        <button type="button" onClick={onPress} className="flex h-[72px] w-full items-center gap-4 bg-card px-4 text-start transition-all active:opacity-70">
          {content}
        </button>
      ) : (
        <div className="flex h-[72px] w-full items-center gap-4 bg-card px-4">
          {content}
        </div>
      )}
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 64 }} />}
    </div>
  );
}

function SupportRow({
  icon,
  label,
  right = <RowChevron />,
  hasDivider = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  hasDivider?: boolean;
  onPress?: () => void;
}) {
  return (
    <div className="relative">
      <button type="button" onClick={onPress} className="flex h-[56px] w-full items-center gap-4 bg-card px-4 text-start transition-all active:opacity-70">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">{icon}</div>
        <p className="flex-1 font-sans text-[15px] font-medium text-foreground">{label}</p>
        {right}
      </button>
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 64 }} />}
    </div>
  );
}

export function AboutPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="About Azkar" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8">
          <CrescentMark size={36} />
          <div className="flex flex-col items-center gap-1.5">
            <p className="font-sans text-[24px] font-bold text-foreground">Azkar</p>
            <p className="font-sans text-[14px] text-muted-foreground">Daily Islamic Remembrance</p>
            <p className="font-sans text-[12px] text-muted-foreground opacity-60">Version 2.0.1</p>
          </div>
        </div>

        <div>
          <SectionLabel label="Content Source" />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <AboutRow
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <BookOpen size={20} className="text-background" />
                </div>
              }
              label="Hisnul Muslim"
              sub="All azkar verified from authentic sources"
            />
            <AboutRow
              icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-background">
                    <path d="M10 2l2.4 5 5.6.8-4 4.1.9 5.6-5-2.6-5 2.6.9-5.6-4-4.1 5.6-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              }
              label="Hadith References"
              sub="Bukhari, Muslim, Tirmidhi & more"
              hasDivider={false}
            />
          </div>
        </div>

        <div>
          <SectionLabel label="Support" />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <SupportRow
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background">
                  <path d="M15 12a3 3 0 0 1-3 3H5l-3 3V4a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Send Feedback"
              onPress={() => openMailto("support@azkarapp.dev", "Azkar feedback")}
            />
            <SupportRow icon={<HelpCircle size={18} className="text-background" />} label="Frequently Asked Questions" onPress={() => openExternal(REPO_URL)} />
            <SupportRow
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background">
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 9h14M9 1c2.5 0 4 3.5 4 8s-1.5 8-4 8-4-3.5-4-8 1.5-8 4-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Visit Website"
              right={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
                  <path d="M14 8v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5M9 2h5v5M14 2L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              hasDivider={false}
              onPress={() => openExternal(SITE_URL)}
            />
          </div>
        </div>

        <div className="pb-8">
          <SectionLabel label="Legal" />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <SupportRow
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background">
                  <path d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM9 5v4M9 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Privacy Policy"
              onPress={() => openExternal(REPO_URL)}
            />
            <SupportRow
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background">
                  <path d="M4 4h10M4 9h10M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              label="Terms of Service"
              hasDivider={false}
              onPress={() => openExternal(FEEDBACK_URL)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
