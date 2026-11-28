import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import partitions from "../src/app/audio/ownerTimingPartitions.json" with { type: "json" };
import { expandOwnerTiming, type OwnerTimingPack } from "../src/app/audio/ownerTimingPreviews";

test.use({ serviceWorkers: "block" });
test("@cross-browser additional exact-file estimates load on demand, keep gaps and retain focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(/\/__browser-test-api(?:\/|\?|$)/, (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
    class EstimatedAudio extends EventTarget {
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
        Object.assign(window, { __estimatedAudio: this });
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
    Object.defineProperty(window, "Audio", { value: EstimatedAudio });
  });
  const entries = getAzkarForMode("evening", "complete");
  const index = entries.findIndex((entry) => entry.id === "e-hm-78e");
  expect(index).toBeGreaterThanOrEqual(0);
  const partition = partitions[0]!;
  const pack = JSON.parse(
    gunzipSync(readFileSync(`docs/audio/timing-assets/${partition.sha256}.bin`)).toString(),
  ) as OwnerTimingPack;
  const digest = createHash("sha256").update(entries[index]!.arabicText).digest("hex");
  const record = pack.records.find((record) => record.h === digest && record.v.some((id) => id.includes("e-hm-78e")))!;
  expect(record).toBeTruthy();
  const annotation = expandOwnerTiming(pack, record, entries[index]!.arabicText);
  if (!("words" in annotation)) throw new Error("Expected ordinary-text estimates");
  const timingRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("__timing-assets__")) timingRequests.push(request.url());
  });
  await page.goto(`/#/azkar/evening/${index + 1}?mode=complete`);
  expect(timingRequests).toHaveLength(0);
  await page.getByTestId("reader-audio-dock-button").click();
  const player = page.getByRole("region", { name: "Audio player", exact: true });
  await player.getByRole("button", { name: "Expand player", exact: true }).click();
  const trigger = player.getByRole("button", { name: "Audio options", exact: true });
  await trigger.click();
  const options = page.getByRole("dialog", { name: "Audio options", exact: true });
  await options.getByTestId("audio-reciter-select").click();
  await page.getByRole("option", { name: "Muhammad Jumah", exact: true }).click();
  expect(
    await page.evaluate(() =>
      new URL((window as unknown as { __estimatedAudio: HTMLAudioElement }).__estimatedAudio.src).searchParams.get(
        "sha256",
      ),
    ),
  ).toBe(record.s);
  const readingOptions = options.locator(".audio-reading-options");
  await readingOptions.locator("summary").click();
  await expect(readingOptions.getByRole("button", { name: "Estimated word highlights", exact: true })).toBeVisible();
  expect(timingRequests).toHaveLength(1);
  expect(timingRequests[0]).toContain(partition.sha256);
  await page.keyboard.press("Escape");
  const reading = player.getByRole("region", { name: "Now playing", exact: true });
  await reading.focus();
  const seek = async (time: number) =>
    page.evaluate((time) => {
      const audio = (window as unknown as { __estimatedAudio: HTMLAudioElement }).__estimatedAudio;
      audio.currentTime = time;
      audio.dispatchEvent(new Event("timeupdate"));
    }, time);
  await seek((annotation.words[0]!.startMs + 1) / 1000);
  await expect(player.locator("[data-listening-word]")).toHaveCount(1);
  await expect(reading).toBeFocused();
  const gap = annotation.words.find(
    (word, index) => annotation.words[index + 1] && annotation.words[index + 1]!.startMs - word.endMs > 40,
  );
  expect(gap).toBeTruthy();
  await seek((gap!.endMs + 10) / 1000);
  await expect(player.locator("[data-listening-word]")).toHaveCount(0);
  await expect(reading).toBeFocused();
  await trigger.click();
  await expect(options).toBeVisible();
  expect(timingRequests).toHaveLength(1);
});
