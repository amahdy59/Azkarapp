/**
 * Evidence capture for phase reports.
 *
 * Deliberately uses only selectors that have been stable since before Phase 02
 * (onboarding test ids and `nav-*` test ids), so the identical file can be run
 * against an older commit to produce a genuine before/after pair rather than a
 * current-state-only snapshot.
 *
 * Writes into a committed directory, not test-results/ — the Phase 01 baseline
 * was captured to an ephemeral path and was therefore lost.
 *
 * Run with:  EVIDENCE_DIR=docs/agent/evidence/screenshots/after pnpm exec playwright test e2e/evidence-capture.spec.ts --project=desktop-chromium
 */
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = process.env.EVIDENCE_DIR ?? "docs/agent/evidence/screenshots/current";

type ThemeMode = "midnight" | "dark" | "light";

function seed(language: "ar" | "en", themeMode: ThemeMode) {
  return {
    settings: {
      language,
      themeMode,
      showTransliteration: true,
      showTranslation: true,
      textSize: "medium",
      highContrast: false,
      boldText: false,
      reduceMotion: true,
      hapticFeedback: false,
      forceRtl: false,
      colorBlindSupport: "none",
    },
    profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
    completed: { morning: [], evening: [], before_sleep: [] },
    sessions: [],
  };
}

async function enterApp(page: Page, language: "ar" | "en", themeMode: ThemeMode) {
  await page.addInitScript(
    (state) => {
      window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      window.localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
    },
    seed(language, themeMode),
  );
  await page.goto("/");
  await expect(page.getByRole("status", { name: /Loading/i })).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });

  // Navigation mounts while the splash is still showing in pre-Phase-02 builds,
  // so waiting on nav alone captures the splash instead of Home. Explicitly go
  // to Home and wait for the splash wordmark to clear.
  const home = page.getByTestId("nav-home");
  if ((await home.count()) > 0) {
    await home.first().click();
  }
  await expect(page.getByText("الذكر اليومي للمسلم", { exact: false })).toHaveCount(0, { timeout: 15_000 });
  await page.waitForTimeout(800);
}

async function shoot(page: Page, name: string) {
  mkdirSync(OUT_DIR, { recursive: true });
  // Let fonts and any entrance transition settle so diffs reflect layout, not timing.
  await page.waitForTimeout(400);
  await page.locator(".skip-link").evaluate((element) => {
    (element as HTMLElement).style.display = "none";
  });
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`), fullPage: true });
}

/** Navigates by test id and tolerates screens that did not exist in older builds. */
async function openTab(page: Page, tab: "home" | "azkar" | "progress" | "settings") {
  const target = page.getByTestId(`nav-${tab}`);
  if ((await target.count()) === 0) return false;
  await target.first().click();
  await page.waitForTimeout(600);
  return true;
}

for (const theme of ["midnight", "dark", "light"] as const) {
  test(`home in Arabic ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await enterApp(page, "ar", theme);
    await shoot(page, `desktop-home-ar-${theme}`);
  });
}

test("core screens in Arabic midnight at desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await enterApp(page, "ar", "midnight");

  for (const tab of ["azkar", "progress", "settings"] as const) {
    if (await openTab(page, tab)) {
      await shoot(page, `desktop-${tab}-ar-midnight`);
    }
  }
});

test("core screens in Arabic midnight at compact width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterApp(page, "ar", "midnight");
  await shoot(page, "compact-home-ar-midnight");

  if (await openTab(page, "azkar")) {
    await shoot(page, "compact-azkar-ar-midnight");
  }
});

test("core screens in Arabic midnight at tablet width", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 1194 });
  await enterApp(page, "ar", "midnight");
  await shoot(page, "tablet-home-ar-midnight");

  if (await openTab(page, "azkar")) {
    await shoot(page, "tablet-azkar-ar-midnight");
  }
});

test("reader in Arabic midnight", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await enterApp(page, "ar", "midnight");

  if (!(await openTab(page, "azkar"))) return;
  const card = page.getByTestId("category-card-morning");
  if ((await card.count()) === 0) return;
  await card.click();
  await page.waitForTimeout(800);
  await shoot(page, "desktop-category-ar-midnight");

  // Open the first zikr, however the collection screen exposes it.
  const firstAction = page.getByRole("button").filter({ hasNotText: /^$/ }).first();
  if ((await firstAction.count()) > 0) {
    await page.waitForTimeout(400);
  }
});

test("home in English light at desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await enterApp(page, "en", "light");
  await shoot(page, "desktop-home-en-light");
});
