import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  // The reader no longer talks to api.quran.com at all; blocking the remote
  // page font keeps the run deterministic on the shipped Unicode fallback.
  await page.route("https://verses.quran.foundation/**", (route) => route.abort());
  await page.addInitScript(() => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "ar", themeMode: "midnight", forceRtl: false, reduceMotion: true },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
        khatmahPage: 42,
        quranReadingPosition: { page: 42, surahNumber: 2, ayahNumber: 256, juzNumber: 3 },
        quranWirdPlan: { kind: "daily", dailyPages: 4 },
        wirdHistory: {},
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });
  await page.getByRole("button", { name: /ورد القرآن/ }).click();
});

test("keeps progress in the Wird overview and turns one semantic page by swipe, key, or button", async ({ page }) => {
  const progress = page.getByRole("progressbar", { name: /أكملت ٠ من ٤/ });
  await expect(progress).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ })).toBeVisible();
  await expect(page.getByRole("region", { name: "هذا الأسبوع" }).getByRole("listitem").first()).toContainText("السبت");

  await page.setViewportSize({ width: 320, height: 700 });
  await page.getByRole("button", { name: "متابعة القراءة" }).click();
  const mushafPage = page.getByRole("article", { name: "صفحة ٤٢" });
  const pageNavigation = page.getByRole("navigation", { name: "التنقل بين صفحات المصحف" });
  const revealControls = page.getByRole("button", { name: "إظهار أدوات صفحة المصحف" });
  await expect(mushafPage).toBeVisible();
  await expect(pageNavigation).toBeVisible();
  await expect(page.getByRole("navigation", { name: /التنقل (السفلي|الرئيسي)/ })).toHaveCount(0);
  await expect(pageNavigation).toHaveCount(0, { timeout: 5000 });
  await revealControls.click();
  await expect(pageNavigation).toBeVisible();
  const initialBox = await mushafPage.boundingBox();
  // The Mushaf is the whole screen: no card, no gutter, no letterbox.
  expect(initialBox?.x ?? 99).toBeLessThanOrEqual(1);
  expect(initialBox?.width ?? 0).toBeGreaterThanOrEqual(319);
  expect(initialBox?.height ?? 0).toBeGreaterThanOrEqual(690);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);

  const optionsButton = page.getByRole("button", { name: "خيارات" });
  await optionsButton.focus();
  const lines = mushafPage.locator("[data-mushaf-line-content]");
  await expect(mushafPage.locator("[data-mushaf-rendering] > div > div")).toHaveCount(15);
  // No line may paint outside the slot it sits in — overlong lines are scaled
  // down to fit, never clipped at the page edge.
  const bleed = await lines.evaluateAll((elements) =>
    elements.flatMap((element) => {
      const slot = element.parentElement?.getBoundingClientRect();
      const painted = element.getBoundingClientRect();
      return slot ? [painted.width - slot.width, painted.height - slot.height] : [];
    }),
  );
  expect(bleed.filter((delta) => delta > 1)).toEqual([]);
  const lineRectsBefore = await lines.evaluateAll((elements) =>
    elements.map((element, _index, allLines) => {
      const rect = element.getBoundingClientRect();
      return [rect.width, rect.height, rect.y - allLines[0].getBoundingClientRect().y];
    }),
  );
  const difficultWords = page.getByRole("switch", { name: "كلمات صعبة" });
  await expect(difficultWords).toHaveAttribute("aria-checked", "false");
  await difficultWords.click();
  await expect(difficultWords).toHaveAttribute("aria-checked", "true");
  await expect(page.getByRole("button", { name: /معنى كلمة/ })).toHaveCount(3);
  const lineRectsAfter = await lines.evaluateAll((elements) =>
    elements.map((element, _index, allLines) => {
      const rect = element.getBoundingClientRect();
      return [rect.width, rect.height, rect.y - allLines[0].getBoundingClientRect().y];
    }),
  );
  expect(lineRectsAfter).toEqual(lineRectsBefore);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await expect(page.getByText(/ختمة المصحف:/)).toHaveCount(0);

  await expect(pageNavigation).toHaveCount(0, { timeout: 5000 });
  await revealControls.click();
  await expect(pageNavigation).toBeVisible();
  await page.keyboard.press("Tab");
  await page.getByRole("button", { name: "رجوع" }).focus();
  await expect(page.getByRole("button", { name: "رجوع" })).toBeFocused();
  await page.waitForTimeout(3800);
  await expect(pageNavigation).toBeVisible();

  const pageBox = await page.getByRole("article", { name: "صفحة ٤٢" }).boundingBox();
  expect(pageBox).not.toBeNull();
  if (!pageBox) return;
  await page.mouse.move(pageBox.x + pageBox.width * 0.8, pageBox.y + pageBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(pageBox.x + pageBox.width * 0.2, pageBox.y + pageBox.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();

  // The arrow that points backwards goes backwards, in Arabic as in English.
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("article", { name: "صفحة ٤٢" })).toBeVisible();
  await page.getByRole("article", { name: "صفحة ٤٢" }).getByRole("button", { name: "التالي" }).click();
  await expect(page.getByRole("article", { name: "صفحة ٤٣" })).toBeVisible();
});
