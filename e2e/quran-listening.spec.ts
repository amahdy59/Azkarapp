import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";
import { t } from "../src/app/i18n";
import { splitMushafPages } from "../src/app/content/mushafPages";
import { listeningCases, listeningTiming, openListeningPage } from "./helpers/quran-listening";

for (const item of listeningCases) {
  for (const language of ["en", "ar"] as const) {
    test(`Mushaf listening ${item.id} ${language} preserves audio and reading state @cross-browser`, async ({
      page,
    }, testInfo) => {
      const player = await openListeningPage(page, item, language);
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", item.id);
      const paper = player.locator(`[data-mushaf-page="${item.first}"]`);
      await expect(paper).toHaveAttribute("data-mushaf-rendering", "unicode-fallback");
      const translation = player.getByTestId("quran-page-translation");
      if (language === "en") {
        await expect(translation).toHaveAttribute("open", "");
        const visibleKeys = await paper
          .locator("[data-listening-verse]")
          .evaluateAll((words) => [...new Set(words.map((word) => word.getAttribute("data-listening-verse")))]);
        const translatedKeys = await translation
          .locator("[data-translation-verse]")
          .evaluateAll((verses) => verses.map((verse) => verse.getAttribute("data-translation-verse")));
        expect(translatedKeys.length).toBeGreaterThan(0);
        expect(translatedKeys.every((key) => visibleKeys.includes(key))).toBe(true);
        const typography = await translation.locator("[role=region]").evaluate((region) => {
          const verse = getComputedStyle(region.querySelector("p")!);
          const fontSize = parseFloat(getComputedStyle(region).fontSize);
          return {
            direction: getComputedStyle(region).direction,
            align: getComputedStyle(region).textAlign,
            leading: parseFloat(getComputedStyle(region).lineHeight) / fontSize,
            verseGap:
              (parseFloat(verse.marginBottom) + parseFloat(verse.paddingTop) + parseFloat(verse.paddingBottom)) /
              fontSize,
          };
        });
        expect(typography.direction).toBe("ltr");
        expect(typography.align).toBe("start");
        expect(typography.leading).toBeCloseTo(1.65, 5);
        expect(typography.verseGap).toBeLessThanOrEqual(1);
      } else {
        await expect(translation).toHaveCount(0);
      }
      const wordOrder = await paper.evaluate((element) => {
        const line = Array.from(element.querySelectorAll("[data-mushaf-line-content]")).find(
          (row) => row.querySelectorAll("[data-listening-verse]").length > 1,
        )!;
        const words = line.querySelectorAll("[data-listening-verse]");
        return {
          direction: getComputedStyle(line).direction,
          firstLeft: words[0]!.getBoundingClientRect().left,
          secondRight: words[1]!.getBoundingClientRect().right,
        };
      });
      expect(wordOrder.direction).toBe("rtl");
      expect(wordOrder.firstLeft).toBeGreaterThanOrEqual(wordOrder.secondRight - 1);
      const initialLayout = await player.evaluate((element) => {
        const viewport = element.querySelector(".audio-expanded-text")!.getBoundingClientRect();
        const heading = (element.querySelector(".audio-expanded-text [data-mushaf-surah-number]") ??
          element.querySelector(".audio-expanded-text [data-listening-verse]"))!.getBoundingClientRect();
        const controls = element.querySelector("[data-listening-controls]")!.getBoundingClientRect();
        return {
          viewportBottom: viewport.bottom,
          headingTop: heading.top,
          headingBottom: heading.bottom,
          controlsBottom: controls.bottom,
          controlsHeight: controls.height,
        };
      });
      expect(initialLayout.controlsHeight).toBeLessThanOrEqual(48);
      expect(initialLayout.headingTop).toBeGreaterThanOrEqual(initialLayout.controlsBottom - 1);
      expect(initialLayout.headingBottom).toBeLessThanOrEqual(initialLayout.viewportBottom + 1);
      await expect(page.getByText(t(language, "quranListening.unavailable"), { exact: true })).toHaveCount(0);
      const information = player.getByRole("button", { name: t(language, "quranListening.information"), exact: true });
      await information.focus();
      await page.keyboard.press("Enter");
      const explanation = page.getByTestId("quran-follow-info");
      await expect(explanation).toBeVisible();
      await expect(explanation.locator("p")).toHaveText(t(language, "quranListening.browseHint"));
      await expect(
        explanation.getByRole("button", { name: t(language, "quranListening.follow"), exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        explanation.getByRole("button", { name: t(language, "quranListening.estimatedWords"), exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="quran-follow-info"]').analyze()).violations,
      ).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(explanation).toHaveCount(0);
      await expect(information).toBeFocused();
      const annotation = listeningTiming(item);
      const first = annotation.verses.find((verse) => verse.words?.length)!;
      await page.evaluate(
        (time) => {
          const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
          audio.currentTime = time;
          audio.dispatchEvent(new Event("timeupdate"));
        },
        (first.words![0]!.startMs + 1) / 1000,
      );
      const active = player.locator('[data-playback-word="true"]');
      await expect(active).toHaveCount(1);
      await expect
        .poll(() =>
          active.evaluate((word) => getComputedStyle(word).color !== getComputedStyle(word.parentElement!).color),
        )
        .toBe(true);
      expect(await active.evaluate((word) => getComputedStyle(word).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
      if (language === "en") {
        await expect(translation.locator('[aria-current="true"]')).toHaveAttribute(
          "data-translation-verse",
          first.verseKey,
        );
      }
      const metrics = await active.evaluate((word) => {
        const bounds = word.getBoundingClientRect(),
          view = word.closest(".audio-expanded-text")!.getBoundingClientRect();
        return {
          width: bounds.width,
          height: bounds.height,
          font: getComputedStyle(word).fontSize,
          visible: bounds.top >= view.top && bounds.bottom <= view.bottom,
        };
      });
      expect(metrics.visible).toBe(true);
      await information.click();
      await explanation
        .getByRole("button", { name: t(language, "quranListening.estimatedWords"), exact: true })
        .click();
      await expect(active).toHaveCount(0);
      await explanation
        .getByRole("button", { name: t(language, "quranListening.estimatedWords"), exact: true })
        .click();
      await expect(active).toHaveCount(1);
      const restored = await active.evaluate((word) => ({
        width: word.getBoundingClientRect().width,
        height: word.getBoundingClientRect().height,
        font: getComputedStyle(word).fontSize,
      }));
      expect(restored).toEqual({ width: metrics.width, height: metrics.height, font: metrics.font });
      await page.keyboard.press("Escape");
      const firstRange = (
        item.id === "friday-kahf"
          ? FRIDAY_KAHF[0]!
          : getAzkarForMode(item.category, "complete").find((zikr) => zikr.id === item.id)!
      ).mushafPages![0]!;
      const lastVerse = annotation.verses
        .filter((verse) => Number(verse.verseKey.split(":")[1]) <= firstRange.endAyah && verse.words?.length)
        .at(-1)!;
      const laterTime = (lastVerse.words!.at(-1)!.startMs + 1) / 1000;
      await page.evaluate((time) => {
        const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
        audio.currentTime = time;
        audio.dispatchEvent(new Event("timeupdate"));
      }, laterTime);
      await expect(active).toHaveCount(1);
      await expect
        .poll(() =>
          active.evaluate((word) => {
            const view = word.closest(".audio-expanded-text")!,
              bounds = word.getBoundingClientRect();
            return (
              bounds.top >= view.querySelector("[data-listening-controls]")!.getBoundingClientRect().bottom &&
              bounds.bottom <= view.getBoundingClientRect().bottom
            );
          }),
        )
        .toBe(true);
      await player
        .locator(".audio-expanded-text")
        .evaluate((viewport) => viewport.dispatchEvent(new WheelEvent("wheel", { bubbles: true })));
      await information.click();
      const following = explanation.getByRole("button", { name: t(language, "quranListening.follow"), exact: true });
      await expect(following).toHaveAttribute("aria-pressed", "false");
      await following.click();
      await expect(following).toHaveAttribute("aria-pressed", "true");
      await page.keyboard.press("Escape");
      for (const offset of [0, 120, 240]) {
        const scrollLayout = await player.evaluate((element, offset) => {
          const viewport = element.querySelector<HTMLElement>(".audio-expanded-text")!;
          viewport.scrollTop = offset;
          const view = viewport.getBoundingClientRect();
          const toolbar = element.querySelector("[data-listening-controls]")!.getBoundingClientRect();
          const hit = document.elementFromPoint(view.left + view.width / 2, view.top + 1);
          return { gap: toolbar.top - view.top, toolbarHit: Boolean(hit?.closest("[data-listening-controls]")) };
        }, offset);
        expect(Math.abs(scrollLayout.gap)).toBeLessThanOrEqual(1);
        expect(scrollLayout.toolbarHit).toBe(true);
      }
      await expect(paper.getByRole("button")).toHaveCount(0);
      const next = player.getByRole("button", { name: t(language, "common.next"), exact: true });
      expect(
        await next.evaluate((button) => {
          const bounds = button.getBoundingClientRect();
          return Boolean(
            document
              .elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
              ?.closest("[data-listening-controls]"),
          );
        }),
      ).toBe(true);
      await next.focus();
      await page.keyboard.press("Enter");
      await expect(player.locator(`[data-mushaf-page="${item.next}"]`)).toBeVisible();
      if (language === "en") {
        const nextKeys = await player
          .locator(`[data-mushaf-page="${item.next}"] [data-listening-verse]`)
          .evaluateAll((words) => [...new Set(words.map((word) => word.getAttribute("data-listening-verse")))]);
        const translatedKeys = await translation
          .locator("[data-translation-verse]")
          .evaluateAll((verses) => verses.map((verse) => verse.getAttribute("data-translation-verse")));
        expect(translatedKeys.every((key) => nextKeys.includes(key))).toBe(true);
        await expect(translation.locator('[aria-current="true"]')).toHaveCount(
          nextKeys.includes(lastVerse.verseKey) ? 1 : 0,
        );
      }
      await expect(next).toBeFocused();
      // A not-yet-cached page must retain the reviewed text while offline.
      const zikr =
        item.id === "friday-kahf"
          ? FRIDAY_KAHF[0]!
          : getAzkarForMode(item.category, "complete").find((value) => value.id === item.id)!;
      await page.context().setOffline(true);
      await next.click();
      await expect(player.getByTestId("audio-quran-fallback-text")).toHaveText(
        splitMushafPages(zikr.arabicText, zikr.mushafPages!)[2]!.text,
      );
      await page.context().setOffline(false);
      await player.getByRole("button", { name: t(language, "audioPlayer.retry"), exact: true }).click();
      await expect(player.locator(`[data-mushaf-page="${zikr.mushafPages![2]!.page}"]`)).toBeVisible();
      const state = await page.evaluate(() => {
        const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
        const audio = window as unknown as {
          __listeningAudio: { src: string; currentTime: number; paused: boolean };
          __listeningAudioCount: number;
        };
        return {
          page: state.khatmahPage,
          src: audio.__listeningAudio.src,
          time: audio.__listeningAudio.currentTime,
          paused: audio.__listeningAudio.paused,
          count: audio.__listeningAudioCount,
        };
      });
      expect(state.page).toBe(42);
      expect(state.count).toBe(1);
      expect(state.paused).toBe(false);
      await player.getByRole("button", { name: t(language, "audioPlayer.collapse"), exact: true }).click();
      await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      await expect(player.locator(`[data-mushaf-page="${item.first}"]`)).toBeVisible();
      expect(
        await page.evaluate(
          () => (window as unknown as { __listeningAudio: { currentTime: number } }).__listeningAudio.currentTime,
        ),
      ).toBe(state.time);
      const scan = await new AxeBuilder({ page }).include('[data-variant="expanded"][role="region"]').analyze();
      expect(scan.violations).toEqual([]);
      await player.screenshot({ path: testInfo.outputPath(`${item.id}-mushaf-listening.png`) });
      await page.setViewportSize({ width: 320, height: 844 });
      await expect.poll(() => paper.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await player.screenshot({ path: testInfo.outputPath(`${item.id}-mushaf-listening-narrow.png`) });
      await page.setViewportSize({ width: 1440, height: 1100 });
      await page.getByTestId("reader-sidebar-close").click();
      if ((await player.getAttribute("data-variant")) === "compact") {
        await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      }
      await expect
        .poll(() => player.locator(".audio-listening-page").evaluate((el) => el.clientHeight))
        .toBeGreaterThan(576);
      const dock = player.locator(".audio-expanded-controls");
      expect((await dock.boundingBox())!.height).toBeLessThanOrEqual(150);
      await player.screenshot({ path: testInfo.outputPath(`${item.id}-mushaf-listening-desktop.png`) });
    });
  }
}
