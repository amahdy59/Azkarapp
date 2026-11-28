import { readFile } from "node:fs/promises";
import { URL } from "node:url";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

const script = await readFile(
  new URL("../android/app/src/debug/assets/insets-diagnostics.js", import.meta.url),
  "utf8",
);

describe("debug APK inset snapshot", () => {
  it("reports actual geometry and dynamic native/visual viewport values without page or saved data", () => {
    const dom = new JSDOM(
      '<div class="app-shell" style="padding-top:32px"><p>private reading text</p></div><nav class="bottom-nav" style="padding-bottom:48px"></nav>',
      { runScripts: "outside-only", url: "https://localhost/#/private-route" },
    );
    const { window } = dom;
    window.localStorage.setItem("private", "saved-secret");
    window.document.documentElement.style.setProperty("--safe-area-inset-top", "32px");
    window.document.documentElement.style.setProperty("--app-safe-area-top", "32px");
    Object.defineProperty(window, "visualViewport", {
      value: { offsetLeft: 0, offsetTop: 0, width: 390, height: 500, scale: 1 },
      configurable: true,
    });
    const first = window.eval(script);
    expect(first.provided[0]).toBe("32px");
    expect(first.resolved[0]).toBe("32px");
    expect(first.shell.padding[0]).toBe("32px");
    expect(first.navigation.padding[2]).toBe("48px");
    expect(first.visualViewport).toEqual([0, 0, 390, 500, 1]);
    expect(JSON.stringify(first)).not.toMatch(/private|secret/);
    window.document.documentElement.style.setProperty("--safe-area-inset-top", "0px");
    expect(window.eval(script).provided[0]).toBe("0px");
    dom.window.close();
  });

  it("can capture startup before the app chrome or visual viewport exists", () => {
    const dom = new JSDOM("", { runScripts: "outside-only" });
    const result = dom.window.eval(script);
    expect(result.shell).toBeNull();
    expect(result.header).toBeNull();
    expect(result.navigation).toBeNull();
    expect(result.immersiveFooter).toBeNull();
    expect(result.visualViewport).toBeNull();
    dom.window.close();
  });
});
