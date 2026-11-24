import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { openDownloadManagement, openDownloadSelection } from "./helpers/downloads";
import { readFile } from "node:fs/promises";
import { AUDIO_CATALOG, AUDIO_MANIFEST_VERSION } from "../src/app/audio/audioManifest";

test("verified partial downloads remain recognizable after a full reload @cross-browser", async ({ page }, info) => {
  const variant = AUDIO_CATALOG.assets["m-hm-78m"]!.segments[0]!.variants.find(
    (item) => item.voiceId === "english-george",
  )!;
  const bytes = await readFile("e2e/fixtures/audio/m-hm-78m-english-george-v1.mp3");
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
    localStorage.setItem("azkar.audio-preferences.v1", JSON.stringify({ duaVoiceId: "english-george" }));
  });
  await page.goto("/#/settings/downloads");
  await expect(page.getByTestId("download-overview-action")).toBeEnabled();
  await page.evaluate(
    async ({ bytes, url, version }) => {
      const cache = await caches.open(`azkar-audio-v${version}`);
      await cache.put(url, new Response(new Uint8Array(bytes), { headers: { "content-type": "audio/mpeg" } }));
    },
    {
      bytes: [...bytes],
      version: AUDIO_MANIFEST_VERSION,
      url: `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/${variant.relativePath}?sha256=${variant.sha256}`,
    },
  );
  let requests = 0;
  await page.route("**/*.r2.dev/**", async (route) => {
    requests++;
    await route.abort();
  });
  await page.reload();
  await expect(page.getByTestId("download-overview-action")).toHaveText("Resume download");
  await expect(page.getByTestId("download-overview")).toContainText("Estimated remaining:");
  await expect(page.getByTestId("download-coverage")).toContainText("Partly downloaded");
  await expect(page.getByTestId("download-management")).not.toHaveAttribute("open");
  expect(requests).toBe(0);
  await page.screenshot({ path: info.outputPath("resume-after-reload.png"), fullPage: true });
});

for (const scenario of [
  {
    language: "ar",
    width: 390,
    height: 844,
    scale: 1,
    themeMode: "midnight",
    appMaterial: "glass",
    reduceTransparency: false,
  },
  {
    language: "en",
    width: 1440,
    height: 900,
    scale: 1,
    themeMode: "light",
    appMaterial: "solid",
    reduceTransparency: false,
  },
  {
    language: "ar",
    width: 320,
    height: 700,
    scale: 2,
    themeMode: "midnight",
    appMaterial: "glass",
    reduceTransparency: false,
  },
  {
    language: "en",
    width: 320,
    height: 700,
    scale: 2,
    themeMode: "light",
    appMaterial: "solid",
    reduceTransparency: false,
  },
  {
    language: "ar",
    width: 820,
    height: 1024,
    scale: 1,
    themeMode: "midnight",
    appMaterial: "glass",
    reduceTransparency: false,
  },
  {
    language: "en",
    width: 390,
    height: 844,
    scale: 1,
    themeMode: "dark",
    appMaterial: "glass",
    reduceTransparency: true,
  },
] as const) {
  test(`offline overview selection ${scenario.language}/${scenario.width}/${scenario.scale}/${scenario.reduceTransparency} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize(scenario);
    await page.addInitScript((settings) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { ...settings, reduceMotion: true }, profile: { isGuest: true } }),
      );
      if (settings.scale === 2)
        document.addEventListener("DOMContentLoaded", () => {
          document.documentElement.style.fontSize = "32px";
        });
    }, scenario);
    await page.goto("/#/settings/downloads");
    const scroll = page.getByTestId("downloads-scroll");
    const action = page.getByTestId("download-overview-action");
    await expect(action).toBeEnabled();
    await expect(action).toHaveText(t(scenario.language, "downloads.downloadAll"));
    await expect(page.getByTestId("download-management")).not.toHaveAttribute("open");
    await expect(page.getByTestId("audio-archive-export")).toHaveCount(0);
    await expect(scroll.getByRole("progressbar")).toHaveCount(0);
    await expect(page.getByTestId("download-coverage")).toBeVisible();
    await expect(page.getByTestId("download-coverage").locator("li")).toHaveCount(3);
    await page.screenshot({ path: info.outputPath("overview.png"), fullPage: true });
    await openDownloadSelection(page);
    const checks = page.getByRole("checkbox");
    await expect(checks).toHaveCount(3);
    for (const check of await checks.all()) {
      await expect(check).toBeChecked();
      await check.focus();
      await page.keyboard.press("Space");
      await expect(check).not.toBeChecked();
      const label = check.locator("..");
      const box = (await label.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
    await expect(action).toBeDisabled();
    await checks.first().check();
    await expect(action).toBeEnabled();
    await expect(action).toHaveText(t(scenario.language, "downloads.downloadSelected"));
    expect(await scroll.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath("selection.png"), fullPage: true });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });
}

test("bulk start is single, stable on return, and cancellable outside management @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: false }, profile: { isGuest: true } }),
    );
    Object.assign(window, { __offlineRequests: 0, __offlineAborts: 0 });
    const original = fetch.bind(window);
    window.fetch = async (input, options) => {
      if (!String(input).includes("r2.dev/")) return original(input, options);
      const metrics = window as unknown as { __offlineRequests: number; __offlineAborts: number };
      metrics.__offlineRequests++;
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array(4096));
            options?.signal?.addEventListener(
              "abort",
              () => {
                metrics.__offlineAborts++;
                controller.error(new DOMException("Cancelled", "AbortError"));
              },
              { once: true },
            );
          },
        }),
        { headers: { "content-type": "audio/mpeg" } },
      );
    };
  });
  await page.goto("/#/settings/downloads");
  const overview = page.getByTestId("download-overview");
  const action = page.getByTestId("download-overview-action");
  await expect(action).toBeEnabled();
  await action.click();
  await expect(overview.getByRole("progressbar")).toHaveAttribute("value", "4096");
  await action.dispatchEvent("click", { detail: 2 });
  const metrics = () =>
    page.evaluate(() => {
      const value = window as unknown as { __offlineRequests: number; __offlineAborts: number };
      return { requests: value.__offlineRequests, aborts: value.__offlineAborts };
    });
  expect(await metrics()).toEqual({ requests: 1, aborts: 0 });
  await expect(page.getByTestId("download-management")).not.toHaveAttribute("open");
  await expect(overview).toContainText("Group 1 of 3");
  await expect(overview).toContainText("Current group progress");
  await expect(overview).toContainText("Keep it open until downloading finishes");
  await expect(overview.getByRole("button", { name: "Cancel download", exact: true })).toHaveCount(1);
  await page.getByTestId("nav-home").click();
  await expect(page.getByTestId("home-daily-evidence")).toBeVisible();
  await page.evaluate(() => {
    window.location.hash = "/settings/downloads";
  });
  await expect(overview.getByRole("progressbar")).toHaveAttribute("value", "4096");
  expect(await metrics()).toEqual({ requests: 1, aborts: 0 });
  const fill = overview.locator('[data-slot="progress-fill"]');
  expect(await fill.evaluate((node) => getComputedStyle(node).getPropertyValue("--progress-ratio").trim())).not.toBe(
    "0",
  );
  await openDownloadManagement(page);
  await expect(page.getByTestId("offline-resource-adhkar")).toHaveCSS("box-shadow", "none");
  await expect(page.getByRole("progressbar")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Cancel download", exact: true })).toHaveCount(1);
  await page.getByTestId("download-management").locator(":scope > summary").click();
  await page.screenshot({ path: info.outputPath("active.png"), fullPage: true });
  await action.click();
  await expect(overview.getByRole("progressbar")).toHaveCount(0);
  expect(await metrics()).toEqual({ requests: 1, aborts: 1 });
  await expect(action).toHaveText("Resume download");
  await page.screenshot({ path: info.outputPath("cancelled.png"), fullPage: true });
});
