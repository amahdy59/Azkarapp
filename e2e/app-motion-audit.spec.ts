import { expect, test } from "@playwright/test";
import { fixtureReminderCatalogue } from "./fixtures/reminderCatalogue";

const families = {
  primary: ["/home", "/quran-wird", "/azkar", "/azkar/saved", "/progress/month", "/settings"],
  reading: ["/quran", "/azkar/morning", "/azkar/morning/1", "/learn/al-mukhtar/p-4"],
  tools: ["/more", "/learn", "/qibla", "/counter"],
  devotional: [
    "/benefits",
    "/quran-wird/benefits",
    "/friday",
    "/friday/salawat",
    "/prayer/dhuhr",
    "/search",
    "/completion",
  ],
  preferences: [
    "/settings/appearance",
    "/settings/prayer",
    "/settings/reading",
    "/settings/audio",
    "/settings/accessibility",
    "/settings/downloads",
    "/settings/location",
    "/settings/notifications",
  ],
  information: [
    "/settings/progress",
    "/settings/account-data",
    "/settings/help",
    "/settings/legal",
    "/settings/sources",
    "/settings/whats-new",
    "/settings/about",
  ],
} as const;

/** Observe native frames without holding an automation call open through rendering. */
function installMotionProbe(selector: string) {
  const collect = () => {
    const pseudo = getComputedStyle(document.documentElement, "::view-transition-new(app-content)");
    const animations = document
      .getAnimations()
      .map((animation) => {
        const effect = animation.effect as KeyframeEffect | null;
        const target = effect?.target;
        if (!(target instanceof Element) || !effect) return null;
        // Geometry alone is insufficient: Gecko can retain boxes and pending
        // transitions inside a closed native disclosure.
        if (!target.checkVisibility({ visibilityProperty: true, contentVisibilityAuto: true })) return null;
        for (let ancestor = target.parentElement; ancestor; ancestor = ancestor.parentElement) {
          if (
            ancestor instanceof HTMLDetailsElement &&
            !ancestor.open &&
            !ancestor.querySelector(":scope > summary")?.contains(target)
          )
            return null;
        }
        const bounds = target.getBoundingClientRect();
        if (!bounds.width || !bounds.height || bounds.bottom < 0 || bounds.top > innerHeight) return null;
        const timing = effect.getComputedTiming();
        const loading = Boolean(target.closest('[aria-busy="true"], [role="progressbar"], [role="status"]'));
        return {
          name: (animation as CSSAnimation).animationName ?? "WAAPI",
          target: target.tagName + "." + target.className,
          pseudo: (effect as KeyframeEffect & { pseudoElement?: string }).pseudoElement,
          duration: Number(timing.duration),
          delay: Number(timing.delay),
          iterations: timing.iterations,
          currentTime: String(animation.currentTime),
          startTime: String(animation.startTime),
          timeline: String(document.timeline.currentTime),
          progress: timing.progress,
          endTime: Number(timing.endTime),
          loading,
          active:
            animation.playState === "running" &&
            Number.isFinite(timing.endTime) &&
            Number(timing.endTime) <= 600 &&
            !loading,
        };
      })
      .filter((item) => item !== null);
    const main = document.querySelector(selector)!;
    const box = main.getBoundingClientRect();
    return {
      pseudoName: pseudo.animationName,
      opacity: getComputedStyle(main).opacity,
      box: { x: box.x, y: box.y, width: box.width, height: box.height },
      animations,
      unsettled: animations.filter((item) => item.active),
    };
  };
  let latest = collect();
  let idleFrames = 0;
  let frameId = 0;
  const observed = new Map<string, (typeof latest.animations)[number]>();
  const frames: { time: number; active: number }[] = [];
  const sample = (time: number) => {
    latest = collect();
    idleFrames = latest.unsettled.length === 0 ? idleFrames + 1 : 0;
    frames.push({ time, active: latest.unsettled.length });
    for (const animation of latest.animations)
      observed.set(
        JSON.stringify([animation.name, animation.duration, animation.delay, animation.iterations]),
        animation,
      );
    frameId = requestAnimationFrame(sample);
  };
  frameId = requestAnimationFrame(sample);
  return {
    read: () => ({ ...latest, idleFrames, frames, observedAnimations: [...observed.values()] }),
    stop: () => cancelAnimationFrame(frameId),
  };
}

for (const [language, mode, width] of [
  ["ar", "default", 390],
  ["en", "default", 1440],
  ["ar", "app", 320],
  ["en", "os", 768],
] as const) {
  for (const [family, routes] of Object.entries(families)) {
    // Each direct endpoint owns a fresh page and the unchanged test deadline;
    // earlier routes cannot consume its motion budget or abort its async work.
    for (const route of routes) {
      test(`page motion endpoints ${family} ${language} ${mode}: ${route} @cross-browser`, async ({ page }, info) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await fixtureReminderCatalogue(page);
        await page.setViewportSize({ width, height: 900 });
        // Motion measurements use the native document/rAF timeline. Prayer-date
        // behavior is independently tested with fixed clocks in the Home suites.
        await page.emulateMedia({ reducedMotion: mode === "os" ? "reduce" : "no-preference" });
        await page.addInitScript(
          ({ language, mode }) => {
            localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
            if (!localStorage.getItem("azkarapp.state.v1"))
              localStorage.setItem(
                "azkarapp.state.v1",
                JSON.stringify({
                  settings: { language, appMaterial: "solid", reduceMotion: mode === "app" },
                  profile: { isGuest: true },
                }),
              );
          },
          { language, mode },
        );
        const evidence = [];
        await test.step(route, async () => {
          // A route-specific query creates one fresh document directly. A
          // hash-only goto followed by reload starts the intermediate route's
          // async work and immediately aborts it, producing WebKit page errors.
          // Interaction transitions have separate navigation coverage below.
          await page.goto(`/?motion-endpoint=${encodeURIComponent(route)}#${route}`);
          await page.bringToFront();
          expect(await page.evaluate(() => document.visibilityState)).toBe("visible");
          // Wide completion is intentionally portalled into its protected dialog.
          const selector =
            route === "/completion" && width >= 900 ? '[data-testid="completion-desktop-dialog"]' : "#main-content";
          const main = page.locator(selector);
          await expect(main).toBeVisible();
          await expect(page.getByTestId("screen-loading")).toHaveCount(0);
          await expect.poll(() => main.innerText()).not.toBe("");
          await page.evaluate(() => document.fonts.ready);
          const probe = await page.evaluateHandle(installMotionProbe, selector);
          try {
            await expect
              // Readiness uses the repository assertion budget: headless WebKit
              // may deliver fewer than three native frames in a wall-clock second.
              // Actual effect durations are checked independently below.
              .poll(() => probe.evaluate((observer) => observer.read().idleFrames))
              .toBeGreaterThanOrEqual(3);
          } catch (error) {
            await info.attach("unsettled-motion.json", {
              body: JSON.stringify({ route, sample: await probe.evaluate((observer) => observer.read()) }),
              contentType: "application/json",
            });
            await probe.evaluate((observer) => observer.stop());
            throw error;
          }
          const settled = await probe.evaluate((observer) => observer.read());
          await expect
            .poll(() => probe.evaluate((observer) => observer.read().frames.length))
            .toBeGreaterThanOrEqual(settled.frames.length + 2);
          const result = await probe.evaluate((observer) => {
            observer.stop();
            return observer.read();
          });
          await probe.dispose();
          expect(result.opacity).toBe("1");
          expect(result.box).toEqual(settled.box);
          expect(result.unsettled).toEqual([]);
          const observed = new Map(
            result.observedAnimations
              .filter((animation) => !animation.loading)
              .map((animation) => [
                JSON.stringify([animation.name, animation.duration, animation.delay, animation.iterations]),
                animation,
              ]),
          );
          for (const animation of observed.values()) {
            expect(Number.isFinite(animation.iterations), JSON.stringify(animation)).toBe(true);
            expect(
              animation.delay + animation.duration * animation.iterations,
              JSON.stringify(animation),
            ).toBeLessThanOrEqual(mode === "default" ? 5000 : 100.1);
          }
          if (mode !== "default") expect(result.pseudoName).toBe("none");
          evidence.push({ route, ...result, observed: [...observed.values()] });
        });
        await info.attach("motion-endpoints.json", { body: JSON.stringify(evidence), contentType: "application/json" });
        expect(errors).toEqual([]);
      });
    }
  }
}

test("route snapshot motion stops when preferences change during an active transition @cross-browser", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
    localStorage.setItem(
      "azkarapp.state.v1",
      JSON.stringify({
        settings: { language: "en", appMaterial: "solid", reduceMotion: false },
        profile: { isGuest: true },
      }),
    );
  });
  await page.goto("/#/home");
  await expect(page.getByTestId("home-prayer-interval")).toBeVisible();
  const native = await page.evaluate(() => typeof document.startViewTransition === "function");
  if (native) {
    const result = await page.evaluate(async () => {
      const transition = document.startViewTransition(() => {
        document.getElementById("main-content")!.dataset.motionProbe = "1";
      });
      await transition.ready;
      const duration = getComputedStyle(
        document.documentElement,
        "::view-transition-new(app-content)",
      ).animationDuration;
      document.documentElement.classList.add("reduce-motion");
      const stopped = getComputedStyle(document.documentElement, "::view-transition-new(app-content)").animationName;
      await transition.finished;
      return { duration, stopped };
    });
    expect(result.duration).toBe("0.22s");
    expect(result.stopped).toBe("none");
  }
  await page.locator("html").evaluate((node) => node.classList.add("reduce-motion"));
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement, "::view-transition-new(app-content)").animationName,
    ),
  ).toBe("none");
  await page.locator("html").evaluate((node) => node.classList.remove("reduce-motion"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement, "::view-transition-new(app-content)").animationName,
    ),
  ).toBe("none");
  await expect(page.getByTestId("home-prayer-interval")).toBeVisible();
});
