import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

test.beforeEach(async ({ page }) => {
  const later = page.getByRole("button", { name: /^(Later|لاحقاً)$/ });
  await page.addLocatorHandler(later, async () => later.click());
});

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 1440]) {
    test(`@cross-browser bounded prayer hierarchy ${language} at ${width}px`, async ({
      page,
      browserName,
    }, testInfo) => {
      if (browserName === "chromium") {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setEmulatedMedia", {
          features: [{ name: "prefers-reduced-transparency", value: "no-preference" }],
        });
      }
      await page.clock.setFixedTime(new Date("2026-10-14T14:00:00+03:00"));
      await page.setViewportSize({ width, height: 1000 });
      await page.addInitScript((language) => {
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      const row = page.getByTestId("home-all-prayers-row");
      await expect(row.locator("article")).toHaveCount(5);
      const geometry = await row.evaluate((node) => {
        const frame = node.getBoundingClientRect();
        return [...node.querySelectorAll("article")].map((card) => {
          const bounds = card.getBoundingClientRect();
          const name = card.querySelector("h3")!.getBoundingClientRect();
          const time = card.querySelector('[id^="prayer-summary-time"]')!.getBoundingClientRect();
          const icon = card.querySelector("[data-prayer-icon]")!.getBoundingClientRect();
          const style = getComputedStyle(card);
          const padding = getComputedStyle(card.querySelector("button")!);
          const identity = card.querySelector("[data-prayer-identity] h3")!.getBoundingClientRect();
          const isRtl = getComputedStyle(card).direction === "rtl";
          const footer = card.querySelector("[data-prayer-footer]")!.getBoundingClientRect();
          return {
            state: card.getAttribute("data-prayer-state"),
            nameTop: name.top,
            timeTop: time.top,
            iconTop: icon.top,
            bottomGap: bounds.bottom - card.querySelector("button")!.getBoundingClientRect().bottom,
            visible: bounds.left >= frame.left && bounds.right <= frame.right,
            aligned: Math.abs(name.bottom - time.bottom) <= 4,
            iconAbove: icon.bottom <= name.top,
            bounded: parseFloat(style.borderTopWidth) >= 1 && style.borderTopColor !== "rgba(0, 0, 0, 0)",
            height: bounds.height,
            paddingTop: parseFloat(padding.paddingTop),
            paddingLeft: parseFloat(padding.paddingLeft),
            paddingRight: parseFloat(padding.paddingRight),
            iconWidth: icon.width,
            columnGap: parseFloat(padding.columnGap),
            visibleTopInset: icon.top - bounds.top,
            visibleIdentityInset: isRtl ? bounds.right - identity.right : identity.left - bounds.left,
            visibleTimeInset: isRtl ? time.left - bounds.left : bounds.right - time.right,
            actualColumnGap: isRtl ? identity.left - time.right : time.left - identity.right,
            width: bounds.width,
            footerTop: footer.top,
            footerHeight: footer.height,
          };
        });
      });
      expect(
        geometry.every((card) => card.aligned && card.iconAbove && card.bounded),
        JSON.stringify(geometry),
      ).toBe(true);
      expect(geometry.every((card) => card.height <= 156)).toBe(true);
      expect(
        geometry.every(
          (card) =>
            card.paddingTop >= 13.5 &&
            card.paddingTop <= 14 &&
            card.paddingLeft >= 13.5 &&
            card.paddingLeft <= 14 &&
            card.paddingLeft === card.paddingRight &&
            card.columnGap === (card.width <= 162 ? 6 : 10) &&
            Math.abs(card.visibleTopInset - 15) <= 1 &&
            Math.abs(card.visibleIdentityInset - 15) <= 1 &&
            Math.abs(card.visibleTimeInset - 15) <= 1 &&
            card.iconWidth >= 26,
        ),
      ).toBe(true);
      await expect(page.getByTestId("prayer-tracker-cards")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(row.locator("[data-prayer-icon]").first()).toHaveCSS("border-top-width", "0px");
      if (width === 1440) {
        expect(geometry.every((card) => card.width <= 186)).toBe(true);
        expect(geometry.every((card) => card.actualColumnGap >= 10)).toBe(true);
        const frames = await row.evaluate((node) => ({
          row: node.getBoundingClientRect().width,
          cards: [...node.querySelectorAll("article")].reduce(
            (sum, card) => sum + card.getBoundingClientRect().width,
            0,
          ),
          padding: parseFloat(getComputedStyle(node).paddingLeft) + parseFloat(getComputedStyle(node).paddingRight),
          gaps: parseFloat(getComputedStyle(node).columnGap) * 4,
        }));
        expect(Math.abs(frames.row - frames.cards - frames.padding - frames.gaps)).toBeLessThanOrEqual(1);
      }
      for (const key of ["nameTop", "timeTop", "iconTop"] as const) {
        const positions = geometry.map((card) => card[key]);
        expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
      }
      for (const key of ["width", "height", "footerTop", "footerHeight"] as const) {
        const positions = geometry.map((card) => card[key]);
        expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
      }
      expect(geometry.every((card) => card.footerHeight >= 48 && card.footerHeight <= 49)).toBe(true);
      await expect(row.locator("[data-prayer-footer]")).toHaveCount(5);
      await expect(row.locator('[data-prayer-state="current"] [data-prayer-detail]')).toHaveText(
        t(language, "prayerTracking.notRecorded"),
      );
      await expect(row.locator('[data-prayer="dhuhr"] [data-prayer-footer]')).toContainText(
        t(language, "prayerTracking.notRecorded"),
      );
      await expect(row.locator('[data-prayer="maghrib"] [data-prayer-footer]')).toContainText(
        t(language, "prayerTracking.afterPrayer", { prayer: t(language, "notifications.asr") }),
      );
      await expect(row).not.toContainText(/Rawatib|Optional|رواتب|مستحبة/);
      await expect(row).not.toContainText(/Opens 30m before|تفتح قبلها/);
      expect(geometry.find((card) => card.state === "next")!.visible).toBe(true);
      if (width >= 390) expect(geometry.find((card) => card.state === "current")!.visible).toBe(true);
      const next = row.locator('[data-prayer-state="next"]');
      await expect(next).toContainText(t(language, "prayerTracking.nextShort"));
      await expect(next.getByRole("progressbar")).toHaveCount(1);
      await expect(next.locator("[data-prayer-footer]").getByRole("progressbar")).toHaveCount(1);
      // The condensed strip owns a hidden countdown inside its button. At the
      // top only the separate footer countdown is visible.
      await expect(next.locator("[data-prayer-compact-countdown]")).toBeHidden();
      await expect(next.locator("[data-prayer-detail]")).toContainText(/باقي|left/);
      const countdownAlignment = await next.evaluate((card) => {
        const text = card.querySelector("[data-prayer-detail]")!;
        const range = document.createRange();
        range.selectNodeContents(text);
        const ink = range.getBoundingClientRect();
        const time = card.querySelector('[id^="prayer-summary-time-"]')!.getBoundingClientRect();
        const bar = card.querySelector("progress")!.getBoundingClientRect();
        const footer = card.querySelector("[data-prayer-footer]")!;
        const footerBox = footer.getBoundingClientRect();
        const rtl = getComputedStyle(card).direction === "rtl";
        return {
          fontSize: getComputedStyle(text).fontSize,
          alignment: getComputedStyle(text).textAlign,
          timeEdge: rtl ? Math.abs(ink.left - time.left) : Math.abs(ink.right - time.right),
          barInsetLeft: bar.left - footerBox.left,
          barInsetRight: footerBox.right - bar.right,
          belowText: bar.top - ink.bottom,
        };
      });
      expect(countdownAlignment.fontSize).toBe("14px");
      expect(countdownAlignment.alignment).toBe("end");
      expect(countdownAlignment.timeEdge).toBeLessThanOrEqual(1);
      expect(countdownAlignment.barInsetLeft).toBeCloseTo(14, 0);
      expect(countdownAlignment.barInsetRight).toBeCloseTo(14, 0);
      expect(countdownAlignment.belowText).toBeGreaterThanOrEqual(4);
      await page.screenshot({ path: testInfo.outputPath(`${language}-${width}-home.png`), scale: "css" });
      await page
        .getByTestId("home-prayer-strip")
        .screenshot({ path: testInfo.outputPath(`${language}-${width}-prayers.png`) });
      await row
        .getByRole("button", {
          name: t(language, "prayerTracking.openPrayer", { prayer: t(language, "notifications.fajr") }),
        })
        .focus();
      const focused = await row.evaluate((node) => {
        const frame = node.getBoundingClientRect();
        const focus = document.activeElement!.getBoundingClientRect();
        return focus.left >= frame.left && focus.right <= frame.right && focus.height >= 44;
      });
      expect(focused).toBe(true);
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "32px";
      });
      const enlarged = await row.locator("article").evaluateAll((nodes) =>
        nodes.map((node) => ({
          width: node.clientWidth,
          content: node.scrollWidth,
          height: node.getBoundingClientRect().height,
          footerTop: node.querySelector("[data-prayer-footer]")!.getBoundingClientRect().top,
        })),
      );
      expect(
        enlarged.every((card) => card.content <= card.width + 1),
        JSON.stringify(enlarged),
      ).toBe(true);
      for (const key of ["width", "height", "footerTop"] as const) {
        const positions = enlarged.map((card) => card[key]);
        expect(Math.max(...positions) - Math.min(...positions)).toBeLessThanOrEqual(1);
      }
      const footerTextBounds = await row.locator("[data-prayer-footer] > span").evaluateAll((nodes) =>
        nodes.map((node) => {
          const text = node.getBoundingClientRect();
          const footer = node.parentElement!.getBoundingClientRect();
          const style = getComputedStyle(node);
          return {
            text: node.textContent,
            left: text.left - footer.left,
            right: footer.right - text.right,
            top: text.top - footer.top,
            bottom: footer.bottom - text.bottom,
            ellipsis: style.textOverflow === "ellipsis",
            overflow: node.scrollWidth - node.clientWidth,
          };
        }),
      );
      expect(
        footerTextBounds.every(
          (item) =>
            item.left >= 0 &&
            item.right >= 0 &&
            item.top >= 0 &&
            item.bottom >= 0 &&
            !item.ellipsis &&
            item.overflow <= 1,
        ),
        JSON.stringify(footerTextBounds),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(row).not.toContainText(/Viewing|معروضة/);
      const current = row.locator('[data-prayer-state="current"]');
      await current.scrollIntoViewIfNeeded();
      // Horizontal focus recovery can scroll the Home region as well. Prove
      // footer activation in the expanded state it belongs to, including 200% text.
      await page
        .getByTestId("home-sticky-prayers")
        .locator("..")
        .evaluate((node) => {
          node.scrollTop = 0;
        });
      await expect(page.getByTestId("home-sticky-prayers")).not.toHaveAttribute("data-prayer-cards-condensed");
      await expect(current.locator("[data-prayer-footer]")).toBeVisible();
      const toggle = current.getByRole("button");
      const initiallyExpanded = await toggle.getAttribute("aria-expanded");
      const footerHit = (await current.locator("[data-prayer-footer]").boundingBox())!;
      await page.mouse.click(footerHit.x + footerHit.width / 2, footerHit.y + footerHit.height / 2);
      await expect(toggle).toHaveAttribute("aria-expanded", initiallyExpanded === "true" ? "false" : "true");
      await toggle.focus();
      await page.keyboard.press("Space");
      await expect(toggle).toHaveAttribute("aria-expanded", initiallyExpanded!);
      // Capture the single joined outline at ordinary text size after proving
      // full-card activation and equal geometry at 200%.
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "";
      });
      if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
      const panel = page.getByTestId("home-prayer-moment");
      await expect(panel).toHaveAttribute("data-prayer", (await current.getAttribute("data-prayer")) ?? "");
      await expect(row.locator('[data-selected="true"]')).toHaveCount(1);
      const matchingEdges = async () =>
        current.evaluate((node) => {
          const panel = document.querySelector('[data-testid="home-prayer-moment"]')!;
          const small = getComputedStyle(node, "::after");
          const detail = getComputedStyle(panel, "::before");
          return (
            small.content === '""' &&
            detail.content === '""' &&
            small.backgroundColor === detail.backgroundColor &&
            small.pointerEvents === "none" &&
            detail.pointerEvents === "none" &&
            small.height === "2px" &&
            detail.height === "2px"
          );
        });
      // WebKit can expose the start of even the reduced-motion transition
      // for one frame. Wait for the exact shared accent, without relaxing it.
      await expect.poll(matchingEdges).toBe(true);
      await expect(page.locator(".home-prayer-bridge")).toHaveCount(0);
      const oldScroll = await row.evaluate((node) => node.scrollLeft);
      await row.evaluate((node) => {
        node.scrollLeft += 16;
      });
      await expect.poll(matchingEdges).toBe(true);
      await row.evaluate((node, left) => {
        node.scrollLeft = left;
      }, oldScroll);
      await expect.poll(matchingEdges).toBe(true);
      await toggle.evaluate((node) => node.blur());
      await row.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath(`${language}-${width}-joined.png`), scale: "css" });
    });
  }
}

for (const language of ["ar", "en"] as const) {
  for (const width of [320, 390, 900, 1920]) {
    test(`@cross-browser ${language} clear Home and independent appearance at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.clock.setFixedTime(new Date("2026-10-14T14:00:00+03:00"));
      await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
      await page.addInitScript((language) => {
        if (localStorage.getItem("azkarapp.state.v1")) return;
        localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: { language, themeMode: "midnight", reduceMotion: true },
            profile: { isGuest: true },
          }),
        );
      }, language);
      await page.goto("/#/home");
      const header = page.getByTestId("home-utility-header");
      const frame = await header.evaluate((element) => {
        const outer = element.getBoundingClientRect();
        const canvas = element.closest('[role="region"]')!.getBoundingClientRect();
        const inner = element.querySelector('[data-testid="home-header-content"]')!.getBoundingClientRect();
        const grid = document.querySelector('[data-testid="home-content-grid"]')!.getBoundingClientRect();
        return {
          outerLeft: outer.left,
          outerRight: outer.right,
          canvasLeft: canvas.left,
          canvasRight: canvas.right,
          innerLeft: inner.left,
          innerRight: inner.right,
          gridLeft: grid.left,
          gridRight: grid.right,
        };
      });
      expect(Math.abs(frame.outerLeft - frame.canvasLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.outerRight - frame.canvasRight)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.innerLeft - frame.gridLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(frame.innerRight - frame.gridRight)).toBeLessThanOrEqual(1);
      const strip = page.getByTestId("home-prayer-strip");
      await expect(strip.locator('[data-density="summary"]')).toHaveCount(5);
      await expect(page.getByTestId("prayer-card-dhuhr")).toHaveAttribute("data-prayer-state", "current");
      await expect(page.getByTestId("prayer-card-asr")).toHaveAttribute("data-prayer-state", "next");
      await expect(strip.getByRole("button", { name: t(language, "settings.showAllPrayers") })).toHaveCount(0);
      const allRow = page.getByTestId("home-all-prayers-row");
      const prayerTops = await allRow
        .locator("article")
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
      expect(Math.max(...prayerTops) - Math.min(...prayerTops)).toBeLessThanOrEqual(1);
      const overflowing = await allRow.evaluate((row) => row.scrollWidth > row.clientWidth + 1);
      expect(overflowing).toBe(width < 1200);
      await expect(strip.locator("#home-prayer-scroll-hint")).toHaveCount(0);
      if (overflowing) {
        // Start at the first prayer: initially revealing Asr may already reach
        // the scroll limit on tablet widths, where another forward key is inert.
        await allRow.evaluate((row) => {
          row.scrollLeft = 0;
        });
        await allRow.focus();
        await expect(allRow).toBeFocused();
        const beforeKey = await allRow.evaluate((row) => row.scrollLeft);
        await allRow.press(language === "ar" ? "ArrowLeft" : "ArrowRight");
        await expect.poll(() => allRow.evaluate((row) => row.scrollLeft)).not.toBe(beforeKey);
      }
      const anatomy = await allRow.locator("article").evaluateAll((cards) =>
        cards.map((card) => {
          const identity = card.querySelector("[data-prayer-identity] h3")!.getBoundingClientRect();
          const timing = card.querySelector("[data-prayer-timing] p")!.getBoundingClientRect();
          const bounds = card.getBoundingClientRect();
          return {
            separated: identity.right + 4 <= timing.left || timing.right + 4 <= identity.left,
            width: bounds.width,
            height: bounds.height,
          };
        }),
      );
      const availableRowWidth = await allRow.evaluate((node) => node.clientWidth);
      expect(
        anatomy.every(
          (card) =>
            card.separated &&
            card.width >= 152 &&
            card.width <= Math.max(240, availableRowWidth / 5) &&
            card.height >= 64,
        ),
      ).toBe(true);

      await allRow.locator("article").last().scrollIntoViewIfNeeded();
      const lastReachable = await allRow.evaluate((row) => {
        const viewport = row.getBoundingClientRect();
        const last = row.querySelector("article:last-child")!.getBoundingClientRect();
        return last.left >= viewport.left - 1 && last.right <= viewport.right + 1;
      });
      expect(lastReachable).toBe(true);
      const prayerTime = allRow.locator('[id^="prayer-summary-time-"]').first();
      expect(await prayerTime.evaluate((node) => parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(
        width < 640 ? 16 : 15,
      );
      expect(await prayerTime.evaluate((node) => Number(getComputedStyle(node).fontWeight))).toBeGreaterThanOrEqual(
        800,
      );
      await expect(strip.locator('[data-density="summary"]')).toHaveCount(5);
      const path = page.getByTestId("home-header-routine-summary");
      if (width >= 600) await expect(path).toBeVisible();
      else await expect(path).toBeHidden();
      const mobilePath = page.getByTestId("home-header-routine-summary-mobile");
      if (width < 600) await expect(mobilePath).toBeVisible();
      else await expect(mobilePath).toBeHidden();
      const date = page.getByTestId("hijri-date");
      const visiblePath = width < 600 ? mobilePath : path;
      const [dateBounds, pathBounds] = await Promise.all([date.boundingBox(), visiblePath.boundingBox()]);
      expect(dateBounds).not.toBeNull();
      expect(pathBounds).not.toBeNull();
      if (language === "ar") expect(dateBounds!.x).toBeGreaterThanOrEqual(pathBounds!.x + pathBounds!.width);
      else expect(dateBounds!.x + dateBounds!.width).toBeLessThanOrEqual(pathBounds!.x);
      await expect(visiblePath.locator("svg")).toHaveCount(2);
      expect(
        await date.evaluate((node) => {
          const time = node.querySelector("time")!;
          return (
            time.scrollWidth <= node.clientWidth + 1 &&
            time.getBoundingClientRect().bottom <= node.getBoundingClientRect().bottom + 1
          );
        }),
      ).toBe(true);
      const cards = page.getByTestId("wird-category-card");
      await expect(cards).toHaveCount(4);
      if (width < 640) {
        const positions = await cards.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
        expect(Math.abs(positions[0]! - positions[1]!)).toBeLessThanOrEqual(1);
        expect(Math.abs(positions[2]! - positions[3]!)).toBeLessThanOrEqual(1);
        expect(positions[2]!).toBeGreaterThan(positions[0]!);
        const heights = await cards.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
        for (const height of heights) {
          expect(height).toBeGreaterThanOrEqual(120);
          expect(height).toBeLessThanOrEqual(160);
        }
        const spacing = await cards
          .first()
          .locator(".home-wird-caption")
          .evaluate((node) => {
            const style = getComputedStyle(node);
            return { top: style.paddingTop, bottom: style.paddingBottom, minimum: style.minHeight };
          });
        expect(spacing).toEqual({ top: "12px", bottom: "12px", minimum: "120px" });
      }
      await expect(cards.locator("img")).toHaveCount(0);
      await expect(page.getByTestId("daily-evidence-hadith")).toBeVisible();
      await expect(page.getByTestId("open-wird-benefits")).toBeVisible();
      await expect(page.getByTestId("situational-shortcuts").locator("a svg")).toHaveCount(3);
      await page.goto("/#/settings/appearance");
      const images = page.getByRole("switch", { name: new RegExp(t(language, "settings.homeWirdImages")) });
      await page.getByText(t(language, "settings.customizeHome"), { exact: true }).click();
      const homeAppearance = page.getByRole("radiogroup", { name: t(language, "settings.homeMaterial"), exact: true });
      const transparency = homeAppearance.getByRole("radio", {
        name: t(language, "settings.homeMaterial_solid"),
        exact: true,
      });
      await transparency.click();
      await expect(images).toHaveAttribute("aria-checked", "false");
      await expect(transparency).toHaveAttribute("aria-checked", "true");
      await images.click();
      await expect(transparency).toHaveAttribute("aria-checked", "true");
      await page.goto("/#/home");
      await expect(cards.locator("img")).toHaveCount(4);
      const caption = cards.first().locator(".home-wird-caption");
      const material = await caption.evaluate((node) => ({
        filter: getComputedStyle(node).backdropFilter,
        systemReduced: matchMedia("(prefers-reduced-transparency: reduce)").matches,
        color: getComputedStyle(node).backgroundColor,
      }));
      if (material.systemReduced) {
        expect(material.filter).toBe("none");
        expect(await caption.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("linear-gradient");
      } else {
        expect(material.filter).toBe("none");
        expect(await caption.evaluate((node) => getComputedStyle(node).backgroundImage)).toContain("linear-gradient");
      }
      await page.goto("/#/settings/appearance");
      await page.getByText(t(language, "settings.customizeHome"), { exact: true }).click();
      await homeAppearance
        .getByRole("radio", { name: t(language, "settings.homeMaterial_solid"), exact: true })
        .click();
      await expect(images).toHaveAttribute("aria-checked", "true");
      await page.goto("/#/home");
      await page.reload();
      await expect(cards.locator("img")).toHaveCount(4);
      expect(await caption.evaluate((node) => getComputedStyle(node).backdropFilter)).toBe("none");
      await page.goto("/#/settings/appearance");
      await images.click();
      await page.goto("/#/home");
      await expect(cards.locator("img")).toHaveCount(0);
      if (width === 320) {
        const shortcuts = page.getByTestId("situational-shortcuts");
        await shortcuts.getByRole("button", { name: t(language, "reader.viewAll"), exact: true }).click();
        await page.locator("html").evaluate((node) => {
          node.style.fontSize = "32px";
        });
        const links = shortcuts.getByRole("link");
        await expect(links).toHaveCount(6);
        expect(
          await links.evaluateAll((nodes) =>
            nodes.every(
              (node) => node.scrollWidth <= node.clientWidth + 1 && node.scrollHeight <= node.clientHeight + 1,
            ),
          ),
        ).toBe(true);
        const tops = await links.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
        expect(new Set(tops).size).toBe(6);
      }
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
        .toBeLessThanOrEqual(0);
      expect(await cards.evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(
        true,
      );
      await cards.first().focus();
      await expect(cards.first()).toBeFocused();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      await page.screenshot({ path: testInfo.outputPath(`${language}-home-clear-${width}.png`) });
    });
  }
}
