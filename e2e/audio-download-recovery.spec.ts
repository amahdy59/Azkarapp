import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

for (const language of ["en", "ar"] as const) {
  test(`audio transfer progress and local storage recovery ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language, reduceMotion: true }, profile: { isGuest: true } }),
      );
      Object.defineProperty(navigator, "storage", {
        configurable: true,
        value: {
          estimate: async () => ({ usage: 0, quota: 1e9 }),
          persisted: async () => false,
          persist: async () => true,
        },
      });
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, options) => {
        const url = String(input);
        if (!url.includes("r2.dev/")) return originalFetch(input, options);
        return new Response(
          new ReadableStream<Uint8Array>({
            start(controller) {
              controller.enqueue(new Uint8Array(4096));
              options?.signal?.addEventListener(
                "abort",
                () => controller.error(new DOMException("Cancelled", "AbortError")),
                { once: true },
              );
            },
          }),
          { headers: { "content-type": url.includes(".wav") ? "audio/wav" : "audio/mpeg" } },
        );
      };
    }, language);
    await page.goto("/#/settings/downloads");
    const keep = page.getByRole("button", { name: t(language, "downloads.keepDownloads"), exact: true });
    await expect(keep).toBeEnabled();
    await keep.click();
    await expect(page.getByTestId("download-persistence")).toHaveText(t(language, "downloads.persistenceGranted"));
    const row = page.getByTestId("offline-resource-adhkar");
    await row
      .getByRole("button", {
        name: `${t(language, "downloads.downloadResource")} · ${t(language, "downloads.adhkarTitle")}`,
        exact: true,
      })
      .click();
    const progress = row.getByRole("progressbar");
    await expect(progress).toHaveAttribute("value", "4096");
    await expect(row).toContainText(
      t(language, "downloads.receivingFile", { file: language === "ar" ? "١" : "1", total: "" }).split(
        language === "ar" ? " من " : " of ",
      )[0],
    );
    await expect(row).toContainText(
      language === "ar" ? "للتشغيل دون اتصال" : "saved on this device for offline playback",
    );
    await page.screenshot({ path: testInfo.outputPath(`audio-download-progress-${language}.png`), fullPage: true });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await row
      .getByRole("button", {
        name: `${t(language, "downloads.cancelDownload")} · ${t(language, "downloads.adhkarTitle")}`,
        exact: true,
      })
      .click();
    await expect(page.getByText(t(language, "downloads.downloadCancelled"), { exact: true })).toBeVisible();
    await expect(row.getByRole("progressbar")).toHaveCount(0);
    await expect(row).toContainText(t(language, "downloads.notDownloaded"));
    // The filesystem export remains available after storage protection is granted.
    const archive = page.getByTestId("audio-archive-export");
    const zip = archive.getByRole("button", { name: t(language, "downloads.archiveAll"), exact: true });
    await expect(zip).toBeEnabled();
    let downloads = 0;
    page.on("download", () => downloads++);
    await zip.focus();
    await page.keyboard.press("Enter");
    await expect(archive.getByRole("progressbar")).toHaveAttribute("value", "4096");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`audio-zip-progress-${language}.png`), fullPage: true });
    const cancelZip = archive.getByRole("button", { name: t(language, "downloads.cancelDownload"), exact: true });
    await cancelZip.focus();
    await page.keyboard.press("Enter");
    await expect(zip).toBeEnabled();
    await expect(zip).toBeFocused();
    await expect(archive.getByRole("progressbar")).toHaveCount(0);
    expect(downloads).toBe(0);
  });
}
