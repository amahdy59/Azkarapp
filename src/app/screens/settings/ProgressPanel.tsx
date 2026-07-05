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

