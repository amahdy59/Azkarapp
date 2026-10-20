import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { t } from "../src/app/i18n";
import { expectSharingStepGeometry, sharingStep } from "./helpers/sharing";

test.beforeEach(async ({ page }) => {
  // Presence is isolated from production and unrelated to sharing visual QA.
  await page.route("**/__browser-test-api/v1/visitors", (route) => route.fulfill({ json: { active: 1 } }));
});

async function openSharingBoard(page: Page, language: "ar" | "en") {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, reduceMotion: true, themeMode: "midnight" },
        profile: { isGuest: true },
      }),
    );
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => {} });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } });
  }, language);
  // Match the supplied board's collection; full Morning exports have separate coverage.
  await page.goto("/#/azkar/before-sleep");
  await page.getByTestId("share-collection-button").click();
  const modal = page.getByTestId("collection-share-modal");
  const preview = modal.getByTestId("sharing-preview");
  const settings = modal.getByTestId("sharing-settings");
  const image = preview.getByRole("img");
  await expect(image).toBeVisible();
  await expect(preview.getByRole("group")).toHaveAttribute("aria-busy", "false");
  return { errors, modal, preview, settings, image };
}

for (const language of ["ar", "en"] as const) {
  test(`sharing board layout keeps real previews, optional design and precise feedback in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const { errors, modal, preview, settings, image } = await openSharingBoard(page, language);
    for (const choice of ["curated", "generated"] as const) {
      const button = modal.getByRole("button", { name: t(language, `shareStudio.${choice}Tab`), exact: true });
      await expect(button.locator(".sharing-choice-icon svg")).toBeVisible();
      await expect(button).toHaveAccessibleDescription(t(language, `shareStudio.${choice}Description`));
    }
    await modal.getByText(t(language, "shareStudio.contentOptions"), { exact: true }).click();
    await page.mouse.move(0, 0);
    for (const width of [834, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expectSharingStepGeometry(modal);
      await expect
        .poll(async () => {
          const p = (await preview.boundingBox())!;
          const s = (await settings.boundingBox())!;
          return Math.abs(p.y - s.y);
        })
        .toBeLessThanOrEqual(1);
      const p = (await preview.boundingBox())!;
      const s = (await settings.boundingBox())!;
      expect(language === "en" ? p.x > s.x : p.x < s.x).toBe(true);
      expect(s.width / p.width).toBeGreaterThan(0.95);
      expect(s.width / p.width).toBeLessThan(1.2);
      expect((await image.boundingBox())!.height).toBeGreaterThanOrEqual(250);
      expect(
        await preview.evaluate((node) => parseFloat(getComputedStyle(node).paddingInlineStart)),
      ).toBeGreaterThanOrEqual(12);
      const panel = (await preview.boundingBox())!;
      const navigation = (await preview.locator(".sharing-card-navigation").boundingBox())!;
      expect(panel.y + panel.height - navigation.y - navigation.height).toBeGreaterThanOrEqual(15);
      const additions = (await modal.locator(".sharing-additions").boundingBox())!;
      const note = (await modal.getByText(t(language, "shareStudio.sourceHint"), { exact: true }).boundingBox())!;
      expect(note.y - additions.y - additions.height).toBeGreaterThanOrEqual(11);
      await page.screenshot({ path: testInfo.outputPath(`sharing-board-${language}-${width}-content.png`) });
      await modal.screenshot({ path: testInfo.outputPath(`sharing-board-${language}-${width}-content-dialog.png`) });
    }
    await modal.getByText(t(language, "shareStudio.contentOptions"), { exact: true }).click();
    await modal.getByRole("button", { name: t(language, "shareStudio.skipDesign"), exact: true }).click();
    await expect(modal.getByRole("heading", { name: t(language, "shareStudio.stepshare"), exact: true })).toBeFocused();
    await sharingStep(modal, "design");
    await expectSharingStepGeometry(modal);
    await expect(modal.getByText(t(language, "shareStudio.designOptional"), { exact: true })).toBeVisible();
    await expect(preview.getByRole("group")).toHaveAttribute("aria-busy", "false");
    await page.screenshot({ path: testInfo.outputPath(`sharing-board-${language}-1280-design.png`) });
    await modal.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }).click();
    await page.getByRole("option", { name: t(language, "shareStudio.square"), exact: true }).click();
    await expect(image).toHaveAttribute("height", "1080");
    // The first preview streams before all 21–23 square PNGs finish. Complete
    // the batch within the existing export budget before resizing the studio.
    await expect(preview.getByRole("group")).toHaveAttribute("aria-busy", "false", { timeout: 60000 });
    const square = await image.getAttribute("src");
    await sharingStep(modal, "content");
    await modal.getByRole("button", { name: t(language, "shareStudio.skipDesign"), exact: true }).click();
    await expect(modal.getByRole("heading", { name: t(language, "shareStudio.stepshare"), exact: true })).toBeFocused();
    await expect(image).toHaveAttribute("src", square!);
    await modal.getByRole("button", { name: t(language, "shareStudio.copyReadingLink"), exact: true }).click();
    const feedback = modal.locator(".sharing-feedback");
    await expect(feedback).toHaveText(t(language, "shareStudio.readingLinkCopied"));
    await expect(feedback).toBeVisible();
    await expectSharingStepGeometry(modal);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: testInfo.outputPath(`sharing-board-${language}-1280-share.png`) });
    const download = page.waitForEvent("download");
    await modal.getByRole("button", { name: t(language, "shareStudio.save"), exact: true }).click();
    expect((await download).suggestedFilename()).toMatch(/square.*\.png$/u);
    await expect(feedback).toHaveText(t(language, "shareStudio.downloaded"));
    expect(errors).toEqual([]);
  });

  test(`sharing board reflows square previews on phones and enlarged text in ${language} @cross-browser`, async ({
    page,
  }, testInfo) => {
    const { errors, modal, preview, image } = await openSharingBoard(page, language);
    await sharingStep(modal, "design");
    await modal.getByRole("combobox", { name: t(language, "shareStudio.format"), exact: true }).click();
    await page.getByRole("option", { name: t(language, "shareStudio.square"), exact: true }).click();
    await expect(image).toHaveAttribute("height", "1080");
    await expect(preview.getByRole("group")).toHaveAttribute("aria-busy", "false", { timeout: 60000 });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await sharingStep(modal, "content");
      await expectSharingStepGeometry(modal);
      const fields = modal.locator(".sharing-content-fields");
      for (const control of await fields.getByRole("combobox").all()) {
        expect(
          Math.abs((await fields.boundingBox())!.width - (await control.boundingBox())!.width),
        ).toBeLessThanOrEqual(1);
      }
      expect(await modal.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      await expect(preview.getByRole("group")).toHaveAttribute("aria-busy", "false");
      await page.screenshot({ path: testInfo.outputPath(`sharing-board-${language}-${width}-content.png`) });
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    await sharingStep(modal, "content");
    await modal.getByRole("button", { name: t(language, "shareStudio.skipDesign"), exact: true }).click();
    await expect(modal.getByRole("heading", { name: t(language, "shareStudio.stepshare"), exact: true })).toBeFocused();
    await expectSharingStepGeometry(modal);
    expect(await modal.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`sharing-board-${language}-200-share.png`) });
    expect(errors).toEqual([]);
  });
}

test("illustrated artwork choices retain keyboard control in the light theme @cross-browser", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", reduceMotion: true, themeMode: "light" },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/azkar/before-sleep");
  await page.getByTestId("share-collection-button").click();
  const modal = page.getByTestId("collection-share-modal");
  const curated = modal.getByRole("button", { name: "Curated cards", exact: true });
  const custom = modal.getByRole("button", { name: "Custom design", exact: true });
  await expect(custom).toHaveAttribute("aria-pressed", "true");
  await curated.focus();
  await curated.press("Enter");
  await expect(curated).toHaveAttribute("aria-pressed", "true");
  await expect(custom).toHaveAttribute("aria-pressed", "false");
  await expect(modal.getByRole("img").first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("sharing-board-light-curated.png") });
  await custom.focus();
  await custom.press("Space");
  await expect(custom).toHaveAttribute("aria-pressed", "true");
  await expect(custom).toBeFocused();
  await expect(modal.getByTestId("sharing-preview").getByRole("group")).toHaveAttribute("aria-busy", "false");
  await modal.getByText("Customize content", { exact: true }).click();
  expect(
    (await new AxeBuilder({ page }).include('[data-testid="collection-share-modal"]').analyze()).violations,
  ).toEqual([]);
  await page.mouse.move(0, 0);
  await page.screenshot({ path: testInfo.outputPath("sharing-board-light-custom.png") });
});
