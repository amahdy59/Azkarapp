import { getProgressDayKey } from "../progress";

export function currentSaturdayWeekKeys(today = new Date()) {
  const saturday = new Date(today);
  saturday.setHours(12, 0, 0, 0);
  saturday.setDate(saturday.getDate() - ((saturday.getDay() + 1) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(saturday);
    date.setDate(saturday.getDate() + index);
    return getProgressDayKey(date);
  });
}
