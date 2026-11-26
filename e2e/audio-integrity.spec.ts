import { playEnglishTranslation } from "./reader-options";
import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { COMPREHENSIVE_DUAS } from "../src/app/content/comprehensiveDuas";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { OWNER_TIMING_PACK_SHA, expandOwnerTiming, type OwnerTimingPack } from "../src/app/audio/ownerTimingPreviews";

test.use({ serviceWorkers: "block" });

test("complete Al-Imran reading offers its exact recording without stale word cues @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  const collection = getAzkarForMode("waking_up", "complete");
  const index = collection.findIndex((entry) => entry.id === "wu-hm-4");
  expect(index).toBeGreaterThanOrEqual(0);
  await page.goto(`/#/azkar/waking-up/${index + 1}?mode=complete`);
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", "wu-hm-4");
  const listen = page.getByTestId("reader-audio-dock-button");
  await expect(listen).toBeEnabled();
  await listen.click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await expect(player).toBeVisible();
  const source = await page.evaluate(
    () => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src,
  );
  expect(source).toContain("quran/wu-hm-4/abdullah-muhammad/v1/wu-hm-4.mp3");
  expect(new URL(source).searchParams.get("sha256")).toBe(
    "f4ba5b49fef6bb91d693276907cb6d6bdfac22118b768fe13ebb1625516d4607",
  );
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  await page.evaluate(() => {
    const audio = (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio;
    audio.duration = 282.432;
    audio.currentTime = 220;
    audio.dispatchEvent(new Event("loadedmetadata"));
    audio.dispatchEvent(new Event("timeupdate"));
  });
  await expect(player.locator("[data-listening-word]")).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.paused),
  ).toBe(false);
  await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
  await expect(player).toHaveCount(0);
  await expect(page.getByTestId("counter-surface")).toBeFocused();
});

async function prepareAudio(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (!localStorage.getItem("azkarapp.state.v1"))
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
      );
    class ReviewAudio extends EventTarget {
      src = "";
      currentTime = 0;
      duration = 120;
      volume = 1;
      muted = false;
      playbackRate = 1;
      paused = true;
      ended = false;
      constructor() {
        super();
        Object.assign(window, { __reviewAudio: this });
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
    Object.defineProperty(window, "Audio", { value: ReviewAudio });
  });
}

test("Aa reader settings retain keyboard focus, persisted text sizing and accessible controls @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  await page.goto("/#/azkar/morning/1");
  const trigger = page.getByTestId("reader-settings-button");
  await expect(trigger).toHaveAccessibleName("Appearance");
  await trigger.focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByTestId("reader-appearance-menu");
  await expect(sheet).toBeVisible();
  await sheet.getByTestId("reader-display-text-size-large").click();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.textSize))
    .toBe("large");
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("corrected Friday dua keeps reading available while its old recording is suspended @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  const collection = COMPREHENSIVE_DUAS.filter((zikr) => !zikr.isCollectionIntroduction);
  const index = collection.findIndex((zikr) => zikr.id === "friday-dua-18");
  expect(index).toBeGreaterThanOrEqual(0);
  await page.goto(`/#/azkar/comprehensive-duas/${index + 1}?mode=complete`);
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", "friday-dua-18");
  await expect(page.getByTestId("zikr-text")).toContainText("الثبات");
  await expect(page.getByTestId("reader-audio-dock-button")).toBeDisabled();
  await expect(page.getByRole("region", { name: "Audio player", exact: true })).toHaveCount(0);
  await expect(page.locator("[data-listening-word]")).toHaveCount(0);
  await page.getByTestId("reader-benefit-dock-button").click();
  await expect(page.getByTestId("reference-source")).toContainText("1304");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("reader-benefit-dock-button")).toBeFocused();
});

test("English narrated words retain readable contrast in light and dark travel palettes @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  const entries = getAzkarForMode("travel", "complete");
  const index = entries.findIndex((entry) => entry.id === "tr-ref-1");
  const pack: OwnerTimingPack = JSON.parse(
    gunzipSync(readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`)).toString(),
  );
  await page.goto(`/#/azkar/travel/${index + 1}?mode=complete`);
  for (const themeMode of ["light", "midnight", "dark"]) {
    await page.evaluate((themeMode) => {
      const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
      state.settings.themeMode = themeMode;
      localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
    }, themeMode);
    await page.reload();
    await page.getByRole("button", { name: "Reader options", exact: true }).click();
    await playEnglishTranslation(page);
    const player = page.getByRole("region", { name: "Audio player", exact: true });
    await player.getByRole("button", { name: "Expand player", exact: true }).click();
    const source = await page.evaluate(
      () => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src,
    );
    const record = pack.records.find(
      (record) => record.l === "en" && record.s === new URL(source).searchParams.get("sha256"),
    )!;
    const annotation = expandOwnerTiming(pack, record, entries[index]!.translation!);
    if (!("words" in annotation)) throw new Error("Expected English timing");
    await page.evaluate(
      (time) => {
        const audio = (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio;
        audio.currentTime = time;
        audio.dispatchEvent(new Event("timeupdate"));
      },
      (annotation.words[0]!.startMs + 1) / 1000,
    );
    const word = player.locator("[data-listening-word]");
    await expect(word).toHaveCount(1);
    await expect
      .poll(() =>
        word.evaluate((element) => {
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext("2d")!;
          const ancestors: Element[] = [];
          for (let current: Element | null = element; current; current = current.parentElement)
            ancestors.unshift(current);
          for (const ancestor of ancestors) {
            ctx.fillStyle = getComputedStyle(ancestor).backgroundColor;
            ctx.fillRect(0, 0, 1, 1);
          }
          const background = ctx.getImageData(0, 0, 1, 1).data;
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = getComputedStyle(element).color;
          ctx.fillRect(0, 0, 1, 1);
          const foreground = ctx.getImageData(0, 0, 1, 1).data;
          const luminance = (color: Uint8ClampedArray) =>
            [0, 1, 2].reduce((sum, i) => {
              const channel = color[i]! / 255;
              return (
                sum +
                (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) *
                  [0.2126, 0.7152, 0.0722][i]!
              );
            }, 0);
          const a = luminance(background),
            b = luminance(foreground);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        }),
      )
      .toBeGreaterThanOrEqual(4.5);
    await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
    await expect(player).toHaveCount(0);
  }
});

for (const id of ["m-hm-91", "e-hm-91", "misc-ref-3", "m-hm-96", "e-hm-96", "friday-dua-08"]) {
  test(`restored Arabic ${id} keeps counting and explicit English playback @cross-browser`, async ({ page }) => {
    await prepareAudio(page);
    const category = id.startsWith("e-")
      ? "evening"
      : id === "misc-ref-3"
        ? "miscellaneous"
        : id === "friday-dua-08"
          ? "comprehensive_duas"
          : "morning";
    const collection =
      id === "friday-dua-08"
        ? COMPREHENSIVE_DUAS.filter((zikr) => !zikr.isCollectionIntroduction)
        : getAzkarForMode(category, "complete");
    const index = collection.findIndex((zikr) => zikr.id === id);
    await page.goto(`/#/azkar/${category.replaceAll("_", "-")}/${index + 1}?mode=complete`);
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", id);
    const listen = page.getByTestId("reader-audio-dock-button");
    await expect(listen).toBeEnabled();
    await listen.click();
    const player = page.getByRole("region", { name: "Audio player", exact: true });
    await expect(player).toBeVisible();
    const path = id === "friday-dua-08" ? "friday-dua-08" : id.endsWith("96") ? "m-hm-96" : "m-hm-91";
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
      .toContain(`/dua/${path}/abdullah-muhammad/v2/`);
    await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
    const counter = page.getByTestId("counter-surface");
    if (id !== "friday-dua-08") {
      await counter.click();
      await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
      await page.reload();
      await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
    }
    await page.getByRole("button", { name: "Reader options", exact: true }).click();
    await playEnglishTranslation(page);
    await expect(player).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
      .toContain("/english-george/");
    await player.getByRole("button", { name: "Expand player", exact: true }).click();
    await player.getByRole("button", { name: "Audio options", exact: true }).click();
    const options = page.getByRole("dialog", { name: "Audio options", exact: true });
    await expect(options.getByTestId("audio-reciter-select")).toContainText("English Translation");
    await options.getByTestId("audio-reciter-select").click();
    await expect(page.getByRole("option", { name: "Abdullah Muhammad", exact: true })).not.toHaveAttribute(
      "data-disabled",
    );
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
    if (id !== "friday-dua-08") await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
    await expect(listen).toBeEnabled();
  });
}

test("a displayed partial tally survives reload without lifecycle flushing @cross-browser", async ({ page }) => {
  await prepareAudio(page);
  const id = "e-hm-96";
  const position = getAzkarForMode("evening", "complete").findIndex((zikr) => zikr.id === id) + 1;
  await page.goto(`/#/azkar/evening/${position}?mode=complete`);
  const counter = page.getByTestId("counter-surface");
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", id);
  await page.evaluate(() => {
    const block = (event: Event) => event.stopImmediatePropagation();
    window.addEventListener("pagehide", block, { capture: true });
    window.addEventListener("beforeunload", block, { capture: true });
    document.addEventListener("visibilitychange", block, { capture: true });
  });
  await counter.click();
  await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
  expect(
    await page.evaluate((id) => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).partialZikrCounts[id], id),
  ).toBe(1);
  await page.reload();
  await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
});

test("ordinary Reader retains an early Listen tap while audio code loads @cross-browser", async ({ page }) => {
  await prepareAudio(page);
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/audio-*.js", async (route) => {
    await delayed;
    await route.continue();
  });
  const index = getAzkarForMode("evening", "complete").findIndex((zikr) => zikr.id === "e-hm-91");
  await page.goto(`/#/azkar/evening/${index + 1}?mode=complete`);
  await page.getByTestId("reader-audio-dock-button").click();
  await expect(page.getByTestId("reader-audio-dock-button")).toHaveAttribute("aria-busy", "true");
  release();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await expect(player).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
    .toContain("/dua/m-hm-91/abdullah-muhammad/v2/");
});

test("Al-Kahf retains its default alongside verified Quran reciters and Escape preserves the expanded player @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  await page.goto("/#/azkar/friday-kahf/1");
  await page.getByRole("button", { name: "Listen to surah", exact: true }).click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  await player.getByRole("button", { name: "Audio options", exact: true }).click();
  const options = page.getByRole("dialog", { name: "Audio options", exact: true });
  await expect(options.getByTestId("audio-reciter-select")).toContainText("Muhammad Shari");
  await options.getByTestId("audio-reciter-select").click();
  await expect(page.getByRole("option")).toHaveCount(4);
  await expect(page.getByRole("option", { name: "Muhammad Shari", exact: true })).not.toHaveAttribute("data-disabled");
  for (const name of ["English Translation", "Abdullah Muhammad", "Muhammad Moataz"])
    await expect(page.getByRole("option", { name, exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(player).toHaveAttribute("data-variant", "expanded");
  await expect(options.getByTestId("audio-reciter-select")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
    .toContain("/muhammad-alshara/");
});
