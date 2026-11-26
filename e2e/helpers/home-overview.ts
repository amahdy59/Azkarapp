import { expect, type Page } from "@playwright/test";

/** Switch only after closing the modal; the underlying prayer cards are inert. */
export async function openPrayerDialog(page: Page, prayer: string) {
  const dialog = page.getByTestId("home-prayer-moment");
  if (await dialog.isVisible()) {
    await dialog.locator(".prayer-tracking-footer button").click();
    await expect(dialog).toBeHidden();
  }
  await page.getByTestId(`prayer-card-${prayer}`).getByRole("button").click();
  await expect(dialog.locator(".prayer-tracking-body")).toHaveAttribute("data-prayer", prayer);
  return dialog;
}

export async function closePrayerDialog(page: Page) {
  const dialog = page.getByTestId("home-prayer-moment");
  await dialog.locator(".prayer-tracking-footer button").click();
  await expect(dialog).toBeHidden();
}

/** Validate the replacement grid's actual ink/targets, including stacked rows. */
export async function assertPrayerOverview(page: Page) {
  const row = page.getByTestId("home-all-prayers-row");
  await expect(row.locator("article")).toHaveCount(5);
  const cells = await row.locator("article").evaluateAll((nodes) =>
    nodes.map((node) => {
      const card = node.getBoundingClientRect();
      const button = node.querySelector("button")!;
      const icon = node.querySelector("[data-prayer-icon]")!.getBoundingClientRect();
      const name = node.querySelector("h3")!.getBoundingClientRect();
      const time = node.querySelector("[data-prayer-time]")!.getBoundingClientRect();
      const badge = node.querySelector(".home-prayer-status-badge");
      const badgeBounds = badge?.getBoundingClientRect();
      const desktop = getComputedStyle(button).textAlign === "start";
      const separate = icon.right <= name.left || name.right <= icon.left;
      return {
        x: card.x,
        top: card.top,
        width: card.width,
        height: card.height,
        fits: button.scrollWidth <= button.clientWidth + 1,
        iconTop: icon.top,
        nameTop: name.top,
        timeTop: time.top,
        headerAligned: !desktop || Math.abs(icon.top + icon.height / 2 - name.top - name.height / 2) <= 4,
        ordered: desktop
          ? separate && name.bottom <= time.top + 1
          : icon.bottom <= name.top + 1 && name.bottom <= time.top + 1,
        cornerStatus:
          !badgeBounds ||
          (getComputedStyle(badge!).position === "absolute" &&
            badgeBounds.top < card.top &&
            badgeBounds.bottom > card.top &&
            badgeBounds.left >= card.left &&
            badgeBounds.right <= card.right),
        contained:
          Math.min(icon.left, name.left, time.left) >= card.left &&
          Math.max(icon.right, name.right, time.right) <= card.right,
      };
    }),
  );
  for (const cell of cells) {
    expect(cell.width).toBeGreaterThanOrEqual(44);
    expect(cell.height).toBeGreaterThanOrEqual(44);
    expect(cell.fits, JSON.stringify(cell)).toBe(true);
    expect(cell.ordered, JSON.stringify(cell)).toBe(true);
    expect(cell.headerAligned, JSON.stringify(cell)).toBe(true);
    expect(cell.cornerStatus, JSON.stringify(cell)).toBe(true);
    expect(cell.contained, JSON.stringify(cell)).toBe(true);
    const peers = cells.filter((other) => Math.abs(other.top - cell.top) < 1);
    for (const key of ["height", "iconTop", "nameTop", "timeTop"] as const) {
      const positions = peers.map((peer) => peer[key]);
      expect(Math.max(...positions) - Math.min(...positions), key).toBeLessThanOrEqual(1);
    }
  }
  expect(await row.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  await expect(row.locator("[data-prayer-chevron]")).toHaveCount(0);
  await expect(row.locator("button[aria-haspopup=dialog]")).toHaveCount(5);
  await expect(page.getByTestId("home-prayer-disclosure")).toHaveAttribute("aria-controls", "home-prayer-timings");
  await expect(page.getByTestId("home-prayer-interval")).toContainText(/remaining|متبقٍ/);
  expect(await page.getByTestId("home-prayer-interval").evaluate((node) => Boolean(node.closest("[aria-live]")))).toBe(
    false,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return cells;
}
