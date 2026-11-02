import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { t } from "../src/app/i18n";

test.use({ serviceWorkers: "block" });

for (const language of ["ar", "en"] as const) {
  test(`selective Mushaf pack and protected juz picker ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, appMaterial: "glass" },
          profile: { isGuest: true },
        }),
      );
    }, language);
    const acquired: string[] = [];
    await page.route(/\/(data\/mushaf\/42\.json|fonts\/qcf-v2\/2026-10-11\/p42\.woff2)$/, async (route) => {
      acquired.push(new URL(route.request().url()).pathname);
      await route.continue();
    });
    await page.goto("/#/settings/downloads");
    const selection = page.getByTestId("mushaf-download-selection");
    await selection.locator("summary").click();
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(
      () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
    );
    const picker = selection.getByRole("combobox");
    await picker.click();
    const list = page.getByRole("listbox");
    await expect(list).toBeVisible();
    await expect
      .poll(() =>
        list.evaluate((node) => {
          const r = node.getBoundingClientRect();
          const background = getComputedStyle(node.closest("[data-dropdown-surface]") ?? node).backgroundColor;
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + Math.min(20, r.height / 2));
          return {
            bounded: r.x >= -1 && r.right <= innerWidth + 1 && r.y >= -1 && r.bottom <= innerHeight + 1,
            opaque: !background.includes("rgba") && background !== "transparent",
            hit: node.contains(hit),
          };
        }),
      )
      .toEqual({ bounded: true, opaque: true, hit: true });
    await page.screenshot({ path: info.outputPath("protected-juz-picker.png") });
    await page.evaluate(() => {
      const events: unknown[] = [];
      Object.assign(window, { __pickerEvents: events });
      for (const type of ["pointerdown", "pointerup", "click"])
        document.addEventListener(
          type,
          (event) => {
            const pointer = event as PointerEvent;
            queueMicrotask(() =>
              events.push({
                type,
                target: (event.target as HTMLElement).outerHTML?.slice(0, 180),
                prevented: event.defaultPrevented,
                x: pointer.clientX,
                y: pointer.clientY,
              }),
            );
          },
          true,
        );
    });
    await list.getByRole("option").nth(2).click();
    await info.attach("juz-pointer-events.json", {
      body: JSON.stringify(
        await page.evaluate(() => (window as unknown as { __pickerEvents: unknown[] }).__pickerEvents),
      ),
      contentType: "application/json",
    });
    await expect(selection.getByLabel(t(language, "downloads.startPage"), { exact: true })).toHaveValue("22");
    await expect(selection.getByLabel(t(language, "downloads.endPage"), { exact: true })).toHaveValue("41");
    await selection.getByLabel(t(language, "downloads.startPage"), { exact: true }).fill("42");
    await selection.getByLabel(t(language, "downloads.endPage"), { exact: true }).fill("42");
    const submit = selection.getByRole("button", { name: t(language, "downloads.downloadPages"), exact: true });
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect(page.getByText(t(language, "downloads.downloadComplete"), { exact: true })).toBeVisible();
    expect(acquired.sort()).toEqual(["/data/mushaf/42.json", "/fonts/qcf-v2/2026-10-11/p42.woff2"]);
    await expect(page.getByTestId("offline-resource-mushaf")).toContainText(
      t(language, "downloads.mushafProgressValue", {
        completed: language === "ar" ? "١" : "1",
        total: language === "ar" ? "٦٠٤" : "604",
      }),
    );
    expect(await selection.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
    expect(
      (await new AxeBuilder({ page }).include('[data-testid="mushaf-download-selection"]').analyze()).violations,
    ).toEqual([]);
  });
}

for (const language of ["ar", "en"] as const) {
  test(`ordered narrow saved-page chart ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.clock.setFixedTime(new Date("2026-10-20T12:00:00+03:00"));
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, reduceMotion: true, calendarType: "gregorian" },
          profile: { isGuest: true },
          wirdHistory: { "2026-10-19": [1, 2] },
        }),
      );
    }, language);
    await page.goto("/#/progress/month");
    const chart = page.locator(".recorded-pages-chart");
    await expect(chart).toBeVisible();
    for (const scale of [1, 2]) {
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${16 * scale}px`;
      }, scale);
      await page.evaluate(() => document.fonts.ready);
      await expect
        .poll(() =>
          chart
            .locator("li")
            .evaluateAll((items) => new Set(items.map((item) => Math.round(item.getBoundingClientRect().y))).size),
        )
        .toBe(7);
      const dates = await chart.locator("time").evaluateAll((items) => items.map((item) => item.dateTime));
      expect(dates).toEqual([...dates].sort());
      expect(await chart.evaluate((node) => node.scrollWidth - node.clientWidth)).toBeLessThanOrEqual(1);
      const fills = await chart
        .locator(".recorded-pages-track > span")
        .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().width));
      expect(fills.filter((width) => width > 1)).toHaveLength(1);
      await chart.screenshot({ path: info.outputPath(`chart-${language}-${scale}.png`) });
    }
    expect((await new AxeBuilder({ page }).include(".recorded-pages-chart").analyze()).violations).toEqual([]);
  });
}

test("download survives navigation and cancels from the returning screen @cross-browser", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({ settings: { language: "en", reduceMotion: true }, profile: { isGuest: true } }),
    );
    const original = fetch.bind(window);
    Object.assign(window, { __downloadAborts: 0 });
    window.fetch = async (input, options) => {
      if (!String(input).includes("r2.dev/")) return original(input, options);
      return new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(new Uint8Array(4096));
            options?.signal?.addEventListener(
              "abort",
              () => {
                Object.assign(window, {
                  __downloadAborts: (window as unknown as { __downloadAborts: number }).__downloadAborts + 1,
                });
                controller.error(new DOMException("Cancelled", "AbortError"));
              },
              { once: true },
            );
          },
        }),
        { headers: { "content-type": "audio/mpeg" } },
      );
    };
  });
  await page.goto("/#/settings/downloads");
  const row = page.getByTestId("offline-resource-adhkar");
  await row.getByRole("button", { name: /^Download ·/ }).click();
  await expect(row.getByRole("progressbar")).toHaveAttribute("value", "4096");
  await page.getByTestId("nav-home").click();
  await expect(page.getByTestId("home-daily-evidence")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __downloadAborts: number }).__downloadAborts)).toBe(0);
  await page.getByTestId("nav-settings").click();
  await page.evaluate(() => {
    window.location.hash = "/settings/downloads";
  });
  await expect(row.getByRole("progressbar")).toHaveAttribute("value", "4096");
  await expect(row).toHaveAttribute("data-transfer-state", "active");
  await page.screenshot({ path: info.outputPath("continued-download.png") });
  await row.getByRole("button", { name: /^Cancel download ·/ }).click();
  await expect(row.getByRole("progressbar")).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { __downloadAborts: number }).__downloadAborts)).toBe(1);
});

for (const mode of ["default", "app", "os"] as const) {
  test(`shared button icon cue ${mode} @cross-browser`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: mode === "os" ? "reduce" : "no-preference" });
    await page.addInitScript((reduceMotion) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "en", reduceMotion }, profile: { isGuest: true } }),
      );
    }, mode === "app");
    await page.goto("/#/settings/downloads");
    const button = page.getByTestId("offline-resource-adhkar").getByRole("button", { name: /^Download ·/ });
    await expect(button).toBeEnabled();
    const geometry = () =>
      button.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const parent = node.parentElement!.getBoundingClientRect();
        return { width: rect.width, height: rect.height, x: rect.x - parent.x, y: rect.y - parent.y };
      });
    const before = await geometry();
    await page.keyboard.press("Tab");
    await button.focus();
    await expect(button.locator("svg")).toHaveCSS("scale", mode === "default" ? "1.1" : "1");
    expect(await geometry()).toEqual(before);
    if (await page.evaluate(() => matchMedia("(hover:hover) and (pointer:fine)").matches)) {
      await button.hover();
      await expect(button.locator("svg")).toHaveCSS("scale", mode === "default" ? "1.1" : "1");
    }
  });
}
