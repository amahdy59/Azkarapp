import React, { useState } from "react";
import { Volume2, Download, Settings, Bell, Flame, Info, Wifi, X, Pause, BookOpen, Share2, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { t } from "../../i18n";
import type { AppLanguage, CategoryId } from "../../types";
import { CATEGORIES } from "../../content/categories";
import { CatIcon } from "../../components/CatIcon";
import { CrescentMark } from "../../components/CrescentMark";
import { SubHeader, SectionLabel, SettingsRowItem, RowValue, RowToggle, RowChevron } from "./SettingsPrimitives";

export type SettingsSubScreen = "root" | "accessibility" | "downloads" | "notifications" | "progress" | "about";

export function SettingsRootPanel({ onNav, language, darkMode, languageLabel, isGuest, isSyncing, onToggleDark, onSignOut }: {
  onNav: (s: SettingsSubScreen) => void;
  language: AppLanguage;
  darkMode: boolean;
  languageLabel: string;
  isGuest: boolean;
  isSyncing: boolean;
  onToggleDark: () => void;
  onSignOut: () => void;
}) {
  return (
    <motion.div className="flex-1 overflow-y-auto pb-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 1, 1], y: [8, 0, 0] }}
      transition={{ opacity: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" }, y: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" } }}>

      <SectionLabel label={t(language, "settings.preferences")} />
      <div className="mx-4 rounded-xl overflow-hidden bg-card border border-border">
        <SettingsRowItem
          iconBg="var(--muted)" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" className="text-foreground" strokeWidth="1.5" /><path d="M10 2C10 2 7 6 7 10s3 8 3 8M10 2c0 0 3 4 3 8s-3 8-3 8M2 10h16" stroke="currentColor" className="text-foreground" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          label={t(language, "settings.language")} right={<RowValue value={languageLabel} />} onPress={() => {}} />
        <SettingsRowItem
          iconBg="var(--muted)" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" className="text-foreground" strokeWidth="1.5" /><path d="M10 3v14M3 10h14" stroke="currentColor" className="text-foreground" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          label={t(language, "settings.displayTheme")}
          right={<div className="flex items-center gap-2"><p className="text-[14px] text-foreground/90 font-sans">{darkMode ? t(language, "common.dark") : t(language, "common.light")}</p><RowToggle checked={darkMode} onChange={onToggleDark} label={t(language, "settings.displayTheme")} /></div>}
          onPress={() => {}} />
        <SettingsRowItem
          iconBg="var(--muted)" icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M7 7h6M7 13h4" stroke="currentColor" className="text-foreground" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          label={t(language, "settings.textSize")} right={<RowValue value={t(language, "settings.medium")} />} onPress={() => onNav("accessibility")} hasDivider={false} />
      </div>

      <SectionLabel label={t(language, "settings.content")} />
      <div className="mx-4 rounded-xl overflow-hidden bg-card border border-border">
        <SettingsRowItem
          iconBg="var(--muted)" icon={<Volume2 size={18} className="text-foreground" />}
          label={t(language, "settings.audioQuality")} right={<RowValue value={t(language, "settings.high")} />} onPress={() => {}} />
        <SettingsRowItem
          iconBg="var(--muted)" icon={<Download size={18} className="text-foreground" />}
          label={t(language, "settings.offlineDownloads")} right={<RowChevron />} onPress={() => onNav("downloads")} hasDivider={false} />
      </div>

      <SectionLabel label={t(language, "settings.accessibility")} />
      <div className="mx-4 rounded-xl overflow-hidden bg-card border border-border">
        <SettingsRowItem
          iconBg="var(--muted)" icon={<Settings size={18} className="text-foreground" />}
          label={t(language, "settings.accessibility")} right={<RowChevron />} onPress={() => onNav("accessibility")} hasDivider={false} />
      </div>

      <SectionLabel label={t(language, "settings.account")} />
      <div className="mx-4 rounded-xl overflow-hidden bg-card border border-border">
        <SettingsRowItem
          iconBg="var(--muted)" icon={<Bell size={18} className="text-foreground" />}
          label={t(language, "settings.notifications")} right={<RowChevron />} onPress={() => onNav("notifications")} />
        <SettingsRowItem
          iconBg="var(--muted)" icon={<Flame size={18} className="text-foreground" />}
          label={t(language, "settings.myProgress")} right={<RowChevron />} onPress={() => onNav("progress")} />
        <SettingsRowItem
          iconBg="var(--muted)" icon={<Info size={18} className="text-foreground" />}
          label={t(language, "settings.aboutHelp")} right={<RowChevron />} onPress={() => onNav("about")} hasDivider={false} />
      </div>

      {!isGuest && (
        <>
          <SectionLabel label={t(language, "settings.sync")} />
          <div className="mx-4 rounded-xl overflow-hidden bg-card border border-border">
            <SettingsRowItem
              iconBg="var(--muted)"
              icon={<Wifi size={18} className="text-foreground" />}
              label={t(language, "settings.accountSync")}
              right={<RowValue value={isSyncing ? t(language, "common.syncing") : t(language, "common.connected")} />}
              onPress={() => {}}
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

export function AccessibilityPanel({ onBack }: { onBack: () => void }) {
  const [textSize, setTextSize] = useState(1); 
  const [highContrast, setHighContrast] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [haptic, setHaptic] = useState(true);
  const [rtl, setRtl] = useState(false);
  const [voiceOver, setVoiceOver] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <SubHeader title="Accessibility" onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <SectionLabel label="Visual" />
        <div className="mx-4 bg-transparent mb-6">
          <div className="px-1 py-2">
            <div className="flex items-center gap-4 mb-4">
              <p className="text-[14px] text-muted-foreground font-sans">A</p>
              <div className="flex-1 relative h-1 rounded-full bg-muted flex items-center">
                <div className="absolute inset-inline-start-0 h-full rounded-full bg-primary opacity-30" style={{ width: `${(textSize / 2) * 100}%` }} />
                <input type="range" min={0} max={2} value={textSize} onChange={e => setTextSize(+e.target.value)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-8 -top-3.5 z-10" aria-label="Text Size" />
                <div className="absolute rounded-full shadow-md transition-all duration-200 bg-primary border-[4px] border-background" style={{ width: 22, height: 22, insetInlineStart: `calc(${(textSize / 2) * 100}% - 11px)` }} />
              </div>
              <p className="text-[20px] font-bold text-foreground font-sans">A</p>
            </div>
            <div className="flex justify-between">
              <p className={`text-[12px] font-sans ${textSize === 0 ? 'text-primary' : 'text-muted-foreground'}`}>Small</p>
              <p className={`text-[12px] font-sans ${textSize === 1 ? 'text-primary' : 'text-muted-foreground'}`}>Medium</p>
              <p className={`text-[12px] font-sans ${textSize === 2 ? 'text-primary' : 'text-muted-foreground'}`}>Large</p>
            </div>
          </div>
        </div>

        <div className="mx-4 rounded-xl overflow-hidden bg-card border border-border">
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="var(--primary)" strokeWidth="1.5"/><path d="M9 2A7 7 0 0 1 9 16V2Z" fill="var(--primary)"/></svg>}
            label="High Contrast Mode" right={<RowToggle checked={highContrast} onChange={() => setHighContrast(v => !v)} label="High Contrast Mode" />} onPress={() => setHighContrast(v => !v)} />
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M5 4H9C11 4 11 7 9 7H5V4ZM5 7H10C12 7 12 11 10 11H5V7Z" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            label="Bold Text" right={<RowToggle checked={boldText} onChange={() => setBoldText(v => !v)} label="Bold Text" />} onPress={() => setBoldText(v => !v)} />
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2C5.1 2 2 5.1 2 9s3.1 7 7 7c1 0 1.5-.8 1.5-1.5S10 13 9 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" /><circle cx="5.5" cy="8.5" r="1.5" fill="var(--primary)"/><circle cx="8.5" cy="5.5" r="1.5" fill="var(--primary)"/><circle cx="12.5" cy="7.5" r="1.5" fill="var(--primary)"/></svg>}
            label="Color Blind Support" right={<RowValue value="None" />} onPress={() => {}} hasDivider={false} />
        </div>

        <SectionLabel label="Motion" />
        <div className="mx-4 rounded-xl overflow-hidden border border-border bg-card">
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 14V4M6 4L3 7M6 4L9 7M12 14V4M12 4L9 7M12 4L15 7" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="Reduce Motion" right={<RowToggle checked={reduceMotion} onChange={() => setReduceMotion(v => !v)} label="Reduce Motion" />} onPress={() => setReduceMotion(v => !v)} />
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="6" y="2" width="6" height="14" rx="1" stroke="var(--primary)" strokeWidth="1.5"/><path d="M3 6V12M15 6V12" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round"/></svg>}
            label="Haptic Feedback" right={<RowToggle checked={haptic} onChange={() => setHaptic(v => !v)} label="Haptic Feedback" />} onPress={() => setHaptic(v => !v)} hasDivider={false} />
        </div>

        <SectionLabel label="Reading" />
        <div className="mx-4 rounded-xl overflow-hidden border border-border bg-card">
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 5H6M15 9H9M15 13H6M3 5H3.01M3 9H3.01M3 13H3.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="Right-to-Left Layout" right={<RowToggle checked={rtl} onChange={() => setRtl(v => !v)} label="Right-to-Left Layout" />} onPress={() => setRtl(v => !v)} />
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="var(--primary)" strokeWidth="1.5"/><path d="M9 13V8M9 5H9.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="VoiceOver Compatible" right={<RowToggle checked={voiceOver} onChange={() => setVoiceOver(v => !v)} label="VoiceOver Compatible" />} onPress={() => setVoiceOver(v => !v)} hasDivider={false} />
        </div>

        <SectionLabel label="Audio" />
        <div className="mx-4 mb-4 flex rounded-lg overflow-hidden bg-muted border border-border">
          {[0.75, 1, 1.25, 1.5].map(s => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`flex-1 h-12 transition-colors active:opacity-70 text-[13px] font-sans border-r last:border-r-0 border-border ${speed === s ? 'bg-card text-primary font-semibold' : 'bg-transparent text-muted-foreground'}`}>
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DownloadsPanel({ onBack }: { onBack: () => void }) {
  const [downloads, setDownloads] = useState<Record<CategoryId, "idle" | "downloading" | "done">>({
    morning: "idle", evening: "idle", before_sleep: "downloading",
  });
  const [progress] = useState(60);

  const catMeta = [
    { id: "morning" as CategoryId, icon: "sun", label: "Morning Azkar", size: "8.2 MB" },
    { id: "evening" as CategoryId, icon: "crescent", label: "Evening Azkar", size: "7.8 MB" },
    { id: "before_sleep" as CategoryId, icon: "stars", label: "Before Sleep", size: "5.1 MB" },
  ];

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <SubHeader title="Offline Downloads" onBack={onBack} right={<Settings size={20} className="text-foreground" />} />
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 rounded-xl flex items-center gap-3 px-4 py-3 bg-[#1A4F44]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white">
            <path d="M12 16L7 11M12 16L17 11M12 16V4M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <p className="text-[14px] text-white font-sans leading-[22px] flex-1">
            Download azkar for offline use — works without internet
          </p>
        </div>

        <div className="px-4 pt-4 pb-2">
          <button className="w-full h-[52px] rounded-xl transition-all active:scale-95 border-[1.5px] border-primary bg-transparent">
            <p className="text-[16px] font-semibold text-primary font-sans">Download All Categories</p>
          </button>
        </div>

        <SectionLabel label="Available to Download" />
        <div className="flex flex-col gap-3 px-4">
          {catMeta.map(({ id, icon, label, size }) => {
            const state = downloads[id];
            return (
              <div key={id} className={`rounded-xl overflow-hidden bg-card border ${state === "downloading" ? 'border-primary' : 'border-border'}`}>
                {state === "downloading" ? (
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <CatIcon type={icon} size={24} />
                      <p className="flex-1 text-[17px] font-semibold text-foreground font-sans">{label}</p>
                      <p className="text-[14px] text-primary font-sans">{progress}%</p>
                      <div className="flex items-center justify-center rounded-full w-8 h-8 bg-white cursor-pointer active:scale-95 transition-transform">
                        <Pause size={14} fill="black" className="text-black" />
                      </div>
                    </div>
                    <p className="text-[13px] text-muted-foreground font-sans -mt-3">{CATEGORIES.find(c => c.id === id)!.totalCount} azkar · {size}</p>
                    <div className="rounded-full overflow-hidden h-1.5 bg-muted mt-1">
                      <div className="h-full rounded-full bg-[#14B8A6]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 h-[72px]">
                    <CatIcon type={icon} size={24} />
                    <div className="flex-1">
                      <p className="text-[17px] font-semibold text-foreground font-sans leading-[24px]">{label}</p>
                      <p className="text-[13px] text-muted-foreground font-sans leading-[20px]">{CATEGORIES.find(c => c.id === id)!.totalCount} azkar · {size}</p>
                    </div>
                    <button onClick={() => setDownloads(d => ({ ...d, [id]: "downloading" }))}
                      className="flex items-center justify-center rounded-full px-4 h-8 bg-[#1A4F44] text-white font-medium text-[13px] transition-all active:scale-95">
                      DOWNLOAD
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SectionLabel label="Storage" />
        <div className="mx-4 flex flex-col gap-3 mb-6">
          <div className="rounded-full overflow-hidden h-1.5 bg-muted">
            <div className="h-full rounded-full bg-[#14B8A6]" style={{ width: "24%" }} />
          </div>
          <p className="text-[13px] text-muted-foreground font-sans">
            24.3 MB used · <span className="text-foreground">75.7 MB free</span>
          </p>
        </div>
        
        <div className="px-4 pb-8">
          <button className="w-full h-[52px] rounded-xl transition-all active:scale-95 border-[1.5px] border-destructive bg-transparent text-destructive font-semibold text-[16px]">
            Clear All Downloads
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotificationsPanel({ onBack }: { onBack: () => void }) {
  const [morningOn, setMorningOn] = useState(true);
  const [eveningOn, setEveningOn] = useState(true);
  const [sleepOn, setSleepOn] = useState(false);
  const [celebration, setCelebration] = useState(true);
  const [streak, setStreak] = useState(false);

  const ReminderRow = ({ label, enabled, onToggle, time, hasDivider = true }: { label: string; enabled: boolean; onToggle: () => void; time: string; hasDivider?: boolean }) => (
    <div>
      <div className="flex items-center gap-3 px-4 h-[56px] bg-card">
        <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-muted">
          <Bell size={18} className="text-primary" />
        </div>
        <p className="flex-1 text-[17px] font-semibold text-foreground font-sans">{label}</p>
        <div className="flex items-center gap-3">
          <p className="text-[14px] text-muted-foreground font-sans">{enabled ? time : "Not set"}</p>
          <RowToggle checked={enabled} onChange={onToggle} label={label} />
        </div>
      </div>
      {hasDivider && <div className="h-px mx-4 bg-border" style={{ marginLeft: 56 }} />}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="mx-4 mt-2 rounded-xl flex items-center gap-3 px-4 py-3 bg-[#1A4F44]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-white">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12.5L11 15.5L16 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[14px] text-white font-sans">Notifications are enabled</p>
        </div>

        <SectionLabel label="Azkar Reminders" />
        <div className="mx-4 rounded-xl overflow-hidden border border-border bg-card">
          <ReminderRow label="Morning Azkar" enabled={morningOn} onToggle={() => setMorningOn(v => !v)} time="6:30 AM" />
          {morningOn && (
            <div className="flex items-center justify-center gap-4 py-6 bg-card border-b border-border">
              {[{ val: "06", lbl: "HOUR" }, null, { val: "30", lbl: "MIN" }].map((item, i) =>
                item === null ? (
                  <p key={i} className="text-[32px] font-bold text-primary font-sans -mt-4">:</p>
                ) : (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <p className="text-[32px] font-bold text-primary font-sans">{item.val}</p>
                    <p className="text-[10px] font-medium text-muted-foreground font-sans uppercase">{item.lbl}</p>
                  </div>
                )
              )}
              <div className="flex items-center justify-center rounded-[10px] px-3 h-[32px] bg-foreground ml-2 -mt-4">
                <p className="text-[14px] font-semibold text-primary font-sans">AM</p>
              </div>
            </div>
          )}
          <ReminderRow label="Evening Azkar" enabled={eveningOn} onToggle={() => setEveningOn(v => !v)} time="5:00 PM" />
          <ReminderRow label="Before Sleep" enabled={sleepOn} onToggle={() => setSleepOn(v => !v)} time="Not set" hasDivider={false} />
        </div>

        <SectionLabel label="General" />
        <div className="mx-4 rounded-xl overflow-hidden border border-border bg-card">
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary"><path d="M9 1l2 5 5 .5-3.5 3.5 1 5L9 13l-4.5 2 1-5L2 6.5 7 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="Completion Celebration" right={<RowToggle checked={celebration} onChange={() => setCelebration(v => !v)} label="Completion Celebration" />} onPress={() => setCelebration(v => !v)} />
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary"><path d="M3 14h12M4 10l3-3 3 3 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="Daily Streak Reminder" right={<RowToggle checked={streak} onChange={() => setStreak(v => !v)} label="Daily Streak Reminder" />} onPress={() => setStreak(v => !v)} />
          <SettingsRowItem iconBg="var(--muted)" icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary"><path d="M4 9h2v4H4V9zm4-4h2v8H8V5zm4 2h2v6h-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="Notification Sound" right={<RowValue value="Gentle Chime" />} onPress={() => {}} hasDivider={false} />
        </div>
      </div>
    </div>
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
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <SubHeader title="My Progress" onBack={onBack} />
      <motion.div className="flex-1 overflow-y-auto pb-8"
        initial={{ opacity: 0, scaleX: 0.85, scaleY: 0.85, y: 10 }}
        animate={{ opacity: [0, 1, 1], scaleX: [0.85, 1, 1], scaleY: [0.85, 1, 1], y: [10, 0, 0] }}
        transition={{
          opacity: { duration: 0.63, times: [0, 0.7143, 1], ease: "easeOut" },
          scaleX: { duration: 0.63, times: [0, 0.7143, 1], ease: [[0.34, 1.56, 0.64, 1], "linear"] },
          scaleY: { duration: 0.63, times: [0, 0.7143, 1], ease: [[0.34, 1.56, 0.64, 1], "linear"] },
          y: { duration: 0.63, times: [0, 0.7143, 1], ease: "easeOut" },
        }}>

        <div className="px-4 pt-4">
          <div className="rounded-2xl overflow-hidden flex items-stretch bg-card border border-border">
            <div className="w-[4px] shrink-0 bg-primary" />
            <div className="flex items-start justify-between p-5 flex-1">
              <div className="flex flex-col gap-1">
                <p className="text-[14px] text-muted-foreground font-sans leading-[22px]">Total Azkar Completed</p>
                <p className="text-[28px] font-bold text-primary font-sans leading-[36px]">1,247</p>
                <p className="text-[12px] text-muted-foreground font-sans mt-1">Since July 2026</p>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-muted-foreground opacity-60">
                <rect x="36" y="22" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <rect x="24" y="12" width="10" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="rounded-2xl p-5 flex flex-col gap-3 bg-card border border-border">
            <div className="flex items-center gap-2">
              <Flame size={20} className="text-muted-foreground" />
              <p className="text-[14px] text-muted-foreground font-sans">Current Streak</p>
            </div>
            <div>
              <p className="text-[28px] font-bold text-primary font-sans">7 days</p>
              <p className="text-[12px] text-muted-foreground font-sans mt-1">Best: 21 days</p>
            </div>
            <div className="flex items-end gap-1.5 h-[60px] mt-2">
              {barHeights.map((h, i) => (
                <div key={i} className={`flex-1 ${i === 6 ? 'bg-primary' : 'bg-foreground'}`} style={{ height: h }} />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {days.map((d, i) => (
                <p key={i} className={`text-[11px] font-medium font-sans flex-1 text-center ${i === 6 ? 'text-primary' : 'text-muted-foreground'}`}>{d}</p>
              ))}
            </div>
          </div>
        </div>

        <SectionLabel label="Category Breakdown" />
        <div className="px-4 flex gap-3">
          {[{ label: "Morning", count: 487, pct: "100%" }, { label: "Evening", count: 430, pct: "88%" }, { label: "Sleep", count: 330, pct: "67%" }].map(({ label, count, pct }) => (
            <div key={label} className="flex-1 rounded-xl p-4 flex flex-col items-center gap-2 bg-card border border-border">
              <p className="text-[12px] text-primary font-sans">{label}</p>
              <p className="text-[22px] font-bold text-foreground font-sans">{count}</p>
              <p className="text-[12px] text-muted-foreground font-sans">{pct}</p>
            </div>
          ))}
        </div>

        <SectionLabel label="Recent Sessions" />
        <div className="px-4 flex flex-col gap-3">
          {sessions.map(({ date, count, mins }) => (
            <div key={date} className="flex items-center gap-3 px-5 rounded-xl h-[72px] bg-card border border-border">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-[15px] font-medium text-foreground font-sans leading-[22px]">{date}</p>
                <p className="text-[14px] text-muted-foreground font-sans">{count} azkar · {mins} min</p>
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

export function AboutPanel({ onBack }: { onBack: () => void }) {
  const AboutRow = ({ icon, label, sub, right = <RowChevron />, hasDivider = true }: { icon: React.ReactNode; label: string; sub?: string; right?: React.ReactNode; hasDivider?: boolean }) => (
    <div className="relative">
      <button className="w-full flex items-center gap-4 px-4 bg-card h-[72px] active:opacity-70 transition-all">
        {icon}
        <div className="flex-1 flex flex-col items-start gap-0.5">
          <p className="text-[15px] font-medium text-foreground font-sans leading-[22px]">{label}</p>
          {sub && <p className="text-[14px] text-muted-foreground font-sans">{sub}</p>}
        </div>
        {right}
      </button>
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 64 }} />}
    </div>
  );
  
  const SupportRow = ({ icon, label, right = <RowChevron />, hasDivider = true }: { icon: React.ReactNode; label: string; right?: React.ReactNode; hasDivider?: boolean }) => (
    <div className="relative">
      <button className="w-full flex items-center gap-4 px-4 bg-card h-[56px] active:opacity-70 transition-all">
        <div className="flex items-center justify-center rounded-lg shrink-0 w-8 h-8 bg-foreground">
          {icon}
        </div>
        <p className="flex-1 text-start text-[15px] font-medium text-foreground font-sans">{label}</p>
        {right}
      </button>
      {hasDivider && <div className="absolute bottom-0 h-px bg-border right-0" style={{ insetInlineStart: 64 }} />}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background slide-in-from-right">
      <SubHeader title="About Azkar" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6 py-4">
        <div className="rounded-2xl p-8 flex flex-col items-center gap-4 bg-card border border-border">
          <CrescentMark size={36} />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-[24px] font-bold text-foreground font-sans">Azkar</p>
            <p className="text-[14px] text-muted-foreground font-sans">Daily Islamic Remembrance</p>
            <p className="text-[12px] text-muted-foreground font-sans opacity-60">Version 2.0.1</p>
          </div>
        </div>

        <div>
          <SectionLabel label="Content Source" />
          <div className="rounded-xl overflow-hidden border border-border bg-card">
            <AboutRow 
              icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground"><BookOpen size={20} className="text-background" /></div>} 
              label="Hisnul Muslim" sub="All azkar verified from authentic sources"
              right={<Info size={18} className="text-muted-foreground" />} />
            <AboutRow 
              icon={<div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-background"><path d="M10 2l2.4 5 5.6.8-4 4.1.9 5.6-5-2.6-5 2.6.9-5.6-4-4.1 5.6-.8L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
              label="Hadith References" sub="Bukhari, Muslim, Tirmidhi & more" hasDivider={false} />
          </div>
        </div>

        <div>
          <SectionLabel label="Support" />
          <div className="rounded-xl overflow-hidden border border-border bg-card">
            <SupportRow icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background"><path d="M15 12a3 3 0 0 1-3 3H5l-3 3V4a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Send Feedback" />
            <SupportRow icon={<HelpCircle size={18} className="text-background" />} label="Frequently Asked Questions" />
            <SupportRow icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background"><circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M2 9h14M9 1c2.5 0 4 3.5 4 8s-1.5 8-4 8-4-3.5-4-8 1.5-8 4-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              label="Visit Website" right={<svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted-foreground"><path d="M14 8v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h5M9 2h5v5M14 2L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} hasDivider={false} />
          </div>
        </div>
        
        <div className="pb-8">
          <SectionLabel label="Legal" />
          <div className="rounded-xl overflow-hidden border border-border bg-card">
            <SupportRow icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background"><path d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM9 5v4M9 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Privacy Policy" />
            <SupportRow icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-background"><path d="M4 4h10M4 9h10M4 14h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>} label="Terms of Service" hasDivider={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
