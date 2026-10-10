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
  translation: Array.from({ length: 30 }, (_, index) => `Meaning ${index + 1} (${index + 1})`).join(" "),
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
  it("contains enlarged Arabic in a named keyboard-scrollable pane without changing the page or meaning", () => {
    const { container, rerender } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" magnification={150} />,
    );
    const body = container.querySelector(".audio-listening-body")!;
    const pane = screen.getByRole("region", { name: "Page magnification" });
    expect(body).toHaveAttribute("data-listening-magnified", "true");
    expect(pane).toHaveAttribute("tabindex", "0");
    expect(pane.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
    expect(
      screen.getByTestId("quran-page-translation").querySelector('[data-translation-verse="67:1"]'),
    ).not.toBeNull();
    rerender(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" magnification={100} />);
    expect(body).toHaveAttribute("data-listening-magnified", "false");
    expect(pane).not.toHaveAttribute("tabindex");
  });
  it("retains the reviewed page text outside the live status when layout data is unavailable and recovers on retry", () => {
    loader.error = true;
    const { container } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" magnification={200} />,
    );
    const fallback = screen.getByTestId("audio-quran-fallback-text");
    expect(fallback.textContent).toBe(Array.from({ length: 12 }, (_, index) => `fixture ﴿${index + 1}﴾`).join(" "));
    expect(fallback.closest("[role=status]")).toBeNull();
    expect(fallback).toHaveAttribute("lang", "ar");
    const expectedSize = document.createElement("span");
    expectedSize.style.fontSize = "calc(1.5rem * 2)";
    expect(fallback.style.fontSize).toBe(expectedSize.style.fontSize);
    loader.error = false;
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(screen.queryByTestId("audio-quran-fallback-text")).toBeNull();
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
  });
  it("allows manual browsing while explaining unavailable exact-recording alignment", () => {
    const { container } = render(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" />);
    expect(screen.queryByRole("button", { name: "Follow recitation" })).toBeNull();
    expect(screen.queryByText(/Following is not available/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Listening options" }));
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
    const show = (currentTime: number) => (
      <div className="audio-expanded-text">
        <QuranListeningReader {...props} currentTime={currentTime} />
      </div>
    );
    const { container, rerender } = render(show(0.5));
    fireEvent.click(screen.getByRole("button", { name: "Listening options" }));
    const follow = screen.getByRole("button", { name: "Follow recitation" });
    expect(follow).toHaveAttribute("aria-pressed", "true");
    follow.focus();
    rerender(show(3));
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(follow).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(follow).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
    fireEvent.click(follow);
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    fireEvent.wheel(container.querySelector(".audio-expanded-text")!);
    expect(follow).toHaveAttribute("aria-pressed", "false");
  });
  it("makes word emphasis optional and clears it after a recording loses approved alignment", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    const { container, rerender } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={1} language="en" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Listening options" }));
    const words = screen.getByRole("button", { name: "Highlight words" });
    expect(words).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector('[data-playback-word="true"]')).not.toBeNull();
    fireEvent.click(words);
    expect(container.querySelector('[data-playback-word="true"]')).toBeNull();
    fireEvent.click(words);
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
  it("pairs meaning with the actual visible verse keys and follows audio without retaining the previous page", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    const { container, rerender } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={1} language="en" />,
    );
    const translation = screen.getByTestId("quran-page-translation");
    expect(translation).toHaveAttribute("open");
    expect(translation.querySelector('[data-translation-verse="67:1"]')).toHaveAttribute("aria-current", "true");
    expect(translation.querySelector('[data-translation-verse="67:2"]')).toBeNull();
    expect(translation.closest("[aria-live]")).toBeNull();
    rerender(<QuranListeningReader entry={entry} segment={null} currentTime={3} language="en" />);
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(translation.querySelector('[data-translation-verse="67:1"]')).toBeNull();
    expect(translation.querySelector('[data-translation-verse="67:13"]')).toHaveAttribute("aria-current", "true");
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(translation.querySelector('[data-translation-verse="67:1"]')).not.toBeNull();
    expect(translation.querySelector('[aria-current="true"]')).toBeNull();
  });
  it("keeps only the selected fallback page meanings offline and hides English in Arabic mode", () => {
    loader.error = true;
    const { rerender } = render(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" />);
    expect(screen.getByTestId("quran-page-translation").querySelectorAll("[data-translation-verse]")).toHaveLength(12);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    const verses = screen.getByTestId("quran-page-translation").querySelectorAll("[data-translation-verse]");
    expect(verses).toHaveLength(14);
    expect(verses[0]).toHaveAttribute("data-translation-verse", "67:13");
    rerender(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="ar" />);
    expect(screen.queryByTestId("quran-page-translation")).toBeNull();
  });
});
