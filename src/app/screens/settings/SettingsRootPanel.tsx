import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BarChart3,
  Database,
  Download,
  Globe,
  Headphones,
  LogOut,
  Menu,
  Moon,
  User,
  Wifi,
} from "../../components/icons";
import { motion } from "motion/react";
import { t } from "../../i18n";
import { LANGUAGE_LABELS, LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage, AudioQuality, CategoryId, ColorBlindSupport, TextSizeOption, ThemeMode } from "../../types";
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

export function SettingsRootPanel({
  onNav,
  language,
  themeMode,
  languageLabel,
  phoneAuthEnabled,
  audioQuality,
  textSize,
  isGuest,
  isSyncing,
  onThemeModeChange,
  onActivateAccount,
  onSignOut,
}: {
  onNav: (screen: SettingsSubScreen) => void;
  language: AppLanguage;
  themeMode: ThemeMode;
  languageLabel: string;
  phoneAuthEnabled: boolean;
  audioQuality: AudioQuality;
  textSize: TextSizeOption;
  isGuest: boolean;
  isSyncing: boolean;
  onThemeModeChange: (value: ThemeMode) => void;
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
      <SectionLabel label={t(language, "settings.preferences") || "Preferences"} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Globe size={20} className="text-primary" />}
          label={t(language, "settings.language")}
          right={<RowValue value={languageLabel} />}
          onPress={() => onNav("language")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Moon size={20} className="text-primary" />}
          label={t(language, "settings.displayTheme")}
          right={
            <RowValue value={themeMode === "dark" ? "Dark Mode" : themeMode === "light" ? "Light Mode" : "Midnight"} />
          }
          onPress={() => onThemeModeChange(themeMode === "dark" ? "light" : "dark")} // Or open a subscreen if implemented
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Menu size={20} className="text-primary" />}
          label={t(language, "settings.textSize") || "Text Size"}
          right={<RowValue value={formatTextSize(textSize)} />}
          onPress={() => onNav("accessibility")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Bell size={20} className="text-primary" />}
          label="Notifications"
          right={<RowToggle checked={true} onChange={() => {}} />}
          hasDivider={false}
        />
      </div>

      <SectionLabel label="Content" />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Headphones size={20} className="text-primary" />}
          label="Audio Quality"
          right={<RowValue value={formatAudioQuality(audioQuality)} />}
          onPress={() => onNav("audio")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Download size={20} className="text-primary" />}
          label="Offline Downloads"
          right={<RowValue value="3 categories" />}
          onPress={() => onNav("downloads")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Database size={20} className="text-primary" />}
          label="Storage Used"
          right={<RowValue value="24.3 MB" />}
          hasDivider={false}
        />
      </div>

      <SectionLabel label="Accessibility" />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<User size={20} className="text-primary" />}
          label="Accessibility"
          right={<RowChevron />}
          onPress={() => onNav("accessibility")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label="Account" />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        {isGuest ? (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Wifi size={20} className="text-primary" />}
            label={t(language, "settings.activateAccount")}
            right={<RowChevron />}
            onPress={onActivateAccount}
          />
        ) : (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<BarChart3 size={20} className="text-primary" />}
            label="My Progress"
            right={<RowChevron />}
            onPress={() => onNav("progress")}
          />
        )}
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--destructive) 15%, transparent)"
          icon={<LogOut size={20} className="text-destructive" />}
          label={t(language, "common.signOut") || "Sign Out"}
          labelColor="text-destructive"
          right={!isGuest ? <RowChevron /> : undefined}
          onPress={onSignOut}
          hasDivider={false}
        />
      </div>
    </motion.div>
  );
}
