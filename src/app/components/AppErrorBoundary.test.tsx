import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppErrorBoundary } from "./AppErrorBoundary";

const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));

vi.mock("../../lib/observability", () => ({ reportError }));
vi.mock("../state", () => ({ resetStoredSettings: vi.fn() }));

function BrokenChild(): never {
  throw new Error("render failed");
}

afterEach(() => {
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  reportError.mockReset();
  vi.restoreAllMocks();
});

describe("AppErrorBoundary", () => {
  it("shows an actionable English recovery surface instead of a blank screen", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("heading", { name: "Some preferences could not load" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Try again" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Restore default preferences" })).toBeVisible();
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), "react-render");
  });

  it("uses the document language and direction when app state is unavailable", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";

    render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("heading")).toHaveAttribute("class", expect.stringContaining("text-2xl"));
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
