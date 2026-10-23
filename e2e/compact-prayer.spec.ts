import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getEstimatedPrayerTimes } from "../src/app/content/prayerTimes";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

// Prayer geometry reloads themes; worker update lifecycle has its own specs.
// A waiting-worker dialog must not replace the information sheet under test.
test.use({ serviceWorkers: "block" });
test.beforeEach(async ({ page }) => fixtureReminderCatalogue(page));

const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

async function openHome(page: Page, language: "ar" | "en") {
  await page.clock.setFixedTime(new Date("2026-09-05T13:40:00+03:00"));
  await page.addInitScript((language) => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    if (localStorage.getItem("azkarapp.state.v1")) return;
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language, themeMode: "midnight", reduceMotion: true, hapticFeedback: false },
        profile: { isGuest: true },
      }),
    );
  }, language);
  await page.goto("/#/home");
  await expect(page.getByTestId("prayer-card-fajr")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByTestId("home-daily-evidence")).toBeVisible();
}

for (const language of ["ar", "en"] as const) {
  test(`Friday deeds and sourced alternatives ${language} @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: language === "ar" ? 390 : 1440, height: 900 });
    await openHome(page, language);
    await page.clock.setFixedTime(new Date("2026-10-16T13:40:00+03:00"));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    const tile = page.getByTestId("prayer-card-dhuhr");
    await tile.getByRole("button").click();
    const panel = page.getByTestId("home-prayer-moment");
    await expect(panel).toHaveAttribute("data-prayer", "dhuhr");
    await expect(panel.locator("h2")).toContainText(language === "ar" ? "الجمعة" : "Jumu");
    await expect(panel.getByRole("checkbox")).toHaveCount(3);
    await expect(panel.getByTestId("prayer-moment-virtue")).toContainText(language === "ar" ? "٨٥٧" : "857a");
    for (const check of await panel.getByRole("checkbox").all()) {
      await check.check();
      await expect(check).toBeChecked();
      await check.press("Space");
      await expect(check).not.toBeChecked();
      await check.press("Space");
    }
    await tile.scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`friday-${language}.png`), scale: "css" });
    await panel.getByTestId("prayer-actions-more-info").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toContainText(language === "ar" ? "٨٨١" : "881a");
    await expect(dialog).toContainText(language === "ar" ? "٨٨٢" : "882a");
    await page.screenshot({ path: testInfo.outputPath(`friday-info-${language}.png`), scale: "css" });
    await page.keyboard.press("Escape");
    await page.reload();
    await page.getByTestId("prayer-card-dhuhr").getByRole("button").click();
    for (const check of await panel.getByRole("checkbox").all()) await expect(check).toBeChecked();
    expect((await new AxeBuilder({ page }).include('[data-testid="home-prayer-moment"]').analyze()).violations).toEqual(
      [],
    );
  });
}

async function checkGeometry(page: Page) {
  const panel = page.getByTestId("home-prayer-moment");
  await expect(panel.getByTestId("prayer-moment-virtue")).toBeVisible();
  await expect(panel.getByTestId("prayer-moment-hero")).toHaveCount(0);
  const measures = await page.evaluate(() => {
    const rootSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const content = document.querySelector('[data-testid="home-content-grid"]')!.getBoundingClientRect();
    const header = document.querySelector('[data-testid="home-header-content"]')!.getBoundingClientRect();
    const strip = document.querySelector('[data-testid="home-prayer-strip"]')!.getBoundingClientRect();
    const panel = document.querySelector('[data-testid="home-prayer-moment"]')!.getBoundingClientRect();
    const quote = document.querySelector('[data-testid="prayer-moment-virtue"] p[lang]')!;
    const heading = document.querySelector('[data-testid="prayer-actions-card"] h2')!;
    return {
      rootSize,
      contentWidth: content.width,
      headerWidth: header.width,
      headerAlignment: content.x - header.x,
      stripWidth: strip.width,
      panelWidth: panel.width,
      centerOffset: strip.x + strip.width / 2 - (content.x + content.width / 2),
      quoteFont: getComputedStyle(quote).fontFamily,
      headingFont: getComputedStyle(heading).fontFamily,
      summaryOverflow: [
        ...document.querySelectorAll('[data-density="summary"] h3, [data-density="summary"] p, [data-prayer-detail]'),
      ].some((el) => el.scrollWidth > el.clientWidth + 1),
    };
  });
  // The owner-approved page frame now matches the Library's 80rem measure.
  expect(measures.contentWidth).toBeLessThanOrEqual(80 * measures.rootSize);
  expect(measures.contentWidth).toBeCloseTo(measures.headerWidth, 0);
  expect(Math.abs(measures.headerAlignment)).toBeLessThanOrEqual(1);
  expect(measures.stripWidth).toBeLessThanOrEqual(measures.contentWidth);
  expect(measures.panelWidth).toBeCloseTo(measures.stripWidth, 0);
  expect(Math.abs(measures.centerOffset)).toBeLessThanOrEqual(1);
  expect(measures.quoteFont).toBe(measures.headingFont);
  expect(measures.summaryOverflow).toBe(false);
  const overflow = await panel.evaluate((panel) => {
    return [...panel.querySelectorAll("h2, h3, h4, p, span[id]")]
      .filter(
        (element) =>
          element.scrollWidth > element.clientWidth + 1 || getComputedStyle(element).textOverflow === "ellipsis",
      )
      .map((element) => ({
        text: element.textContent,
        width: element.clientWidth,
        scrollWidth: element.scrollWidth,
        font: getComputedStyle(element).fontSize,
        parentWidth: element.parentElement?.clientWidth,
      }));
  });
  expect(overflow).toEqual([]);
  const checklist = await panel.locator("ol").evaluate((list) => ({
    gap: getComputedStyle(list).rowGap,
    circles: [...list.querySelectorAll(".tracking-check")].map((circle) => circle.getBoundingClientRect().width),
    rootSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
    labelIcons: list.querySelectorAll("li > div svg").length,
  }));
  expect(["normal", "0px"]).toContain(checklist.gap);
  expect(checklist.labelIcons).toBe(0);
  for (const width of checklist.circles) expect(width).toBeCloseTo(checklist.rootSize * 1.25, 2);
  const bounds = (await panel.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual((await page.evaluate(() => innerWidth)) + 1);
  // Read all targets in one browser call: serial geometry round trips can
  // exhaust WebKit's deadline without a geometry assertion failing.
  const controlBounds = await panel.locator("input[type=checkbox], button").evaluateAll((controls) =>
    controls
      .filter((control) => control.getClientRects().length > 0)
      .map((control) => {
        const { width, height } = control.getBoundingClientRect();
        return { width, height };
      }),
  );
  for (const bounds of controlBounds) {
    // Firefox rect subtraction can return 43.999969 for a 44px CSS target.
    // Normalize only floating-point noise; retain the same 44px requirement.
    expect(Number(bounds.width.toFixed(3))).toBeGreaterThanOrEqual(44);
    expect(Number(bounds.height.toFixed(3))).toBeGreaterThanOrEqual(44);
  }
  const action = panel.getByTestId("prayer-open-adhkar");
  await action.scrollIntoViewIfNeeded();
  await expect(action).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const language of ["ar", "en"] as const) {
  for (const width of [390, 1440]) {
    // Keep pointer, keyboard and reload assertions within WebKit's ordinary
    // deadline without skipping any prayer or increasing the global timeout.
    for (const prayerGroup of [["fajr"], ["dhuhr"], ["asr"], ["maghrib", "isha"]] as const) {
      test(`fixed prayer disclosure and every checkbox ${language} ${width} ${prayerGroup.join("/")} @cross-browser`, async ({
        page,
        browserName,
      }, testInfo) => {
        // Normal-glass captures complement the separate reduced-transparency checks.
        if (browserName === "chromium") {
          const cdp = await page.context().newCDPSession(page);
          await cdp.send("Emulation.setEmulatedMedia", {
            features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
          });
        }
        await page.setViewportSize({ width, height: 1000 });
        await openHome(page, language);
        const panel = page.getByTestId("home-prayer-moment");
        const strip = page.getByTestId("home-prayer-strip");
        const primary = page.getByTestId("home-primary-card");
        let fixedPosition: { x: number; width: number } | undefined;
        const selectPrayer = async (prayer: (typeof prayers)[number]) => {
          const time = getEstimatedPrayerTimes(new Date("2026-09-05T12:00:00+03:00"))[prayer];
          const instant = new Date(`2026-09-05T${time}:00+03:00`);
          instant.setMinutes(instant.getMinutes() + 2);
          await page.clock.setFixedTime(instant);
          await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
          const tile = page.getByTestId(`prayer-card-${prayer}`);
          await expect(tile).toHaveAttribute("data-prayer-state", "current");
          const toggle = tile.getByRole("button");
          if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
          await expect(panel).toHaveAttribute("data-prayer", prayer);
        };
        for (const prayer of prayerGroup) {
          await selectPrayer(prayer);
          const [detail, summary, context] = await Promise.all([
            panel.boundingBox(),
            strip.boundingBox(),
            primary.boundingBox(),
          ]);
          const focusInset = 0;
          expect(detail!.x).toBeCloseTo(summary!.x + focusInset, 0);
          expect(detail!.width).toBeCloseTo(summary!.width - 2 * focusInset, 0);
          const homeMeasure = await page.evaluate(() => {
            const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
            return {
              heading: rect('[data-testid="home-header-content"]'),
              gutter: parseFloat(
                getComputedStyle(document.querySelector('[data-testid="home-header-content"]')!).paddingLeft,
              ),
              grid: rect('[data-testid="home-context-grid"]'),
              wird: rect('[data-testid="home-wird-row"]'),
              lower: rect('[data-testid="situational-shortcuts"]'),
            };
          });
          for (const box of [homeMeasure.grid, homeMeasure.wird, homeMeasure.lower]) {
            expect(box.x).toBeCloseTo(homeMeasure.heading.x + homeMeasure.gutter + focusInset, 0);
            expect(box.width).toBeCloseTo(homeMeasure.heading.width - 2 * homeMeasure.gutter - 2 * focusInset, 0);
          }
          expect(homeMeasure.grid.x).toBeCloseTo(detail!.x, 0);
          expect(homeMeasure.grid.width).toBeCloseTo(detail!.width, 0);
          if (fixedPosition) {
            expect(context!.x).toBeCloseTo(fixedPosition.x, 0);
            expect(context!.width).toBeCloseTo(fixedPosition.width, 0);
          } else fixedPosition = context!;
          expect(context!.y).toBeGreaterThanOrEqual(detail!.y + detail!.height);
          const checks = panel.getByRole("checkbox");
          await expect(checks).toHaveCount(prayer === "dhuhr" ? 4 : 3);
          for (const checkbox of await checks.all()) {
            await expect(checkbox).toBeEnabled();
            await expect(checkbox).not.toBeChecked();
            // Real pointer activation in the text area of the full-width input.
            await checkbox.click({ position: { x: 60, y: 20 } });
            await expect(checkbox).toBeChecked();
            await checkbox.focus();
            await checkbox.press("Space");
            await expect(checkbox).not.toBeChecked();
            await checkbox.press("Space");
            await expect(checkbox).toBeChecked();
          }
          if (prayer === "maghrib" || prayer === "isha") {
            await checks.last().evaluate((node) => node.blur());
            await strip.scrollIntoViewIfNeeded();
            const cardGaps = await page.getByTestId("home-all-prayers-row").evaluate((row) => {
              const cards = [...row.querySelectorAll<HTMLElement>("article")];
              const gaps = cards.slice(1).map((card, index) => {
                const previous = cards[index].getBoundingClientRect();
                const current = card.getBoundingClientRect();
                return Math.max(current.left - previous.right, previous.left - current.right);
              });
              const viewport = row.getBoundingClientRect();
              const selected = row.querySelector<HTMLElement>('[data-selected="true"]')!.getBoundingClientRect();
              const visible = cards.filter((card) => {
                const bounds = card.getBoundingClientRect();
                return Math.min(bounds.right, viewport.right) - Math.max(bounds.left, viewport.left) >= 44;
              });
              return {
                gaps,
                selectedVisible: selected.left >= viewport.left - 1 && selected.right <= viewport.right + 1,
                visibleCount: visible.length,
              };
            });
            expect(cardGaps.gaps.every((gap) => Math.abs(gap - 8) <= 1)).toBe(true);
            expect(cardGaps.selectedVisible).toBe(true);
            if (width === 390) expect(cardGaps.visibleCount).toBeGreaterThanOrEqual(2);
            await expect(page.getByTestId(`prayer-card-${prayer}`)).toHaveAttribute("data-selected", "true");
            await page.screenshot({
              path: testInfo.outputPath(`${language}-${width}-${prayer}-fixed-panel.png`),
              scale: "css",
            });
          }
        }
        // Prayer settings intentionally coalesce writes. Prove every field
        // reached storage before testing its independent restoration; an
        // automation reload can bypass the browser's normal unload flush.
        await expect
          .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).prayerTracking))
          .toEqual(
            expect.arrayContaining(
              prayerGroup.map((prayer) =>
                expect.objectContaining({
                  dayKey: "2026-09-05",
                  prayer,
                  mosque: true,
                  location: "mosque",
                  adhkar: true,
                  sunnah: true,
                  ...(prayer === "dhuhr" ? { sunnahBefore: true, sunnahAfter: true } : {}),
                }),
              ),
            ),
          );
        // Revisit every prayer after a real reload: independent fields must persist.
        await page.reload();
        for (const prayer of prayerGroup) {
          await selectPrayer(prayer);
          for (const checkbox of await panel.getByRole("checkbox").all()) {
            await expect(checkbox).toBeChecked();
            await checkbox.press("Space");
            await expect(checkbox).not.toBeChecked();
          }
        }
        const header = page.getByTestId("home-utility-header");
        await expect(header).toHaveCSS("border-top-width", "0px");
        await expect(header).toHaveCSS("border-bottom-width", "0px");
      });
    }
  }
  // Each viewport checks all five prayers within the normal per-test deadline,
  // including WebKit under concurrent local development workloads.
  for (const views of [[[320, 700]], [[390, 844]], [[643, 275]], [[820, 900]], [[1440, 900]], [[1885, 1000]]]) {
    test(`compact prayer panels reflow across ${language} ${views[0][0]} view @cross-browser`, async ({
      page,
    }, testInfo) => {
      await openHome(page, language);
      for (const [width, height] of views) {
        await page.setViewportSize({ width, height });
        for (const prayer of prayers) {
          const time = getEstimatedPrayerTimes(new Date("2026-09-05T12:00:00+03:00"))[prayer];
          const instant = new Date(`2026-09-05T${time}:00+03:00`);
          instant.setMinutes(instant.getMinutes() + 2);
          await page.clock.setFixedTime(instant);
          await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
          const tile = page.getByTestId(`prayer-card-${prayer}`);
          await expect(tile).toHaveAttribute("data-prayer-state", "current");
          if ((await tile.getByRole("button").getAttribute("aria-expanded")) !== "true") {
            await tile.getByRole("button").click();
          }
          await expect(page.getByTestId("home-prayer-moment")).toHaveAttribute("data-prayer", prayer);
          await tile.scrollIntoViewIfNeeded();
          await checkGeometry(page);
          // Geometry below describes the full row. Browser scroll anchoring
          // may condense its sticky cards after opening a longer detail panel.
          await page
            .getByTestId("home-sticky-prayers")
            .locator("..")
            .evaluate((node) => {
              node.scrollTop = 0;
            });
          await expect(page.getByTestId("home-sticky-prayers")).not.toHaveAttribute(
            "data-prayer-cards-condensed",
            "true",
          );
          const edges = await tile.evaluate((node) => ({
            small: getComputedStyle(node, "::after").backgroundColor,
            detail: getComputedStyle(document.querySelector('[data-testid="home-prayer-moment"]')!, "::before")
              .backgroundImage,
          }));
          expect(edges.detail).toContain(edges.small);
          await expect(tile).toHaveAttribute("data-selected", "true");
          await expect(page.locator(".home-prayer-bridge")).toHaveCount(0);
          const tiles = await page.locator('[data-density="summary"]').evaluateAll((tiles) =>
            tiles.map((tile) => {
              const button = tile.querySelector("button")!;
              return {
                width: button.getBoundingClientRect().width,
                height: button.getBoundingClientRect().height,
                gap: parseFloat(getComputedStyle(button).rowGap),
                statusGap:
                  tile.querySelector("[data-prayer-footer]")!.getBoundingClientRect().top -
                  tile.querySelector("p")!.getBoundingClientRect().bottom,
                identity: tile.querySelector("[data-prayer-identity] h3")!.getBoundingClientRect().right,
                timing: tile.querySelector("[data-prayer-timing] p")!.getBoundingClientRect().right,
                overflow: [...tile.querySelectorAll("h3, p, [data-prayer-detail]")].some(
                  (el) => el.scrollWidth > el.clientWidth + 1,
                ),
              };
            }),
          );
          expect(tiles.every((tile) => tile.width >= 44 && tile.height >= 44 && !tile.overflow)).toBe(true);
          expect(tiles.every((tile) => tile.gap === 4)).toBe(true);
          expect(
            tiles.every((tile) => tile.statusGap >= 8 && Math.abs(tile.identity - tile.timing) <= 1),
            JSON.stringify(tiles),
          ).toBe(true);
          const timeStyles = await page.locator('[id^="prayer-summary-time-"]').evaluateAll((times) =>
            times.map((time) => ({
              size: getComputedStyle(time).fontSize,
              weight: getComputedStyle(time).fontWeight,
            })),
          );
          expect(
            timeStyles.every(
              (time) => parseFloat(time.size) >= 16 && parseFloat(time.size) <= 28 && Number(time.weight) >= 800,
            ),
          ).toBe(true);
          if ((width === 390 && prayer === "fajr") || (width === 1440 && prayer === "dhuhr")) {
            await page.getByTestId("home-prayer-strip").scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `output/playwright/compact-prayer/${testInfo.project.name}-${language}-${width}-${prayer}.png`,
              fullPage: true,
            });
          }
        }
        const row = page.getByTestId("home-all-prayers-row");
        const overflowing = await row.evaluate((node) => node.scrollWidth > node.clientWidth + 1);
        await expect(row.locator("article").first()).toHaveAttribute("data-prayer", overflowing ? "isha" : "fajr");
        const first = (await row.locator("article").first().boundingBox())!;
        const last = (await row.locator("article").last().boundingBox())!;
        expect(first.y < last.y || (language === "ar" ? first.x > last.x : first.x < last.x)).toBe(true);
      }
    });
  }

  test(`compact prayer ${language} themes, enlarged text and keyboard @cross-browser`, async ({ page }) => {
    await openHome(page, language);
    await page.setViewportSize({ width: 390, height: 700 });
    for (const [themeMode, reduceTransparency] of [
      ["light", false],
      ["midnight", false],
      ["dark", true],
    ] as const) {
      await page.evaluate(
        ({ themeMode, reduceTransparency }) => {
          const state = JSON.parse(localStorage.getItem("azkarapp.state.v1")!);
          Object.assign(state.settings, { themeMode, reduceTransparency });
          localStorage.setItem("azkarapp.state.v1", JSON.stringify(state));
        },
        { themeMode, reduceTransparency },
      );
      await page.reload();
      await page.getByTestId("prayer-card-dhuhr").getByRole("button").click();
      await checkGeometry(page);
      expect(
        (
          await new AxeBuilder({ page })
            .include('[data-testid="home-prayer-strip"]')
            .include('[data-testid="home-prayer-moment"]')
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page.locator("html").evaluate((element) => {
      element.style.fontSize = "200%";
    });
    await checkGeometry(page);
    const tileRows = await page
      .locator('[data-density="summary"]')
      .evaluateAll((tiles) => new Set(tiles.map((el) => el.getBoundingClientRect().y)).size);
    expect(tileRows).toBe(1);
    const row = page.getByTestId("home-all-prayers-row");
    await row.locator("article").last().scrollIntoViewIfNeeded();
    await expect(row.locator("article").last()).toBeInViewport();
    const input = page.getByTestId("prayer-action-location").locator("input");
    await input.focus();
    await page.keyboard.press("Space");
    await expect(input).toBeChecked();
    await expect(page.getByTestId("prayer-actions-progress")).toHaveCount(0);
    await expect(page.getByTestId("prayer-card-dhuhr").getByRole("button")).toHaveAccessibleDescription(
      language === "ar" ? /في المسجد/ : /At the mosque/,
    );
    await page.keyboard.press("Space");
    await expect(input).not.toBeChecked();
    await page.getByTestId("prayer-actions-more-info").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("prayer-actions-more-info")).toBeFocused();
    await page.emulateMedia({ forcedColors: "active" });
    await checkGeometry(page);
    await page.goto("/#/prayer/dhuhr");
    await expect(page.getByTestId("prayer-moment-screen")).toBeVisible();
    await expect(page.getByTestId("prayer-open-adhkar")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
