import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Download,
  Flame,
  HelpCircle,
  Info,
  Pause,
  Play,
  Settings,
  Sparkles,
  Sprout,
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
          <CheckCircle2 size={24} className="shrink-0 text-white" />
          <p className="latin-ui text-[14px] text-white" lang="en" dir="ltr">
            Notification preferences are saved for your reminder flow.
          </p>
        </div>

        <SectionLabel label="Azkar Reminders" />
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <ReminderRow
            label="Morning Azkar"
            categoryId="morning"
            enabled={morningOn}
            onToggle={() => setMorningOn((value) => !value)}
          />
          <ReminderRow
            label="Evening Azkar"
            categoryId="evening"
            enabled={eveningOn}
            onToggle={() => setEveningOn((value) => !value)}
          />
          <ReminderRow
            label="Before Sleep"
            categoryId="before_sleep"
            enabled={sleepOn}
            onToggle={() => setSleepOn((value) => !value)}
            hasDivider={false}
          />
        </div>

        <SectionLabel label="General" />
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-card">
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={<Sparkles size={18} className="text-primary" />}
            label="Completion Celebration"
            right={
              <RowToggle
                checked={celebration}
                onChange={() => setCelebration((value) => !value)}
                label="Completion Celebration"
              />
            }
            onPress={() => setCelebration((value) => !value)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={<Sprout size={18} className="text-primary" />}
            label="Daily Streak Reminder"
            right={
              <RowToggle checked={streak} onChange={() => setStreak((value) => !value)} label="Daily Streak Reminder" />
            }
            onPress={() => setStreak((value) => !value)}
          />
          <SettingsRowItem
            iconBg="var(--muted)"
            icon={<Volume2 size={18} className="text-primary" />}
            label="Notification Sound"
            right={<RowValue value={soundOptions[notificationSoundIndex] ?? "Gentle Chime"} withChevron={false} />}
            onPress={() => setNotificationSoundIndex((index) => (index + 1) % soundOptions.length)}
            hasDivider={false}
          />
        </div>
      </div>
    </div>
  );
}
