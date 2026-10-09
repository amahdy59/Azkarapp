import { clickReaderOption } from "./reader-options";
import { expect, test, type Page } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { COMPREHENSIVE_DUAS } from "../src/app/content/comprehensiveDuas";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { OWNER_TIMING_PACK_SHA, expandOwnerTiming, type OwnerTimingPack } from "../src/app/audio/ownerTimingPreviews";

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

test("owner-reviewed Friday dua loads exact registered timings and clears cues on opt-out and voice change @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  const collection = COMPREHENSIVE_DUAS.filter((zikr) => !zikr.isCollectionIntroduction);
  const index = collection.findIndex((zikr) => zikr.id === "friday-dua-18");
  expect(index).toBeGreaterThanOrEqual(0);
  await page.goto(`/#/azkar/comprehensive-duas/${index + 1}?mode=complete`);
  await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", "friday-dua-18");
  await page.getByTestId("reader-audio-dock-button").click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  const emphasis = player.getByRole("button", { name: "Highlight words", exact: true });
  await expect(emphasis).toHaveAttribute("aria-pressed", "true");
  const clock = async (time: number) =>
    page.evaluate((time) => {
      const audio = (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio;
      audio.currentTime = time;
      audio.dispatchEvent(new Event("timeupdate"));
    }, time);
  await clock(0.5);
  await expect(player.locator("[data-listening-word]")).toHaveText("اللهم");
  await clock(1.2);
  await expect(player.locator("[data-listening-word]")).toHaveText("إني");
  await emphasis.click();
  await expect(player.locator("[data-listening-word]")).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.paused),
  ).toBe(false);
  await emphasis.click();
  await clock(1.05);
  await expect(player.locator("[data-listening-word]")).toHaveCount(0);
  await clock(0.5);
  await expect(player.locator("[data-listening-word]")).toHaveText("اللهم");
  await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
  await page.getByRole("button", { name: "Reader options", exact: true }).click();
  await clickReaderOption(page, "Play English translation");
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  await expect(player.locator('[data-listening-word]:has-text("اللهم")')).toHaveCount(0);
  await expect(player.getByRole("button", { name: "Estimated word highlights", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const pack: OwnerTimingPack = JSON.parse(
    gunzipSync(readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`)).toString(),
  );
  const text = COMPREHENSIVE_DUAS.find((entry) => entry.id === "friday-dua-18")!.translation!;
  const source = await page.evaluate(
    () => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src,
  );
  const { createHash } = await import("node:crypto");
  const digest = createHash("sha256").update(text).digest("hex");
  const audioSha = new URL(source).searchParams.get("sha256");
  expect(audioSha).toMatch(/^[a-f0-9]{64}$/);
  const record = pack.records.find((record) => record.l === "en" && record.h === digest && record.s === audioSha)!;
  const annotation = expandOwnerTiming(pack, record, text);
  if (!("words" in annotation)) throw new Error("Expected English timing");
  const firstWord = annotation.words[0]!;
  await clock((firstWord.startMs + 1) / 1000);
  const englishWord = player.locator("[data-listening-word]");
  await expect(englishWord).toHaveText(text.slice(firstWord.startOffset, firstWord.endOffset));
  expect(await englishWord.evaluate((word) => getComputedStyle(word).color)).not.toBe(
    await englishWord.evaluate((word) => getComputedStyle(word.parentElement!).color),
  );
  expect(await englishWord.evaluate((word) => getComputedStyle(word).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  const geometry = await englishWord.evaluate((word) => ({
    width: word.getBoundingClientRect().width,
    height: word.getBoundingClientRect().height,
    font: getComputedStyle(word).fontSize,
  }));
  const estimated = player.getByRole("button", { name: "Estimated word highlights", exact: true });
  await estimated.click();
  await expect(englishWord).toHaveCount(0);
  await estimated.click();
  await expect(englishWord).toHaveCount(1);
  expect(
    await englishWord.evaluate((word) => ({
      width: word.getBoundingClientRect().width,
      height: word.getBoundingClientRect().height,
      font: getComputedStyle(word).fontSize,
    })),
  ).toEqual(geometry);
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
    await clickReaderOption(page, "Play English translation");
    await expect(player).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
      .toContain("/english-george/");
    await player.getByRole("button", { name: "Expand player", exact: true }).click();
    await expect(player.getByTestId("audio-reciter-select")).toContainText("English Translation");
    await player.getByTestId("audio-reciter-select").click();
    await expect(page.getByRole("option", { name: "Abdullah Muhammad", exact: true })).not.toHaveAttribute(
      "data-disabled",
    );
    await page.keyboard.press("Escape");
    await player.getByRole("button", { name: "Stop audio and close player", exact: true }).click();
    if (id !== "friday-dua-08") await expect(counter).toHaveAccessibleName(/1 \/ 100$/);
    await expect(listen).toBeEnabled();
  });
}

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

test("Al-Kahf offers only its approved reciter and Escape preserves the expanded player @cross-browser", async ({
  page,
}) => {
  await prepareAudio(page);
  await page.goto("/#/azkar/friday-kahf/1");
  await page.getByRole("button", { name: "Listen to surah", exact: true }).click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  await expect(player.getByTestId("audio-reciter-select")).toContainText("Muhammad Shari");
  await player.getByTestId("audio-reciter-select").click();
  for (const name of ["English Translation", "Abdullah Muhammad", "Muhammad Moataz"]) {
    await expect(page.getByRole("option", { name, exact: true })).toHaveAttribute("data-disabled");
  }
  await expect(page.getByRole("option", { name: "Muhammad Shari", exact: true })).not.toHaveAttribute("data-disabled");
  await page.keyboard.press("Escape");
  await expect(player).toHaveAttribute("data-variant", "expanded");
  await expect(player.getByTestId("audio-reciter-select")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __reviewAudio: HTMLAudioElement }).__reviewAudio.src))
    .toContain("/muhammad-alshara/");
});
