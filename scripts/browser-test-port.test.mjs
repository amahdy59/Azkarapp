import { expect, test } from "vitest";
import { browserTestPort } from "./browser-test-port.mjs";

test("uses the standard port and supports a separate local preview", () => {
  expect(browserTestPort("")).toBe(4173);
  expect(browserTestPort("4197")).toBe(4197);
  expect(browserTestPort("65535")).toBe(65535);
});

test.each(["0", "65536", "-1", "4173.5", "invalid", "4173 && echo unsafe"])(
  "rejects an invalid preview port: %s",
  (value) => expect(() => browserTestPort(value)).toThrow("E2E_PORT"),
);
