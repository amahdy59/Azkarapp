import { expect, type Locator } from "@playwright/test";

/** Exercise the same labelled step navigation available to readers. */
export async function sharingStep(studio: Locator, step: "content" | "design" | "share") {
  const names = { content: /^(Content|المحتوى),/u, design: /^(Design|التصميم),/u, share: /^(Share|المشاركة),/u };
  const navigation = studio.getByRole("navigation", { name: /Sharing steps|خطوات المشاركة/u });
  const control = navigation.getByRole("button", { name: names[step] });
  await control.click();
  await expect(control).toHaveAttribute("aria-current", "step");
}

export async function sharingContent(studio: Locator) {
  await sharingStep(studio, "content");
  const disclosure = studio.getByText(/^(Customize content|تخصيص المحتوى)$/u).locator("xpath=ancestor::details[1]");
  if (!(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open)))
    await disclosure.locator("summary").click();
}
