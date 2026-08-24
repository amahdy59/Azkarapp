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

      const progressDayStartHour = 0;
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
    await expect(async () => {
      const box = await garden.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(800);
    }).toPass();
    // Three: after-prayer adhkar are tracked per prayer in their own section.
    const routineCards = garden.getByRole("button", { name: / - (Completed|Not completed|مكتملة|غير مكتملة)$/ });
    await expect(routineCards).toHaveCount(3);
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

  // Verify routine progress buttons on the card
  await expect(garden.getByRole("button", { name: /Completed|مكتملة/ })).toHaveCount(2);

  await expectNoWcagViolations(page);
});

test("three completed main collections stay concise and explain the palm on demand", async ({ page }) => {
  await seedReturningGardenUser(page, {
    completedToday: ["morning", "evening", "before_sleep"],
  });
  await openReturningHome(page);

  const garden = page.getByTestId("today-garden-card");

  await expect(garden.getByText("Masha'Allah! All today's routines completed! 🌴", { exact: false })).toHaveCount(0);
  await expect(garden.getByRole("button", { name: /Completed|مكتملة/ })).toHaveCount(3);
  await expect(garden).not.toContainText(/points?|rank|leaderboard/i);
  await garden.getByRole("button", { name: "How a palm is earned" }).click();
  await expect(garden.getByRole("tooltip")).toHaveText(
    "Complete Morning, Evening, and Before Sleep Azkar to build your daily palm streak.",
  );
  await expect(garden.getByRole("tooltip")).toBeInViewport();
});

test("legacy garden visibility preferences no longer hide the current Wird or add a Progress toggle", async ({
  page,
}) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"], quietProgressEnabled: false });
  await openReturningHome(page);
  await expect(page.getByTestId("today-garden-card")).toBeVisible();

  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await expect(page.getByRole("switch", { name: /^Garden progress/ })).toHaveCount(0);
  await expect(page.getByTestId("garden-hidden-state")).toHaveCount(0);
  await expect(page.getByTestId("today-garden-card")).toBeVisible();
});

test("month view shows the calendar without the removed summary card", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByRole("tab", { name: "Month", exact: true }).click();

  await expect(page.getByTestId("garden-month-calendar")).toBeVisible();
  await expect(page.getByText("Longest Streak", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Adherence", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Full Palms", { exact: true })).toHaveCount(0);
});

test("both Home and Progress keep after-prayer outside the wird card", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  // The wird is the three time-of-day routines. After-prayer adhkar are
  // tracked per prayer rather than as one routine, so they are not a fourth
  // tile in this card on either screen.
  const garden = page.getByTestId("today-garden-card");
  for (const routine of [/Morning Azkar/, /Evening Azkar/, /Sleep Azkar/]) {
    await expect(garden.getByRole("button", { name: routine })).toBeVisible();
  }
  await expect(garden.getByRole("button", { name: /After Prayer Azkar/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Progress", exact: true }).click();

  const progressGarden = page.getByTestId("today-garden-card");
  await expect(progressGarden.getByRole("button", { name: /After Prayer Azkar/ })).toHaveCount(0);

  // It stays reachable, in a section of its own that follows the wird card.
  const afterPrayer = page.getByTestId("progress-after-prayer");
  await expect(afterPrayer).toBeVisible();
  await expect(afterPrayer.locator("article[data-prayer-state]").first()).toBeVisible();
  await expect(afterPrayer.locator('input[type="checkbox"]').first()).toBeAttached();
  expect(
    await page.evaluate(() => {
      // Compared inside the page: Node.DOCUMENT_POSITION_* only exists there.
      const card = document.querySelector('[data-testid="today-garden-card"]');
      const section = document.querySelector('[data-testid="progress-after-prayer"]');
      if (!card || !section) return false;
      return Boolean(card.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING);
    }),
  ).toBe(true);
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
  await expect(table.locator("td .sr-only")).toHaveCount(21);
  await expect(table).toContainText(/Morning: (Completed|Not completed)/);
  await expect(table).not.toContainText(/Post-Prayer: (Completed|Not completed)/);

  // Headers must be associated with their column for grid navigation.
  const scoped = await table.locator("th[scope='col']").count();
  expect(scoped).toBe(4);
});
