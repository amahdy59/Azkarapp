import { formatHijriDateWithTime } from "../formatting";
import { getGardenSummary } from "../progress";
import type { AppLanguage, DailyCollectionCompletion } from "../types";
import { ShareableCardModal } from "./ShareableCardModal";

export function ProgressShareModal({
  dailyCompletions,
  dailyHabits,
  progressDayStartHour,
  language,
  onClose,
}: {
  dailyCompletions: DailyCollectionCompletion[];
  dailyHabits?: import("../types").DailyHabitCompletion[];
  progressDayStartHour: number;
  language: AppLanguage;
  onClose: () => void;
}) {
  const today = new Date();
  const summary = getGardenSummary(dailyCompletions, dailyHabits ?? [], today, progressDayStartHour);

  return (
    <ShareableCardModal
      palms={summary.lifetimePalms}
      golden={summary.today.goldenLeafCount ?? summary.today.leafCount}
      green={summary.today.greenLeafCount ?? summary.today.extraLeafCount}
      dateStr={formatHijriDateWithTime(new Date(), language)}
      language={language}
      onClose={onClose}
    />
  );
}
