import { chooseProgressOption } from "./helpers/progress";
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
    await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();

    const garden = page.getByTestId("today-garden-card");
    await expect(garden).toBeVisible();
    await expect(async () => {
      const box = await garden.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(800);
    }).toPass();
    // Three: after-prayer adhkar are tracked per prayer in their own section.
    const routineCards = garden
      .getByRole("term")
      .filter({ hasText: /Morning Azkar|Evening Azkar|Sleep Azkar|أذكار الصباح|أذكار المساء|أذكار النوم/ });
    await expect(routineCards).toHaveCount(3);
    await expect(async () => {
      const routineCardTops = await routineCards.evaluateAll((cards) =>
        cards.map((card) => Math.round(card.getBoundingClientRect().top)),
      );
      // Native daily status rows retain complete names in semantic source order.
      expect(routineCardTops[1]).toBeGreaterThan(routineCardTops[0]);
      expect(routineCardTops[2]).toBeGreaterThan(routineCardTops[1]);
    }).toPass();
    await expect(page.locator("html")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  });
}

test("Arabic large text keeps Progress controls and month details usable at compact widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await seedReturningGardenUser(page, { language: "ar", completedToday: [], textSize: "large" });
  await openReturningHome(page);
  await page.getByTestId("nav-progress").click();
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();

  const period = page.getByRole("combobox", { name: "الفترة", exact: true });
  await period.click();
  const options = page.getByRole("option");
  await expect(options).toHaveCount(5);
  for (const option of await options.all()) {
    const box = await option.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.keyboard.press("Escape");
  await chooseProgressOption(period, "month");
  await expect(page.getByTestId("today-garden-card").getByRole("heading", { name: /rhythm|إيقاع/ })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
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
  await expect(garden.getByRole("button", { name: "How a palm is earned" })).toHaveCount(0);
  await garden.getByTestId("open-wird-benefits").click();
  await expect(page.getByRole("heading", { name: "How a palm is earned" })).toHaveCount(0);
  await page.goto("/#/progress");
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
  await page.getByTestId("oasis-stage-card").locator("summary").click();
  const explanation = page.getByText(
    "A palm is planted in your oasis when you complete all of today's awrad (Morning, Evening, and Before Sleep azkar, and Qur'an wird).",
  );
  await expect(page.getByRole("heading", { name: "How a palm is earned" })).toBeVisible();
  await explanation.scrollIntoViewIfNeeded();
  await expect(explanation).toBeInViewport();
});

test("legacy garden visibility preferences no longer hide the current Wird or add a Progress toggle", async ({
  page,
}) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"], quietProgressEnabled: false });
  await openReturningHome(page);
  await expect(page.getByTestId("today-garden-card")).toBeVisible();

  await page.getByRole("link", { name: "Progress", exact: true }).click();
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
  await expect(page.getByRole("switch", { name: /^Garden progress/ })).toHaveCount(0);
  await expect(page.getByTestId("garden-hidden-state")).toHaveCount(0);
  await expect(page.getByTestId("today-garden-card")).toBeVisible();
});

test("month view shows routine patterns without the removed summary card", async ({ page }) => {
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  await page.getByRole("link", { name: "Progress", exact: true }).click();
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
  await chooseProgressOption(page.getByRole("combobox", { name: "Period", exact: true }), "month");

  await expect(page.getByTestId("today-garden-card").getByRole("heading", { name: /rhythm|إيقاع/ })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(page.getByText("Longest Streak", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Adherence", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Full Palms", { exact: true })).toHaveCount(0);
});

test("both Home and Progress keep prayer tracking outside the wird card", async ({ page }) => {
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

  await page.getByRole("link", { name: "Progress", exact: true }).click();
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();

  const progressGarden = page.getByTestId("today-garden-card");
  await expect(progressGarden.getByRole("button", { name: /After Prayer Azkar/ })).toHaveCount(0);

  // Prayer facts remain in their own read-only group, outside daily wird.
  const prayerGroup = page.getByTestId("progress-prayer-group");
  await expect(prayerGroup).toBeVisible();
  await expect(prayerGroup.getByTestId("prayer-progress-summary").getByRole("listitem")).toHaveCount(5);
  await expect(prayerGroup.locator("input, table")).toHaveCount(0);
  expect(
    await page.evaluate(() => {
      // Compared inside the page: Node.DOCUMENT_POSITION_* only exists there.
      const card = document.querySelector('[data-testid="today-garden-card"]');
      const section = document.querySelector('[data-testid="progress-prayer-group"]');
      if (!card || !section) return false;
      return Boolean(section.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING);
    }),
  ).toBe(true);
});

test("weekly charts convey complete-day recording values through accessible text", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-14T12:00:00+03:00"));
  await seedReturningGardenUser(page, { completedToday: ["morning"] });
  await openReturningHome(page);

  await page.getByRole("link", { name: "Progress", exact: true }).click();
  await page.getByTestId("progress-detailed-context").locator(":scope > summary").click();
  await chooseProgressOption(page.getByRole("combobox", { name: "Period", exact: true }), "week");

  const garden = page.getByTestId("today-garden-card");
  await expect(garden.getByTestId("insight-morning").getByRole("img")).toHaveAccessibleName(
    /Morning: 0%; 0 days recorded/,
  );
  await expect(garden.getByTestId("insight-evening").getByRole("img")).toHaveAccessibleName(
    /Evening: 0%; 0 days recorded/,
  );
  await expect(garden.getByTestId("insight-before_sleep").getByRole("img")).toHaveAccessibleName(
    /Sleep: 0%; 0 days recorded/,
  );
  await expect(garden).toContainText("Quran");
  await expect(page.getByRole("table")).toHaveCount(0);
  await expect(garden).toContainText("3 complete days");
  await page.getByRole("button", { name: "Previous period", exact: true }).click();
  await expect(garden).toContainText("7 complete days");
  await expect(garden.getByRole("list").getByRole("img")).toHaveCount(3);
  await expect(garden.getByTestId("routine-trends").getByRole("img")).toBeVisible();
  // A correctly flat SVG line has a zero-height geometry box despite its
  // visible stroke. Assert the rendered plot and all seven exact zero points.
  await expect(garden.getByTestId("recording-time-line")).toHaveAttribute("points", /^(?:[\d.]+,184\s?){7}$/);
});
