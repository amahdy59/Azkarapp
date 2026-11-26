import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import records from "../src/app/audio/mushafAudio.data.json" with { type: "json" };
import { t } from "../src/app/i18n";
import { getSurahMeta } from "../src/app/content/surahInfo";
import { listeningCases, openListeningPage } from "./helpers/quran-listening";

test.use({ serviceWorkers: "block" });
for (const language of ["ar", "en"] as const) {
  test(`Mushaf keeps the selected audio surah on a shared page ${language} @cross-browser`, async ({ page }) => {
    await openListeningPage(page, listeningCases[0], language);
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 900 });
    await page.evaluate(() => {
      window.location.hash = "/quran/604";
    });
    await expect(page.locator('[data-mushaf-page="604"]').first()).toBeVisible();
    for (const surah of [112, 113, 114]) {
      const metadata = getSurahMeta(surah)!;
      await page
        .getByTestId("mushaf-rail-index")
        .or(page.getByTestId("mushaf-top-center-index"))
        .or(page.getByTestId("mushaf-furniture-surah-btn"))
        .first()
        .click();
      const index = page.getByTestId("mushaf-index-modal").or(page.getByTestId("mushaf-index-inline"));
      await index.getByText(language === "ar" ? metadata.nameArabic : metadata.nameEnglish, { exact: true }).click();
      await expect(index).toBeHidden();
      const direct = page.getByTestId("mushaf-rail-listen");
      if (await direct.isVisible()) await direct.click();
      else {
        await page.getByTestId("mushaf-more-actions").click();
        await page.getByTestId("mushaf-quick-audio").click();
      }
      const recording = records.find((item) => item.surah === surah)!.variants[0]!;
      await expect
        .poll(() =>
          page.evaluate(() => (window as unknown as { __listeningAudio: HTMLAudioElement }).__listeningAudio.src),
        )
        .toContain(recording.sha256);
      await expect(page.locator('[data-mushaf-page="604"]').first()).toBeVisible();
    }
  });
  test(`Mushaf starts exact complete-surah audio and switches native reciters ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 900 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
      const OriginalAudio = window.Audio;
      Object.defineProperty(window, "Audio", {
        value: function () {
          const audio = new OriginalAudio();
          Object.assign(window, { __mushafLibraryAudio: audio });
          return audio;
        },
      });
    }, language);
    const record = records.find((item) => item.surah === 1)!;
    expect(record.variants).toHaveLength(2); // Source coverage rejected the third candidate.
    const files = new Map<string, Buffer>();
    for (const variant of record.variants) {
      const file = variant.voiceId === "mp3quran-al-minshawi" ? "fatihah-minshawi.mp3" : "fatihah-dosari.mp3";
      const bytes = await readFile(`docs/audio/expanded-library/media/${file}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(variant.sha256);
      files.set(variant.relativePath, bytes);
    }
    await page.route("**/*.r2.dev/**", async (route) => {
      const path = new URL(route.request().url()).pathname.slice(1),
        bytes = files.get(path);
      if (!bytes) return route.abort();
      const range = /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range ?? "");
      const start = range ? Number(range[1]) : 0,
        end = range?.[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
      await route.fulfill({
        status: range ? 206 : 200,
        contentType: "audio/mpeg",
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Length": String(end - start + 1),
          ...(range ? { "Content-Range": `bytes ${start}-${end}/${bytes.length}` } : {}),
        },
        body: bytes.subarray(start, end + 1),
      });
    });
    await page.goto("/#/quran/1");
    await expect(page.locator("[data-mushaf-line-content]").first()).toBeVisible();
    const direct = page.getByTestId("mushaf-rail-listen");
    if (await direct.isVisible()) await direct.click();
    else {
      await page.getByTestId("mushaf-more-actions").click();
      await page.getByTestId("mushaf-quick-audio").click();
    }
    const player = page.getByRole("region", { name: t(language, "audioPlayer.region"), exact: true });
    await expect(player).toBeVisible();
    const native = () =>
      page.evaluate(() => {
        const audio = (window as unknown as { __mushafLibraryAudio: HTMLAudioElement }).__mushafLibraryAudio;
        return {
          src: audio?.src,
          time: audio?.currentTime,
          playing: audio ? !audio.paused : false,
          error: audio?.error?.code ?? null,
        };
      });
    await expect.poll(async () => (await native()).playing && (await native()).time > 0.1).toBe(true);
    expect((await native()).error).toBeNull();
    expect((await native()).src).toContain(record.variants[0]!.sha256);
    await player.getByRole("button", { name: t(language, "audioPlayer.pause"), exact: true }).click();
    await expect.poll(async () => (await native()).playing).toBe(false);
    await page.getByTestId("audio-compact-title").click();
    await page.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true }).click();
    const reciter = page.getByTestId("audio-reciter-select");
    await reciter.click();
    await expect(page.getByRole("option")).toHaveCount(2);
    await page
      .getByRole("option", { name: language === "ar" ? "ياسر الدوسري" : "Yasser Al-Dosari", exact: true })
      .click();
    await expect.poll(async () => (await native()).src.includes(record.variants[1]!.sha256)).toBe(true);
    await expect.poll(async () => (await native()).playing).toBe(false);
    await page.keyboard.press("Escape");
    await player.getByRole("button", { name: t(language, "audioPlayer.play"), exact: true }).click();
    await expect.poll(async () => (await native()).playing && (await native()).time > 0.1).toBe(true);
    expect((await native()).error).toBeNull();
    expect(
      await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.audio-preferences.v1")!).quranReciterId),
    ).toBe("mp3quran-yasser-al-dosari");
  });
}
