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
