import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";
import { t } from "../src/app/i18n";
import { splitMushafPages } from "../src/app/content/mushafPages";

for (const item of [
  { id: "ir-baqarah", category: "illness_ruqyah", route: "illness-ruqyah", first: 2, next: 3 },
  { id: "friday-kahf", category: "friday_kahf", route: "friday-kahf", first: 293, next: 294 },
  { id: "s-hm-110a", category: "before_sleep", route: "before-sleep", first: 415, next: 416 },
  { id: "s-hm-110b", category: "before_sleep", route: "before-sleep", first: 562, next: 563 },
] as const) {
  for (const language of ["en", "ar"] as const) {
    test(`Mushaf listening ${item.id} ${language} preserves audio and reading state @cross-browser`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.route("https://verses.quran.foundation/fonts/**", (route) => route.abort());
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, routineMode: "complete", reduceMotion: true },
            routineMode: "complete",
            profile: { isGuest: true },
            khatmahPage: 42,
          }),
        );
        class ListeningAudio extends EventTarget {
          src = "";
          currentTime = 30;
          duration = 120;
          volume = 1;
          muted = false;
          playbackRate = 1;
          paused = true;
          ended = false;
          constructor() {
            super();
            Object.assign(window, {
              __listeningAudio: this,
              __listeningAudioCount:
                ((window as unknown as { __listeningAudioCount?: number }).__listeningAudioCount ?? 0) + 1,
            });
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
        Object.defineProperty(window, "Audio", { value: ListeningAudio });
      }, language);
      const index =
        item.id === "friday-kahf"
          ? 0
          : getAzkarForMode(item.category, "complete").findIndex((zikr) => zikr.id === item.id);
      await page.goto(`/#/azkar/${item.route}/${index + 1}`);
      await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", item.id);
      await page.getByRole("button", { name: t(language, "reader.listenToSurah"), exact: true }).click();
      const player = page.getByRole("region", { name: t(language, "audioPlayer.region"), exact: true });
      await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      const paper = player.locator(`[data-mushaf-page="${item.first}"]`);
      await expect(paper).toHaveAttribute("data-mushaf-rendering", "unicode-fallback");
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
      await expect(player.getByRole("button", { name: t(language, "quranListening.follow"), exact: true })).toHaveCount(
        0,
      );
      await expect(page.getByText(t(language, "quranListening.unavailable"), { exact: true })).toHaveCount(0);
      const information = player.getByRole("button", { name: t(language, "quranListening.information"), exact: true });
      await information.focus();
      await page.keyboard.press("Enter");
      const explanation = page.getByTestId("quran-follow-info");
      await expect(explanation).toBeVisible();
      await expect(explanation).toHaveText(t(language, "quranListening.unavailable"));
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="quran-follow-info"]').analyze()).violations,
      ).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(explanation).toHaveCount(0);
      await expect(information).toBeFocused();
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
    });
  }
}
