import type { Page } from "@playwright/test";

/** Layout checks need a persistent player, independent of network/media events. */
export async function installStableLayoutAudio(page: Page) {
  await page.addInitScript(() => {
    class LayoutAudio extends EventTarget {
      private source = "";
      get src() {
        return this.source;
      }
      set src(value: string) {
        this.source = value ? new URL(value, location.href).href : "";
      }
      currentTime = 0;
      duration = 120;
      volume = 1;
      muted = false;
      playbackRate = 1;
      paused = true;
      ended = false;
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
      removeAttribute(name: string) {
        if (name === "src") this.src = "";
      }
    }
    Object.defineProperty(window, "Audio", { value: LayoutAudio });
  });
}
