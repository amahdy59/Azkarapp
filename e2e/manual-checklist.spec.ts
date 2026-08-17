/**
 * Automated evidence for rows of the Manual release record in
 * `docs/QUALITY_CHECKLIST.md` that do not actually require a human.
 *
 * These do NOT replace the rows that need a real screen reader, real device
 * hardware, or human judgement — screen reader, safe areas, performance and
 * media alternatives stay manual and stay Pending until someone does them.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

type Settings = Record<string, unknown>;

async function seedAndOpen(page: Page, settings: Settings = {}) {
  await page.addInitScript((overrides) => {
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    window.localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: {
          language: "en",
          themeMode: "midnight",
          textSize: "medium",
          highContrast: false,
          boldText: false,
          reduceMotion: true,
          forceRtl: false,
          colorBlindSupport: "none",
          ...(overrides as object),
        },
        profile: { displayName: "Guest", lastPhoneNumber: "", isGuest: true },
        completed: { morning: [], evening: [], before_sleep: [] },
        sessions: [],
      }),
    );
  }, settings);

  await page.goto("/");
  await expect(page.getByRole("status", { name: /Loading/i })).toHaveCount(0, { timeout: 10_000 });
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });
}

/** Horizontal overflow is the clearest machine-checkable symptom of clipping. */
async function expectNoHorizontalOverflow(page: Page, context: string) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth, `${context}: page scrolls horizontally`).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/**
 * The shared screen-header title no longer promises one line — it promises the
 * whole name. It wraps to at most two lines and steps down a size below 360px
 * rather than truncating, because a collection name cut to "أذكار ال…" names
 * nothing and fitting the longest names on one line at 320px would need a
 * ~14px h1.
 *
 * Clipping is measured against an unclamped probe at the same width and font.
 * `scrollHeight > clientHeight` is meaningless here: `line-clamp` renders the
 * heading as a `-webkit-box`, where the two differ even when nothing is cut.
 */
async function expectUnclippedHeading(heading: Locator, context: string) {
  await expect(heading).toBeVisible();
  const metrics = await heading.evaluate((element) => {
    const style = getComputedStyle(element);
    const lineHeight = Number.parseFloat(style.lineHeight);

    const probe = document.createElement("div");
    probe.style.cssText =
      `position:absolute;visibility:hidden;left:-9999px;top:0;width:${element.clientWidth}px;` +
      `font-family:${style.fontFamily};font-size:${style.fontSize};font-weight:${style.fontWeight};` +
      `line-height:${style.lineHeight};letter-spacing:${style.letterSpacing};white-space:normal;`;
    probe.dir = document.documentElement.dir;
    probe.textContent = element.textContent;
    document.body.appendChild(probe);
    const naturalLines = Math.round(probe.scrollHeight / lineHeight);
    probe.remove();

    return { naturalLines, fontSize: Number.parseFloat(style.fontSize), text: element.textContent ?? "" };
  });

  expect(
    metrics.naturalLines,
    `${context}: "${metrics.text}" needs more than two lines, so it is clipped`,
  ).toBeLessThanOrEqual(2);
  expect(metrics.fontSize, `${context}: mobile heading is oversized`).toBeLessThanOrEqual(20);
}

async function expectSingleLineHeading(heading: Locator, context: string) {
  await expect(heading).toBeVisible();
  const metrics = await heading.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(style.lineHeight),
      fontSize: Number.parseFloat(style.fontSize),
      whiteSpace: style.whiteSpace,
    };
  });

  expect(metrics.whiteSpace, `${context}: heading can wrap`).toBe("nowrap");
  expect(metrics.height, `${context}: heading wrapped to more than one line`).toBeLessThanOrEqual(
    metrics.lineHeight + 1,
  );
  expect(metrics.scrollWidth, `${context}: heading text was clipped`).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.fontSize, `${context}: mobile heading is oversized`).toBeLessThanOrEqual(20);
}

// ─── Contrast ────────────────────────────────────────────────────────────────
// Checklist row: "Light, dark, high-contrast, and color-blind modes pass a
// contrast analyzer."
const CONTRAST_MODES: ReadonlyArray<{ name: string; settings: Settings }> = [
  { name: "midnight", settings: { themeMode: "midnight" } },
  { name: "dark", settings: { themeMode: "dark" } },
  { name: "light", settings: { themeMode: "light" } },
  { name: "high contrast", settings: { themeMode: "light", highContrast: true } },
  { name: "color-blind (deuteranopia)", settings: { themeMode: "midnight", colorBlindSupport: "deuteranopia" } },
];

for (const mode of CONTRAST_MODES) {
  test(`contrast: ${mode.name} mode passes the analyzer on Home`, async ({ page }) => {
    await seedAndOpen(page, mode.settings);
    const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    expect(results.violations, `${mode.name}: contrast violations`).toEqual([]);
  });
}

// ─── Responsive layout ───────────────────────────────────────────────────────
// Checklist row: "320 px mobile, 390 px mobile, tablet, and desktop reflow
// without clipping."
const VIEWPORTS = [
  { name: "320px mobile", width: 320, height: 720 },
  { name: "390px mobile", width: 390, height: 844 },
  // OnePlus Nord 4 is 1240×2772 physical pixels. 412×924 is the representative
  // CSS viewport at common Android display scaling; the physical device check
  // remains part of the manual release record.
  { name: "OnePlus Nord 4", width: 412, height: 924 },
  { name: "tablet", width: 834, height: 1194 },
  { name: "desktop", width: 1280, height: 900 },
] as const;

for (const viewport of VIEWPORTS) {
  test(`responsive: ${viewport.name} reflows without clipping`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedAndOpen(page);

    await expectNoHorizontalOverflow(page, `${viewport.name} Home`);
    await expect(page.getByRole("navigation")).toHaveCount(1);

    await page.getByTestId("nav-azkar").click();
    await expect(page.getByTestId("category-card-morning")).toBeVisible();
    await expectNoHorizontalOverflow(page, `${viewport.name} Library`);
  });
}

for (const viewport of VIEWPORTS.filter((item) => item.width <= 412)) {
  test(`mobile headings: ${viewport.name} keeps Progress titles readable on one line`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await seedAndOpen(page);
    await page.getByTestId("nav-progress").click();

    // The page title is the shared header h1, which now wraps rather than
    // truncates; the card headings below it keep the one-line contract.
    await expectUnclippedHeading(
      page.getByRole("heading", { name: "Progress", exact: true, level: 1 }),
      `${viewport.name} page title`,
    );

    const tabs = page.getByRole("tab");
    for (let index = 0; index < 4; index += 1) {
      await tabs.nth(index).click();
      await expectSingleLineHeading(
        page.getByTestId("progress-primary-heading"),
        `${viewport.name} Progress tab ${index + 1}`,
      );
    }
  });
}

test("mobile headings: OnePlus Nord 4 keeps Arabic Progress titles readable on one line", async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 924 });
  await seedAndOpen(page, { language: "ar" });
  await page.getByTestId("nav-progress").click();

  const tabs = page.getByRole("tab");
  for (let index = 0; index < 4; index += 1) {
    await tabs.nth(index).click();
    await expectSingleLineHeading(
      page.getByTestId("progress-primary-heading"),
      `OnePlus Nord 4 Arabic Progress tab ${index + 1}`,
    );
  }
});

// ─── Text resize ─────────────────────────────────────────────────────────────
// Checklist row: "200% browser zoom and largest app text setting do not hide
// content or actions."
test("text resize: largest app text setting keeps content and actions reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAndOpen(page, { textSize: "large" });

  await expectNoHorizontalOverflow(page, "large text Home");
  await page.getByTestId("nav-azkar").click();
  const card = page.getByTestId("category-card-morning");
  await expect(card).toBeVisible();
  await expectNoHorizontalOverflow(page, "large text Library");

  // The card must remain operable, not merely present.
  await card.click();
  await expect(page.getByRole("button", { name: /Start Session|Continue/ }).first()).toBeVisible();
});

test("text resize: 200% zoom keeps primary navigation usable", async ({ page }) => {
  // 200% zoom on a 1280px desktop presents as a 640px CSS viewport.
  await page.setViewportSize({ width: 640, height: 450 });
  await seedAndOpen(page);

  await expectNoHorizontalOverflow(page, "200% zoom Home");
  await expect(page.getByRole("navigation")).toHaveCount(1);
  await page.getByTestId("nav-settings").click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "200% zoom Settings");
});

test("text reflow: 400% zoom equivalent keeps core actions reachable", async ({ page }) => {
  // WCAG's 1280px-at-400% reflow condition presents as a 320 CSS px viewport.
  await page.setViewportSize({ width: 320, height: 700 });
  await seedAndOpen(page);

  await page.getByTestId("nav-azkar").click();
  const morning = page.getByTestId("category-card-morning");
  await expect(morning).toBeVisible();
  await expectNoHorizontalOverflow(page, "400% zoom Library");
  await morning.click();
  await expect(page.getByRole("button", { name: /Start Session|Continue/ }).first()).toBeVisible();

  await page.getByTestId("nav-settings").click();
  await expect(page.getByRole("button", { name: "Accessibility", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "400% zoom Settings");
});

test("text spacing overrides do not clip core content or actions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAndOpen(page);
  await page.addStyleTag({
    content: `
      #main-content * {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
      }
      #main-content p { margin-bottom: 2em !important; }
    `,
  });

  await expectNoHorizontalOverflow(page, "text spacing Home");
  await page.getByTestId("nav-azkar").click();
  await expect(page.getByTestId("category-card-morning")).toBeVisible();
  await expectNoHorizontalOverflow(page, "text spacing Library");
  await page.getByTestId("nav-settings").click();
  await expect(page.getByRole("button", { name: "Accessibility", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page, "text spacing Settings");
});

test("time-of-day imagery has no decorative overlay layer", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seedAndOpen(page, { reduceMotion: false });

  const hero = page.getByTestId("home-hero");
  const scene = page.getByTestId("time-of-day-scene-window");
  const image = hero.locator("picture img");
  await expect(image).toBeVisible();
  await expect(hero.locator(".azkar-hero-particles, .azkar-hero__overlay")).toHaveCount(0);
  await expect(scene).toBeVisible();

  const [sceneBox, imageOpacity, imageWidth] = await Promise.all([
    scene.boundingBox(),
    image.evaluate((element) => getComputedStyle(element).opacity),
    image.evaluate((element: HTMLImageElement) => element.naturalWidth),
  ]);
  expect(sceneBox?.height).toBeGreaterThanOrEqual(192);
  expect(imageOpacity).toBe("1");
  expect(imageWidth).toBeGreaterThan(0);
});

test("post-prayer cards hide what cannot be acted on and stay equal height", async ({ page }) => {
  await seedAndOpen(page);

  const tracker = page.getByTestId("after-prayer-trackers");
  const grid = page.getByTestId("prayer-tracker-cards");
  const masbaha = page.getByTestId("home-masbaha-entry");
  const cards = grid.locator("article[data-prayer-state]");

  const [trackerBox, masbahaBox] = await Promise.all([tracker.boundingBox(), masbaha.boundingBox()]);
  expect(masbahaBox?.y).toBeGreaterThanOrEqual((trackerBox?.y ?? 0) + (trackerBox?.height ?? 0));

  // A prayer that has not arrived cannot be tracked or read, so it is not
  // shown until asked for. What has passed, what is open, and what is next
  // always are.
  const collapsedStates = await cards.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLElement).dataset.prayerState),
  );
  expect(collapsedStates).not.toContain("upcoming");
  expect(collapsedStates).toContain("next");

  const toggle = page.getByTestId("prayer-show-upcoming");
  if (await toggle.count()) {
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const expanded = await cards.evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).dataset.prayerState));
    expect(expanded.length).toBe(5);
    expect(expanded).toContain("upcoming");
  }

  const metrics = await grid.evaluate((element) => {
    const all = [...element.querySelectorAll("article[data-prayer-state]")];
    const offsetsWithin = (card: Element) => {
      const top = card.getBoundingClientRect().top;
      const at = (selector: string) => {
        const node = card.querySelector(selector);
        return node ? Math.round(node.getBoundingClientRect().top - top) : -1;
      };
      return [at("h3"), at('[data-testid^="prayer-status-"]'), at("hr"), at("fieldset")].join("|");
    };
    return {
      heights: [...new Set(all.map((card) => Math.round(card.getBoundingClientRect().height)))],
      layouts: [...new Set(all.map(offsetsWithin))],
      checkboxCount: element.querySelectorAll('input[type="checkbox"]').length,
      radioCount: element.querySelectorAll('input[type="radio"]').length,
      fieldsets: element.querySelectorAll("fieldset").length,
    };
  });

  // Two independent checkboxes per prayer, never radios, each in its own fieldset.
  expect(metrics.checkboxCount).toBe(10);
  expect(metrics.radioCount).toBe(0);
  expect(metrics.fieldsets).toBe(5);
  // Identical height and identical internal vertical positions whatever the state.
  expect(metrics.heights).toHaveLength(1);
  expect(metrics.layouts).toHaveLength(1);
});

test("forced colors preserves focus and selected-state cues", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await seedAndOpen(page);

  const home = page.getByTestId("nav-home");
  await expect(home).toHaveAttribute("aria-current", "page");
  const selectedOutline = await home.evaluate((element) => getComputedStyle(element).outlineWidth);
  expect(parseFloat(selectedOutline)).toBeGreaterThanOrEqual(2);

  await page.keyboard.press("Tab");
  const focusedOutline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineWidth);
  expect(parseFloat(focusedOutline)).toBeGreaterThanOrEqual(2);
});

// ─── Prayer time and DST ─────────────────────────────────────────────────────
// Checklist row: "Effective timezone/offset match the detected location; online
// and offline results use the selected method."
test("prayer times: effective timezone and offset are surfaced and survive going offline", async ({ page }) => {
  await seedAndOpen(page);
  await page.getByTestId("nav-settings").click();
  await page.getByRole("button", { name: /Prayer Times & Reminders/ }).click();

  const status = page.getByTestId("daylight-saving-status");
  await expect(status).toBeVisible();
  await expect(status).toContainText("Africa/Cairo");
  await expect(status).toContainText(/UTC\+0[23]:00/);
  const onlineText = await status.innerText();

  // Astronomical calculation must not depend on the network.
  await page.context().setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("offline")));
  await expect(status).toContainText("Africa/Cairo");
  expect(await status.innerText(), "offline timings drifted from online").toBe(onlineText);
  await page.context().setOffline(false);
});

// ─── Keyboard-only core flow ─────────────────────────────────────────────────
// Checklist row: "Logical order, visible focus, no traps."
test("keyboard: the core flow is reachable with a visible focus indicator and no traps", async ({ page }) => {
  await seedAndOpen(page);

  // Every element reached by Tab must show a focus indicator, not rely on the
  // browser default being suppressed somewhere.
  const seen = new Set<string>();
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      // Settle the browser's own focus scroll before measuring. Without this
      // the walk reports a control as "below the fold" purely because the
      // scroll had not finished — a measurement artifact, not clipping. The
      // elementFromPoint check below is what actually detects an obscured
      // control, and it is unaffected.
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const hasOutline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth || "0") > 0;
      const hasShadowRing = style.boxShadow !== "none";
      return {
        key: `${el.tagName}:${el.getAttribute("data-testid") ?? el.textContent?.trim().slice(0, 24) ?? ""}`,
        visible: hasOutline || hasShadowRing,
        unobscured:
          rect.top >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.left >= 0 &&
          rect.right <= window.innerWidth &&
          Boolean(
            (() => {
              const topElement = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
              return topElement && (el.contains(topElement) || topElement.contains(el));
            })(),
          ),
      };
    });
    if (!info) continue;
    seen.add(info.key);
    expect(info.visible, `no visible focus indicator on ${info.key}`).toBe(true);
    expect(info.unobscured, `focused control is clipped or obscured: ${info.key}`).toBe(true);
  }
  expect(seen.size, "Tab did not move across distinct controls").toBeGreaterThan(3);

  // Not a trap: the library is reachable and Escape does not strand focus.
  await page.getByTestId("nav-azkar").click();
  await expect(page.getByTestId("category-card-morning")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation")).toBeVisible();
});

// The header title is the app's most space-constrained string: the longest
// collection names have to survive a 320px viewport minus back button,
// gutters and the reader's two actions.
for (const language of ["ar", "en"] as const) {
  test(`mobile headings: ${language.toUpperCase()} longest collection name is never clipped at 320px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await seedAndOpen(page, { language });
    await page.getByTestId("nav-azkar").click();

    // "أذكار الظواهر الطبيعية" / "Natural Events" — the longest of the set.
    await page.getByTestId("category-card-natural_events").click();
    await expectUnclippedHeading(
      page.getByRole("heading", { level: 1 }).first(),
      `${language} category header at 320px`,
    );

    // And again in the reader, where two header actions compete for the row.
    await page
      .getByRole("button", { name: /Start Session|ابدأ/ })
      .first()
      .click();
    await expect(page.getByTestId("reader-screen")).toBeVisible();
    await expectUnclippedHeading(page.getByRole("heading", { level: 1 }).first(), `${language} reader header at 320px`);
  });
}

// ─── Motion ──────────────────────────────────────────────────────────────────
// Checklist row: "Reduce motion stops animation without stopping feedback."
test("the Reduce motion setting neutralises animation but keeps press feedback", async ({ page }) => {
  await seedAndOpen(page, { reduceMotion: true });

  const metrics = await page.evaluate(() => {
    const toMs = (value: string) => (value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000);
    // Probe the rule itself rather than whichever cards a given viewport
    // happens to mount: the contract is global, so an injected element on a
    // stock animation class is the tier-independent way to measure it.
    const probe = document.createElement("div");
    probe.className = "fade-in";
    document.body.appendChild(probe);
    const probeStyle = getComputedStyle(probe);
    const animationMs = toMs(probeStyle.animationDuration);
    probe.remove();

    const button = document.querySelector("button");
    return {
      rootFlagged: document.documentElement.classList.contains("reduce-motion"),
      animationMs,
      buttonTransitionMs: button ? toMs(getComputedStyle(button).transitionDuration) : null,
      buttonTransitionProperty: button ? getComputedStyle(button).transitionProperty : null,
    };
  });

  expect(metrics.rootFlagged).toBe(true);
  // The app-level setting must reach keyframe animations, not just transitions
  // on interactive elements — that gap meant entrances kept playing for anyone
  // who turned the setting on without an OS preference.
  expect(metrics.animationMs).toBeLessThan(1);
  // Reduced motion means "stop moving", not "stop responding": a press keeps
  // its opacity feedback.
  expect(metrics.buttonTransitionProperty).toContain("opacity");
  expect(metrics.buttonTransitionMs).toBeGreaterThan(1);
});

test("motion stays on when the setting is off", async ({ page }) => {
  await seedAndOpen(page, { reduceMotion: false });

  const metrics = await page.evaluate(() => {
    const toMs = (value: string) => (value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000);
    // Build the stagger container directly so the assertion holds at every
    // viewport, not only the tiers that mount the prayer grid.
    const probe = document.createElement("div");
    probe.className = "stagger-in";
    probe.innerHTML = "<span></span><span></span><span></span>";
    document.body.appendChild(probe);
    const children = [...probe.children].map((child) => getComputedStyle(child));
    const result = {
      animationName: children[0]?.animationName ?? null,
      animationMs: children[0] ? toMs(children[0].animationDuration) : null,
      firstDelayMs: children[0] ? toMs(children[0].animationDelay) : null,
      thirdDelayMs: children[2] ? toMs(children[2].animationDelay) : null,
    };
    probe.remove();
    return result;
  });

  expect(metrics.animationName).toBe("slide-up");
  expect(metrics.animationMs).toBeGreaterThan(1);
  // Each child enters a beat after the one before it.
  expect(metrics.thirdDelayMs).toBeGreaterThan(metrics.firstDelayMs ?? 0);
});
