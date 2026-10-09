import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";
import { t } from "../src/app/i18n";
import { splitMushafPages } from "../src/app/content/mushafPages";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { OWNER_TIMING_PACK_SHA, expandOwnerTiming, type OwnerTimingPack } from "../src/app/audio/ownerTimingPreviews";

const timingPack: OwnerTimingPack = JSON.parse(
  gunzipSync(readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`)).toString(),
);

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
      const record = timingPack.records.find(
        (record) =>
          record.q &&
          record.v.some((id) =>
            id.startsWith(item.id === "ir-baqarah" ? "quran-002" : item.id === "friday-kahf" ? "quran-018" : item.id),
          ),
      )!;
      const annotation = expandOwnerTiming(timingPack, record);
      if (!("verses" in annotation)) throw new Error("Expected Quran timings");
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
