import { getProgressDayKey, dateFromProgressDayKey, DEFAULT_PROGRESS_DAY_START_HOUR } from "../progress";

export function currentSaturdayWeekKeys(today = new Date(), boundaryHour = DEFAULT_PROGRESS_DAY_START_HOUR) {
  const currentProgressDate = dateFromProgressDayKey(getProgressDayKey(today, boundaryHour));
  const saturday = new Date(currentProgressDate);
  saturday.setDate(saturday.getDate() - ((saturday.getDay() + 1) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(saturday);
    date.setDate(saturday.getDate() + index);
    return getProgressDayKey(date, boundaryHour);
  });
}
