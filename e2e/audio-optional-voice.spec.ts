import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { getAzkarForMode } from "../src/app/content/azkar";
import { COMPREHENSIVE_DUAS } from "../src/app/content/comprehensiveDuas";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "../src/app/audio/audioManifest";
import { DEFAULT_AUDIO_PREFERENCES } from "../src/app/audio/audioPreferences";
import { t } from "../src/app/i18n";
import { openDownloadManagement } from "./helpers/downloads";

const pilot: {
  voiceId: string;
  candidates: { assetId: string; file: string; relativePath: string; sha256: string }[];
} = JSON.parse(readFileSync("docs/audio/opendua-pilot/pilot.json", "utf8"));

test.use({ serviceWorkers: "block" });
async function seed(page: Page, language: "ar" | "en", selected = false) {
  await page.addInitScript(
    ({ language, selected, preferences, voiceId }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
      if (!localStorage.getItem("azkar.audio-preferences.v1"))
        localStorage.setItem(
          "azkar.audio-preferences.v1",
          JSON.stringify({ ...preferences, ...(selected ? { duaVoiceId: voiceId } : {}) }),
        );
    },
    { language, selected, preferences: DEFAULT_AUDIO_PREFERENCES, voiceId: pilot.voiceId },
  );
}

for (const language of ["ar", "en"] as const) {
  for (const scenario of [
    { width: 320, scale: 2, material: "glass" },
    { width: 834, scale: 1, material: "solid" },
    { width: 1440, scale: 1, material: "glass" },
  ]) {
    test(`additional reciter menu remains protected ${language} ${scenario.width} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: scenario.width, height: 1000 });
      await seed(page, language);
      await page.addInitScript((scenario) => {
        const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
        Object.assign(state.settings, {
          themeMode: scenario.material === "glass" ? "midnight" : "light",
          appMaterial: scenario.material,
        });
        localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
        document.addEventListener("DOMContentLoaded", () => {
          document.documentElement.style.fontSize = `${scenario.scale * 100}%`;
        });
      }, scenario);
      await page.goto("/#/settings/audio");
      const trigger = page.getByRole("combobox", { name: t(language, "settings.preferredReciter") });
      await trigger.click();
      const menu = page.getByRole("listbox");
      await expect(menu).toHaveAttribute("data-dropdown-surface", "");
      const option = page.getByRole("option", {
        name: language === "ar" ? "محمد جمعة" : "Muhammad Jumah",
        exact: true,
      });
      await option.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          menu.evaluate((element) => {
            const box = element.getBoundingClientRect();
            const background = getComputedStyle(element).backgroundColor;
            return {
              inside: box.left >= 0 && box.right <= innerWidth + 1 && box.top >= 0 && box.bottom <= innerHeight + 1,
              noOverflow: element.scrollWidth <= element.clientWidth + 1,
              opaque: /^(?:rgb|color)\([^/]+\)$/.test(background) && Number(getComputedStyle(element).opacity) === 1,
              hit: element.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)),
            };
          }),
        )
        .toEqual({ inside: true, noOverflow: true, opaque: true, hit: true });
      const bounds = await option.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      await page.screenshot({
        path: info.outputPath(`reciter-menu-${language}-${scenario.width}.png`),
        fullPage: true,
      });
      await page.keyboard.press("Escape");
      await expect(trigger).toBeFocused();
    });
  }

  test(`optional dua voice keeps the default until selection and survives reload ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 900 });
    await seed(page, language);
    await page.goto("/#/settings/audio");
    const choice = page.getByRole("combobox", { name: t(language, "settings.preferredReciter") });
    await expect(choice).toContainText(language === "ar" ? "عبد الله محمد" : "Abdullah Muhammad");
    await choice.click();
    await page.getByRole("option", { name: language === "ar" ? "محمد جمعة" : "Muhammad Jumah", exact: true }).click();
    await expect(
      page.getByRole("status").filter({ hasText: t(language, "settings.additionalReciterCoverage") }),
    ).toBeVisible();
    await page.reload();
    await expect(choice).toContainText(language === "ar" ? "محمد جمعة" : "Muhammad Jumah");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkar.audio-preferences.v1")!))).toMatchObject({
      duaVoiceId: pilot.voiceId,
      quranReciterId: DEFAULT_AUDIO_PREFERENCES.quranReciterId,
    });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath(`optional-voice-${language}.png`), fullPage: true });
  });
}

for (const candidate of pilot.candidates) {
  test(`native playback decodes the exact optional recording ${candidate.assetId} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await seed(page, "ar", true);
    await page.addInitScript(() => {
      const OriginalAudio = window.Audio;
      Object.defineProperty(window, "Audio", {
        configurable: true,
        value: function (src?: string) {
          const audio = new OriginalAudio(src);
          Object.assign(window, { __optionalVoiceAudio: audio });
          return audio;
        },
      });
    });
    const bytes = await readFile(`docs/audio/opendua-pilot/media/${candidate.file}`);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(candidate.sha256);
    await page.route("**/*.r2.dev/**", async (route) => {
      if (route.request().url().includes(candidate.relativePath)) {
        const range = /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range ?? "");
        const start = range ? Number(range[1]) : 0;
        const end = range?.[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
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
      } else await route.abort();
    });
    const category =
      candidate.assetId === "friday-dua-22"
        ? "comprehensive_duas"
        : candidate.assetId === "wu-hm-3"
          ? "waking_up"
          : "morning";
    const collection =
      category === "comprehensive_duas"
        ? COMPREHENSIVE_DUAS.filter((entry) => !entry.isCollectionIntroduction)
        : getAzkarForMode(category, "complete");
    const index = collection.findIndex((entry) => entry.id === candidate.assetId);
    expect(index).toBeGreaterThanOrEqual(0);
    await page.goto(`/#/azkar/${category.replace(/_/g, "-")}/${index + 1}?mode=complete`);
    await expect(page.getByTestId("reader-screen")).toHaveAttribute("data-zikr-id", candidate.assetId);
    await page.getByTestId("reader-audio-dock-button").click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const audio = (window as unknown as { __optionalVoiceAudio?: HTMLAudioElement }).__optionalVoiceAudio;
          return Boolean(audio && !audio.paused && audio.currentTime > 0.1);
        }),
      )
      .toBe(true);
    const media = await page.evaluate(() => {
      const audio = (window as unknown as { __optionalVoiceAudio: HTMLAudioElement }).__optionalVoiceAudio;
      return { src: audio.src, duration: audio.duration, error: audio.error?.code ?? null };
    });
    expect(media.src).toContain(`${candidate.relativePath}?sha256=${candidate.sha256}`);
    expect(media.error).toBeNull();
    expect(media.duration).toBeGreaterThan(3);
    await page.screenshot({ path: info.outputPath(`native-${candidate.assetId}.png`), fullPage: true });
  });
}

test("accepted optional recording can be exported with identical bytes while offline @cross-browser", async ({
  page,
  context,
}, info) => {
  const candidate = pilot.candidates[0]!;
  const variant = AUDIO_CATALOG.assets[candidate.assetId]!.segments[0]!.variants.find(
    (entry) => entry.voiceId === pilot.voiceId,
  )!;
  const bytes = await readFile(`docs/audio/opendua-pilot/media/${candidate.file}`);
  await seed(page, "ar", true);
  await page.route("**/*.r2.dev/**", (route) => route.abort());
  await page.goto("/#/settings/downloads");
  await openDownloadManagement(page);
  const url = `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/${variant.relativePath}?sha256=${variant.sha256}`;
  await page.evaluate(
    async ({ bytes, url, version }) => {
      await (
        await caches.open(`azkar-audio-v${version}`)
      ).put(url, new Response(new Uint8Array(bytes), { headers: { "content-type": "audio/mpeg" } }));
    },
    { bytes: [...bytes], url, version: AUDIO_MANIFEST_VERSION },
  );
  const group = page.getByTestId("downloaded-audio-files");
  await group.locator("summary").click();
  const save = group.getByRole("button", { name: new RegExp(`^${t("ar", "downloads.saveFile")}`) });
  await expect(save).toHaveCount(1);
  await context.setOffline(true);
  const downloadEvent = page.waitForEvent("download");
  await save.click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe("wu-hm-3-opendua-muhammad-jumah-v0-0-2.mp3");
  const saved = info.outputPath("optional-audio.mp3");
  await download.saveAs(saved);
  expect(
    createHash("sha256")
      .update(await readFile(saved))
      .digest("hex"),
  ).toBe(candidate.sha256);
  await context.setOffline(false);
});
