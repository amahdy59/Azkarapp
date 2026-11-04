import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";
import { installStableLayoutAudio } from "./helpers/stable-layout-audio";
import { playEnglishTranslation } from "./reader-options";

for (const profile of [
  { language: "en", width: 390, scale: 1, themeMode: "midnight", appMaterial: "glass", highContrast: false },
  { language: "ar", width: 320, scale: 2, themeMode: "light", appMaterial: "solid", highContrast: true },
  { language: "ar", width: 834, scale: 1, themeMode: "dark", appMaterial: "glass", highContrast: false },
  { language: "en", width: 1440, scale: 1, themeMode: "light", appMaterial: "solid", highContrast: false },
] as const) {
  test.describe(`${profile.language}/${profile.width}/${profile.scale}`, () => {
    test.beforeEach(async ({ page }, info) => {
      await page.setViewportSize({ width: profile.width, height: 900 });
      const origin = new URL(String(info.project.use.baseURL)).origin;
      await page.route("**/*", (route) =>
        new URL(route.request().url()).origin === origin ? route.continue() : route.abort(),
      );
      await installStableLayoutAudio(page);
      await page.addInitScript((profile) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { ...profile, reduceMotion: true }, profile: { isGuest: true } }),
        );
        const BaseAudio = window.Audio;
        Object.assign(window, { __focusPauses: 0 });
        class FocusAudio extends BaseAudio {
          pause() {
            Object.assign(window, {
              __focusPauses: (window as unknown as { __focusPauses: number }).__focusPauses + 1,
            });
            super.pause();
          }
        }
        Object.defineProperty(window, "Audio", { value: FocusAudio });
      }, profile);
    });

    test("matching compact Library and Progress controls and structured path @cross-browser", async ({
      page,
    }, info) => {
      await page.goto("/#/azkar");
      await page.getByTestId("library-section-collections").waitFor();
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale * 100}%`;
      }, profile.scale);
      await page.evaluate(() => document.fonts.ready);
      const libraryTab = page.getByTestId("library-section-collections");
      const tabSize = (await libraryTab.boundingBox())!;
      expect(tabSize.width).toBeGreaterThanOrEqual(44);
      if (profile.width < 600) {
        const filter = page.getByTestId("library-filter-disclosure").getByRole("button");
        const box = (await filter.boundingBox())!;
        const group = (await page.locator(".library-section-tabs").boundingBox())!;
        expect(Math.abs(box.y + box.height / 2 - group.y - group.height / 2)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.height - group.height)).toBeLessThanOrEqual(1);
        expect(Math.abs(box.y - tabSize.y)).toBeLessThanOrEqual(5);
        expect(Math.abs(box.height - tabSize.height)).toBeLessThanOrEqual(10);
        expect(await filter.evaluate((node) => Boolean(node.closest('[role="tablist"]')))).toBe(false);
        await expect(filter).toHaveAccessibleName(t(profile.language, "library.searchFilters"));
        await filter.click();
        const sheet = page.getByTestId("library-filter-disclosure-sheet");
        await sheet.getByRole("textbox").fill(profile.language === "ar" ? "النوم" : "sleep");
        await sheet.getByRole("button", { name: t(profile.language, "library.showResults"), exact: true }).click();
        await expect(filter).toBeFocused();
        await filter.click();
        await expect(sheet.getByRole("textbox")).toHaveValue(profile.language === "ar" ? "النوم" : "sleep");
        await page.keyboard.press("Escape");
      }
      await page.screenshot({ path: info.outputPath("library.png") });
      await page.goto("/#/progress");
      const overview = page.getByTestId("progress-tab-overview");
      await overview.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const progressTab = (await overview.boundingBox())!;
      expect(progressTab.width).toBeGreaterThanOrEqual(44);
      expect(Math.abs(progressTab.height - tabSize.height)).toBeLessThanOrEqual(1);
      const filter = (await page.getByTestId("progress-filters-toggle").boundingBox())!;
      const group = (await page.locator(".progress-view-tabs").boundingBox())!;
      expect(Math.abs(filter.y + filter.height / 2 - group.y - group.height / 2)).toBeLessThanOrEqual(1);
      expect(Math.abs(filter.height - group.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(progressTab.y - filter.y)).toBeLessThanOrEqual(5);
      await expect(page.getByTestId("progress-empty-period")).toHaveCount(0);
      for (const card of await page.locator(".progress-metric-card").all()) {
        const box = (await card.boundingBox())!;
        if (profile.width === 390) expect(box.height).toBeLessThan(175);
        expect(await card.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      }
      await page.getByTestId("progress-tab-trends").focus();
      await page.keyboard.press(profile.language === "ar" ? "ArrowRight" : "ArrowLeft");
      await expect(overview).toBeFocused();
      await expect(overview).toHaveAttribute("aria-selected", "true");
      expect((await new AxeBuilder({ page }).include(".progress-screen").analyze()).violations).toEqual([]);
      await page.screenshot({ path: info.outputPath("progress.png") });
      await page.goto("/#/home");
      await page
        .getByTestId(profile.width < 600 ? "home-header-routine-summary-mobile" : "home-header-routine-summary")
        .click();
      const path = page.getByTestId("todays-path-sheet");
      await expect(path.locator("dl > div")).toHaveCount(3);
      await expect(path.locator("dl dt svg")).toHaveCount(3);
      for (const row of await path.locator("dl > div").all()) {
        expect(
          await row.evaluate((node) => {
            const row = node.getBoundingClientRect();
            const icon = node.querySelector("dt svg")!.getBoundingClientRect();
            return Math.abs(row.y + row.height / 2 - icon.y - icon.height / 2);
          }),
        ).toBeLessThanOrEqual(1);
      }
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="todays-path-sheet"]').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({ path: info.outputPath("todays-path.png") });
      await path.getByRole("button", { name: t(profile.language, "dailyPath.viewProgress") }).click();
      await expect(page.getByTestId("progress-tab-overview")).toBeVisible();
    });

    for (const reading of ["zikr", "quran"] as const) {
      test(`${reading} listening focus fills viewport and preserves playback @cross-browser`, async ({
        page,
      }, info) => {
        await page.goto(reading === "quran" ? "/#/quran/3" : "/#/azkar/evening/1");
        await page.locator("html").evaluate((node, scale) => {
          node.style.fontSize = `${scale * 100}%`;
        }, profile.scale);
        if (reading === "quran") {
          await page.locator('[data-mushaf-page="3"]').first().waitFor();
          const railListen = page.getByTestId("mushaf-rail-listen");
          if (await railListen.isVisible()) await railListen.click();
          else {
            await page.getByTestId("mushaf-more-actions").click();
            await page.getByTestId("mushaf-quick-audio").click();
          }
        } else if (profile.language === "ar") {
          await page.getByTestId("reader-audio-dock-button").click();
        } else {
          await page.getByRole("button", { name: "Reader options", exact: true }).click();
          await playEnglishTranslation(page);
        }
        const player = page.getByRole("region", { name: t(profile.language, "audioPlayer.region"), exact: true });
        await player.getByRole("button", { name: t(profile.language, "audioPlayer.expand") }).click();
        const toggle = page.getByTestId("audio-focus-toggle");
        const pauses = () => page.evaluate(() => (window as unknown as { __focusPauses: number }).__focusPauses);
        const before = await pauses();
        await player
          .locator(".audio-expanded-text")
          .evaluate((node) => node.setAttribute("data-preserved-reading", "true"));
        await toggle.click();
        await expect(toggle).toBeFocused();
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
        await expect(player.locator(".audio-expanded-transport")).toBeHidden();
        await expect(player.getByTestId("audio-lock-controls")).toBeVisible();
        await expect(player.getByRole("slider")).toHaveCount(0);
        await expect(player.locator('[data-preserved-reading="true"]')).toBeVisible();
        const bounds = (await page.locator(".audio-player-surface").boundingBox())!;
        expect(Math.abs(bounds.x) + Math.abs(bounds.y)).toBeLessThanOrEqual(1);
        expect(Math.abs(bounds.width - profile.width)).toBeLessThanOrEqual(1);
        expect(Math.abs(bounds.height - 900)).toBeLessThanOrEqual(1);
        await toggle.press("Shift+Tab");
        expect(
          await page.locator(".audio-player-surface").evaluate((node) => node.contains(document.activeElement)),
        ).toBe(true);
        expect(await pauses()).toBe(before);
        expect((await new AxeBuilder({ page }).include(".audio-player-surface").analyze()).violations).toEqual([]);
        await page.screenshot({ path: info.outputPath(`${reading}-focus.png`) });
        await page.keyboard.press("Escape");
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await expect(toggle).toBeFocused();
        await expect(player.locator(".audio-expanded-controls")).toBeVisible();
        expect(await pauses()).toBe(before);
        await toggle.click();
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
      });
    }
  });
}

test("navigation selection never fades its icon out @cross-browser", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: false }, profile: { isGuest: true } }),
    );
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/home");
  for (const item of ["progress", "settings", "masbaha"]) {
    const link = page.getByTestId(`nav-${item}`);
    await link.click();
    await expect(link).toHaveAttribute("aria-current", "page");
    const samples = await link
      .locator("svg")
      .first()
      .evaluate(async (node) => {
        const cue = node.parentElement!;
        const animation = cue.getAnimations()[0];
        const values = [];
        for (const time of [0, 16, 60, 120, 200]) {
          if (animation) {
            animation.pause();
            animation.currentTime = time;
          }
          values.push({ opacity: getComputedStyle(cue).opacity, width: node.getBoundingClientRect().width });
        }
        animation?.finish();
        return values;
      });
    for (const sample of samples) {
      expect(Number(sample.opacity)).toBe(1);
      expect(sample.width).toBeGreaterThanOrEqual(19);
    }
    await expect(link).toHaveAttribute("aria-current", "page");
  }
});
