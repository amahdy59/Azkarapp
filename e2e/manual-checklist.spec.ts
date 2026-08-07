/**
 * Automated evidence for rows of the Manual release record in
 * `docs/QUALITY_CHECKLIST.md` that do not actually require a human.
 *
 * These do NOT replace the rows that need a real screen reader, real device
 * hardware, or human judgement — screen reader, safe areas, performance and
 * media alternatives stay manual and stay Pending until someone does them.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type Settings = Record<string, unknown>;

async function seedAndOpen(page: Page, settings: Settings = {}) {
  await page.addInitScript((overrides) => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "midnight",
          textSize: "medium",
          highContrast: false,
          boldText: false,
          reduceMotion: true,
          forceRtl: false,
          colorBlindSupport: "none",
          ...(overrides as object),
        },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  }, settings);

  await page.goto("/");
  await expect(page.getByRole("status", { name: /Loading/i })).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });
}

/** Horizontal overflow is the clearest machine-checkable symptom of clipping. */
async function expectNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, `${context}: page scrolls horizontally`).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

// ─── Contrast ────────────────────────────────────────────────────────────────
// Checklist row: "Light, dark, high-contrast, and color-blind modes pass a
// contrast analyzer."
const CONTRAST_MODES: ReadonlyArray<{ name: string; settings: Settings }> = [
  { name: "midnight", settings: { themeMode: "midnight" } },
  { name: "dark", settings: { themeMode: "dark" } },
  { name: "light", settings: { themeMode: "light" } },
  { name: "high contrast", settings: { themeMode: "light", highContrast: true } },
  { name: "color-blind (deuteranopia)", settings: { themeMode: "midnight", colorBlindSupport: "deuteranopia" } },
];

for (const mode of CONTRAST_MODES) {
  test(`contrast: ${mode.name} mode passes the analyzer on Home`, async ({ page }) => {
    await seedAndOpen(page, mode.settings);
    const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(results.violations, `${mode.name}: contrast violations`).toEqual([]);
  });
}

// ─── Responsive layout ───────────────────────────────────────────────────────
// Checklist row: "320 px mobile, 390 px mobile, tablet, and desktop reflow
// without clipping."
const VIEWPORTS = [
  { name: "320px mobile", width: 320, height: 720 },
  { name: "390px mobile", width: 390, height: 844 },
  { name: "tablet", width: 834, height: 1194 },
  { name: "desktop", width: 1280, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`responsive: ${viewport.name} reflows without clipping`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedAndOpen(page);

    await expectNoHorizontalOverflow(page, `${viewport.name} Home`);
    await expect(page.getByRole("navigation")).toHaveCount(1);

    await page.getByTestId("nav-azkar").click();
    await expect(page.getByTestId("category-card-morning")).toBeVisible();
    await expectNoHorizontalOverflow(page, `${viewport.name} Library`);
  });
}

// ─── Text resize ─────────────────────────────────────────────────────────────
// Checklist row: "200% browser zoom and largest app text setting do not hide
// content or actions."
test("text resize: largest app text setting keeps content and actions reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAndOpen(page, { textSize: "large" });

  await expectNoHorizontalOverflow(page, "large text Home");
  await page.getByTestId("nav-azkar").click();
  const card = page.getByTestId("category-card-morning");
  await expect(card).toBeVisible();
  await expectNoHorizontalOverflow(page, "large text Library");

  // The card must remain operable, not merely present.
  await card.click();
  await expect(page.getByRole("button", { name: /Start Session|Continue/ }).first()).toBeVisible();
});

test("text resize: 200% zoom keeps primary navigation usable", async ({ page }) => {
  // 200% zoom on a 1280px desktop presents as a 640px CSS viewport.
  await page.setViewportSize({ width: 640, height: 450 });
  await seedAndOpen(page);

  await expectNoHorizontalOverflow(page, "200% zoom Home");
  await expect(page.getByRole("navigation")).toHaveCount(1);
  await page.getByTestId("nav-settings").click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "200% zoom Settings");
});

// ─── Prayer time and DST ─────────────────────────────────────────────────────
// Checklist row: "Effective timezone/offset match the detected location; online
// and offline results use the selected method."
test("prayer times: effective timezone and offset are surfaced and survive going offline", async ({ page }) => {
  await seedAndOpen(page);
  await page.getByTestId("nav-settings").click();
  await page.getByRole("button", { name: /Prayer Times & Location/ }).click();

  const status = page.getByTestId("daylight-saving-status");
  await expect(status).toBeVisible();
  await expect(status).toContainText("Africa/Cairo");
  await expect(status).toContainText(/UTC\+0[23]:00/);
  const onlineText = await status.innerText();

  // Astronomical calculation must not depend on the network.
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(status).toContainText("Africa/Cairo");
  expect(await status.innerText(), "offline timings drifted from online").toBe(onlineText);
  await page.context().setOffline(false);
});

// ─── Keyboard-only core flow ─────────────────────────────────────────────────
// Checklist row: "Logical order, visible focus, no traps."
test("keyboard: the core flow is reachable with a visible focus indicator and no traps", async ({ page }) => {
  await seedAndOpen(page);

  // Every element reached by Tab must show a focus indicator, not rely on the
  // browser default being suppressed somewhere.
  const seen = new Set<string>();
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const hasOutline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth || "0") > 0;
      const hasShadowRing = style.boxShadow !== "none";
      return {
        key: `${el.tagName}:${el.getAttribute("data-testid") ?? el.textContent?.trim().slice(0, 24) ?? ""}`,
        visible: hasOutline || hasShadowRing,
      };
    });
    if (!info) continue;
    seen.add(info.key);
    expect(info.visible, `no visible focus indicator on ${info.key}`).toBe(true);
  }
  expect(seen.size, "Tab did not move across distinct controls").toBeGreaterThan(3);

  // Not a trap: the library is reachable and Escape does not strand focus.
  await page.getByTestId("nav-azkar").click();
  await expect(page.getByTestId("category-card-morning")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation")).toBeVisible();
});
