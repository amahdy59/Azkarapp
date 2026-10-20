import { expect, type Page } from "@playwright/test";
import { t } from "../../src/app/i18n";
import type { AppLanguage } from "../../src/app/types";

export async function chooseWirdOption(
  page: Page,
  language: AppLanguage,
  field: "plan" | "schedule" | "section",
  option: string,
) {
  const label = { plan: "readingPlanLabel", schedule: "completionSchedule", section: "sectionType" };
  const keys = {
    plan: {
      daily: "planPagesPerDay",
      repeating: "planRepeatChoice",
      scheduled: "planScheduledChoice",
      free: "planFreeReading",
    },
    schedule: { hijriMonth: "scheduleHijriEnd", gregorianMonth: "scheduleGregorianEnd", custom: "scheduleCustom" },
    section: { juz: "repeatingScopeJuz", surah: "repeatingScopeSurah", custom: "repeatingScopeCustom" },
  };
  const control = page.getByRole("combobox", { name: t(language, `mushaf.${label[field]}`), exact: true });
  const name = t(language, `mushaf.${(keys[field] as Record<string, string>)[option]}`);
  await control.click();
  await page.getByRole("option", { name, exact: true }).click();
  await expect(control).toContainText(name);
  await expect(control).toBeFocused();
}
