import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "../src/app/audio/audioManifest";
import { t } from "../src/app/i18n";

// Frozen copy of existing approved owner audio; no test override of integrity rules.
const variant = AUDIO_CATALOG.assets["m-hm-78m"]!.segments[0]!.variants.find((v) => v.voiceId === "english-george")!;
for (const language of ["en", "ar"] as const) {
  test(`save a verified cached audio file to device while offline ${language} @cross-browser`, async ({
    page,
    context,
  }, testInfo) => {
    const bytes = await readFile("e2e/fixtures/audio/m-hm-78m-english-george-v1.mp3");
    expect(bytes.byteLength).toBe(variant.byteSize);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(variant.sha256);
    let audioRequests = 0;
    await page.route("**/*.r2.dev/**", async (route) => {
      audioRequests++;
      await route.abort();
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
      localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ duaVoiceId: "english-george" }));
    }, language);
    await page.goto("/#/settings/downloads");
    await expect(page.getByTestId("downloads-scroll")).toBeVisible();
    const url = `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/${variant.relativePath}?sha256=${variant.sha256}`;
    await page.evaluate(
      async ({ bytes, url, version }) => {
        const cache = await caches.open(`azkar-audio-v${version}`);
        await cache.put(url, new Response(new Uint8Array(bytes), { headers: { "content-type": "audio/mpeg" } }));
      },
      { bytes: [...bytes], url, version: AUDIO_MANIFEST_VERSION },
    );
    const group = page.getByTestId("download-category-adhkar");
    await group.locator("summary").first().click();
    await group.getByText(t(language, "downloads.exportFiles"), { exact: true }).click();
    const save = group.getByRole("button", { name: new RegExp(`^${t(language, "downloads.saveFile")}`) });
    await expect(save).toHaveCount(1);
    await expect(save).toBeEnabled();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await context.setOffline(true);
    const downloadEvent = page.waitForEvent("download");
    await save.click();
    const download = await downloadEvent;
    expect(download.suggestedFilename()).toBe(`${variant.id}.mp3`);
    const path = testInfo.outputPath("saved-audio.mp3");
    await download.saveAs(path);
    expect(
      createHash("sha256")
        .update(await readFile(path))
        .digest("hex"),
    ).toBe(variant.sha256);
    await expect(group.getByText(t(language, "downloads.fileHandedToBrowser"), { exact: true })).toBeVisible();
    expect(audioRequests).toBe(0);
    expect(
      await page.evaluate(
        async ({ url, version }) => Boolean(await (await caches.open(`azkar-audio-v${version}`)).match(url)),
        { url, version: AUDIO_MANIFEST_VERSION },
      ),
    ).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`audio-file-export-${language}.png`), fullPage: true });
    await context.setOffline(false);
  });
}
