import type { AppStateSnapshot } from "./types";
import { getProgressDayKey } from "./progress";
import {
  exportProgressDashboard,
  indexProgressDashboard,
  metricProgressRange,
  validateProgressRange,
  type ProgressRange,
} from "./progressDashboard";
import { saveFileToDevice } from "./share/shareDispatcher";

/** Read-only export from the application's normalized snapshot, never storage. */
export async function saveProgressExport(snapshot: AppStateSnapshot, range: ProgressRange, now = new Date()) {
  if (validateProgressRange(range, getProgressDayKey(now, 0))) throw new Error("invalid-progress-range");
  const dayStart = snapshot.settings.progressDayStartHour;
  const input = {
    dailyCompletions: snapshot.dailyCompletions ?? [],
    prayerTracking: snapshot.prayerTracking ?? [],
    dailyHabits: snapshot.dailyHabits ?? [],
    wirdHistory: snapshot.wirdHistory ?? {},
    quranWirdDailyGoals: snapshot.quranWirdDailyGoals ?? {},
    quranWirdPlan: snapshot.quranWirdPlan,
  };
  const currentDay = range.startKey === range.endKey && range.endKey === getProgressDayKey(now, 0);
  const records = indexProgressDashboard(input, getProgressDayKey(now, dayStart));
  const data = exportProgressDashboard(
    input,
    records,
    range,
    now,
    dayStart,
    currentDay,
    snapshot.settings.calendarType ?? "hijri",
  );
  const zikrRange = metricProgressRange(range, "routines", now, dayStart, false, currentDay);
  await saveFileToDevice(
    new File(
      [
        JSON.stringify(
          {
            ...data,
            zikrHistory: (snapshot.zikrHistory ?? []).filter(
              (row) => row.dayKey >= zikrRange.startKey && row.dayKey <= zikrRange.endKey,
            ),
          },
          null,
          2,
        ),
      ],
      `progress-${range.startKey}-${range.endKey}.json`,
      { type: "application/json" },
    ),
  );
}
