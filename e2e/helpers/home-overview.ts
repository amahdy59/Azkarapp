import { expect, type Page } from "@playwright/test";

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
      const arrow = node.querySelector("[data-prayer-chevron]")!.getBoundingClientRect();
      const desktop = node.closest("[data-desktop]") !== null;
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
        arrowTop: arrow.top,
        ordered: desktop
          ? separate && name.bottom <= time.top + 1 && time.bottom <= arrow.top + 1
          : icon.bottom <= name.top + 1 && name.bottom <= time.top + 1 && time.bottom <= arrow.top + 1,
        contained:
          Math.min(icon.left, name.left, time.left, arrow.left) >= card.left &&
          Math.max(icon.right, name.right, time.right, arrow.right) <= card.right,
      };
    }),
  );
  for (const cell of cells) {
    expect(cell.width).toBeGreaterThanOrEqual(44);
    expect(cell.height).toBeGreaterThanOrEqual(44);
    expect(cell.fits, JSON.stringify(cell)).toBe(true);
    expect(cell.ordered, JSON.stringify(cell)).toBe(true);
    expect(cell.contained, JSON.stringify(cell)).toBe(true);
    const peers = cells.filter((other) => Math.abs(other.top - cell.top) < 1);
    for (const key of ["height", "iconTop", "nameTop", "timeTop", "arrowTop"] as const) {
      const positions = peers.map((peer) => peer[key]);
      expect(Math.max(...positions) - Math.min(...positions), key).toBeLessThanOrEqual(1);
    }
  }
  expect(await row.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
  await expect(row.locator("[data-prayer-chevron]")).toHaveCount(5);
  await expect(page.getByTestId("home-prayer-interval")).toContainText(/remaining|متبقٍ/);
  expect(await page.getByTestId("home-prayer-interval").evaluate((node) => Boolean(node.closest("[aria-live]")))).toBe(
    false,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return cells;
}
