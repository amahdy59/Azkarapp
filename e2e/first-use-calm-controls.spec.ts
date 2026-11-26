import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { t } from "../src/app/i18n";

// These surface tests do not exercise upgrades. Keep a first-install worker's
// refresh notice from obscuring controls during repeated theme reloads.
test.use({ serviceWorkers: "block" });

for (const language of ["ar", "en"] as const) {
  test(`welcome stays protected across appearance modes in ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.addInitScript(
      ({ language }) => {
        const mode = JSON.parse(sessionStorage.getItem("welcome-mode") ?? "{}");
        localStorage.removeItem("azkarapp.onboarding-complete.v1");
        localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({
            settings: {
              language,
              reduceMotion: true,
              ...mode,
              reminders: { morning: { enabled: true, time: "07:30" } },
            },
            profile: { isGuest: true },
          }),
        );
        Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Test browser" });
        Object.defineProperty(navigator, "platform", { configurable: true, value: "Test" });
        Object.defineProperty(window, "Notification", {
          configurable: true,
          value: { permission: "default", requestPermission: async () => "default" },
        });
      },
      { language },
    );
    const modes = [
      { themeMode: "light", appMaterial: "solid" },
      { themeMode: "dark", appMaterial: "glass" },
      { themeMode: "midnight", appMaterial: "glass" },
      { themeMode: "light", appMaterial: "glass", highContrast: true },
      { themeMode: "dark", appMaterial: "glass", reduceTransparency: true },
    ];
    await page.goto("/");
    for (const mode of modes) {
      await page.evaluate((mode) => sessionStorage.setItem("welcome-mode", JSON.stringify(mode)), mode);
      await page.goto("/");
      await page.getByTestId(`language-option-${language}`).click();
      await page.getByTestId("confirm-language").click();
      await page.getByTestId("onboarding-get-started").click();
      await page.locator("html").evaluate((node) => {
        node.style.fontSize = "200%";
      });
      const setup = page.getByTestId("first-use-setup");
      const button = setup.getByRole("button", { name: t(language, "notifications.requestPermission"), exact: true });
      await expect(button).toBeVisible();
      await button.scrollIntoViewIfNeeded();
      expect(
        await button.evaluate((node) => {
          const r = node.getBoundingClientRect();
          return {
            target: r.height >= 44,
            hit: node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)),
          };
        }),
      ).toEqual({ target: true, hit: true });
      expect(
        await setup.evaluate((node) => {
          const c = getComputedStyle(node).backgroundColor;
          const s = node.querySelector(".overflow-y-auto")!;
          return { opaque: !c.startsWith("rgba"), fits: s.scrollWidth <= s.clientWidth + 1 };
        }),
      ).toEqual({ opaque: true, fits: true });
      expect((await new AxeBuilder({ page }).include('[data-testid="first-use-setup"]').analyze()).violations).toEqual(
        [],
      );
      await page.screenshot({
        path: info.outputPath(
          `welcome-${language}-${mode.themeMode}-${mode.highContrast ? "contrast" : mode.reduceTransparency ? "opaque" : mode.appMaterial}.png`,
        ),
      });
    }
  });
  test(`notification-first layout and city selection in ${language} @cross-browser`, async ({ page }, info) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Notification-capable test browser" });
      Object.defineProperty(navigator, "platform", { configurable: true, value: "Test" });
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: {
          permission: "default",
          requestPermission: async () => {
            Object.defineProperty(Notification, "permission", { value: "granted", configurable: true });
            return "granted";
          },
        },
      });
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByTestId(`language-option-${language}`).click();
    await page.getByTestId("confirm-language").click();
    await page.getByTestId("onboarding-get-started").click();
    const setup = page.getByTestId("first-use-setup");
    const enable = setup.getByRole("button", { name: t(language, "notifications.requestPermission"), exact: true });
    await expect(enable).toBeVisible();
    await expect(setup.getByTestId("first-use-reminders")).not.toHaveAttribute("open");
    for (const [width, height, scale] of [
      [390, 844, 100],
      [834, 1112, 100],
      [1440, 900, 100],
      [320, 568, 200],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.locator("html").evaluate((node, scale) => {
        node.style.fontSize = `${scale}%`;
      }, scale);
      await page.evaluate(() => document.fonts.ready);
      await expect(async () => {
        await expect(enable).toBeVisible();
        await enable.scrollIntoViewIfNeeded();
      }).toPass({ timeout: 15000 });
      const geometry = await setup.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        const scroll = node.querySelector(".overflow-y-auto")!;
        const color = getComputedStyle(node).backgroundColor;
        return {
          fits: rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1,
          noOverflow: scroll.scrollWidth <= scroll.clientWidth + 1,
          bounded: rect.width <= 30 * parseFloat(getComputedStyle(document.documentElement).fontSize) + 1,
          bottom: node.dataset.overlaySurface !== "sheet" || Math.abs(rect.bottom - innerHeight) <= 1,
          opaque: !color.startsWith("rgba"),
        };
      });
      expect(geometry).toEqual({ fits: true, noOverflow: true, bounded: true, bottom: true, opaque: true });
      await expect(enable).toBeInViewport();
      await page.screenshot({ path: info.outputPath(`welcome-${language}-${width}-${scale}.png`) });
    }
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "100%";
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect((await new AxeBuilder({ page }).include('[data-testid="first-use-setup"]').analyze()).violations).toEqual(
      [],
    );
    await enable.click();
    await expect(setup.locator(".first-use-heading")).toHaveText(t(language, "firstUse.locationTitle"));
    await expect(setup.locator(".first-use-heading")).toBeFocused();
    await page.screenshot({ path: info.outputPath(`city-step-${language}.png`) });
    await setup.getByRole("button", { name: t(language, "firstUse.chooseCity"), exact: true }).click();
    await expect(setup.getByRole("searchbox")).toBeFocused();
    await setup.getByRole("searchbox").fill("London");
    await page.screenshot({ path: info.outputPath(`city-search-${language}.png`) });
    await setup.getByRole("button", { name: language === "ar" ? /لندن/ : /London/ }).click();
    await expect(setup).toBeHidden();
    await expect
      .poll(() =>
        page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.location.cityName),
      )
      .toBe("London");
    await page.reload();
    await expect(page.getByTestId("nav-home").first()).toBeVisible();
    await expect(setup).toBeHidden();
  });
  test(`first-use permissions are optional and reminders are preselected in ${language} @cross-browser`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Notification-capable test browser" });
      Object.defineProperty(navigator, "platform", { configurable: true, value: "Test" });
      const calls = { notifications: 0, storage: 0 };
      Object.assign(window, { setupPermissionCalls: calls });
      Object.defineProperty(window, "Notification", {
        configurable: true,
        value: {
          permission: "default",
          requestPermission: async () => {
            calls.notifications++;
            return "denied";
          },
        },
      });
      Object.defineProperty(navigator, "storage", {
        configurable: true,
        value: {
          persisted: async () => false,
          persist: async () => {
            calls.storage++;
            return false;
          },
        },
      });
    });
    await page.goto("/");
    await page.getByTestId(`language-option-${language}`).click();
    await page.getByTestId("confirm-language").click();
    await page.getByTestId("onboarding-get-started").click();
    const setup = page.getByTestId("first-use-setup");
    await expect(setup).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { setupPermissionCalls: object }).setupPermissionCalls),
    ).toEqual({ notifications: 0, storage: 0 });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const reminders = JSON.parse(localStorage.getItem("azkarapp.state.v1")!).settings.reminders;
          return Object.fromEntries(
            ["prayer", "morning", "evening", "before_sleep", "after_prayer", "beforeFajrDua"].map((kind) => [
              kind,
              reminders[kind]?.enabled,
            ]),
          );
        }),
      )
      .toEqual({
        prayer: true,
        morning: true,
        evening: true,
        before_sleep: true,
        after_prayer: true,
        beforeFajrDua: false,
      });
    await setup.getByRole("button", { name: t(language, "notifications.requestPermission"), exact: true }).click();
    await expect(setup.getByRole("heading", { name: t(language, "firstUse.blockedTitle"), exact: true })).toBeVisible();
    await expect(setup.getByRole("button", { name: t(language, "firstUse.protectStorage"), exact: true })).toHaveCount(
      0,
    );
    expect(
      await page.evaluate(() => (window as unknown as { setupPermissionCalls: object }).setupPermissionCalls),
    ).toEqual({ notifications: 1, storage: 0 });
    expect((await new AxeBuilder({ page }).include('[data-testid="first-use-setup"]').analyze()).violations).toEqual(
      [],
    );
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator("html").evaluate((node) => {
      node.style.fontSize = "200%";
    });
    const content = setup.locator(".overflow-y-auto");
    await expect(content).toHaveCSS("overflow-y", "auto");
    const continueButton = setup.getByRole("button", { name: t(language, "firstUse.continue"), exact: true });
    await page.evaluate(() => document.fonts.ready);
    await content.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });
    await continueButton.focus();
    await continueButton.scrollIntoViewIfNeeded();
    await expect(continueButton).toBeInViewport();
    expect(await content.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: `output/first-use-setup-${language}-320-200.png` });
    await setup.getByRole("button", { name: t(language, "firstUse.continue"), exact: true }).click();
    await expect(setup).toBeHidden();
    await page.goto("/#/settings/account-data");
    const storage = page.getByTestId("storage-protection");
    await expect(storage).not.toHaveAttribute("open");
    await storage.locator("summary").click();
    await storage.getByRole("button", { name: t(language, "firstUse.protectStorage"), exact: true }).click();
    expect(
      await page.evaluate(() => (window as unknown as { setupPermissionCalls: object }).setupPermissionCalls),
    ).toEqual({ notifications: 1, storage: 1 });
    await page.reload();
    await expect(page.getByTestId("nav-home").first()).toBeVisible();
    await expect(setup).toBeHidden();
  });

  test(`palm summary and shared pills stay calm and usable in ${language} @cross-browser`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: { language, themeMode: "light", appMaterial: "solid", reduceMotion: true },
          profile: { isGuest: true },
        }),
      );
    }, language);
    await page.goto("/#/home");
    const opener = page.getByTestId("home-header-routine-summary-mobile");
    await expect(opener).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await opener.click();
    const sheet = page.getByTestId("todays-path-sheet");
    const guide = sheet.getByTestId("path-growth-guide");
    await expect(guide).not.toHaveAttribute("open");
    await expect(sheet.locator("[data-reward-tier]").first()).toBeHidden();
    await page.screenshot({ path: info.outputPath(`palm-${language}.png`) });
    await guide.locator("summary").click();
    await expect(sheet.locator("[data-reward-tier]").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await page.goto("/#/azkar");
    const tabs = page.locator(".library-section-tabs");
    await expect(tabs).toHaveClass(/choice-pill/);
    const saved = tabs.getByRole("tab").last();
    await saved.focus();
    await saved.press("Home");
    await expect(tabs.getByRole("tab").first()).toBeFocused();
    await saved.press("End");
    await expect(saved).toHaveAttribute("aria-selected", "true");
    for (const enlarged of [false, true]) {
      await page.setViewportSize({ width: enlarged ? 320 : 390, height: 844 });
      await page.locator("html").evaluate((node, enlarged) => {
        node.style.fontSize = enlarged ? "200%" : "100%";
      }, enlarged);
      for (const button of await tabs.getByRole("tab").all()) {
        const bounds = (await button.boundingBox())!;
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
      }
      expect(await tabs.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      expect((await new AxeBuilder({ page }).include(".library-stationary-header").analyze()).violations).toEqual([]);
      await page.screenshot({ path: info.outputPath(`library-pill-${language}-${enlarged ? 200 : 100}.png`) });
    }
  });

  test(`Library filter disclosure wraps and keeps keyboard recovery in ${language} @cross-browser`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript((language) => {
      const mode = JSON.parse(sessionStorage.getItem("test-filter-appearance") ?? "{}");
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({
          settings: {
            language,
            themeMode: "light",
            appMaterial: "solid",
            reduceMotion: true,
            highContrast: false,
            reduceTransparency: false,
            ...mode,
          },
          profile: { isGuest: true },
        }),
      );
    }, language);
    const modes = [
      { themeMode: "light", appMaterial: "solid" },
      { themeMode: "dark", appMaterial: "glass" },
      { themeMode: "midnight", appMaterial: "glass" },
      { themeMode: "light", appMaterial: "glass", highContrast: true },
      { themeMode: "dark", appMaterial: "glass", reduceTransparency: true },
    ];
    for (const mode of modes) {
      await page.goto("/#/azkar");
      await page.evaluate((mode) => {
        sessionStorage.setItem("test-filter-appearance", JSON.stringify(mode));
      }, mode);
      await page.reload();
      await expect(page.locator("html")).toHaveClass(new RegExp(`theme-${mode.themeMode}`));
      const filters = page.getByTestId("library-filter-disclosure");
      const trigger = filters.locator(".responsive-filter-trigger");
      const sheet = page.getByTestId("library-filter-disclosure-sheet");
      await expect(trigger).toBeVisible();
      await trigger.focus();
      await trigger.press("Enter");
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const search = page.getByRole("textbox");
      const query =
        language === "ar"
          ? "دعاء طويل لاختبار التفاف النص وحفظ البحث"
          : "A long search to check wrapping and retained filters";
      await search.fill(query);
      await sheet.getByTestId("modal-close-button").focus();
      await sheet.getByTestId("modal-close-button").press("Space");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toBeFocused();
      await expect(trigger.locator(".responsive-filter-context")).toContainText(query);
      for (const enlarged of [false, true]) {
        await page.setViewportSize({ width: enlarged ? 320 : 390, height: 844 });
        await page.locator("html").evaluate((node, enlarged) => {
          node.style.fontSize = enlarged ? "200%" : "100%";
        }, enlarged);
        await trigger.scrollIntoViewIfNeeded();
        await expect
          .poll(async () => {
            await trigger.scrollIntoViewIfNeeded();
            return trigger.evaluate((node) => {
              const rect = node.getBoundingClientRect();
              return {
                fits: node.scrollWidth <= node.clientWidth + 1 && rect.left >= 0 && rect.right <= innerWidth,
                target: rect.height >= 44,
                hit: node.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)),
              };
            });
          })
          .toEqual({ fits: true, target: true, hit: true });
        expect(
          (await new AxeBuilder({ page }).include('[data-testid="library-filter-disclosure"]').analyze()).violations,
        ).toEqual([]);
        await page.screenshot({
          path: info.outputPath(
            `filters-${language}-${mode.themeMode}-${mode.highContrast ? "contrast" : mode.reduceTransparency ? "opaque" : mode.appMaterial}-${enlarged ? 200 : 100}.png`,
          ),
        });
      }
      await trigger.press("Enter");
      await expect(search).toHaveValue(query);
      await page.setViewportSize({ width: 834, height: 1112 });
      await expect(trigger).toBeHidden();
      await expect(search).toBeVisible();
      await page.setViewportSize({ width: 1440, height: 900 });
      await expect(search).toBeVisible();
      await page.setViewportSize({ width: 390, height: 844 });
    }
  });
}

test("Collections restart daily while Al-Kahf stays weekly and saved history survives @cross-browser", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-01T12:00:00+02:00") });
  await page.addInitScript(() => {
    if (localStorage.getItem("azkarapp.onboarding-complete.v1")) return;
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem("azkarapp.friday-kahf-week.v1", "2026-11-06");
    localStorage.setItem(
      "azkarapp.friday-dua-reading.v1",
      JSON.stringify({ dayKey: "2026-11-01", ids: ["comprehensive-dua-01"] }),
    );
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", reduceMotion: true },
        lastActiveDayKey: "2026-11-01",
        completed: {
          comprehensive_duas: ["comprehensive-dua-01"],
          travel: ["tr-ref-1"],
          illness_ruqyah: ["ir-ref-1"],
          friday_kahf: ["friday-kahf"],
        },
        partialZikrCounts: { "comprehensive-dua-02": 1, "tr-ref-1": 2 },
        surahReadingPages: { "friday-kahf": 295, "ir-ref-5a": 604 },
        khatmahPage: 100,
        savedZikrIds: ["comprehensive-dua-01"],
      }),
    );
  });
  await page.goto("/#/home");
  // Persisted seed data exists before React mounts. Wait for the screen so
  // the midnight timer is active before advancing the clock.
  await expect(page.getByTestId("home-all-prayers-row")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed.comprehensive_duas),
    )
    .toEqual(["comprehensive-dua-01"]);
  await page.clock.fastForward(24 * 60 * 60 * 1000);
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed.comprehensive_duas),
    )
    .toEqual([]);
  const nextDay = await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!));
  expect(nextDay.completed.travel).toEqual([]);
  expect(nextDay.completed.illness_ruqyah).toEqual([]);
  expect(nextDay.completed.friday_kahf).toEqual(["friday-kahf"]);
  expect(nextDay.surahReadingPages).toEqual({ "friday-kahf": 295 });
  expect(nextDay.khatmahPage).toBe(100);
  expect(nextDay.partialZikrCounts).toEqual({});
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).savedZikrIds)).toContain(
    "comprehensive-dua-01",
  );
  await page.reload();
  // Likewise, stored data alone does not prove the reloaded router has
  // mounted its hash listener before the next same-document navigation.
  await expect(page.getByTestId("home-all-prayers-row")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem("azkarapp.state.v1")!).completed.comprehensive_duas),
    )
    .toEqual([]);
  await page.goto("/#/friday");
  await expect(page.getByRole("button", { name: /Comprehensive duas.*0\s*\//i })).toBeVisible();
});
