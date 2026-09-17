import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "../components/icons";
import { DropletMark, SeedlingMark, BranchMark, PalmTreeMark, OasisMark } from "../components/GardenMarks";
import { DailyCompanionsCard } from "../components/DailyCompanionsCard";
import { ScreenContainer } from "../components/ScreenContainer";
import {
  calculateOasisLevel,
  OASIS_LEVEL_DETAILS,
  getPresetOasisState,
  deriveOasisRoutinesFromCompletions,
  type GardenLevel,
  type OasisRoutines,
  type OasisHabits,
} from "../oasis/oasisModel";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage, DailyCollectionCompletion, DailyHabitCompletion } from "../types";

export function OasisPreviewScreen({
  language,
  direction,
  dailyCompletions = [],
  dailyHabits = [],
  dayKey,
  onBack,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  dailyCompletions?: DailyCollectionCompletion[];
  dailyHabits?: DailyHabitCompletion[];
  dayKey?: string;
  onBack: () => void;
}) {
  const isArabic = language === "ar";
  const [activeMode, setActiveMode] = useState<"simulator" | "real">("simulator");

  // Simulator state (default to Level 3: Branch)
  const defaultPreset = useMemo(() => getPresetOasisState(3), []);
  const [simRoutines, setSimRoutines] = useState<OasisRoutines>(defaultPreset.routines);
  const [simHabits, setSimHabits] = useState<OasisHabits>(defaultPreset.habits);

  // Derive real data
  const realRoutines = useMemo(() => {
    return deriveOasisRoutinesFromCompletions(dailyCompletions, dayKey ?? "");
  }, [dailyCompletions, dayKey]);

  const realHabits = useMemo((): OasisHabits => {
    const todayHabits = new Set(dailyHabits.filter((h) => !dayKey || h.dayKey === dayKey).map((h) => h.habit));
    return {
      quranWird: todayHabits.has("quran_wird"),
      mosquePrayers: todayHabits.has("mosque_5") ? "mosque_5" : todayHabits.has("mosque_3") ? "mosque_3" : null,
      active: todayHabits.has("active"),
    };
  }, [dailyHabits, dayKey]);

  // Current active routines and habits based on mode
  const currentRoutines = activeMode === "real" ? realRoutines : simRoutines;
  const currentHabits = activeMode === "real" ? realHabits : simHabits;

  const currentLevel = useMemo(
    () => calculateOasisLevel(currentRoutines, currentHabits),
    [currentRoutines, currentHabits],
  );

  const levelDetail = OASIS_LEVEL_DETAILS[currentLevel];

  // Helper to apply preset
  const handleApplyPreset = (level: GardenLevel) => {
    const preset = getPresetOasisState(level);
    setSimRoutines(preset.routines);
    setSimHabits(preset.habits);
  };

  // Helper for companion card interactions in simulator mode
  const handleToggleSimQuran = () => {
    setSimHabits((prev) => ({ ...prev, quranWird: !prev.quranWird }));
  };

  const handleCycleSimMosque = () => {
    setSimHabits((prev) => {
      if (prev.mosquePrayers === "mosque_5") {
        return { ...prev, mosquePrayers: null };
      }
      if (prev.mosquePrayers === "mosque_3") {
        return { ...prev, mosquePrayers: "mosque_5" };
      }
      return { ...prev, mosquePrayers: "mosque_3" };
    });
  };

  // Helper to render the appropriate mark for any level
  const renderTierMark = (level: GardenLevel, size = 32) => {
    switch (level) {
      case 5:
        return <OasisMark size={size} filled />;
      case 4:
        return <PalmTreeMark size={size} color="var(--garden-gold, #E4A84A)" filled />;
      case 3:
        return <BranchMark size={size} filled />;
      case 2:
        return <SeedlingMark size={size} filled />;
      case 1:
        return <DropletMark size={size} filled />;
      case 0:
      default:
        return <DropletMark size={size} filled={false} color="#94A3B8" />;
    }
  };

  // Mock 7-day strip showcasing progression
  const weekDays = useMemo(() => {
    const labelsAr = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "اليوم"];
    const labelsEn = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Today"];
    const sampleLevels: GardenLevel[] = [1, 2, 2, 3, 4, 4, currentLevel];
    return sampleLevels.map((lvl, idx) => ({
      index: idx,
      label: isArabic ? labelsAr[idx] : labelsEn[idx],
      level: idx === 6 ? currentLevel : lvl,
      isToday: idx === 6,
    }));
  }, [currentLevel, isArabic]);

  return (
    <ScreenContainer
      dir={direction}
      className="relative flex flex-col overflow-y-auto px-4 py-4 sm:px-6 md:px-8 pb-24"
      screenName={t(language, "oasisPreview.title")}
    >
      <div className="mx-auto flex w-full max-w-[56rem] flex-col gap-6">
        {/* Header with Back Button */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label={t(language, "oasisPreview.backToHome")}
              className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-border/80 bg-card text-foreground transition-colors hover:bg-muted active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {direction === "rtl" ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-title3 sm:text-title2 font-black leading-tight text-foreground">
                  {t(language, "oasisPreview.title")}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-caption font-bold text-primary">
                  <Sparkles size={12} aria-hidden="true" />
                  {t(language, "oasisPreview.badge")}
                </span>
              </div>
              <p className="mt-0.5 text-body-subtle text-muted-foreground">{t(language, "oasisPreview.subtitle")}</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div
            role="tablist"
            aria-label="Mode selector"
            className="flex rounded-full border border-border bg-muted p-1 self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "simulator"}
              onClick={() => setActiveMode("simulator")}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-caption font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeMode === "simulator"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(language, "oasisPreview.simulatorMode")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === "real"}
              onClick={() => setActiveMode("real")}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-caption font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                activeMode === "real"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(language, "oasisPreview.realDataMode")}
            </button>
          </div>
        </header>

        {/* Hero Oasis Status Stage Card */}
        <section
          aria-labelledby="oasis-stage-heading"
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-card/90 p-5 sm:p-7 shadow-raised"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7">
            {/* Visual Mark Showcase */}
            <div className="flex size-24 sm:size-28 shrink-0 items-center justify-center rounded-3xl bg-muted/60 border border-border/80 shadow-sm">
              {renderTierMark(currentLevel, 60)}
            </div>

            {/* Level Info & Spiritual Meaning */}
            <div className="flex flex-1 flex-col text-center sm:text-start">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="rounded-full bg-warning/15 px-3 py-1 text-caption font-black text-warning">
                  {formatNumerals(currentLevel, language)} / {formatNumerals(5, language)}
                </span>
                <h2 id="oasis-stage-heading" className="text-title2 sm:text-title1 font-black text-foreground">
                  {isArabic ? levelDetail.nameArabic : levelDetail.name}
                </h2>
              </div>

              <p className="mt-2 text-body leading-relaxed text-muted-foreground">
                {isArabic ? levelDetail.descriptionArabic : levelDetail.description}
              </p>

              {/* Progression Progress Bar */}
              <div className="mt-4 w-full">
                <div className="flex justify-between text-caption font-bold text-muted-foreground mb-1.5">
                  <span>{t(language, "oasisPreview.currentStatusTitle")}</span>
                  <span>{formatNumerals(levelDetail.progressPercent, language)}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={levelDetail.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-success via-warning to-primary transition-all duration-500"
                    style={{ width: `${levelDetail.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Next Milestone */}
              {(levelDetail.nextMilestone || levelDetail.nextMilestoneArabic) && (
                <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:p-3.5 text-caption font-bold text-foreground flex items-start gap-2.5 text-start">
                  <Sparkles size={18} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="text-primary font-black block">
                      {t(language, "oasisPreview.nextLevelUnlocked")}
                    </span>
                    <span className="text-foreground">
                      {isArabic ? levelDetail.nextMilestoneArabic : levelDetail.nextMilestone}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 7-Day Oasis Rhythm Strip */}
        <section
          aria-labelledby="oasis-rhythm-heading"
          className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-raised"
        >
          <h2 id="oasis-rhythm-heading" className="text-subtitle font-black text-foreground mb-3" dir="auto">
            {t(language, "oasisPreview.weekRhythmTitle")}
          </h2>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
            {weekDays.map((day) => (
              <div
                key={day.index}
                className={`flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 border transition-colors ${
                  day.isToday ? "border-primary bg-primary/10 shadow-sm" : "border-border/60 bg-muted/40"
                }`}
              >
                <span className="text-caption font-bold text-muted-foreground mb-1.5 truncate">{day.label}</span>
                <div className="flex size-9 sm:size-11 items-center justify-center">
                  {renderTierMark(day.level, 28)}
                </div>
                <span className="mt-1 text-micro font-black text-foreground">
                  {formatNumerals(day.level, language)}★
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Simulator Controls (Shown when activeMode === 'simulator') */}
        {activeMode === "simulator" && (
          <section
            aria-labelledby="simulator-controls-heading"
            className="rounded-3xl border border-border bg-card p-5 shadow-raised"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/70 pb-3 mb-4">
              <div>
                <h2 id="simulator-controls-heading" className="text-subtitle font-black text-foreground">
                  {t(language, "oasisPreview.simulatorControlsTitle")}
                </h2>
                <p className="text-caption text-muted-foreground">
                  {t(language, "oasisPreview.simulatorControlsDesc")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleApplyPreset(0)}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-caption font-bold text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto"
              >
                <RotateCcw size={14} aria-hidden="true" />
                {t(language, "oasisPreview.resetSimulation")}
              </button>
            </div>

            {/* Presets Row */}
            <div className="mb-5">
              <span className="block text-caption font-bold text-muted-foreground mb-2">
                {t(language, "oasisPreview.presetsTitle")}
              </span>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 4, 5].map((lvl) => {
                  const isSelected = currentLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleApplyPreset(lvl as GardenLevel)}
                      className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-caption font-extrabold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/80 bg-muted/50 hover:bg-muted text-foreground"
                      }`}
                    >
                      <span>{renderTierMark(lvl as GardenLevel, 18)}</span>
                      <span>
                        {lvl === 0
                          ? t(language, "oasisPreview.level0Name")
                          : lvl === 1
                            ? t(language, "oasisPreview.level1Name")
                            : lvl === 2
                              ? t(language, "oasisPreview.level2Name")
                              : lvl === 3
                                ? t(language, "oasisPreview.level3Name")
                                : lvl === 4
                                  ? t(language, "oasisPreview.level4Name")
                                  : t(language, "oasisPreview.level5Name")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Toggles */}
            <div className="space-y-4">
              <span className="block text-caption font-bold text-muted-foreground">
                {t(language, "oasisPreview.routinesTitle")}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Morning */}
                <label className="flex min-h-[48px] items-center justify-between rounded-2xl border border-border bg-muted/30 p-3.5 cursor-pointer hover:bg-muted/60 transition-colors">
                  <span className="text-body font-bold text-foreground">
                    {t(language, "oasisPreview.morningAzkar")}
                  </span>
                  <input
                    type="checkbox"
                    checked={simRoutines.morning}
                    onChange={(e) => setSimRoutines((prev) => ({ ...prev, morning: e.target.checked }))}
                    className="size-5 rounded border-border text-primary focus:ring-primary"
                  />
                </label>

                {/* Evening */}
                <label className="flex min-h-[48px] items-center justify-between rounded-2xl border border-border bg-muted/30 p-3.5 cursor-pointer hover:bg-muted/60 transition-colors">
                  <span className="text-body font-bold text-foreground">
                    {t(language, "oasisPreview.eveningAzkar")}
                  </span>
                  <input
                    type="checkbox"
                    checked={simRoutines.evening}
                    onChange={(e) => setSimRoutines((prev) => ({ ...prev, evening: e.target.checked }))}
                    className="size-5 rounded border-border text-primary focus:ring-primary"
                  />
                </label>

                {/* Before Sleep */}
                <label className="flex min-h-[48px] items-center justify-between rounded-2xl border border-border bg-muted/30 p-3.5 cursor-pointer hover:bg-muted/60 transition-colors">
                  <span className="text-body font-bold text-foreground">{t(language, "oasisPreview.sleepAzkar")}</span>
                  <input
                    type="checkbox"
                    checked={simRoutines.beforeSleep}
                    onChange={(e) => setSimRoutines((prev) => ({ ...prev, beforeSleep: e.target.checked }))}
                    className="size-5 rounded border-border text-primary focus:ring-primary"
                  />
                </label>
              </div>

              {/* After Prayer Stepper */}
              <div className="rounded-2xl border border-border bg-muted/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-body font-bold text-foreground">
                    {t(language, "oasisPreview.afterPrayerAzkar")}
                  </span>
                  <span className="text-caption font-semibold text-muted-foreground">
                    {t(language, "oasisPreview.afterPrayerCount", {
                      count: formatNumerals(simRoutines.afterPrayerCount, language),
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {[0, 1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSimRoutines((prev) => ({ ...prev, afterPrayerCount: count }))}
                      className={`size-9 min-h-[36px] min-w-[36px] rounded-xl font-bold text-caption transition-colors ${
                        simRoutines.afterPrayerCount === count
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {formatNumerals(count, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Embedded Daily Companions Card */}
        <section aria-label={t(language, "home.dailyCompanions")}>
          <DailyCompanionsCard
            language={language}
            quranWird={currentHabits.quranWird}
            mosquePrayers={currentHabits.mosquePrayers}
            onToggleQuranWird={handleToggleSimQuran}
            onCycleMosquePrayers={handleCycleSimMosque}
          />
        </section>

        {/* Metaphor Guide Accordion / Explainer */}
        <section
          aria-labelledby="metaphor-guide-heading"
          className="rounded-3xl border border-border/80 bg-card/60 p-5 shadow-sm"
        >
          <h2 id="metaphor-guide-heading" className="text-subtitle font-black text-foreground mb-1">
            {t(language, "oasisPreview.guideTitle")}
          </h2>
          <p className="text-caption text-muted-foreground mb-4">{t(language, "oasisPreview.guideDesc")}</p>

          <div className="space-y-3">
            {[
              {
                level: 1,
                nameAr: "المستوى ١: قطرة الندى",
                nameEn: "Level 1: Droplet",
                criteriaAr: "أي ذكر من أذكار اليوم أو الأحوال أو العادات.",
                criteriaEn: "Any devotional zikr, situation, or habit.",
              },
              {
                level: 2,
                nameAr: "المستوى ٢: الفسيلة",
                nameEn: "Level 2: Seedling",
                criteriaAr: "إتمام ورد أساسي واحد على الأقل (أذكار الصباح أو المساء أو النوم).",
                criteriaEn: "Completing at least 1 core routine (Morning, Evening, or Sleep).",
              },
              {
                level: 3,
                nameAr: "المستوى ٣: الغصن المورق",
                nameEn: "Level 3: Branch",
                criteriaAr: "إتمام أذكار الصباح والمساء معاً لحفظ طرفي النهار.",
                criteriaEn: "Completing both Morning and Evening azkar to guard both ends of day.",
              },
              {
                level: 4,
                nameAr: "المستوى ٤: النخلة الذهبية",
                nameEn: "Level 4: Full Palm",
                criteriaAr: "إتمام التحصين اليومي الكامل: الصباح والمساء والنوم.",
                criteriaEn: "Full daily protection: Morning, Evening, and Sleep azkar complete.",
              },
              {
                level: 5,
                nameAr: "المستوى ٥: الواحة المزدهرة",
                nameEn: "Level 5: Flourishing Oasis",
                criteriaAr: "التحصين الكامل + أذكار الصلوات الخمس + الورد القرآني + صلاة المسجد.",
                criteriaEn: "All core azkar + 5 post-prayer adhkar + Quran wird + Mosque prayers.",
              },
            ].map((item) => (
              <div
                key={item.level}
                className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5"
              >
                <div className="mt-0.5 shrink-0">{renderTierMark(item.level as GardenLevel, 24)}</div>
                <div>
                  <h3 className="text-body font-bold text-foreground">{isArabic ? item.nameAr : item.nameEn}</h3>
                  <p className="text-caption text-muted-foreground mt-0.5">
                    {isArabic ? item.criteriaAr : item.criteriaEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
