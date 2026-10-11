import { expect, test } from "vitest";
import { verifyBrowserShards } from "./verify-browser-shards.mjs";

const inventory = (...ids) => ({
  suites: [{ suites: [{ specs: ids.map((id) => ({ id, tests: [{ projectName: "chromium" }] })) }] }],
});

test("accepts the exact release inventory spread across shards", () => {
  expect(verifyBrowserShards(inventory("a", "b", "c"), [inventory("b"), inventory("c", "a")])).toEqual({
    tests: 3,
    shardCounts: [1, 2],
  });
});
test("rejects omissions and unexpected replacement tests", () => {
  expect(() => verifyBrowserShards(inventory("a", "b"), [inventory("a", "c")])).toThrow("1 missing, 1 extra");
});
test("rejects duplicate execution even when the union matches", () => {
  expect(() => verifyBrowserShards(inventory("a", "b"), [inventory("a"), inventory("a", "b")])).toThrow("Duplicate");
});
test("rejects empty, malformed and missing-identity inventories", () => {
  expect(() => verifyBrowserShards(inventory(), [inventory()])).toThrow("empty inventory");
  expect(() => verifyBrowserShards({}, [])).toThrow("inventory JSON");
  expect(() => verifyBrowserShards(inventory(""), [inventory("")])).toThrow("Missing test identity");
});
