import { expect, test } from "@playwright/test";
import { getAzkarForMode } from "../src/app/content/azkar";
import { t } from "../src/app/i18n";

test.use({ serviceWorkers: "block" });
for (const language of ["ar", "en"] as const) {
  test(`Al-Mulk offers only approved Quran reciters and keeps dua preferences independent ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
      localStorage.setItem(
        "azkar.audio-preferences.v1",
        JSON.stringify({ duaVoiceId: "opendua-muhammad-jumah", quranReciterId: "alafasy" }),
      );
      // Controlled media clock proves routing/preferences. Original-file decoding is
      // independently covered by verify-quran-reciter-review.mjs before activation.
      class SelectionAudio extends EventTarget {
        src = "";
        currentTime = 0;
        duration = 700;
        volume = 1;
        muted = false;
        playbackRate = 1;
        paused = true;
        ended = false;
        constructor() {
          super();
          Object.assign(window, { __quranSelectionAudio: this });
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
      Object.defineProperty(window, "Audio", { value: SelectionAudio });
    }, language);
    const index = getAzkarForMode("before_sleep", "complete").findIndex((entry) => entry.id === "s-hm-110b");
    expect(index).toBeGreaterThanOrEqual(0);
    await page.goto(`/#/azkar/before-sleep/${index + 1}?mode=complete`);
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", "s-hm-110b");
    await page.getByRole("button", { name: t(language, "reader.listenToSurah"), exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as unknown as { __quranSelectionAudio: HTMLAudioElement }).__quranSelectionAudio.src,
        ),
      )
      .toContain("azkar/before_sleep/abdullah-muhammad/v1/s-hm-110b.mp3");
    await page.getByTestId("audio-compact-title").click();
    await page.getByRole("button", { name: t(language, "audioPlayer.options"), exact: true }).click();
    const reciter = page.getByTestId("audio-reciter-select");
    await expect(reciter).toContainText(language === "ar" ? "عبد الله محمد" : "Abdullah Muhammad");
    const options = [
      { id: "mp3quran-al-minshawi", ar: "محمد صديق المنشاوي", en: "Muhammad Siddiq Al-Minshawi" },
      { id: "mp3quran-al-hussary", ar: "محمود خليل الحصري", en: "Mahmoud Khalil Al-Hussary" },
      { id: "mp3quran-yasser-al-dosari", ar: "ياسر الدوسري", en: "Yasser Al-Dosari" },
    ];
    for (const candidate of options) {
      await reciter.click();
      await expect(page.getByRole("option")).toHaveCount(4);
      await expect(page.getByRole("option", { name: /English Translation|الترجمة الإنجليزية/ })).toHaveCount(0);
      if (candidate === options[0])
        await page.screenshot({ path: info.outputPath(`quran-options-${language}.png`), fullPage: true });
      await page.getByRole("option", { name: candidate[language], exact: true }).click();
      await expect(reciter).toContainText(candidate[language]);
      await expect
        .poll(() =>
          page.evaluate(
            () => (window as unknown as { __quranSelectionAudio: HTMLAudioElement }).__quranSelectionAudio.src,
          ),
        )
        .toContain(`quran/067/${candidate.id}/v1/067.mp3?sha256=`);
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.audio-preferences.v1")!))).toMatchObject({
        quranReciterId: candidate.id,
        duaVoiceId: "opendua-muhammad-jumah",
      });
    }
    await page.screenshot({ path: info.outputPath(`quran-selected-${language}.png`), fullPage: true });
  });
}
