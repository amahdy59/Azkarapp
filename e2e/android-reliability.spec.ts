import { expect, test, type Page } from "@playwright/test";

async function returningGuest(page: Page, language: "ar" | "en") {
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, themeMode: "midnight", appMaterial: "glass", reduceMotion: false },
        profile: { isGuest: true },
      }),
    );
  }, language);
}

for (const language of ["ar", "en"] as const) {
  test(`index reveals the current quarter and exact page at enlarged text ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await returningGuest(page, language);
    await page.goto("/#/quran/562");
    const indexButton = page.getByRole("button", {
      name: language === "ar" ? "فهرس المصحف الشريف" : "Holy Quran Index",
      exact: true,
    });
    await expect(indexButton).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await indexButton.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toHaveCSS("background-color", "rgb(15, 23, 42)");
    const panel = dialog.getByRole("tabpanel");
    for (const label of [dialog.getByRole("heading"), ...(await dialog.getByRole("tab").all())]) {
      expect(await label.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    await dialog.getByRole("tab", { name: language === "ar" ? "الأجزاء" : "Ajza'", exact: true }).click();
    const currentQuarter = panel.locator('[data-current-quarter="true"]');
    expect((await panel.boundingBox())!.height).toBeGreaterThanOrEqual(200);
    await expect(currentQuarter).toBeInViewport({ ratio: 1 });
    expect(
      await currentQuarter.evaluate((node) => {
        const bounds = node.getBoundingClientRect();
        return (
          document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)?.closest("button") ===
          node
        );
      }),
    ).toBe(true);
    await expect(panel.locator('[aria-current="true"]:not([data-current-quarter])')).toHaveCount(1);
    const assertWithinPanel = async () => {
      const bounds = (await panel.boundingBox())!;
      const current = (await panel.locator('[data-current-quarter="true"], [aria-current="page"]').boundingBox())!;
      expect(current.y).toBeGreaterThanOrEqual(bounds.y - 1);
      expect(current.y + current.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    };
    await assertWithinPanel();
    await page.screenshot({ path: testInfo.outputPath(`current-quarter-${language}.png`), scale: "css" });
    await dialog.getByRole("tab", { name: language === "ar" ? "صفحة" : "Page", exact: true }).click();
    await expect(panel.locator('[aria-current="page"]')).toHaveText(language === "ar" ? "٥٦٢" : "562");
    await expect(panel.locator('[aria-current="page"]')).toBeInViewport({ ratio: 1 });
    await assertWithinPanel();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(indexButton).toBeFocused();
  });
}

test("touch dragging releases a previously focused prayer control", async ({ page, browserName }, testInfo) => {
  test.skip(browserName !== "chromium", "CDP dispatches a real touch gesture");
  await page.setViewportSize({ width: 390, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.clock.setFixedTime(new Date("2026-10-17T08:00:00+03:00"));
  await returningGuest(page, "ar");
  await page.goto("/#/home");
  const sticky = page.getByTestId("home-sticky-prayers");
  const scroll = page.locator(".home-content-scroll");
  const control = sticky.locator(".home-prayer-sticky-row button").first();
  await control.focus();
  await expect(control).toBeFocused();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 180, y: 730 }] });
  for (let y = 700; y >= 360; y -= 30) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 180, y }] });
    await page.evaluate(() => new Promise(requestAnimationFrame));
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(control).not.toBeFocused();
  await expect.poll(() => scroll.evaluate((node) => node.scrollTop)).toBeGreaterThan(96);
  await expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
  await scroll.evaluate((node) => {
    node.scrollTop = 0;
  });
  await expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
  await page.screenshot({ path: testInfo.outputPath("home-touch-recovery.png"), scale: "css" });
});

test("a nonzero system top inset is reserved once on Progress", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await returningGuest(page, "ar");
  await page.goto("/#/progress");
  await expect(page.locator(".progress-screen-controls")).toBeVisible();
  // Desktop engines report zero safe areas. Replace env() in the actual loaded
  // declarations, preserving which elements own the inset and their geometry.
  await page.evaluate(() => {
    const replace = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if ("cssRules" in rule) replace((rule as CSSGroupingRule).cssRules);
        if (rule instanceof CSSStyleRule && rule.style.cssText.includes("safe-area-inset-top")) {
          rule.style.cssText = rule.style.cssText.replaceAll("env(safe-area-inset-top)", "32px ");
        }
      }
    };
    for (const sheet of document.styleSheets) {
      replace(sheet.cssRules);
    }
  });
  await expect(page.locator(".app-shell")).toHaveCSS("padding-top", "32px");
  await expect(page.locator(".progress-screen-controls")).toHaveCSS("padding-top", "0px");
  await expect(page.locator(".progress-screen")).toHaveCSS("padding-top", "0px");
});

test("Play all restores continuation from a saved manual-next preference", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await returningGuest(page, "ar");
  await page.addInitScript(() => {
    localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ autoAdvance: false }));
    class TestAudio extends EventTarget {
      src = "";
      currentTime = 0;
      duration = 30;
      paused = true;
      ended = false;
      playbackRate = 1;
      volume = 1;
      muted = false;
      constructor() {
        super();
        Object.assign(window, { testAudio: this });
      }
      load() {
        this.dispatchEvent(new Event("loadedmetadata"));
        this.dispatchEvent(new Event("canplay"));
      }
      play() {
        this.paused = false;
        this.dispatchEvent(new Event("playing"));
        return Promise.resolve();
      }
      pause() {
        this.paused = true;
        this.dispatchEvent(new Event("pause"));
      }
      removeAttribute() {
        this.src = "";
      }
    }
    Object.defineProperty(window, "Audio", { value: TestAudio });
  });
  let releaseAudio!: () => void;
  const audioReleased = new Promise<void>((resolve) => {
    releaseAudio = resolve;
  });
  await page.route("**/assets/audio-*.js", async (route) => {
    await audioReleased;
    await route.continue();
  });
  await page.goto("/#/azkar/before-sleep");
  await page.getByRole("button", { name: "تشغيل الصوتي للكل", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "جارٍ تجهيز الصوت" })).toBeVisible();
  releaseAudio();
  const confirm = page.getByRole("button", { name: "تشغيل المتاح", exact: true });
  const reader = page.getByTestId("reader-screen");
  await expect(confirm.or(reader)).toBeVisible();
  if (await confirm.isVisible()) await confirm.click();
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-100");
  await page.evaluate(() =>
    (window as unknown as { testAudio: HTMLMediaElement }).testAudio.dispatchEvent(new Event("ended")),
  );
  await expect(reader).toHaveAttribute("data-zikr-id", "s-hm-101");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.audio-preferences.v1")!).autoAdvance)).toBe(
    true,
  );
});

test("leaving a collection cancels cold Play all intent", async ({ page }) => {
  await returningGuest(page, "ar");
  let releaseAudio!: () => void;
  const audioReleased = new Promise<void>((resolve) => {
    releaseAudio = resolve;
  });
  await page.route("**/assets/audio-*.js", async (route) => {
    await audioReleased;
    await route.continue();
  });
  await page.goto("/#/azkar/before-sleep");
  await page.getByRole("button", { name: "تشغيل الصوتي للكل", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "جارٍ تجهيز الصوت" })).toBeVisible();
  await page.evaluate(() => {
    location.hash = "#/home";
  });
  await expect(page.getByTestId("home-sticky-prayers")).toBeVisible();
  releaseAudio();
  await expect
    .poll(() =>
      page.evaluate(() =>
        performance.getEntriesByType("resource").some((entry) => /\/audio-[^/]+\.js/.test(entry.name)),
      ),
    )
    .toBe(true);
  await expect(page.getByRole("region", { name: "مشغل الصوت", exact: true })).toHaveCount(0);
  await expect(page.getByTestId("reader-screen")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("failed cold audio loading provides an explicit recovery action", async ({ page }) => {
  await returningGuest(page, "ar");
  let blockAudio = true;
  await page.route("**/assets/audio-*.js", (route) => (blockAudio ? route.abort() : route.continue()));
  await page.goto("/#/azkar/before-sleep");
  await page.getByRole("button", { name: "تشغيل الصوتي للكل", exact: true }).click();
  const failure = page.getByRole("alert").filter({ hasText: "تعذّر تجهيز الصوت" });
  await expect(failure).toBeVisible();
  await expect(failure.getByRole("button", { name: "إعادة تحميل التطبيق", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "جارٍ تجهيز الصوت" })).toHaveCount(0);
  blockAudio = false;
  await failure.getByRole("button", { name: "إعادة تحميل التطبيق", exact: true }).click();
  await expect(failure).toBeHidden();
  await page.getByRole("button", { name: "تشغيل الصوتي للكل", exact: true }).click();
  await expect(page.getByTestId("reader-screen").or(page.getByRole("dialog"))).toBeVisible();
});
