import { openPrayerDialog, closePrayerDialog } from "./helpers/home-overview";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";
import { t } from "../src/app/i18n";

for (const language of ["ar", "en"] as const) {
  test(`Home retains reading position after desktop to phone resize ${language} @cross-browser`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await openHome(page, language, "glass");
    await page.clock.setFixedTime(new Date("2026-09-05T16:29:00+03:00"));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
    await expect(page.getByTestId("prayer-card-asr").locator("button")).toBeEnabled();
    const scroll = page.locator(".home-content-scroll");
    const anchor = page.getByTestId("home-primary-card");
    const documentTop = () =>
      anchor.evaluate((node) => node.getBoundingClientRect().top + node.closest(".home-content-scroll")!.scrollTop);

    for (const viewport of [
      { width: 643, height: 275 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await scroll.evaluate((node) => {
        node.scrollTop = 0;
      });
      await expect(page.getByTestId("home-prayer-disclosure")).toHaveAttribute("aria-expanded", "true");
      await page.setViewportSize(viewport);
      await expect(page.getByTestId("home-prayer-interval")).toBeVisible();
      const before = await documentTop();
      await scroll.evaluate((node) => {
        node.scrollTop = 180;
      });
      await expect(page.getByTestId("home-prayer-disclosure")).toHaveAttribute("aria-expanded", "true");
      await expect.poll(documentTop).toBeCloseTo(before, 0);
      await openPrayerDialog(page, "asr");
      const action = page.getByTestId("prayer-open-adhkar");
      await action.scrollIntoViewIfNeeded();
      await expect(action).toBeInViewport();
      await closePrayerDialog(page);
    }
  });
}

async function openHome(page: Page, language: "ar" | "en", material: string, large = false, locationName?: string) {
  await fixtureReminderCatalogue(page);
  await page.clock.setFixedTime(new Date("2026-11-24T12:30:00+02:00"));
  await page.addInitScript(
    ({ language, material, large, locationName }) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "midnight",
            homeMaterial: material,
            reduceMotion: true,
            fontSize: large ? "large" : "medium",
            ...(locationName
              ? {
                  location: {
                    cityName: locationName,
                    latitude: 30.1,
                    longitude: 31.7,
                    timeZone: "Africa/Cairo",
                    calculationMethod: 5,
                    autoDetect: false,
                  },
                }
              : {}),
          },
          profile: { isGuest: true },
        }),
      );
    },
    { language, material, large, locationName },
  );
  await page.goto("/#/home");
  await expect(page.getByTestId("home-all-prayers-row")).toBeVisible();
  if (large) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
  await page.evaluate(() => document.fonts.ready);
}

async function assertSummary(page: Page, singleLine = false) {
  const summary = page.getByTestId("home-prayer-interval");
  const geometry = await summary.evaluate((node) => {
    const side = getComputedStyle(node).direction === "rtl" ? "right" : "left";
    const groups = [...node.querySelectorAll<HTMLElement>("[data-prayer-summary-state]")];
    return groups.map((group) => {
      const label = group.querySelector(".home-prayer-summary-label")!.getBoundingClientRect();
      const name = group.querySelector(".home-prayer-summary-name")!.getBoundingClientRect();
      const cell = group.getBoundingClientRect();
      const value = group.querySelector(".home-prayer-summary-value")!;
      const countdown = group.querySelector("#home-prayer-countdown")?.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(value);
      return {
        labelTop: label.top,
        nameTop: name.top,
        ordered: side === "right" ? label.left >= name.right - 1 : name.left >= label.right - 1,
        labelCenter: label.top + label.height / 2,
        nameCenter: name.top + name.height / 2,
        countdownOnNameRow: !countdown || countdown.top < name.top + name.height / 2,
        inkFits: [...range.getClientRects()]
          .filter((r) => r.width > 0)
          .every((r) => r.left >= cell.left - 1 && r.right <= cell.right + 1),
      };
    });
  });
  expect(geometry).toHaveLength(2);
  for (const item of geometry) {
    expect(item.inkFits, JSON.stringify(item)).toBe(true);
    if (singleLine) {
      expect(item.ordered, JSON.stringify(item)).toBe(true);
      expect(Math.abs(item.nameCenter - item.labelCenter)).toBeLessThanOrEqual(4);
      expect(item.countdownOnNameRow).toBe(true);
    }
  }
  if (singleLine) {
    expect(geometry[0].labelTop).toBeCloseTo(geometry[1].labelTop, 0);
    expect(geometry[0].nameTop).toBeCloseTo(geometry[1].nameTop, 0);
  }
  const shade = summary.locator(".home-prayer-interval-shade");
  const initial = await shade.getAttribute("style");
  for (const percent of [12, 85]) {
    await shade.evaluate(
      (node, percent) => (node as HTMLElement).style.setProperty("--interval-elapsed", `${percent}%`),
      percent,
    );
    const positions = await summary
      .locator(".home-prayer-summary-label")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x));
    const sidePositions = await summary
      .locator(".home-prayer-summary-name")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x));
    // The shade is decorative; it cannot change label/name coordinates.
    if (percent === 12) {
      await summary.evaluate(
        (node, positions) => node.setAttribute("data-test-label-positions", JSON.stringify(positions)),
        [positions, sidePositions],
      );
    } else
      expect(JSON.stringify([positions, sidePositions])).toBe(await summary.getAttribute("data-test-label-positions"));
  }
  await shade.evaluate(
    (node, value) => (value === null ? node.removeAttribute("style") : node.setAttribute("style", value)),
    initial,
  );
  await summary.evaluate((node) => node.removeAttribute("data-test-label-positions"));
}

async function assertLocationFooter(page: Page) {
  const group = page.getByTestId("home-location");
  const change = group.locator(".home-location-change");
  await expect(page.getByTestId("home-header-content").getByTestId("home-location")).toHaveCount(0);
  await expect(group.getByRole("combobox")).toHaveCount(0);
  await expect(group.locator("svg")).toHaveCount(3);
  const geometry = await group.evaluate((node) => {
    const a = node.querySelector(".home-location-change")!.getBoundingClientRect();
    const b = node.querySelector("[data-home-location-refresh]")!.getBoundingClientRect();
    const footer = node.closest(".home-prayer-location")!.getBoundingClientRect();
    const row = document.querySelector('[data-testid="home-all-prayers-row"]')!.getBoundingClientRect();
    return {
      gap: Math.max(a.left, b.left) - Math.min(a.right, b.right),
      expectedGap: parseFloat(getComputedStyle(node.querySelector(".home-location-row")!).columnGap),
      centers: Math.abs(a.y + a.height / 2 - b.y - b.height / 2),
      targetSizes: [a.width, a.height, b.width, b.height],
      below: footer.top - row.bottom,
      compact: footer.width < row.width,
      overflow: node.scrollWidth - node.clientWidth,
    };
  });
  expect(geometry.gap).toBeCloseTo(geometry.expectedGap, 0);
  expect(geometry.centers).toBeLessThanOrEqual(1);
  expect(geometry.targetSizes.every((size) => size >= 44)).toBe(true);
  expect(geometry.below).toBeGreaterThanOrEqual(7);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
  return change;
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390]) {
    test(`Home compact inline summary ${language} ${width}px @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 900 });
      await openHome(page, language, "glass");
      for (const [time, prayer] of [
        ["04:00", "isha"],
        ["06:30", "fajr"],
        ["12:30", "dhuhr"],
        ["15:30", "asr"],
        ["17:15", "maghrib"],
        ["19:30", "isha"],
      ] as const) {
        await test.step(`inline summary at ${time}`, async () => {
          await page.clock.setFixedTime(new Date(`2026-11-24T${time}:00+02:00`));
          await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
          await expect(page.locator('[data-prayer-summary-state="current"] strong')).toHaveText(
            t(language, `notifications.${prayer}`),
          );
          await assertSummary(page, width >= 390);
        });
      }
      await page.clock.setFixedTime(new Date("2026-11-27T12:30:00+02:00"));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await expect(page.locator('[data-prayer-summary-state="current"] strong')).toHaveText(
        t(language, "prayerTracking.jumuah"),
      );
      await assertSummary(page, width >= 390);
      await page.clock.setFixedTime(new Date("2026-11-24T12:30:00+02:00"));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await assertLocationFooter(page);
      await page.screenshot({
        path: `output/playwright/home-inline-status/${info.project.name}-${language}-${width}.png`,
      });
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 834, 1440, 320]) {
    test(`Home overview ${language} ${width}px @cross-browser`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: width === 834 ? 1112 : 900 });
      await openHome(page, language, width === 1440 ? "solid" : "glass", width === 320);
      await assertSummary(page, width >= 390);
      await assertLocationFooter(page);
      const row = page.getByTestId("home-all-prayers-row");
      await expect(row.locator("[data-prayer-icon]")).toHaveCount(5);
      await expect(row.locator("[data-prayer-chevron]")).toHaveCount(0);
      await expect(row.locator("button[aria-haspopup=dialog]")).toHaveCount(5);
      const geometry = await row.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return [...element.querySelectorAll("button")].map((button) => {
          const r = button.getBoundingClientRect();
          return {
            width: r.width,
            height: r.height,
            left: r.left - bounds.left,
            right: r.right - bounds.right,
            overflow: button.scrollWidth - button.clientWidth,
          };
        });
      });
      for (const item of geometry) {
        expect(item.width).toBeGreaterThanOrEqual(44);
        expect(item.height).toBeGreaterThanOrEqual(44);
        expect(item.left).toBeGreaterThanOrEqual(-1);
        expect(item.right).toBeLessThanOrEqual(1);
        expect(item.overflow).toBeLessThanOrEqual(1);
      }
      if (width !== 320) {
        const tops = await row
          .locator("[data-prayer-icon]")
          .evaluateAll((icons) => icons.map((icon) => icon.getBoundingClientRect().top));
        expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(1);
      }
      const selected = page.getByTestId("prayer-card-dhuhr").locator("button");

      await expect(page.getByTestId("home-prayer-moment")).toHaveCount(0);
      await page.screenshot({
        path: `output/playwright/home-overview/${info.project.name}-${language}-${width}-collapsed.png`,
        fullPage: true,
      });
      await selected.focus();
      await selected.press("Enter");
      await expect(selected).toHaveAttribute("aria-haspopup", "dialog");
      const panel = page.getByTestId("home-prayer-moment");
      await expect(panel.locator(".prayer-tracking-body")).toHaveAttribute("data-prayer", "dhuhr");
      const evidence = panel.locator(".prayer-evidence-toggle");
      if (width >= 1200) {
        await expect(evidence).toBeHidden();
        await expect(panel.getByTestId("prayer-virtue-source")).toBeVisible();
      } else {
        await expect(evidence).toHaveAttribute("aria-expanded", "false");
        await evidence.click();
        await expect(panel.getByTestId("prayer-virtue-source")).toBeVisible();
        await evidence.click();
        await expect(panel.getByTestId("prayer-virtue-source")).toBeHidden();
      }
      await page.screenshot({
        path: `output/playwright/home-overview/${info.project.name}-${language}-${width}-expanded.png`,
        fullPage: true,
      });
      await panel.getByRole("button", { name: t(language, "home.prayerTrackingDone"), exact: true }).click();
      await expect(selected).toBeFocused();
      await expect(panel).toHaveCount(0);
      await expect(page.getByTestId("prayer-card-isha").locator("button")).toBeDisabled();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const large of [false, true]) {
    test(`Home long location retains readable caption and grouped actions ${language} ${large ? "200 percent" : "normal"} @cross-browser`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: large ? 320 : 390, height: 1000 });
      const name =
        language === "ar"
          ? "العاصمة الإدارية الجديدة، الحي السكني الشرقي"
          : "New Administrative Capital, eastern residential district";
      await openHome(page, language, "glass", large, name);
      const group = page.getByTestId("home-location");
      await expect(group.getByTestId("home-location-caption")).toContainText(name);
      await group.locator(".home-location-change").focus();
      await group.locator("[data-home-location-refresh]").scrollIntoViewIfNeeded();
      await assertLocationFooter(page);
      const geometry = await group.evaluate((node) => {
        const select = node.querySelector(".home-location-change")!;
        const refresh = node.querySelector("[data-home-location-refresh]")!;
        const a = select.getBoundingClientRect();
        const b = refresh.getBoundingClientRect();
        const caption = node.querySelector('[data-testid="home-location-caption"]')!;
        const label = caption.getBoundingClientRect();
        const bounds = node.getBoundingClientRect();
        const insideChange =
          label.left >= a.left - 1 && label.right <= a.right + 1 && label.top >= a.top && label.bottom <= a.bottom;
        const text = caption.firstChild!;
        const words = [...(text.textContent ?? "").matchAll(/\S+/g)];
        const wholeWords = words.every((word) => {
          const range = document.createRange();
          range.setStart(text, word.index!);
          range.setEnd(text, word.index! + word[0].length);
          return (
            new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)))
              .size === 1
          );
        });
        return {
          insideChange,
          wholeWords,
          gap: Math.max(a.left, b.left) - Math.min(a.right, b.right),
          overlapY: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top),
          clipped:
            label.left < bounds.left - 1 ||
            label.right > bounds.right + 1 ||
            label.top < bounds.top - 1 ||
            label.bottom > bounds.bottom + 1,
          overflow: node.scrollWidth - node.clientWidth,
          hit: document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.closest("button") === refresh,
        };
      });
      expect(geometry.gap).toBeCloseTo(0, 0);
      expect(geometry.insideChange).toBe(true);
      expect(geometry.wholeWords, JSON.stringify(geometry)).toBe(true);
      expect(geometry.overlapY).toBeGreaterThanOrEqual(44);
      expect(geometry.clipped, JSON.stringify(geometry)).toBe(false);
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.hit).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await page.screenshot({
        path: `output/playwright/home-overview/${info.project.name}-${language}-long-location-${large ? "large" : "normal"}.png`,
      });
    });
  }
}

test("Home location uses the saved prayer boundary and retains it after denied refresh @cross-browser", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await openHome(page, "en", "solid");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          (window as unknown as { finishHomeLocation: () => void }).finishHomeLocation = () =>
            success({
              coords: { latitude: 51.5, longitude: -0.12, accuracy: 15 },
              timestamp: Date.now(),
            } as GeolocationPosition);
        },
      },
    });
  });
  const refresh = page
    .getByTestId("home-location")
    .getByRole("button", { name: t("en", "qibla.useCurrentLocation"), exact: true });
  await refresh.click();
  await expect(page.getByTestId("home-location").getByRole("button", { name: /Finding location/ })).toBeDisabled();
  await page.locator(".home-content-scroll").evaluate((node) => {
    node.scrollTop = 180;
  });
  await expect(page.getByTestId("home-prayer-disclosure")).toBeDisabled();
  await page.screenshot({ path: `output/playwright/home-overview/${info.project.name}-location-loading.png` });
  await page.evaluate(() => (window as unknown as { finishHomeLocation: () => void }).finishHomeLocation());
  await expect(page.getByTestId("home-location-result").getByRole("status")).toContainText(/updated/i);
  const result = page.getByTestId("home-location-result");
  await expect(result).toHaveAttribute("data-dropdown-surface", "");
  await expect(result.getByTestId("sheet-header-title")).toHaveText(t("en", "home.locationResult"));
  await page.screenshot({ path: `output/playwright/home-overview/${info.project.name}-location-success.png` });
  await page.keyboard.press("Escape");
  await expect(refresh).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location?.latitude))
    .toBe(51.5);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location);
  expect(saved.cityName).not.toMatch(/Cairo/);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: unknown, error: (value: { code: number }) => void) => error({ code: 1 }),
      },
    }),
  );
  await refresh.click();
  await expect(page.getByTestId("home-location-result").getByRole("status")).toContainText(/blocked/i);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location)).toEqual(
    saved,
  );
  await page.screenshot({ path: `output/playwright/home-overview/${info.project.name}-location-denied.png` });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: new RegExp(t("en", "home.chooseLocation")) }).click();
  await expect(page).toHaveURL(/settings\/location/);
  await expect(page.getByTestId("home-location")).toHaveCount(0);
});
