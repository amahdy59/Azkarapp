import { expect, test } from "@playwright/test";
import { listeningCases, listeningTiming, openListeningPage } from "./helpers/quran-listening";
import { t } from "../src/app/i18n";

for (const scenario of [
  {
    name: "phone-ar-light",
    width: 390,
    height: 844,
    language: "ar",
    themeMode: "light",
    appMaterial: "solid",
    enlarged: false,
  },
  {
    name: "narrow-en-glass",
    width: 320,
    height: 568,
    language: "en",
    themeMode: "midnight",
    appMaterial: "glass",
    enlarged: true,
  },
  {
    name: "tablet-en-light",
    width: 820,
    height: 1180,
    language: "en",
    themeMode: "light",
    appMaterial: "solid",
    enlarged: false,
  },
  {
    name: "desktop-ar-glass",
    width: 1440,
    height: 1000,
    language: "ar",
    themeMode: "midnight",
    appMaterial: "glass",
    enlarged: false,
  },
] as const) {
  for (const item of [listeningCases[0], listeningCases[3]]) {
    test(`Mushaf word cue and footer recovery ${item.id} ${scenario.name} @cross-browser`, async ({
      page,
    }, testInfo) => {
      const player = await openListeningPage(page, item, scenario.language, scenario);
      await page.setViewportSize({ width: scenario.width, height: scenario.height });
      await expect(page.getByTestId("reader-screen")).toHaveAttribute(
        "data-reader-layout",
        scenario.width >= 768 ? "desktop" : "mobile",
      );
      if ((await player.getAttribute("data-variant")) === "compact")
        await player.getByRole("button", { name: t(scenario.language, "audioPlayer.expand"), exact: true }).click();
      if (scenario.enlarged)
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "32px";
        });
      await expect(player.locator(".audio-expanded-header select")).toHaveCount(0);
      const verse = listeningTiming(item).verses.find((verse) => (verse.words?.length ?? 0) > 1)!;
      await page.evaluate(
        (time) => {
          const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
          audio.currentTime = time;
          audio.dispatchEvent(new Event("timeupdate"));
        },
        (verse.words![0]!.startMs + 1) / 1000,
      );
      const active = player.locator('[data-playback-word="true"]');
      await expect(active).toHaveCount(1);
      await expect(active).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const paint = await active.evaluate((word) => {
        const style = getComputedStyle(word);
        const neighbor = word
          .closest(".mushaf-page-canvas")!
          .querySelector('[data-playback-verse]:not([data-playback-word="true"])')!;
        return {
          outline: style.outlineStyle,
          shadow: style.boxShadow,
          decoration: style.textDecorationLine,
          background: style.backgroundColor,
          neighbor: getComputedStyle(neighbor).backgroundColor,
        };
      });
      expect(paint.outline).toBe("none");
      expect(paint.shadow).toBe("none");
      expect(paint.decoration).toBe("none");
      expect(paint.background).not.toBe("rgba(0, 0, 0, 0)");
      expect(paint.neighbor).toBe("rgba(0, 0, 0, 0)");
      const viewport = player.locator(".audio-expanded-text");
      await viewport.focus();
      await page.keyboard.press("ArrowDown");
      const resume = player.getByRole("button", {
        name: t(scenario.language, "quranListening.returnToVerse"),
        exact: true,
      });
      await expect(resume).toBeVisible();
      expect(await resume.evaluate((button) => Boolean(button.closest(".audio-focus-actions")))).toBe(true);
      const verifyTools = async () => {
        const tools = await player.locator(".audio-focus-actions button").evaluateAll((buttons) =>
          buttons.map((button) => {
            const bounds = button.getBoundingClientRect();
            const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
            return { width: bounds.width, height: bounds.height, hit: hit === button || button.contains(hit) };
          }),
        );
        for (const tool of tools) {
          expect(tool.width).toBeGreaterThanOrEqual(44);
          expect(tool.height).toBeGreaterThanOrEqual(44);
          expect(tool.hit).toBe(true);
        }
      };
      // Very short enlarged surfaces retain the whole-player scroll fallback.
      await resume.scrollIntoViewIfNeeded();
      await verifyTools();
      await player.getByTestId("audio-focus-toggle").click();
      await expect(player).toHaveAttribute("data-listening-focus");
      await verifyTools();
      const spacing = await player.evaluate((element) => {
        const view = element.querySelector(".audio-expanded-text")!;
        const tools = element.querySelector(".audio-focus-actions")!.getBoundingClientRect();
        const paper = element.querySelector(".audio-listening-stream");
        return {
          overlap: view.getBoundingClientRect().bottom - tools.top,
          padding: paper ? getComputedStyle(paper).paddingBottom : "0px",
          margin: getComputedStyle(view).marginTop,
        };
      });
      expect(spacing.overlap).toBeLessThanOrEqual(1);
      expect(spacing.padding).toBe("0px");
      expect(spacing.margin).toBe("0px");
      await player.screenshot({ path: testInfo.outputPath(`focus-${item.id}-${scenario.name}.png`), scale: "css" });
      await resume.click();
      await expect(viewport).toBeFocused();
      await expect(resume).toHaveCount(0);
      await expect(player).toHaveAttribute("data-listening-focus");
      await page.emulateMedia({ forcedColors: "active" });
      await expect(active).toHaveCSS("outline-style", "solid");
      await expect(active).toHaveCSS("outline-width", "2px");
      await page.emulateMedia({ forcedColors: "none" });
      await player.getByTestId("audio-focus-toggle").click();
      await expect(player.getByTestId("audio-focus-toggle")).toBeFocused();
      expect(
        await page.evaluate(() => (window as unknown as { __listeningAudioCount: number }).__listeningAudioCount),
      ).toBe(1);
    });
  }
}

test("exact Mushaf glyphs retain word geometry and clear neighboring ayah ink @cross-browser", async ({
  page,
}, testInfo) => {
  const item = listeningCases[0];
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const player = await openListeningPage(page, item, "ar", {
    themeMode: "light",
    appMaterial: "solid",
    reduceMotion: false,
  });
  await expect(player.locator("[data-mushaf-page]")).toBeVisible();
  // Page 42 has its own shipped, verified QCF font; no external font request is needed.
  const verse = listeningTiming(item).verses.find((verse) => verse.verseKey === "2:255")!;
  await page.evaluate(
    (time) => {
      const audio = (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio;
      audio.currentTime = time;
      audio.dispatchEvent(new Event("timeupdate"));
    },
    (verse.words![3]!.startMs + 1) / 1000,
  );
  const paper = player.locator('[data-mushaf-page="42"]');
  await expect(paper).toHaveAttribute("data-mushaf-rendering", "qcf-v2");
  const word = paper.locator('[data-playback-word="true"]');
  await expect(word).toHaveCount(1);
  await expect(word).toHaveCSS("outline-style", "none");
  await expect(word).toHaveCSS("animation-name", "mushaf-word-arrive");
  const marker = paper.locator('[data-current-ayah-marker="true"]');
  await expect(marker).toHaveCount(1);
  await expect(marker).toHaveCSS("outline-style", "none");
  await expect(marker).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(paper.locator('[data-playback-verse]:not([data-playback-word="true"])').first()).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  const geometry = await word.boundingBox();
  await player.getByRole("button", { name: t("ar", "audioPlayer.options"), exact: true }).click();
  const toggle = page.getByRole("button", { name: t("ar", "quranListening.estimatedWords"), exact: true });
  await toggle.click();
  await expect(word).toHaveCount(0);
  await expect(marker).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await toggle.click();
  await expect(word).toHaveCount(1);
  await expect.poll(async () => (await word.boundingBox())!.width).toBeCloseTo(geometry!.width, 1);
  await expect.poll(async () => (await word.boundingBox())!.height).toBeCloseTo(geometry!.height, 1);
  await page.keyboard.press("Escape");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(word).toHaveCSS("animation-name", "none");
  await player.screenshot({ path: testInfo.outputPath("exact-glyphs-normal.png"), scale: "css" });
  await player.getByTestId("audio-focus-toggle").click();
  await expect(player).toHaveAttribute("data-listening-focus");
  await player.locator(".audio-expanded-text").focus();
  await page.keyboard.press("ArrowDown");
  await expect(player.locator(".audio-focus-actions .audio-listening-resume")).toBeVisible();
  await player.screenshot({ path: testInfo.outputPath("exact-glyphs-focus.png"), scale: "css" });
});
