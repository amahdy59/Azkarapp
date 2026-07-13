import { expect, test, type Page } from "@playwright/test";

async function openFirstMorningZikr(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("status", { name: "Loading Azkar" })).toHaveCount(0, { timeout: 5000 });

  await page.getByRole("button", { name: "🇬🇧 English en", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue as Guest Your progress won't sync across devices", exact: true })
    .click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("button", { name: "Morning Azkar, 0 of 15 complete", exact: true }).click();
  await page.getByRole("button", { name: "Start Session", exact: true }).click();
}

test("counter shows a checkmark-only completion for 500 ms and a clear tap-anywhere instruction", async ({ page }) => {
  await openFirstMorningZikr(page);

  const zikr = page.getByTestId("zikr-text");
  const counterSurface = page.getByTestId("counter-surface");
  const firstZikr = await zikr.textContent();
  expect(firstZikr).toBeTruthy();
  await expect(counterSurface.getByText("Tap anywhere to count", { exact: true })).toBeVisible();
  await expect(page.getByText("Take a calm breath, then tap to begin", { exact: true })).toHaveCount(0);

  const startedAt = Date.now();
  await counterSurface.click();

  const completionCue = page.getByTestId("counter-completion-cue");
  await expect(completionCue).toBeVisible();
  await expect(completionCue.locator("svg")).toBeVisible();
  await expect(counterSurface).toHaveText("");
  await expect(page.getByText("Complete!", { exact: true })).toHaveCount(0);

  await page.waitForTimeout(350);
  await expect(zikr).toHaveText(firstZikr!);

  await expect(zikr).not.toHaveText(firstZikr!, { timeout: 1000 });
  expect(Date.now() - startedAt).toBeGreaterThanOrEqual(450);
  await expect(counterSurface.getByText("Tap anywhere to count", { exact: true })).toBeVisible();
});

test("reference sheet matches the approved hierarchy and stays usable on short screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 560 });
  await openFirstMorningZikr(page);

  const trigger = page.getByRole("button", { name: "References", exact: true });
  await trigger.click();

  const sheet = page.getByTestId("reference-sheet");
  const close = sheet.getByRole("button", { name: "Close references", exact: true });
  await expect(sheet).toBeVisible();
  await expect(close).toBeFocused();
  await expect(sheet.getByRole("heading", { name: "Translation", exact: true })).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Pronunciation in English", exact: true })).toBeVisible();
  await expect(sheet.getByRole("button", { name: "Copy translation", exact: true })).toBeVisible();
  await expect(sheet.getByText("Recommended timing", { exact: true })).toHaveCount(0);
  await expect(sheet.getByText("Authenticity", { exact: true })).toHaveCount(0);
  await expect
    .poll(() => sheet.evaluate((element) => Math.abs(window.innerHeight - element.getBoundingClientRect().bottom)))
    .toBeLessThan(0.5);

  const dimensions = await sheet.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    const viewport = element.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    return {
      height: bounds.height,
      bottom: bounds.bottom,
      scrollHeight: viewport?.scrollHeight ?? 0,
      clientHeight: viewport?.clientHeight ?? 0,
    };
  });
  expect(dimensions.height).toBeLessThanOrEqual(548.5);
  expect(dimensions.bottom).toBeLessThanOrEqual(560.5);
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight);

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});
