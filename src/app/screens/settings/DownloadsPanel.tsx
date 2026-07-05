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

