import { describe, expect, it } from "vitest";
import { createErrorEvent } from "./observability";

describe("observability privacy", () => {
  it("never includes error messages, stacks, query strings, or hashes", () => {
    window.history.replaceState(null, "", "/reader?phone=secret#private");
    const error = new Error("sensitive zikr or account content");
    error.stack = "private stack";

    const event = createErrorEvent(error, "render");
    const serialized = JSON.stringify(event);

    expect(event).toMatchObject({ type: "error", name: "Error", source: "render", path: "/reader" });
    expect(serialized).not.toContain("sensitive");
    expect(serialized).not.toContain("private stack");
    expect(serialized).not.toContain("phone");
  });
});
