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

