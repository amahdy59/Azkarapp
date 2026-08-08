import { expect, test, type Page } from "@playwright/test";

async function openReturningGuest(page: Page, savedZikrIds: string[] = [], completedComprehensiveDuas: string[] = []) {
  await page.addInitScript(
    ({ saved, comprehensiveDuas }) => {
      const progressDate = new Date();
      progressDate.setHours(progressDate.getHours() - 4);
      const progressDayKey = [
        progressDate.getFullYear(),
        String(progressDate.getMonth() + 1).padStart(2, "0"),
        String(progressDate.getDate()).padStart(2, "0"),
      ].join("-");
      window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      window.localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language: "en", themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
          profile: { displayName: "Guest", isGuest: true },
          completed: {
            morning: [],
            evening: [],
            before_sleep: [],
            comprehensive_duas: comprehensiveDuas,
          },
          sessions: [],
          dailyCompletions:
            comprehensiveDuas.length > 0
              ? [
                  {
                    dayKey: progressDayKey,
                    category: "comprehensive_duas",
                    timeZone: "UTC",
                    completionLevel: "complete",
                  },
                ]
              : [],
          savedZikrIds: saved,
        }),
      );
    },
    { saved: savedZikrIds, comprehensiveDuas: completedComprehensiveDuas },
  );

  await page.goto("/");
  await expect(page.getByTestId("home-utility-header")).toBeVisible({ timeout: 10_000 });
}

test("Home utility status keeps its two-row hierarchy without horizontal overflow", async ({ page }) => {
  await openReturningGuest(page);

  for (const viewport of [
    { width: 320, height: 700 },
    { width: 390, height: 844 },
    { width: 643, height: 900 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);

    const geometry = await page.evaluate(() => {
      const bounds = (testId: string) =>
        document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!.getBoundingClientRect().toJSON();

      return {
        date: bounds("hijri-date"),
        time: bounds("current-time"),
        streak: bounds("header-streak"),
        palms: bounds("header-palms"),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(geometry.date.y, `date row at ${viewport.width}px`).toBeLessThan(geometry.time.y);
    expect(geometry.streak.y, `streak row at ${viewport.width}px`).toBeLessThan(geometry.palms.y);
    expect(geometry.overflow, `horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(0);
  }
});

test("Home Benefits entry opens the dedicated collection with encoded WhatsApp sharing", async ({ page }) => {
  await openReturningGuest(page);
  await page.getByTestId("home-benefits-card").click();

  await expect(page.locator('#main-content[data-view="benefits"]')).toBeVisible();
  await expect(page.getByTestId("benefits-list")).toBeVisible();
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveText(["Qur’an (7)", "Hadith (21)", "30 hadith benefits"]);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Evening testimony of faith.", { exact: true })).toHaveCount(0);

  await page.getByRole("tab", { name: "Hadith (21)" }).click();
  await expect(page.getByText("Authentic hadith").first()).toBeVisible();
  await page.getByRole("tab", { name: "30 hadith benefits" }).click();
  await expect(page.getByRole("heading", { name: "Forgiveness" })).toBeVisible();

  const shareLink = page.getByRole("link", { name: /WhatsApp/ }).first();
  const href = await shareLink.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(href).toContain("%0A");
  expect(href).not.toMatch(/[\r\n ]/);
  expect(new URL(href!).searchParams.get("text")).toBeTruthy();
});

test("Home Saved preview opens its item and the full Saved library state", async ({ page }) => {
  await openReturningGuest(page, ["m-hm-77m"]);

  const savedSection = page.getByTestId("home-saved-section");
  await expect(savedSection).toContainText("1");
  await savedSection.getByRole("button").first().click();
  await expect(page.getByTestId("reader-screen")).toBeVisible();

  await page.goBack();
  await expect(page.getByTestId("home-saved-section")).toBeVisible();
  await page.getByTestId("home-saved-section").getByRole("button", { name: "Open all saved zikr" }).click();

  await expect(page.getByRole("tab", { name: /Saved/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("heading", { name: "Saved remembrance", exact: true })).toBeVisible();
});

test("Friday mode omits the removed supporting copy and remains overflow-free", async ({ page }) => {
  await openReturningGuest(page);
  await page.goto("/?view=friday");
  await expect(page.getByTestId("friday-mode-screen")).toBeVisible();
  await expect(page.getByText("Set aside a quiet time for dua before sunset.", { exact: true })).toHaveCount(0);

  for (const viewport of [
    { width: 320, height: 700 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `Friday horizontal overflow at ${viewport.width}px`).toBeLessThanOrEqual(0);
  }
});

test("Friday dua progress starts weekly even when the canonical collection was completed", async ({ page }) => {
  const canonicalDuaIds = [
    ...Array.from({ length: 35 }, (_, index) => `friday-dua-${String(index + 1).padStart(2, "0")}`),
    ...Array.from({ length: 12 }, (_, index) => `comprehensive-dua-${index + 36}`),
  ];
  await openReturningGuest(page, [], canonicalDuaIds);
  await page.goto("/?view=friday");

  await page.getByRole("button", { name: /Seek the response hour after/ }).click();
  await expect(page.getByRole("heading", { name: "Comprehensive Duas", exact: true })).toBeVisible();
  await expect(page.getByText("0 of 47", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Not completed — tap to check" }).first().click();
  await expect(page.getByText("1 of 47", { exact: true })).toBeVisible();

  const persisted = await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("azkarapp.state.v1") ?? "{}");
    const fridayKey = Object.keys(localStorage).find((key) => key.startsWith("azkarapp.friday-duas."));
    return {
      canonical: state.completed?.comprehensive_duas ?? [],
      weekly: fridayKey ? JSON.parse(localStorage.getItem(fridayKey) ?? "[]") : [],
    };
  });
  expect(persisted.canonical).toHaveLength(47);
  expect(persisted.weekly).toEqual(["friday-dua-01"]);
});

test("before-sleep preparation reports progress and completion", async ({ page }) => {
  await openReturningGuest(page);
  await page.getByTestId("nav-azkar").click();
  await page.getByTestId("category-card-before_sleep").click();

  const progress = page.getByTestId("sleep-preparation-count");
  await expect(progress).toHaveText("0 / 3");

  await expect(page.getByRole("checkbox")).toHaveCount(3);
  for (const label of ["Perform wudu", "Dust the bed", "Lie on the right side"]) {
    await page.getByText(label, { exact: true }).click();
  }

  await expect(progress).toHaveText("3 / 3");
  await expect(page.getByTestId("sleep-preparation-complete")).toBeVisible();
});
