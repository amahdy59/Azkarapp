import { expect, test } from "vitest";
import { browserEngines } from "./browser-engines.mjs";
import { BROWSER_PARTITIONS } from "./browser-partitions.mjs";

test("default full verification installs all engines", () => {
  expect(browserEngines()).toEqual(["chromium", "firefox", "webkit"]);
});

test("every release group has exactly its required runtime", () => {
  for (const partition of BROWSER_PARTITIONS) {
    const selected = browserEngines(partition.projects);
    expect(selected).toHaveLength(1);
    if (partition.projects.includes("firefox")) expect(selected).toEqual(["firefox"]);
    else if (partition.projects.includes("webkit")) expect(selected).toEqual(["webkit"]);
    else expect(selected).toEqual(["chromium"]);
  }
  expect(browserEngines("desktop-firefox-smoke,mobile-chromium,mobile-webkit-smoke")).toEqual([
    "firefox",
    "chromium",
    "webkit",
  ]);
});

test("unknown, empty and inherited project names fail closed", () => {
  for (const selection of ["unknown", "toString", "__proto__", "desktop-chromium,", "desktop-chromium;false"]) {
    expect(() => browserEngines(selection)).toThrow("Unknown browser project");
  }
});
