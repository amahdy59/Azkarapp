import type { Page } from "@playwright/test";
import { getAzkarForMode } from "../../src/app/content/azkar";
import { t } from "../../src/app/i18n";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import {
  OWNER_TIMING_PACK_SHA,
  expandOwnerTiming,
  type OwnerTimingPack,
} from "../../src/app/audio/ownerTimingPreviews";

export const listeningCases = [
  { id: "ir-baqarah", category: "illness_ruqyah", route: "illness-ruqyah", first: 2, next: 3 },
  { id: "friday-kahf", category: "friday_kahf", route: "friday-kahf", first: 293, next: 294 },
  { id: "s-hm-110a", category: "before_sleep", route: "before-sleep", first: 415, next: 416 },
  { id: "s-hm-110b", category: "before_sleep", route: "before-sleep", first: 562, next: 563 },
] as const;
type ListeningCase = (typeof listeningCases)[number];
const timingPack: OwnerTimingPack = JSON.parse(
  gunzipSync(readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`)).toString(),
);

export function listeningTiming(item: ListeningCase) {
  const record = timingPack.records.find(
    (record) =>
      record.q &&
      record.v.some((id) =>
        id.startsWith(item.id === "ir-baqarah" ? "quran-002" : item.id === "friday-kahf" ? "quran-018" : item.id),
      ),
  )!;
  const annotation = expandOwnerTiming(timingPack, record);
  if (!("verses" in annotation)) throw new Error("Expected Quran timings");
  return annotation;
}

export async function openListeningPage(page: Page, item: ListeningCase, language: "en" | "ar") {
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
      private source = "";
      get src() {
        return this.source;
      }
      set src(value: string) {
        this.source = value ? new URL(value, window.location.href).href : "";
      }
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
    item.id === "friday-kahf" ? 0 : getAzkarForMode(item.category, "complete").findIndex((zikr) => zikr.id === item.id);
  await page.goto(`/#/azkar/${item.route}/${index + 1}`);
  await page.getByRole("button", { name: t(language, "reader.listenToSurah"), exact: true }).click();
  const player = page.getByRole("region", { name: t(language, "audioPlayer.region"), exact: true });
  await player.getByRole("button", { name: t(language, "audioPlayer.expand"), exact: true }).click();
  return player;
}
