import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Download,
  Flame,
  HelpCircle,
  Info,
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
          <PanelOptionButton
            active={audioQuality === "standard"}
            label="Standard"
            onClick={() => onChange("standard")}
          />
          <PanelOptionButton active={audioQuality === "high"} label="High" onClick={() => onChange("high")} />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="latin-ui text-[15px] font-semibold text-foreground" lang="en" dir="ltr">
            Current quality
          </p>
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
