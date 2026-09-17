import { formatHijriDateWithTime } from "../formatting";
import { getGardenSummary } from "../progress";
import type { AppLanguage, DailyCollectionCompletion } from "../types";
import { ShareableCardModal } from "./ShareableCardModal";

export function ProgressShareModal({
  dailyCompletions,
  progressDayStartHour,
  language,
  onClose,
}: {
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  language: AppLanguage;
  onClose: () => void;
}) {
  const summary = getGardenSummary(dailyCompletions, new Date(), progressDayStartHour);

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
