import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as timings from "../audio/quranTimings";
import type { PlaybackEntry } from "../audio/audioTypes";
import ContinuousReader, { PagedQuranListeningReader as QuranListeningReader } from "./QuranListeningReader";

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
  it("reveals a cue covered by navigation portalled above the reading pane", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
      const top = this.matches(".audio-expanded-text") ? 100 : this.matches("[data-playback-word]") ? 120 : 0;
      const bottom = this.matches("[data-listening-controls]")
        ? 160
        : this.matches(".audio-expanded-text")
          ? 300
          : top + 20;
      return { top, bottom, left: 0, right: 200, width: 200, height: bottom - top, x: 0, y: top, toJSON: () => {} };
    });
    const wrapper = document.createElement("div");
    wrapper.className = "floating-audio-player--expanded";
    const host = document.createElement("div");
    const viewport = document.createElement("div");
    viewport.className = "audio-expanded-text";
    viewport.scrollTop = 100;
    const scrollTo = vi.fn();
    viewport.scrollTo = scrollTo;
    wrapper.append(host, viewport);
    document.body.append(wrapper);
    const { unmount } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={1} language="en" controlsHost={host} />,
      { container: viewport },
    );
    expect(scrollTo).toHaveBeenCalledWith({ top: 52, behavior: "instant" });
    unmount();
    wrapper.remove();
  });
  it("discloses following preferences in the shared options host without an Info button or resetting state", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    const host = document.createElement("div");
    document.body.append(host);
    const show = (preferencesHost: HTMLElement | null) => (
      <QuranListeningReader
        entry={entry}
        segment={null}
        currentTime={1}
        language="en"
        preferencesHost={preferencesHost}
      />
    );
    const { container, rerender, unmount } = render(show(null));
    expect(screen.queryByRole("button", { name: "Listening options" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Follow recitation" })).toBeNull();
    rerender(show(host));
    const words = screen.getByRole("button", { name: "Highlight words" });
    expect(host).toContainElement(words);
    expect(container.querySelector('[data-testid="quran-listening-preferences"]')).toBeNull();
    fireEvent.click(words);
    expect(words).toHaveAttribute("aria-pressed", "false");
    rerender(show(null));
    expect(host).toBeEmptyDOMElement();
    rerender(show(host));
    expect(screen.getByRole("button", { name: "Highlight words" })).toHaveAttribute("aria-pressed", "false");
    unmount();
    expect(host).toBeEmptyDOMElement();
    host.remove();
  });
  it("renders navigation in the fixed header host while keeping browsing and text in the reading pane", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const { container, unmount } = render(
      <QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" controlsHost={host} />,
    );
    expect(host.querySelector("[data-listening-controls]")).not.toBeNull();
    expect(container.querySelector("[data-listening-controls]")).toBeNull();
    const next = screen.getByRole("combobox");
    expect(host).toContainElement(next);
    fireEvent.change(next, { target: { value: "1" } });
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(screen.getByRole("combobox", { name: "Quran page 563" })).toHaveValue("1");
    unmount();
    expect(host).toBeEmptyDOMElement();
    host.remove();
  });
  it("offers Arabic following recovery after manual browsing and restores reading focus", () => {
    vi.mocked(timings.resolveQuranTiming).mockReturnValue(annotation);
    const { container } = render(
      <div className="audio-expanded-text" tabIndex={-1}>
        <QuranListeningReader entry={entry} segment={null} currentTime={3} language="ar" />
      </div>,
    );
    expect(screen.queryByRole("button", { name: "العودة للآية الحالية" })).toBeNull();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "0" } });
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
    const resume = screen.getByRole("button", { name: "العودة للآية الحالية" });
    resume.focus();
    fireEvent.click(resume);
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(container.querySelector(".audio-expanded-text")).toHaveFocus();
    expect(screen.queryByRole("button", { name: "العودة للآية الحالية" })).toBeNull();
  });
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
    expect(screen.getByText(/Following is not available/)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Highlight words" })).toBeNull();
    expect(container.querySelector('[data-mushaf-page="562"]')).not.toBeNull();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
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
    const follow = screen.getByRole("button", { name: "Follow recitation" });
    expect(follow).toHaveAttribute("aria-pressed", "true");
    follow.focus();
    rerender(show(3));
    expect(container.querySelector('[data-mushaf-page="563"]')).not.toBeNull();
    expect(follow).toHaveFocus();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "0" } });
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
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "0" } });
    expect(translation.querySelector('[data-translation-verse="67:1"]')).not.toBeNull();
    expect(translation.querySelector('[aria-current="true"]')).toBeNull();
  });
  it("keeps only the selected fallback page meanings offline and hides English in Arabic mode", () => {
    loader.error = true;
    const { rerender } = render(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="en" />);
    expect(screen.getByTestId("quran-page-translation").querySelectorAll("[data-translation-verse]")).toHaveLength(12);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    const verses = screen.getByTestId("quran-page-translation").querySelectorAll("[data-translation-verse]");
    expect(verses).toHaveLength(14);
    expect(verses[0]).toHaveAttribute("data-translation-verse", "67:13");
    rerender(<QuranListeningReader entry={entry} segment={null} currentTime={0} language="ar" />);
    expect(screen.queryByTestId("quran-page-translation")).toBeNull();
  });
});

describe("continuous surah listening", () => {
  beforeEach(() => {
    loader.error = false;
    vi.spyOn(timings, "resolveQuranTiming").mockReturnValue(annotation);
  });
  afterEach(() => vi.restoreAllMocks());
  it("retains fifteen canonical slots per passage and enlarges both page dimensions", () => {
    const { container, rerender } = render(
      <ContinuousReader
        entry={entry}
        segment={null}
        currentTime={0}
        language="ar"
        theme="light"
        textScale="medium"
        preferencesHost={null}
      />,
    );
    const pages = container.querySelectorAll(".audio-listening-page");
    expect(pages).toHaveLength(3);
    for (const page of pages) expect(page.querySelectorAll("[data-mushaf-column] > div")).toHaveLength(15);
    expect(pages[0]).toHaveStyle({ width: "calc(100% * 1)" });
    expect(container.querySelector('[data-mushaf-surah-number="68"]')).toBeNull();
    expect(container.querySelector(".audio-listening-stream")).toHaveClass("theme-light", "bg-background");
    rerender(
      <ContinuousReader
        entry={entry}
        segment={null}
        currentTime={0}
        language="ar"
        theme="midnight"
        textScale="large"
        magnification={150}
        preferencesHost={null}
      />,
    );
    expect(pages[0]).toHaveStyle({ width: "calc(100% * 1.5)" });
    for (const page of pages) expect(page.querySelectorAll("[data-mushaf-column] > div")).toHaveLength(15);
    expect(container.querySelector(".audio-listening-stream")).toHaveClass("theme-midnight");
  });
  it("keeps every passage mounted without page controls and restores following after keyboard browsing", () => {
    const { container } = render(
      <div className="audio-expanded-reading">
        <div className="audio-expanded-text" tabIndex={-1} role="region" aria-label="Test reading">
          <ContinuousReader entry={entry} segment={null} currentTime={1} language="ar" preferencesHost={null} />
        </div>
      </div>,
    );
    expect(container.querySelectorAll("[data-listening-passage]")).toHaveLength(3);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("button", { name: "الصفحة التالية" })).toBeNull();
    const viewport = container.querySelector<HTMLElement>(".audio-expanded-text")!;
    fireEvent.keyDown(viewport, { key: "PageDown" });
    const resume = screen.getByRole("button", { name: "العودة للآية الحالية" });
    expect(resume.parentElement).toHaveClass("audio-expanded-reading");
    fireEvent.click(resume);
    expect(viewport).toHaveFocus();
    expect(screen.queryByRole("button", { name: "العودة للآية الحالية" })).toBeNull();
    expect(container.querySelectorAll("[data-listening-passage]")).toHaveLength(3);
  });
  it("retains the complete offline passage and meaning without a page picker", () => {
    loader.error = true;
    render(<ContinuousReader entry={entry} segment={null} currentTime={0} language="en" preferencesHost={null} />);
    expect(
      screen
        .getAllByTestId("audio-quran-fallback-text")
        .map((element) => element.textContent)
        .join(""),
    ).toBe(entry.arabicText);
    expect(screen.getByTestId("quran-page-translation").querySelectorAll("[data-translation-verse]")).toHaveLength(30);
    expect(screen.queryByRole("combobox")).toBeNull();
  });
});
