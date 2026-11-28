import { expect, type Locator } from "@playwright/test";
import { t } from "../../src/app/i18n";

export async function enlargeReading(owner: Locator, language: "ar" | "en") {
  const trigger = owner.getByTestId("enlarged-size-trigger");
  await trigger.click();
  const popup = owner.getByTestId("enlarged-size-popover");
  await expect(popup).toBeVisible();
  await popup.getByRole("button", { name: t(language, "quranZoom.larger"), exact: true }).click();
  await popup.press("Escape");
  await expect(popup).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(owner).toBeVisible();
}
