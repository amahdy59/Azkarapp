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
    textSize = "medium",
  }: {
    language?: AppLanguage;
    completedToday: CategoryId[];
    quietProgressEnabled?: boolean;
    textSize?: "medium" | "large";
  },
) {
  await page.addInitScript(
    ({ language: selectedLanguage, completedToday: categories, quietProgressEnabled: gardenEnabled, textSize }) => {
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
            textSize,
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
    { language, completedToday, quietProgressEnabled, textSize },
  );
}

for (const language of ["en", "ar"] as const) {
  test(`Progress uses the expanded desktop canvas in ${language}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await seedReturningGardenUser(page, { language, completedToday: [] });
    await openReturningHome(page);
    await page.getByTestId("nav-progress").click();

    const garden = page.getByTestId("today-garden-card");
    await expect(garden).toBeVisible();
    const dayView = garden.locator('[role="tabpanel"]');
    const box = await dayView.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(800);
    const routineCards = dayView.getByRole("button");
    await expect(routineCards).toHaveCount(4);
    const routineCardTops = await routineCards.evaluateAll((cards) =>
      cards.map((card) => Math.round(card.getBoundingClientRect().top)),
    );
    expect(new Set(routineCardTops).size).toBe(1);
    await expect(page.locator("html")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });
}

test("Arabic large text keeps Progress controls and month details usable at compact widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await seedReturningGardenUser(page, { language: "ar", completedToday: [], textSize: "large" });
  await openReturningHome(page);
  await page.getByTestId("nav-progress").click();

  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  for (const tab of await tabs.all()) {
    const box = await tab.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  await tabs.nth(2).click();
  await expect(page.getByTestId("garden-month-calendar")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const date = page.getByTestId("garden-view-date");
  expect(await date.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
});

async function openReturningHome(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await expect(page.getByRole("navigation").first()).toBeVisible();
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
  await expect(garden.getByRole("heading", { name: /Daily Protection|Today's practice|Today's Wird/i })).toBeVisible();

  // Verify screen reader text for progress
  const headerStats = page.locator('div[aria-label*="leaves"]');
  await expect(headerStats).toHaveAttribute("aria-label", /Today's leaves: 2 of 4/i);

  await expectNoWcagViolations(page);
});

test("four completed main collections are announced as a palm without points or rank", async ({ page }) => {
  await seedReturningGardenUser(page, {
    completedToday: ["morning", "evening", "before_sleep", "after_prayer"],
  });
  await openReturningHome(page);

  const garden = page.getByTestId("today-garden-card");

  await expect(garden.getByText("Masha'Allah! All today's routines completed! 🌴", { exact: false })).toBeVisible();
  // Home lists only the three time-of-day routines; after-prayer azkar are
  // getting their own card. A palm still requires all four main collections,
  // which is why the all-complete message above is the real assertion here.
  await expect(garden.getByRole("button", { name: /Completed|مكتملة/ })).toHaveCount(3);
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

test("month view shows the calendar without the removed summary card", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: /My progress.*Garden shown/i }).click();
  await page.getByRole("tab", { name: "Month", exact: true }).click();

  await expect(page.getByTestId("garden-month-calendar")).toBeVisible();
  await expect(page.getByText("Longest Streak", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Adherence", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Full Palms", { exact: true })).toHaveCount(0);
});

test("Home lists the three time-of-day routines while Progress keeps all four", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  // Home's wird card: after-prayer azkar are deliberately absent, since they
  // are getting a dedicated card of their own.
  const garden = page.getByTestId("today-garden-card");
  await expect(garden.getByRole("button", { name: /Morning Azkar/ })).toBeVisible();
  await expect(garden.getByRole("button", { name: /Evening Azkar/ })).toBeVisible();
  await expect(garden.getByRole("button", { name: /Sleep Azkar/ })).toBeVisible();
  await expect(garden.getByRole("button", { name: /After Prayer Azkar/ })).toHaveCount(0);

  // Progress still accounts for every main collection, so the routine stays
  // reachable and leaf/palm maths is unchanged.
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByRole("button", { name: /After Prayer Azkar/ }).first()).toBeVisible();
});

test("the week grid conveys completion as text, not shape alone", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByRole("tab", { name: "Week", exact: true }).click();

  const table = page.locator("table").first();
  await expect(table).toBeVisible();

  // Cells used to contain only an icon or an empty bordered circle, so a
  // screen reader announced the whole grid as blank.
  await expect(table.locator("td .sr-only")).toHaveCount(28);
  await expect(table).toContainText(/Morning: (Completed|Not completed)/);
  await expect(table).toContainText(/Post-Prayer: (Completed|Not completed)/);

  // Headers must be associated with their column for grid navigation.
  const scoped = await table.locator("th[scope='col']").count();
  expect(scoped).toBeGreaterThan(3);
});
