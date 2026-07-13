import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Download,
  Flame,
  Globe,
  HelpCircle,
  Info,
  Pause,
  Play,
  Settings,
  TypeIcon,
  Volume2,
  Wifi,
  X,
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
      <SectionLabel label={t(language, "settings.preferences")} />
      <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-4">
          <p className="mb-3 font-sans text-[14px] font-semibold text-foreground">
            {t(language, "settings.displayTheme")}
          </p>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t(language, "settings.displayTheme")}>
            {(["midnight", "light", "dark"] as ThemeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={themeMode === mode}
                onClick={() => onThemeModeChange(mode)}
                className={`min-h-11 rounded-lg border px-2 text-[12px] font-semibold capitalize ${
                  themeMode === mode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<Globe size={20} className="text-foreground" />}
          label={t(language, "settings.language")}
          right={<RowValue value={languageLabel} />}
          onPress={() => onNav("language")}
        />
        <SettingsRowItem
          iconBg="var(--muted)"
          icon={<TypeIcon size={20} className="text-foreground" />}
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
              right={
                <RowValue
                  value={isSyncing ? t(language, "common.syncing") : t(language, "common.connected")}
                  withChevron={false}
                />
              }
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
