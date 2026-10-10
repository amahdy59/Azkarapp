import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";
import { t } from "../src/app/i18n";
import { listeningCases, listeningTiming, openListeningPage } from "./helpers/quran-listening";

test("Main Mushaf follows audio beside readable English and yields to manual browsing @cross-browser", async ({
  page,
}, testInfo) => {
  const player = await openListeningPage(page, listeningCases[0], "en");
  await page.setViewportSize({ width: 1440, height: 900 });
  if (await page.getByTestId("reader-sidebar-close").isVisible())
    await page.getByTestId("reader-sidebar-close").click();
  const annotation = listeningTiming(listeningCases[0]);
  const playVerse = async (key: string) => {
    const verse = annotation.verses.find((verse) => verse.verseKey === key)!;
    await page.evaluate(
      (seconds) => {
        const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
        audio.currentTime = seconds;
        audio.dispatchEvent(new Event("timeupdate"));
      },
      (verse.startMs + 10) / 1000,
    );
  };
  await playVerse("2:6");
  await page.evaluate(() => {
    window.location.hash = "/quran/3";
  });
  await expect(page.locator('.mushaf-paper [data-mushaf-page="3"]')).toBeVisible();
  await page.getByTestId("mushaf-rail-more").click();
  await page.getByTestId("quick-page-translation-switch").click();
  await page.keyboard.press("Escape");
  const meaning = page.locator(".quran-page-meaning");
  await expect(meaning.locator('[aria-current="true"]')).toHaveAttribute("data-translation-verse", "2:6");
  await expect(page.locator('.mushaf-paper [data-playback-verse="2:6"]').first()).toBeVisible();
  const layoutCheck = await meaning.evaluate((element) => {
    const text = element.querySelector(".quran-meaning-text")!;
    const arabicFrame = element.closest(".mushaf-paper")!.querySelector(".mushaf-page-frame")!.getBoundingClientRect();
    const facingFrame = element.closest(".mushaf-page-frame")!.getBoundingClientRect();
    return {
      boundsRight: facingFrame.right,
      arabicLeft: arabicFrame.left,
      beside: facingFrame.right <= arabicFrame.left,
      boundsTop: facingFrame.top,
      arabicTop: arabicFrame.top,
      diffTop: Math.abs(facingFrame.top - arabicFrame.top),
      fontSize: parseFloat(getComputedStyle(text).fontSize),
    };
  });
  expect(layoutCheck.beside).toBe(true);
  expect(layoutCheck.diffTop).toBeLessThanOrEqual(1);
  expect(layoutCheck.fontSize).toBeGreaterThanOrEqual(14);
  await playVerse("2:16");
  await expect(meaning.locator('[aria-current="true"]')).toHaveAttribute("data-translation-verse", "2:16");
  await page.getByTestId("mushaf-rail-next").click();
  await expect(page.getByTestId("mushaf-playback-follow")).toHaveAttribute("aria-checked", "false");
  await playVerse("2:7");
  await expect(page.locator('.mushaf-paper [data-mushaf-page="4"]')).toBeVisible();
  await page.getByTestId("mushaf-playback-follow").click();
  await expect(page.locator('.mushaf-paper [data-mushaf-page="3"]')).toBeVisible();
  await playVerse("2:25");
  await expect(page.locator('.mushaf-paper [data-mushaf-page="5"]')).toBeVisible();
  await expect(meaning.locator('[aria-current="true"]')).toHaveAttribute("data-translation-verse", "2:25");
  await meaning.locator(".quran-meaning-text").click();
  await page.screenshot({ path: testInfo.outputPath("meaning-pointer.png") });
  await expect(page.getByTestId("mushaf-playback-follow")).toHaveAttribute("aria-checked", "false");
  await page.getByTestId("mushaf-playback-follow").click();
  await expect(page.getByTestId("mushaf-playback-follow")).toHaveAttribute("aria-checked", "true");
  await expect(player).toHaveAttribute("data-variant", "compact");
  expect(
    await meaning.evaluate((element) => {
      const dock = document.querySelector('[data-variant="compact"][role="region"]')!.getBoundingClientRect();
      const paper = element.closest(".mushaf-paper")!.getBoundingClientRect();
      return paper.bottom <= dock.top - 7;
    }),
  ).toBe(true);
  expect(
    await page.evaluate(() => (window as unknown as { __listeningAudioCount: number }).__listeningAudioCount),
  ).toBe(1);
  await page.screenshot({ path: testInfo.outputPath("main-mushaf-synchronized.png") });
  expect((await new AxeBuilder({ page }).include(".mushaf-paper").analyze()).violations).toEqual([]);
});

for (const item of listeningCases) {
  test(`Paired translation ${item.id} follows hidden audio and reflows @cross-browser`, async ({ page }, testInfo) => {
    const player = await openListeningPage(page, item, "en");
    await expect(player.locator(`[data-mushaf-page="${item.first}"]`)).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.getByTestId("reader-sidebar-close").click();
    if ((await player.getAttribute("data-variant")) === "compact") {
      await player.getByRole("button", { name: t("en", "audioPlayer.expand"), exact: true }).click();
    }
    const translation = player.getByTestId("quran-page-translation");
    await expect(translation).toHaveAttribute("open", "");
    const layout = await player.evaluate((element) => {
      const paper = element.querySelector(".audio-listening-page")!.getBoundingClientRect();
      const translation = element.querySelector(".audio-listening-translation")!.getBoundingClientRect();
      const text = element.querySelector(".audio-listening-translation-text")!.getBoundingClientRect();
      return {
        beside: translation.right <= paper.left,
        topGap: Math.abs(translation.top - paper.top),
        width: text.width,
      };
    });
    expect(layout.beside).toBe(true);
    expect(layout.topGap).toBeLessThanOrEqual(1);
    expect(layout.width).toBeLessThan(650);
    const annotation = listeningTiming(item);
    const zikr =
      item.id === "friday-kahf"
        ? FRIDAY_KAHF[0]!
        : getAzkarForMode(item.category, "complete").find((zikr) => zikr.id === item.id)!;
    const lastVerse = annotation.verses
      .filter((verse) => Number(verse.verseKey.split(":")[1]) <= zikr.mushafPages![0]!.endAyah && verse.words?.length)
      .at(-1)!;
    await page.evaluate(
      (time) => {
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
        document.dispatchEvent(new Event("visibilitychange"));
        const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
        audio.currentTime = time;
        audio.dispatchEvent(new Event("timeupdate"));
      },
      (lastVerse.words!.at(-1)!.startMs + 1) / 1000,
    );
    await expect(translation.locator('[aria-current="true"]')).toHaveAttribute(
      "data-translation-verse",
      lastVerse.verseKey,
    );
    const meaningInView = () =>
      translation.locator('[aria-current="true"]').evaluate((active) => {
        const view = active.closest("[role=region]")!.getBoundingClientRect();
        const pane = active.closest(".audio-listening-translation")!.getBoundingClientRect();
        const canvas = active.closest(".audio-expanded-text")!.getBoundingClientRect();
        const bounds = active.getBoundingClientRect();
        return (
          bounds.top >= Math.max(view.top, pane.top, canvas.top) - 1 &&
          bounds.bottom <= Math.min(view.bottom, pane.bottom, canvas.bottom) + 1
        );
      });
    await expect.poll(meaningInView).toBe(true);
    const nextPlayingVerse = annotation.verses.find(
      (verse) => Number(verse.verseKey.split(":")[1]) > zikr.mushafPages![0]!.endAyah && verse.words?.length,
    )!;
    await page.evaluate(
      (time) => {
        const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
        audio.currentTime = time;
        audio.dispatchEvent(new Event("timeupdate"));
      },
      (nextPlayingVerse.words![0]!.startMs + 1) / 1000,
    );
    await expect(player.locator(`[data-mushaf-page="${item.next}"]`)).toBeVisible();
    await expect(translation.locator('[aria-current="true"]')).toHaveAttribute(
      "data-translation-verse",
      nextPlayingVerse.verseKey,
    );
    await expect.poll(meaningInView).toBe(true);
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "visibilityState");
      document.dispatchEvent(new Event("visibilitychange"));
      window.dispatchEvent(new Event("focus"));
    });
    await page.screenshot({ path: testInfo.outputPath(`${item.id}-paired.png`) });
    await page.setViewportSize({ width: 1440, height: 760 });
    await expect.poll(meaningInView).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${item.id}-short.png`) });
    await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(
      await translation.locator("[role=region]").evaluate((region) => {
        const view = region.getBoundingClientRect();
        return Array.from(region.querySelectorAll("p")).every((verse) => {
          const bounds = verse.getBoundingClientRect();
          return bounds.left >= view.left && bounds.right <= view.right && verse.scrollWidth <= verse.clientWidth + 1;
        });
      }),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${item.id}-enlarged-text.png`) });
  });
}

test("Enlarged paired Mushaf stays inside a keyboard-scrollable Arabic pane @cross-browser", async ({
  page,
}, testInfo) => {
  const player = await openListeningPage(page, listeningCases[0], "en");
  await expect(player.locator('[data-mushaf-page="2"]')).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.getByTestId("reader-sidebar-close").click();
  if ((await player.getAttribute("data-variant")) === "compact") {
    await player.getByRole("button", { name: t("en", "audioPlayer.expand"), exact: true }).click();
  }
  await player.getByRole("button", { name: t("en", "audioPlayer.options"), exact: true }).click();
  const magnification = page.getByRole("slider", { name: t("en", "mushaf.magnification"), exact: true });
  await magnification.focus();
  await page.keyboard.press("End");
  await expect(magnification).toHaveValue("200");
  await page.keyboard.press("Escape");
  const arabic = player.locator(".audio-listening-arabic");
  await expect(arabic).toHaveAttribute("tabindex", "0");
  await expect(player.locator(".audio-listening-body")).toHaveAttribute("data-listening-magnified", "true");
  expect(
    await player.evaluate((element) => {
      const arabic = element.querySelector(".audio-listening-arabic")!.getBoundingClientRect();
      const translation = element.querySelector(".audio-listening-translation")!.getBoundingClientRect();
      const canvas = element.querySelector(".audio-expanded-text")!.getBoundingClientRect();
      return translation.top >= arabic.bottom - 1 && arabic.left >= canvas.left && arabic.right <= canvas.right;
    }),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect
    .poll(() =>
      arabic.evaluate((region) => {
        const view = region.getBoundingClientRect();
        const heading = region.querySelector('[data-mushaf-surah-number="2"]')!.getBoundingClientRect();
        const first = region.querySelector('[data-listening-verse="2:1"]')!.getBoundingClientRect();
        return (
          heading.left >= view.left - 1 &&
          heading.right <= view.right + 1 &&
          heading.top >= view.top - 1 &&
          heading.top <= view.top + 16 &&
          first.top >= view.top &&
          first.bottom <= view.bottom &&
          first.left >= view.left &&
          first.right <= view.right
        );
      }),
    )
    .toBe(true);
  await arabic.focus();
  await page.keyboard.press("ArrowDown");
  await expect(arabic).toBeFocused();
  expect(
    (await new AxeBuilder({ page }).include('[data-variant="expanded"][role="region"]').analyze()).violations,
  ).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("bounded-arabic-magnification.png") });
});
