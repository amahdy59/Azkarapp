import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { listeningCases, listeningTiming, openListeningPage } from "./helpers/quran-listening";
import { t } from "../src/app/i18n";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";

for (const item of listeningCases.filter((item) => item.id !== "ir-baqarah")) {
  for (const language of ["ar", "en"] as const) {
    test(`continuous listening ${item.id} ${language} @cross-browser`, async ({ page }, testInfo) => {
      const player = await openListeningPage(page, item, language);
      const zikr =
        item.id === "friday-kahf"
          ? FRIDAY_KAHF[0]!
          : getAzkarForMode(item.category, "complete").find((zikr) => zikr.id === item.id)!;
      const passages = player.locator("[data-listening-passage]");
      await expect(passages).toHaveCount(zikr.mushafPages!.length);
      await expect(player.locator('[data-testid="mushaf-excerpt"]')).toHaveCount(zikr.mushafPages!.length);
      await expect(player.getByRole("combobox")).toHaveCount(0);
      await expect(player.locator("[data-listening-controls]")).toHaveCount(0);
      await expect(player.locator(".audio-listening-stream")).toBeVisible();
      // Adjacent surahs on the first/last printed page must never enter this passage.
      const keys = await player
        .locator("[data-listening-verse]")
        .evaluateAll((words) => [...new Set(words.map((word) => word.getAttribute("data-listening-verse")))]);
      expect(keys).toHaveLength(zikr.verseCount!);
      expect(
        keys.every((key) => key!.startsWith(`${item.id === "friday-kahf" ? 18 : item.id === "s-hm-110a" ? 32 : 67}:`)),
      ).toBe(true);
      const translation = player.getByTestId("quran-page-translation");
      if (language === "en") {
        await expect(translation).toHaveAttribute("open", "");
        await expect(translation.locator("[data-translation-verse]")).toHaveCount(zikr.verseCount!);
      } else await expect(translation).toHaveCount(0);
      const viewport = player.locator(".audio-expanded-text");
      const surface = await player.boundingBox();
      const main = await page.locator("#main-content").boundingBox();
      expect(Math.abs(surface!.y - main!.y)).toBeLessThanOrEqual(1);
      const headerTargets = await player.locator(".audio-expanded-header button").evaluateAll((buttons) =>
        buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
          return { width: bounds.width, height: bounds.height, reachable: button === hit || button.contains(hit) };
        }),
      );
      for (const target of headerTargets) {
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
        expect(target.reachable).toBe(true);
      }
      const initialSize = await passages
        .first()
        .locator('[data-testid="mushaf-excerpt"]')
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      expect(initialSize).toBeGreaterThanOrEqual(30);
      await viewport.focus();
      const before = await passages.first().boundingBox();
      await page.keyboard.press("ArrowDown");
      const resume = player.getByRole("button", { name: t(language, "quranListening.returnToVerse"), exact: true });
      await expect(resume).toBeVisible();
      expect(
        await resume.evaluate((button) => button.parentElement!.classList.contains("audio-expanded-reading")),
      ).toBe(true);
      // The recovery action overlays the reading surface and adds no document-flow height.
      const after = await passages.first().boundingBox();
      expect(after!.height).toBeCloseTo(before!.height, 1);
      await resume.click();
      await expect(viewport).toBeFocused();
      await expect(resume).toHaveCount(0);
      const options = player.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true });
      await options.click();
      const preferences = page.getByTestId("quran-listening-preferences");
      const preferenceLayout = await preferences.getByRole("button").evaluateAll((buttons) =>
        buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          const icon = button.querySelector("svg")!.getBoundingClientRect();
          const label = button.querySelector("span")!.getBoundingClientRect();
          return {
            height: bounds.height,
            centerGap: Math.abs(icon.top + icon.height / 2 - (bounds.top + bounds.height / 2)),
            labelGap: Math.abs(label.top + label.height / 2 - (icon.top + icon.height / 2)),
            contained:
              label.left >= bounds.left &&
              label.right <= bounds.right &&
              icon.left >= bounds.left &&
              icon.right <= bounds.right,
          };
        }),
      );
      for (const control of preferenceLayout) {
        expect(control.height).toBeGreaterThanOrEqual(44);
        expect(control.centerGap).toBeLessThanOrEqual(1);
        expect(control.labelGap).toBeLessThanOrEqual(1);
        expect(control.contained).toBe(true);
      }
      const words = preferences.getByRole("button", {
        name: t(language, "quranListening.estimatedWords"),
        exact: true,
      });
      await expect(words).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("Escape");
      await expect(options).toBeFocused();
      const annotation = listeningTiming(item);
      const last = annotation.verses.filter((verse) => verse.words?.length).at(-1)!;
      await page.evaluate(
        (time) => {
          const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
          audio.currentTime = time;
          audio.dispatchEvent(new Event("timeupdate"));
        },
        (last.words!.at(-1)!.startMs + 1) / 1000,
      );
      const active = player.locator('[data-playback-word="true"]');
      await expect(active).toHaveCount(1);
      await expect
        .poll(() =>
          active.evaluate((word) => {
            const ink = word.getBoundingClientRect();
            const viewport = word.closest(".audio-expanded-text")!.getBoundingClientRect();
            return ink.top >= viewport.top - 1 && ink.bottom <= viewport.bottom + 1;
          }),
        )
        .toBe(true);
      if (language === "en")
        await expect(translation.locator('[aria-current="true"]')).toHaveAttribute(
          "data-translation-verse",
          last.verseKey,
        );
      const geometry = await active.boundingBox();
      await options.click();
      await words.click();
      await expect(active).toHaveCount(0);
      await words.click();
      await expect(active).toHaveCount(1);
      const restored = await active.boundingBox();
      expect(restored!.width).toBeCloseTo(geometry!.width, 1);
      expect(restored!.height).toBeCloseTo(geometry!.height, 1);
      await page.keyboard.press("Escape");
      await page.context().setOffline(true);
      await player.getByRole("button", { name: t(language, "audioPlayer.collapse"), exact: true }).click();
      await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      await expect(passages).toHaveCount(zikr.mushafPages!.length);
      await expect(player.locator('[data-testid="mushaf-excerpt"]')).toHaveCount(zikr.mushafPages!.length);
      await page.context().setOffline(false);
      const state = await page.evaluate(() => ({
        state: JSON.parse(localStorage.getItem("azkarapp.state.v1")!),
        count: (window as unknown as { __listeningAudioCount: number }).__listeningAudioCount,
      }));
      expect(state.state.khatmahPage).toBe(42);
      expect(state.count).toBe(1);
      expect((await new AxeBuilder({ page }).include('[data-variant="expanded"]').analyze()).violations).toEqual([]);
      await viewport.focus();
      await page.keyboard.press("Home");
      await player.screenshot({ path: testInfo.outputPath(`${item.id}-${language}-stream.png`), scale: "css" });
      for (const size of [
        { width: 320, height: 568 },
        { width: 1440, height: 1100 },
      ]) {
        await page.setViewportSize(size);
        await expect(page.getByTestId("reader-screen")).toHaveAttribute(
          "data-reader-layout",
          size.width >= 768 ? "desktop" : "mobile",
        );
        if ((await player.getAttribute("data-variant")) === "compact")
          await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
        await expect
          .poll(() => player.evaluate((element) => element.scrollWidth - element.clientWidth))
          .toBeLessThanOrEqual(1);
        await expect(options).toBeVisible();
        await player.screenshot({
          path: testInfo.outputPath(`${item.id}-${language}-${size.width}.png`),
          scale: "css",
        });
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-reader-layout", "mobile");
      await page.locator("html").evaluate((element) => {
        element.style.fontSize = "32px";
      });
      if ((await player.getAttribute("data-variant")) === "compact")
        await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      await expect
        .poll(() => player.evaluate((element) => element.scrollWidth - element.clientWidth))
        .toBeLessThanOrEqual(1);
      await expect(options).toBeVisible();
      await viewport.focus();
      await page.keyboard.press("End");
      await expect
        .poll(() =>
          viewport.evaluate((element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 2),
        )
        .toBe(true);
      await player.screenshot({ path: testInfo.outputPath(`${item.id}-${language}-200-percent.png`), scale: "css" });
    });
  }
}
