import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as timings from "../audio/quranTimings";
import type { PlaybackEntry } from "../audio/audioTypes";
import QuranListeningReader from "./QuranListeningReader";

const loader = vi.hoisted(() => ({ error: false }));

vi.mock("../hooks/useListeningMushafPage", () => ({
  useListeningMushafPage: (page: number) => ({
    error: loader.error,
    result: loader.error
      ? null
      : {
          page,
          qcf: false,
          lines: [
            [
              { verseKey: page === 562 ? "67:1" : "67:13", position: 1, isEnd: 0, text: "fixture" },
              { verseKey: page === 562 ? "67:1" : "67:13", position: 2, isEnd: 1, text: "1" },
            ],
          ],
        },
  }),
}));
const entry = {
  entryId: "test",
  arabicText: Array.from({ length: 30 }, (_, index) => `fixture ﴿${index + 1}﴾`).join(" "),
  quranRange: { surah: 67, ayahStart: 1, ayahEnd: 30 },
  mushafPages: [
    { page: 562, startAyah: 1, endAyah: 12 },
    { page: 563, startAyah: 13, endAyah: 26 },
    { page: 564, startAyah: 27, endAyah: 30 },
  ],
} as PlaybackEntry;
const annotation: timings.QuranTimingAnnotation = {
  variantId: "test",
  sha256: "a".repeat(64),
  durationMs: 5000,
  unit: "milliseconds",
  source: "Synthetic test only",
  authoredBy: "Author",
  reviewedBy: "Reviewer",
  reviewedAt: "2026-10-08",
  reviewStatus: "approved",
  verses: [
    { verseKey: "67:1", startMs: 0, endMs: 2000, words: [{ position: 1, startMs: 0, endMs: 2000 }] },
    { verseKey: "67:13", startMs: 2000, endMs: 5000 },
  ],
};

describe("read-only listening controls", () => {
  beforeEach(() => {
    loader.error = false;
    vi.spyOn(timings, "resolveQuranTiming").mockReturnValue(null);
  });
  afterEach(() => vi.restoreAllMocks());
  it("retains the reviewed page text outside the live status when layout data is unavailable and recovers on retry", () => {
    loader.error = true;
    const { container } = render(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" />);
    const fallback = screen.getByTestId("audio-quran-fallback-text");
    expect(fallback.textContent).toBe(Array.from({ length: 12 }, (_, index) => `fixture ﴿${index + 1}﴾`).join(" "));
    expect(fallback.closest("[role=status]")).toBeNull();
    expect(fallback).toHaveAttribute("lang", "ar");
    loader.error = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(screen.queryByTestId("audio-quran-fallback-text")).toBeNull();
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
  });
  it("allows manual browsing while explaining unavailable exact-recording alignment", () => {
    const { container } = render(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" />);
    expect(screen.queryByRole("button", { name: "Follow recitation" })).toBeNull();
    expect(screen.queryByText(/Following is not available/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "About text following" }));
    expect(screen.getByText(/Following is not available/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("button", { name: "Highlight words" })).toBeNull();
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(container.querySelector('[aria-hidden="true"] button')).toBeNull();
  });
  it("follows verified verse changes, pauses on manual browsing and returns without moving focus", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    const props = { entry, segment: null, language: "en" as const };
    const { container, rerender } = render(<QuranListeningReader {...props} currentTime={0.5} />);
    const follow = screen.getByRole("button", { name: "Follow recitation" });
    follow.focus();
    fireEvent.click(follow);
    rerender(<QuranListeningReader {...props} currentTime={3} />);
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(follow).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(follow).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
    fireEvent.click(follow);
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    fireEvent.wheel(screen.getByRole("region", { name: "Mushaf while listening" }));
    expect(follow).toHaveAttribute("aria-pressed", "false");
  });
  it("makes word emphasis optional and clears it after a recording loses approved alignment", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    const { container, rerender } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={1} language="en" />,
    );
    expect(container.querySelector('[data-playback-word="true"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Highlight words" }));
    expect(container.querySelector('[data-playback-word="true"]')).not.toBeNull();
    expect(container.querySelector("[data-playback-line]")).not.toBeNull();
    expect(container.querySelector('[aria-current="true"]')).not.toBeNull();
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(null);
    rerender(
      <QuranListeningReader
        entry={entry}
        segment={{ variantId: "different" } as never}
        currentTime={1}
        language="en"
      />,
    );
    expect(container.querySelector('[data-playback-word="true"]')).toBeNull();
  });
});
