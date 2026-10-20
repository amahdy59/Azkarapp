import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";
import { sharingStep } from "./helpers/sharing";

test.beforeEach(async ({ page }) => {
  await page.route("**/__browser-test-api/v1/visitors", (route) => route.fulfill({ json: { active: 1 } }));
});

for (const language of ["ar", "en"] as const) {
  test(`image caption matches the selected card, copy and native payload in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "midnight", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
      const captured = { shares: [] as { text: string; files: string[] }[], copies: [] as string[] };
      Object.assign(window, { captured });
      Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: async (data: ShareData) => {
          captured.shares.push({ text: data.text ?? "", files: data.files?.map((file) => file.name) ?? [] });
        },
      });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            captured.copies.push(text);
          },
        },
      });
    }, language);
    await page.goto("/#/azkar/morning");
    await page.getByTestId("share-collection-button").click();
    const modal = page.getByTestId("collection-share-modal");
    await expect(modal.getByTestId("sharing-preview").getByRole("img")).toBeVisible();
    await sharingStep(modal, "share");
    const share = modal.getByRole("button", { name: t(language, "shareStudio.share"), exact: true });
    const included = modal.getByRole("checkbox", { name: t(language, "shareStudio.includeCaption"), exact: true });
    await expect(included).not.toBeChecked();
    await expect(share).toBeEnabled();
    await share.click();
    const shares = () =>
      page.evaluate(
        () => (window as unknown as { captured: { shares: { text: string; files: string[] }[] } }).captured.shares,
      );
    await expect.poll(async () => (await shares()).length).toBe(1);
    expect((await shares())[0]!.text).toBe("https://wa-zaker.com/");
    await included.check();
    const caption = modal.getByRole("textbox", { name: t(language, "shareStudio.captionPreview"), exact: true });
    const first = await caption.inputValue();
    expect(first).toMatch(/[\u0600-\u06ff]/u);
    await share.click();
    await expect.poll(async () => (await shares())[1]?.text).toBe(first);
    expect((await shares())[1]!.files).toHaveLength(1);
    await modal.getByRole("button", { name: t(language, "shareStoryPack.nextPage"), exact: true }).click();
    await expect(caption).not.toHaveValue(first);
    const next = await caption.inputValue();
    await share.click();
    await expect.poll(async () => (await shares())[2]?.text).toBe(next);
    await modal.getByRole("button", { name: t(language, "shareStudio.copyText"), exact: true }).click();
    const copies = () => page.evaluate(() => (window as unknown as { captured: { copies: string[] } }).captured.copies);
    await expect.poll(async () => (await copies())[0]).toBe(next);
    const link = modal.getByRole("button", { name: t(language, "shareStudio.copyReadingLink"), exact: true });
    const url = await link.getAttribute("title");
    expect(url).toMatch(/#\/azkar\/morning/u);
    await link.click();
    await expect.poll(async () => (await copies())[1]).toBe(url);
    await expect(modal.getByTestId("sharing-preview").getByRole("img")).toBeInViewport({ ratio: 1 });
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
    ).toEqual([]);
    for (const width of [320, 390, 834, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const scope = modal.getByRole("combobox", { name: t(language, "shareStudio.scope"), exact: true });
      await expect(scope).toContainText(t(language, "shareStudio.scopecurrent"));
      const values = [scope, ...(await modal.getByTestId("sharing-export-actions").getByRole("button").all())];
      for (const control of values) {
        const geometry = await control.evaluate((element) => {
          const span =
            element.querySelector<HTMLElement>('[data-slot="select-value"]') ??
            element.querySelector<HTMLElement>("span");
          if (!span) return { lines: 1, fits: element.scrollWidth <= element.clientWidth + 1 };
          const range = document.createRange();
          range.selectNodeContents(span);
          const rows = new Set(
            [...range.getClientRects()]
              .filter((box) => box.width > 0 && box.height > 0)
              .map((box) => Math.round(box.top)),
          );
          return { lines: rows.size, fits: element.scrollWidth <= element.clientWidth + 1 };
        });
        expect(geometry, `${width}px ${await control.innerText()}`).toEqual({ lines: 1, fits: true });
      }
      await page.screenshot({ path: testInfo.outputPath(`sharing-caption-${language}-${width}.png`) });
    }
    await included.uncheck();
    await expect(caption).toHaveCount(0);
    await share.click();
    await expect.poll(async () => (await shares())[3]?.text).toBe("https://wa-zaker.com/");
  });
}
