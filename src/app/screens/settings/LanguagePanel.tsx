import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Check,
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
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[16px] font-semibold text-foreground" dir="auto">
                    {item.native}
                  </p>
                  <p className="font-sans text-[12px] text-muted-foreground">
                    {LANGUAGE_LABELS[item.code as AppLanguage]}
                  </p>
                </div>
                {active && <Check size={20} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
