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
      await expect(player.locator("[data-mushaf-page]")).toHaveCount(zikr.mushafPages!.length);
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
      const columns = passages.locator("[data-mushaf-column]");
      expect(await columns.evaluateAll((elements) => elements.map((element) => element.children.length))).toEqual(
        Array(zikr.mushafPages!.length).fill(15),
      );
      const textLine = passages.first().locator("[data-mushaf-line-content]").first();
      expect(await textLine.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(10);
      await page.screenshot({ path: testInfo.outputPath(`${item.id}-${language}-reading.png`) });
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
      await active.evaluate(async (element) => {
        await new Promise<void>((resolve) => {
          let previous = "";
          let unchanged = 0;
          const sample = () => {
            const box = element.getBoundingClientRect();
            const value = `${box.width}:${box.height}:${getComputedStyle(element).fontSize}`;
            unchanged = value === previous ? unchanged + 1 : 0;
            previous = value;
            if (unchanged >= 12) resolve();
            else requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        });
      });
      const geometry = await active.boundingBox();
      await options.click();
      await words.click();
      await expect(active).toHaveCount(0);
      await words.click();
      await expect(active).toHaveCount(1);
      await expect.poll(async () => (await active.boundingBox())!.width).toBeCloseTo(geometry!.width, 1);
      await expect.poll(async () => (await active.boundingBox())!.height).toBeCloseTo(geometry!.height, 1);
      await page.keyboard.press("Escape");
      await page.context().setOffline(true);
      await player.getByRole("button", { name: t(language, "audioPlayer.collapse"), exact: true }).click();
      await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      await expect(passages).toHaveCount(zikr.mushafPages!.length);
      await expect(player.locator("[data-mushaf-page]")).toHaveCount(zikr.mushafPages!.length);
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
    });
    test(`canonical surah magnification ${item.id} ${language} @cross-browser`, async ({ page }, testInfo) => {
      const player = await openListeningPage(page, item, language);
      const passages = player.locator("[data-listening-passage]");
      const columns = passages.locator("[data-mushaf-column]");
      const textLine = passages.first().locator("[data-mushaf-line-content]").first();
      const options = player.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true });
      const zikr =
        item.id === "friday-kahf"
          ? FRIDAY_KAHF[0]!
          : getAzkarForMode(item.category, "complete").find((entry) => entry.id === item.id)!;
      await expect(columns).toHaveCount(zikr.mushafPages!.length);
      expect(await columns.evaluateAll((elements) => elements.map((element) => element.children.length))).toEqual(
        Array(zikr.mushafPages!.length).fill(15),
      );
      const printedLines = await columns.evaluateAll((elements) =>
        elements.map((element) => Array.from(element.children, (line) => line.textContent)),
      );
      await page.evaluate(() => document.fonts.ready);
      const baseFont = await textLine.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      await options.click();
      const magnification = page.getByRole("slider", { name: t(language, "mushaf.magnification"), exact: true });
      await magnification.focus();
      await page.keyboard.press("Home");
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("ArrowUp");
      await expect(magnification).toHaveValue("150");
      await page.keyboard.press("Escape");
      await expect
        .poll(() => textLine.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)))
        .toBeGreaterThan(baseFont * 1.35);
      expect(
        await columns.evaluateAll((elements) =>
          elements.map((element) => Array.from(element.children, (line) => line.textContent)),
        ),
      ).toEqual(printedLines);
      await page.screenshot({ path: testInfo.outputPath(`${item.id}-${language}-150.png`) });
      await options.click();
      await page.getByRole("button", { name: t(language, "mushaf.magnificationReset"), exact: true }).click();
      await page.keyboard.press("Escape");
      // Reset schedules fitting via ResizeObserver; record word geometry only
      // after its font size and containment transform have settled.
      await textLine.evaluate(async (element) => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => {
          let previous = "";
          let unchanged = 0;
          const sample = () => {
            const box = element.getBoundingClientRect();
            const value = `${getComputedStyle(element).fontSize}:${box.width}:${box.height}`;
            unchanged = value === previous ? unchanged + 1 : 0;
            previous = value;
            if (unchanged >= 12) resolve();
            else requestAnimationFrame(sample);
          };
          requestAnimationFrame(sample);
        });
      });
    });
    test(`responsive surah listening ${item.id} ${language} @cross-browser`, async ({ page }, testInfo) => {
      const player = await openListeningPage(page, item, language);
      const options = player.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true });
      const viewport = player.locator(".audio-expanded-text");
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
          .toBeLessThanOrEqual(1)
          .catch(async (error) => {
            await testInfo.attach("expanded-player-overflow", {
              contentType: "application/json",
              body: JSON.stringify(
                await player.evaluate((element) => {
                  const box = element.getBoundingClientRect();
                  return [...element.querySelectorAll<HTMLElement>("*")]
                    .map((node) => ({
                      tag: node.tagName,
                      className: node.className,
                      scrollWidth: node.scrollWidth,
                      clientWidth: node.clientWidth,
                      left: node.getBoundingClientRect().left - box.left,
                      right: node.getBoundingClientRect().right - box.right,
                    }))
                    .filter((node) => node.right > 1 || node.left < -1 || node.scrollWidth > node.clientWidth + 1);
                }),
                null,
                2,
              ),
            });
            throw error;
          });
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
