import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { FRIDAY_KAHF } from "../src/app/content/fridayKahf";
import { t } from "../src/app/i18n";
import { splitMushafPages } from "../src/app/content/mushafPages";
import { listeningCases, listeningTiming, openListeningPage } from "./helpers/quran-listening";

for (const scenario of [
  { name: "narrow-ar", width: 320, height: 568, language: "ar", enlarged: false },
  { name: "narrow-en-enlarged", width: 320, height: 568, language: "en", enlarged: true },
  { name: "phone-ar-enlarged", width: 390, height: 844, language: "ar", enlarged: true },
  { name: "landscape-ar", width: 844, height: 390, language: "ar", enlarged: false },
] as const) {
  test(`fixed listening header and transport remain reachable: ${scenario.name} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const player = await openListeningPage(page, listeningCases[0], scenario.language);
    await page.setViewportSize({ width: scenario.width, height: scenario.height });
    if (scenario.enlarged)
      await page.locator("html").evaluate((element) => {
        element.style.fontSize = "32px";
      });
    // The existing Reader shell remounts its dock at the desktop breakpoint.
    await expect(page.getByTestId("reader-screen")).toHaveAttribute(
      "data-reader-layout",
      scenario.width >= 768 ? "desktop" : "mobile",
    );
    if ((await player.getAttribute("data-variant")) === "compact") {
      await player.getByRole("button", { name: t(scenario.language, "audioPlayer.expand"), exact: true }).click();
    }
    const header = player.locator(".audio-expanded-header");
    await expect(header.locator("[data-listening-controls]")).toHaveCount(1);
    await expect(player.locator("[data-mushaf-page]")).toBeVisible();
    await testInfo.attach("reading-layout", {
      contentType: "application/json",
      body: JSON.stringify(
        await player.evaluate((element) => {
          const viewport = element.querySelector(".audio-expanded-text")!;
          const bounds = viewport.getBoundingClientRect();
          const words = Array.from(viewport.querySelectorAll("[data-listening-verse]")).map((word) => {
            const ink = word.getBoundingClientRect();
            return { top: ink.top, bottom: ink.bottom, height: ink.height };
          });
          return {
            reading: { top: bounds.top, bottom: bounds.bottom, height: bounds.height, scrollTop: viewport.scrollTop },
            words,
          };
        }),
      ),
    });
    await expect
      .poll(() =>
        player.locator(".audio-expanded-text").evaluate((viewport) => {
          const bounds = viewport.getBoundingClientRect();
          const visibleInk = Array.from(viewport.querySelectorAll("[data-listening-verse]")).some((word) => {
            const ink = word.getBoundingClientRect();
            return ink.bottom > bounds.top && ink.top < bounds.bottom && ink.width > 0 && ink.height > 0;
          });
          return { visibleInk, readingHeight: bounds.height, scrollTop: viewport.scrollTop };
        }),
      )
      .toMatchObject({ visibleInk: true });
    const regions = await player.evaluate((element) => {
      const header = element.querySelector(".audio-expanded-header")!.getBoundingClientRect();
      const reading = element.querySelector(".audio-expanded-text")!.getBoundingClientRect();
      return { gap: reading.top - header.bottom, overflow: element.scrollWidth - element.clientWidth };
    });
    expect(regions.gap).toBeGreaterThanOrEqual(-1);
    expect(regions.overflow).toBeLessThanOrEqual(1);
    const targets = await header.getByRole("button").evaluateAll((buttons) =>
      buttons.map((button) => {
        const bounds = button.getBoundingClientRect();
        const header = button.closest(".audio-expanded-header")!.getBoundingClientRect();
        return {
          width: bounds.width,
          height: bounds.height,
          inside:
            bounds.left >= header.left - 1 &&
            bounds.right <= header.right + 1 &&
            bounds.top >= header.top - 1 &&
            bounds.bottom <= header.bottom + 1,
        };
      }),
    );
    for (const target of targets) {
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
      expect(target.inside).toBe(true);
    }
    const options = player.getByRole("button", { name: t(scenario.language, "audioPlayer.options"), exact: true });
    await expect(
      header.getByRole("button", { name: t(scenario.language, "quranListening.information"), exact: true }),
    ).toHaveCount(0);
    const alignment = await header.evaluate((element) => {
      const options = element.querySelector(".audio-options-trigger")!.getBoundingClientRect();
      const navigation = element.querySelector("[data-listening-controls]")!.getBoundingClientRect();
      const header = element.getBoundingClientRect();
      return {
        centerOffset:
          (Math.min(options.left, navigation.left) + Math.max(options.right, navigation.right)) / 2 -
          (header.left + header.width / 2),
        rowOffset: options.top + options.height / 2 - navigation.top - navigation.height / 2,
      };
    });
    expect(Math.abs(alignment.centerOffset)).toBeLessThanOrEqual(2);
    if (!scenario.enlarged) expect(Math.abs(alignment.rowOffset)).toBeLessThanOrEqual(2);
    await options.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: t(scenario.language, "audioPlayer.options"), exact: true });
    await expect(dialog).toBeVisible();
    expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(options).toBeFocused();
    await expect(header.locator("[data-listening-controls]")).toBeVisible();
    const navigationBounds = await header.locator("[data-listening-controls]").boundingBox();
    const headerBounds = await header.boundingBox();
    expect(navigationBounds!.y + navigationBounds!.height).toBeLessThanOrEqual(
      headerBounds!.y + headerBounds!.height + 1,
    );
    await header.getByRole("button", { name: t(scenario.language, "audioPlayer.collapse"), exact: true }).focus();
    await player.locator(".audio-expanded-layout").evaluate((element) => {
      element.scrollTop = 0;
    });
    await player.screenshot({ path: testInfo.outputPath(`quran-header-${scenario.name}.png`) });
  });
}

for (const item of listeningCases.filter((item) => item.id === "ir-baqarah")) {
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
            gap: parseFloat(verse.marginBottom),
            topPadding: parseFloat(verse.paddingTop),
            bottomPadding: parseFloat(verse.paddingBottom),
            leftPadding: parseFloat(verse.paddingLeft),
            rightPadding: parseFloat(verse.paddingRight),
          };
        });
        expect(typography.direction).toBe("ltr");
        expect(typography.align).toBe("start");
        expect(typography.leading).toBeCloseTo(1.65, 5);
        expect(typography.gap).toBe(8);
        expect(typography.topPadding).toBe(8);
        expect(typography.bottomPadding - typography.topPadding).toBe(2);
        expect(typography.leftPadding).toBe(14);
        expect(typography.rightPadding).toBe(typography.leftPadding);
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
      const header = player.locator(".audio-expanded-header");
      await expect(header.locator("[data-listening-controls]")).toHaveCount(1);
      await expect(player.locator(".audio-expanded-text [data-listening-controls]")).toHaveCount(0);
      const navigationTargets = await header.getByRole("button").evaluateAll((buttons) =>
        buttons.map((button) => {
          const { width, height, left, right } = button.getBoundingClientRect();
          const header = button.closest(".audio-expanded-header")!.getBoundingClientRect();
          return { width, height, inside: left >= header.left - 1 && right <= header.right + 1 };
        }),
      );
      for (const target of navigationTargets) {
        expect(target.width).toBeGreaterThanOrEqual(44);
        expect(target.height).toBeGreaterThanOrEqual(44);
        expect(target.inside).toBe(true);
      }
      await expect(page.getByText(t(language, "quranListening.unavailable"), { exact: true })).toHaveCount(0);
      const information = player.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true });
      await information.focus();
      await page.keyboard.press("Enter");
      const explanation = page.getByTestId("quran-listening-preferences");
      await expect(explanation).toBeVisible();
      await expect(explanation.locator("p")).toHaveText(t(language, "quranListening.browseHint"));
      await expect(
        explanation.getByRole("button", { name: t(language, "quranListening.follow"), exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(
        explanation.getByRole("button", { name: t(language, "quranListening.estimatedWords"), exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        (await new AxeBuilder({ page }).include('[data-testid="quran-listening-preferences"]').analyze()).violations,
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
              bounds.top >=
                Math.max(
                  view.getBoundingClientRect().top,
                  word
                    .closest(".floating-audio-player--expanded")!
                    .querySelector("[data-listening-controls]")!
                    .getBoundingClientRect().bottom,
                ) && bounds.bottom <= view.getBoundingClientRect().bottom
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
      const headerTop = (await header.boundingBox())!.y;
      for (const offset of [0, 120, 240]) {
        const scrollLayout = await player.evaluate((element, offset) => {
          const viewport = element.querySelector<HTMLElement>(".audio-expanded-text")!;
          viewport.scrollTop = offset;
          const view = viewport.getBoundingClientRect();
          const toolbar = element.querySelector("[data-listening-controls]")!.getBoundingClientRect();
          const hit = document.elementFromPoint(toolbar.left + toolbar.width / 2, toolbar.top + toolbar.height / 2);
          return {
            gap: view.top - toolbar.bottom,
            headerTop: element.querySelector(".audio-expanded-header")!.getBoundingClientRect().top,
            toolbarHit: Boolean(hit?.closest("[data-listening-controls]")),
          };
        }, offset);
        expect(scrollLayout.gap).toBeGreaterThanOrEqual(-1);
        expect(Math.abs(scrollLayout.headerTop - headerTop)).toBeLessThanOrEqual(1);
        expect(scrollLayout.toolbarHit).toBe(true);
      }
      await expect(paper.getByRole("button")).toHaveCount(0);
      const next = player.getByRole("combobox");
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
      await next.selectOption({ value: "1" });
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
      await next.selectOption({ value: "10" });
      await expect(player.getByTestId("audio-quran-fallback-text")).toHaveText(
        splitMushafPages(zikr.arabicText, zikr.mushafPages!)[10]!.text,
      );
      await page.context().setOffline(false);
      await player.getByRole("button", { name: t(language, "audioPlayer.retry"), exact: true }).click();
      await expect(player.locator(`[data-mushaf-page="${zikr.mushafPages![10]!.page}"]`)).toBeVisible();
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
      // Fold while the current layout is stable. Resizing can remount the
      // responsive player, detaching a Minimize target read from the old layout.
      await player.getByRole("button", { name: t(language, "audioPlayer.collapse"), exact: true }).click();
      await expect(player).toHaveAttribute("data-variant", "compact");
      await page.setViewportSize({ width: 1440, height: 1100 });
      await page.getByTestId("reader-sidebar-close").click();
      await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
      await expect
        .poll(() => player.locator(".audio-listening-page").evaluate((el) => el.clientHeight))
        .toBeGreaterThan(576);
      const dock = player.locator(".audio-expanded-controls");
      expect((await dock.boundingBox())!.height).toBeLessThanOrEqual(150);
      await player.screenshot({ path: testInfo.outputPath(`${item.id}-mushaf-listening-desktop.png`) });
    });
  }
}
