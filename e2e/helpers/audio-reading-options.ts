import { expect, type Page } from "@playwright/test";

/** Exercise the same progressive disclosure as a reader before using its controls. */
export async function revealAudioReadingOptions(page: Page) {
  const section = page.locator(".audio-reading-options");
  await expect(section).toBeVisible();
  if (!(await section.evaluate((node) => (node as HTMLDetailsElement).open))) await section.locator("summary").click();
  await expect(section).toHaveAttribute("open", "");
}
