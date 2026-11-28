import { expect, type Locator } from "@playwright/test";

/** Compact steps keep full labels, usable targets and one visible current mark. */
export async function expectSharingStepGeometry(studio: Locator) {
  const steps = studio.locator(".sharing-steps");
  await expect(steps.locator('[aria-current="step"]')).toHaveCount(1);
  await expect(steps.locator(".sharing-step-number")).toHaveCount(0);
  const geometry = await steps.locator("button").evaluateAll((items) =>
    items.map((item) => {
      const label = item.querySelector("span")!.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      const mark = getComputedStyle(item, "::after");
      return {
        width: box.width,
        height: box.height,
        labelInside:
          label.left >= box.left - 1 &&
          label.right <= box.right + 1 &&
          label.top >= box.top - 1 &&
          label.bottom <= box.bottom + 1,
        current: item.getAttribute("aria-current") === "step",
        markHeight: parseFloat(mark.height),
        markContent: mark.content,
        hit: item.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)),
      };
    }),
  );
  for (const item of geometry) {
    expect(item.width).toBeGreaterThanOrEqual(44);
    expect(item.height).toBeGreaterThanOrEqual(44);
    expect(item.labelInside).toBe(true);
    expect(item.hit).toBe(true);
    if (item.current) expect(item.markHeight).toBeGreaterThanOrEqual(3);
    else expect(item.markContent).toBe("none");
  }
}

/** Exercise the same labelled step navigation available to readers. */
export async function sharingStep(studio: Locator, step: "content" | "design" | "share") {
  await expect(studio).toBeVisible();
  // Calling a wizard step deliberately enters custom design; prepared sets
  // now expose their direct actions without a wizard.
  const custom = studio.getByRole("radio", { name: /^(Custom design|تصميم مخصص)$/u });
  if ((await custom.count()) && !(await custom.isChecked())) await custom.check();
  const names = { content: /^(Content|المحتوى),/u, design: /^(Design|التصميم),/u, share: /^(Share|المشاركة),/u };
  const navigation = studio.getByRole("navigation", { name: /Sharing steps|خطوات المشاركة/u });
  const control = navigation.getByRole("button", { name: names[step] });
  await control.click();
  await expect(control).toHaveAttribute("aria-current", "step");
  // Wait for the announced step before a test deliberately focuses another control.
  const headings = { content: /^(Content|المحتوى)$/u, design: /^(Design|التصميم)$/u, share: /^(Share|المشاركة)$/u };
  await expect(studio.getByRole("heading", { name: headings[step] })).toBeFocused();
}

export async function sharingContent(studio: Locator) {
  await sharingStep(studio, "content");
  const disclosure = studio.getByText(/^(Customize content|تخصيص المحتوى)$/u).locator("xpath=ancestor::details[1]");
  if (!(await disclosure.evaluate((node) => (node as HTMLDetailsElement).open)))
    await disclosure.locator("summary").click();
}

/** Single-reader regressions explicitly choose the individual text from the prepared-first entry. */
export async function sharingSingleContent(studio: Locator) {
  await sharingContent(studio);
  await studio.getByRole("radio", { name: /^(This zikr|هذا الذكر)$/u }).check();
}

/** Inspect the exact optional caption without changing the image workflow. */
export async function sharingCaption(studio: Locator) {
  await sharingStep(studio, "share");
  await studio.getByRole("checkbox", { name: /^(Include text with image|إرفاق نص مع الصورة)$/u }).check();
  return studio.getByRole("textbox", { name: /^(Caption preview|معاينة النص المرفق)$/u });
}
export async function sharingReadingLink(studio: Locator) {
  await sharingStep(studio, "share");
  const button = studio.getByRole("button", { name: /^(Copy reading link|نسخ رابط القراءة)$/u });
  await expect(button).toBeVisible();
  return (await button.getAttribute("title"))!;
}

export async function sharingScope(studio: Locator, value: "current" | "selected" | "all") {
  await sharingStep(studio, "share");
  const scope = studio.getByRole("combobox", { name: /^(Cards to share|البطاقات المراد مشاركتها)$/u });
  await scope.click();
  const labels = {
    current: /^(This card|هذه البطاقة)$/u,
    selected: /^(Selected cards|بطاقات مختارة)$/u,
    all: /^(All cards|كل البطاقات)$/u,
  };
  await studio.page().getByRole("option", { name: labels[value] }).click();
}
