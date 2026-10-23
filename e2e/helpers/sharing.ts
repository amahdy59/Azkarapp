import { expect, type Locator } from "@playwright/test";

/** Circles, labels and colored connector segments must remain independent at every width. */
export async function expectSharingStepGeometry(studio: Locator) {
  // Stage attributes update before the browser finishes its reduced-motion style frame.
  const connectors = studio.locator(".sharing-steps li:not(:last-child)");
  for (const item of await connectors.all()) {
    await expect
      .poll(() =>
        item.evaluate((element) => {
          const state = element.getAttribute("data-state");
          const scale = state === "past" ? 1 : state === "current" ? 0.5 : 0;
          return getComputedStyle(element, "::after").transform === `matrix(${scale}, 0, 0, 1, 0, 0)`;
        }),
      )
      .toBe(true);
  }
  const geometry = await studio.locator(".sharing-steps li").evaluateAll((items) =>
    items.map((item, index) => {
      const circle = item.querySelector(".sharing-step-number")!.getBoundingClientRect();
      const label = item.querySelector("button > span:last-child")!.getBoundingClientRect();
      const column = item.getBoundingClientRect();
      const track = getComputedStyle(item, "::before");
      const fill = getComputedStyle(item, "::after");
      return {
        size: circle.width,
        labelGap: label.top - circle.bottom,
        labelWidth: label.width,
        columnWidth: column.width,
        last: index === items.length - 1,
        state: item.getAttribute("data-state"),
        trackWidth: parseFloat(track.width),
        transform: fill.transform,
        trackColor: track.backgroundColor,
        fillColor: fill.backgroundColor,
        centerOffset: parseFloat(track.top) + 1 - (circle.top - column.top + circle.height / 2),
      };
    }),
  );
  for (const item of geometry) {
    expect(item.size).toBeGreaterThanOrEqual(32);
    expect(item.labelGap).toBeGreaterThanOrEqual(5);
    expect(item.labelWidth).toBeLessThanOrEqual(item.columnWidth + 1);
    if (item.last) continue;
    expect(item.trackWidth).toBeGreaterThan(0);
    expect(Math.abs(item.centerOffset)).toBeLessThanOrEqual(1);
    expect(item.fillColor).not.toBe(item.trackColor);
    const scale = item.state === "past" ? 1 : item.state === "current" ? 0.5 : 0;
    expect(item.transform).toBe(`matrix(${scale}, 0, 0, 1, 0, 0)`);
  }
}

/** Exercise the same labelled step navigation available to readers. */
export async function sharingStep(studio: Locator, step: "content" | "design" | "share") {
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
