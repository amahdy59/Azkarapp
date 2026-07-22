import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type AppLanguage = "en" | "ar";
type CategoryId =
  | "morning"
  | "evening"
  | "before_sleep"
  | "waking_up"
  | "home"
  | "mosque"
  | "after_prayer"
  | "restroom"
  | "food_drink"
  | "travel";

async function seedReturningGardenUser(
  page: Page,
  {
    language = "en",
    completedToday,
    quietProgressEnabled = true,
  }: {
    language?: AppLanguage;
    completedToday: CategoryId[];
    quietProgressEnabled?: boolean;
  },
) {
  await page.addInitScript(
    ({ language: selectedLanguage, completedToday: categories, quietProgressEnabled: gardenEnabled }) => {
      const seedMarker = "azkarapp.e2e.quiet-garden-seeded";
      if (window.sessionStorage.getItem(seedMarker) === "true") {
        return;
      }
      window.sessionStorage.setItem(seedMarker, "true");

      const progressDayStartHour = 4;
      const progressDate = new Date();
      progressDate.setHours(progressDate.getHours() - progressDayStartHour);
      const dayKey = [
        progressDate.getFullYear(),
        String(progressDate.getMonth() + 1).padStart(2, "0"),
        String(progressDate.getDate()).padStart(2, "0"),
      ].join("-");
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";

      window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      window.localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language: selectedLanguage,
            darkMode: true,
            themeMode: "midnight",
            showTransliteration: false,
            showTranslation: false,
            textSize: "medium",
            arabicFont: "ibm_plex",
            highContrast: false,
            boldText: false,
            reduceMotion: true,
            hapticFeedback: false,
            forceRtl: false,
            colorBlindSupport: "none",
            reminders: {
              morning: { enabled: false, time: "07:30" },
              evening: { enabled: false, time: "18:30" },
              before_sleep: { enabled: false, time: "22:00" },
              onlyWhenIncomplete: true,
            },
            weeklyGoalDays: 4,
            quietProgressEnabled: gardenEnabled,
            progressDayStartHour,
          },
          profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
          completed: {
            morning: [],
            evening: [],
            before_sleep: [],
            waking_up: [],
            home: [],
            mosque: [],
            after_prayer: [],
            restroom: [],
            food_drink: [],
            travel: [],
          },
          sessions: [],
          dailyCompletions: categories.map((category) => ({ dayKey, category, timeZone })),
          savedZikrIds: [],
        }),
      );
    },
    { language, completedToday, quietProgressEnabled },
  );
}

async function openReturningHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByRole("navigation")).toBeVisible();
}

async function expectNoWcagViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
}

test("populated Home exposes leaf progress through text, state, and accessible names", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning", "evening"] });
  await openReturningHome(page);

  const garden = page.getByTestId("today-garden-card");
  await expect(garden).toBeVisible();
  await expect(garden.getByRole("heading", { name: "Today's practice" })).toBeVisible();
  await expect(page.getByTestId("today-leaf-count")).toHaveText("2 of 10 leaves");

  const collections = garden.getByRole("list", { name: "Today's collection progress" });
  await expect(collections.getByRole("listitem")).toHaveCount(10);
  await expect(page.getByTestId("garden-category-morning")).toHaveAttribute("data-state", "complete");
  await expect(page.getByTestId("garden-category-evening")).toHaveAttribute("data-state", "complete");
  await expect(page.getByTestId("garden-category-before_sleep")).toHaveAttribute("data-state", "pending");
  await expect(page.getByTestId("garden-category-morning")).toHaveAccessibleName("Morning Azkar. Complete");
  await expect(page.getByTestId("garden-category-before_sleep")).toHaveAccessibleName("Before Sleep Azkar. Not yet");

  await expectNoWcagViolations(page);
});

test("ten completed collections are announced as a palm without points or rank", async ({ page }) => {
  await seedReturningGardenUser(page, {
    completedToday: [
      "morning",
      "evening",
      "before_sleep",
      "waking_up",
      "home",
      "mosque",
      "after_prayer",
      "restroom",
      "food_drink",
      "travel",
    ],
  });
  await openReturningHome(page);

  const garden = page.getByTestId("today-garden-card");
  await expect(page.getByTestId("today-leaf-count")).toHaveText("10 of 10 leaves");
  await expect(garden).toContainText(/palm has grown/i);
  await expect(garden.locator('[data-state="complete"]')).toHaveCount(10);
  await expect(garden).not.toContainText(/points?|rank|leaderboard/i);
});

test("garden visibility preference persists and keeps Home quiet when disabled", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);
  await expect(page.getByTestId("today-garden-card")).toBeVisible();

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: /My progress.*Garden shown/i }).click();
  await expect(page.getByRole("heading", { name: "My progress", exact: true })).toBeVisible();

  const gardenSwitch = page.getByRole("switch", { name: /^Garden progress/ });
  await expect(gardenSwitch).toBeChecked();
  await gardenSwitch.click();
  await expect(gardenSwitch).not.toBeChecked();
  await expect(page.getByTestId("garden-hidden-state")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const stored = JSON.parse(window.localStorage.getItem("azkarapp.state.v1") || "{}");
        return stored.settings?.quietProgressEnabled;
      }),
    )
    .toBe(false);

  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(page.getByTestId("today-garden-card")).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByTestId("today-garden-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("button", { name: /My progress.*Garden hidden/i })).toBeVisible();
});

test("Arabic garden mirrors collection order and provides non-color completion cues", async ({ page }) => {
  await seedReturningGardenUser(page, { language: "ar", completedToday: ["morning"] });
  await openReturningHome(page);

  const garden = page.getByTestId("today-garden-card");
  const collectionList = garden.getByRole("list");
  await expect(collectionList).toHaveCSS("direction", "rtl");

  const morning = page.getByTestId("garden-category-morning");
  const evening = page.getByTestId("garden-category-evening");
  const beforeSleep = page.getByTestId("garden-category-before_sleep");
  const morningBox = await morning.boundingBox();
  const eveningBox = await evening.boundingBox();
  const beforeSleepBox = await beforeSleep.boundingBox();
  expect(morningBox).not.toBeNull();
  expect(eveningBox).not.toBeNull();
  expect(beforeSleepBox).not.toBeNull();
  if (!morningBox || !eveningBox || !beforeSleepBox) return;

  expect(morningBox.x).toBeGreaterThan(eveningBox.x);
  expect(eveningBox.x).toBeGreaterThan(beforeSleepBox.x);
  await expect(morning).toHaveAttribute("data-state", "complete");
  await expect(evening).toHaveAttribute("data-state", "pending");

  const completeStatus = morning.locator("span").last();
  const pendingStatus = evening.locator("span").last();
  await expect(completeStatus).not.toHaveText("");
  await expect(pendingStatus).not.toHaveText("");
  expect(await completeStatus.textContent()).not.toBe(await pendingStatus.textContent());
  expect(await morning.getAttribute("aria-label")).not.toBe(await evening.getAttribute("aria-label"));
  await expect(morning.locator("svg")).toHaveCount(2);
  await expect(evening.locator("svg")).toHaveCount(1);
});
