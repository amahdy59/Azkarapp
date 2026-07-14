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
      <div
        className="flex-1 overflow-y-auto px-4 pb-8 pt-3"
        role="radiogroup"
        aria-label={t(language, "settings.language")}
      >
        <div className="flex flex-col gap-3">
          {LANGUAGES_LIST.map((item) => {
            const active = selectedLanguage === item.code;
            return (
              <button
                key={item.code}
                role="radio"
                aria-checked={active}
                type="button"
                onClick={() => onChange(item.code as AppLanguage)}
                className={`relative flex h-[64px] w-full items-center justify-center gap-3 rounded-2xl border bg-card px-4 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active ? "border-primary shadow-sm" : "border-border"
                }`}
                dir={item.code === "ar" ? "rtl" : "ltr"}
                lang={item.code}
              >
                <div className="flex w-full items-center justify-center gap-3">
                  {active && (
                    <div className="absolute left-4">
                      <Check size={20} className="text-primary" aria-hidden="true" />
                    </div>
                  )}

                  <span
                    className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground"
                    aria-hidden="true"
                  >
                    {item.code}
                  </span>
                  <span className="font-sans text-[17px] font-semibold text-foreground">{item.native}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
