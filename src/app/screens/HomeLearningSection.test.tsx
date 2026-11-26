import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeLearningSection } from "./HomeLearningSection";
import { LEARNING_STATE_KEY } from "../learning/learningState";
import { learningT } from "../i18n/learning";

beforeEach(() => {
  localStorage.clear();
  vi.stubEnv("DEV", false);
  vi.stubGlobal("__LEARNING_REVIEW__", false);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Home Learn composition", () => {
  it.each(["ar", "en"] as const)("provides one discovery action without fetching a book in %s", (language) => {
    const fetch = vi.spyOn(window, "fetch");
    const open = vi.fn();
    render(<HomeLearningSection language={language} onGlass={false} onOpenBooks={open} onOpenResource={vi.fn()} />);
    expect(screen.getByRole("heading", { name: learningT(language, "homeTitle") })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: learningT(language, "exploreBooks") }));
    expect(open).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem(LEARNING_STATE_KEY)).toBeNull();
  });

  it("continues only an available saved edition and preserves every saved record", () => {
    const records = JSON.stringify({
      "dalil-al-mutamir": {
        bookmarks: ["p-6"],
        position: { unitId: "p-6", offset: 0.3 },
        contentLanguage: "en",
        lastReadAt: 10,
      },
      "dalil-al-mutamir:en": { bookmarks: ["p-9"], position: { unitId: "p-9", offset: 0.4 }, lastReadAt: 30 },
      "al-mukhtar": { bookmarks: [], position: { unitId: "p-32", offset: 0.5 }, lastReadAt: 40 },
    });
    localStorage.setItem(LEARNING_STATE_KEY, records);
    const open = vi.fn(),
      allBooks = vi.fn();
    render(<HomeLearningSection language="en" onGlass onOpenBooks={allBooks} onOpenResource={open} />);
    const resume = screen.getByRole("button", { name: "Continue reading" });
    expect(resume).toHaveAccessibleDescription("المختار من صحيح الأدعية والأذكار Source page 32");
    fireEvent.click(resume);
    expect(open).toHaveBeenCalledExactlyOnceWith("al-mukhtar", "p-32", "ar");
    fireEvent.click(screen.getByRole("button", { name: "All books" }));
    expect(allBooks).toHaveBeenCalledOnce();
    expect(localStorage.getItem(LEARNING_STATE_KEY)).toBe(records);
  });
});
