import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Globe,
  HelpCircle,
  Info,
  MessageChat,
  Pause,
  Play,
  Settings,
  Star,
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

export function AboutPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title="About Azkar" onBack={onBack} />
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8">
          <CrescentMark size={36} />
          <div className="flex flex-col items-center gap-1.5">
            <p className="font-sans text-[24px] font-bold text-foreground">Azkar</p>
            <p className="latin-ui text-[14px] text-muted-foreground" lang="en" dir="ltr">
              Daily Islamic Remembrance
            </p>
            <p className="latin-ui text-[12px] text-muted-foreground opacity-60" lang="en" dir="ltr">
              Version 2.0.1
            </p>
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
                  <Star size={20} className="text-background" />
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
              icon={<MessageChat size={18} className="text-background" />}
              label="Send Feedback"
              onPress={() => openMailto("support@azkarapp.dev", "Azkar feedback")}
            />
            <SupportRow
              icon={<HelpCircle size={18} className="text-background" />}
              label="Frequently Asked Questions"
              onPress={() => openExternal(REPO_URL)}
            />
            <SupportRow
              icon={<Globe size={18} className="text-background" />}
              label="Visit Website"
              right={<ExternalLink size={16} className="text-muted-foreground" />}
              hasDivider={false}
              onPress={() => openExternal(SITE_URL)}
            />
          </div>
        </div>

        <div className="pb-8">
          <SectionLabel label="Legal" />
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <SupportRow
              icon={<Info size={18} className="text-background" />}
              label="Privacy Policy"
              onPress={() => openExternal(REPO_URL)}
            />
            <SupportRow
              icon={<FileText size={18} className="text-background" />}
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

function AboutRow({
  icon,
  label,
  sub,
  right = <RowChevron />,
  hasDivider = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  hasDivider?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon}
      <div className="flex flex-1 flex-col items-start gap-0.5">
        <p className="font-sans text-[15px] font-medium leading-[22px] text-foreground">{label}</p>
        {sub && <p className="font-sans text-[14px] text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </>
  );

  return (
    <div className="relative">
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          className="flex h-[72px] w-full items-center gap-4 bg-card px-4 text-start transition-all active:opacity-70"
        >
          {content}
        </button>
      ) : (
        <div className="flex h-[72px] w-full items-center gap-4 bg-card px-4">{content}</div>
      )}
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 64 }} />}
    </div>
  );
}

function SupportRow({
  icon,
  label,
  right = <RowChevron />,
  hasDivider = true,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  hasDivider?: boolean;
  onPress?: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPress}
        className="flex h-[56px] w-full items-center gap-4 bg-card px-4 text-start transition-all active:opacity-70"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground">{icon}</div>
        <p className="flex-1 font-sans text-[15px] font-medium text-foreground">{label}</p>
        {right}
      </button>
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 64 }} />}
    </div>
  );
}
