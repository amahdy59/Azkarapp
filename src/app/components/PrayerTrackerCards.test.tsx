import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrayerTrackerCards, type PrayerCardModel } from "./PrayerTrackerCards";
import type { PrayerName, PrayerTrackingRecord } from "../types";

const TIMES: Record<PrayerName, string> = {
  fajr: "04:52",
  dhuhr: "12:59",
  asr: "16:31",
  maghrib: "19:34",
  isha: "21:02",
};

/** Builds the row's models with `current` on the named prayer. */
function modelsWithCurrent(current: PrayerName): PrayerCardModel[] {
  const order: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const activeIndex = order.indexOf(current);
  return order.map((prayer, index) => ({
    prayer,
    time: TIMES[prayer],
    ...(prayer === "fajr" ? { shroukTime: "06:18" } : {}),
    state:
      index === activeIndex
        ? "current"
        : index < activeIndex
          ? "past"
          : index === activeIndex + 1
            ? "next"
            : "upcoming",
    isOpenable: index <= activeIndex, // mock implementation: current and past are openable, future are not
    isRecordable: index <= activeIndex,
    ...(index === activeIndex + 1 ? { countdown: "01:00" } : {}),
  }));
}

function renderRow(current: PrayerName) {
  render(
    <PrayerTrackerCards
      models={modelsWithCurrent(current)}
      language="en"
      direction="ltr"
      records={[]}
      dayKey="2026-08-19"
      onToggle={() => undefined}
    />,
  );
  return [...screen.getAllByTestId(/^prayer-card-/)].map((card) => card.dataset.prayer);
}

afterEach(() => vi.unstubAllGlobals());

describe("PrayerTrackerCards", () => {
  it.each(["ar", "en"] as const)("exposes remaining-time semantics and native %s fill direction", (language) => {
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("dhuhr").map((model) =>
          model.state === "next" ? { ...model, remainingPercent: 25 } : model,
        )}
        language={language}
        direction={language === "ar" ? "rtl" : "ltr"}
        records={[]}
        dayKey="2026-10-16"
        onToggle={vi.fn()}
        onOpen={vi.fn()}
        summaryOnly
        compactSummary
      />,
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("value", "25");
    expect(bar).toHaveAttribute("max", "100");
    expect(bar).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    expect(bar).toHaveAttribute("aria-valuetext", "01:00");
    expect(bar).toHaveAccessibleName(language === "ar" ? "الوقت المتبقي حتى صلاة العصر" : "Time remaining until Asr");
    expect(bar.closest("button")).toBeNull();
  });
  it("uses concise saved-location and future-state footers without adding actions", () => {
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("dhuhr").map((model) =>
          model.state === "next" ? { ...model, remainingPercent: 60 } : model,
        )}
        language="en"
        direction="ltr"
        records={[
          { dayKey: "2026-10-16", prayer: "fajr", mosque: false, adhkar: false, location: "home" },
          { dayKey: "2026-10-16", prayer: "dhuhr", mosque: true, adhkar: false },
        ]}
        dayKey="2026-10-16"
        onToggle={vi.fn()}
        onOpen={vi.fn()}
        summaryOnly
        compactSummary
      />,
    );
    const footer = (prayer: PrayerName) =>
      screen.getByTestId(`prayer-card-${prayer}`).querySelector("[data-prayer-footer]");
    expect(screen.getByTestId("prayer-card-fajr").querySelector("[data-prayer-detail]")).toHaveTextContent("Passed");
    expect(screen.getByTestId("prayer-card-dhuhr").querySelector("[data-prayer-detail]")).toHaveTextContent("Now");
    expect(screen.getByTestId("prayer-card-fajr").querySelector("button")).toHaveAccessibleDescription(/At home/);
    expect(footer("fajr")).toHaveTextContent("At home");
    expect(footer("dhuhr")).toHaveTextContent("At the mosque");
    expect(footer("maghrib")).toHaveTextContent("After Asr");
    expect(footer("isha")).toHaveTextContent("After Maghrib");
    expect(footer("asr")).toHaveTextContent("01:00");
    expect(footer("asr")?.querySelector("progress")).not.toBeNull();
    expect(screen.getByTestId("prayer-tracker-cards")).not.toHaveTextContent(/Rawatib|Optional/);
    expect(screen.getByTestId("prayer-card-asr").querySelector("progress")).not.toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(footer("fajr")?.querySelector("button")).toBeNull();
  });
  it.each([
    ["ar", "2026-10-16", "الجمعة"],
    ["en", "2026-10-16", "Jumu‘ah"],
    ["ar", "2026-10-15", "الظهر"],
    ["en", "2026-10-17", "Dhuhr"],
    ["en", "invalid", "Dhuhr"],
  ] as const)("names noon prayer in %s for the supplied record day %s", (language, dayKey, name) => {
    const onOpen = vi.fn();
    const onToggle = vi.fn();
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("dhuhr")}
        language={language}
        direction={language === "ar" ? "rtl" : "ltr"}
        records={[]}
        dayKey={dayKey}
        onToggle={onToggle}
        onOpen={onOpen}
        summaryOnly
      />,
    );
    const card = screen.getByTestId("prayer-card-dhuhr");
    expect(card.querySelector("h3")).toHaveTextContent(name);
    fireEvent.click(card.querySelector("button")!);
    expect(onOpen).toHaveBeenCalledWith("dhuhr");
    expect(onToggle).not.toHaveBeenCalled();
    expect(card).toHaveTextContent(language === "ar" ? "١٢:٥٩ م" : "12:59 PM");
    expect(card.querySelector("[data-prayer-footer]")).toHaveTextContent(
      language === "ar" ? "غير مسجّلة" : "Not recorded",
    );
  });

  it("does not infer a prayed location from adhkar alone or from future records", () => {
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("dhuhr")}
        language="en"
        direction="ltr"
        records={[
          { dayKey: "2026-10-16", prayer: "fajr", mosque: false, adhkar: true },
          { dayKey: "2026-10-16", prayer: "isha", mosque: true, adhkar: true },
        ]}
        dayKey="2026-10-16"
        onToggle={vi.fn()}
        summaryOnly
      />,
    );
    expect(screen.getByTestId("prayer-card-fajr").querySelector("[data-prayer-footer]")).toHaveTextContent(
      "Adhkar completed",
    );
    expect(screen.getByTestId("prayer-card-isha").querySelector("[data-prayer-footer]")).toHaveTextContent(
      "After Maghrib",
    );
  });
  it("shows all five prayers in order with a labelled countdown and today's recordable state", () => {
    const models = modelsWithCurrent("isha").map((model): PrayerCardModel =>
      model.prayer === "fajr" ? { ...model, state: "next", countdown: "06:00 left", remainingPercent: 60 } : model,
    );
    render(
      <PrayerTrackerCards
        models={models}
        language="en"
        direction="ltr"
        records={[]}
        dayKey="2026-10-15"
        onToggle={vi.fn()}
        onOpen={vi.fn()}
        summaryOnly
        compactSummary
      />,
    );
    expect(screen.getAllByTestId(/^prayer-card-/).map((card) => card.dataset.prayer)).toEqual([
      "fajr",
      "dhuhr",
      "asr",
      "maghrib",
      "isha",
    ]);
    const progress = screen.getByRole("progressbar", { name: "Time remaining until Fajr" });
    expect(progress).toHaveAttribute("value", "60");
    expect(progress).toHaveAttribute("aria-valuetext", "06:00 left");
    expect(screen.queryByRole("button", { name: "Show all prayers" })).toBeNull();
    expect(screen.getByRole("button", { name: "Open Dhuhr" })).toBeEnabled();
    expect(screen.getByTestId("prayer-card-dhuhr")).toHaveTextContent("12:59 PM");
    expect(progress.closest("button")).toBeNull();
  });

  it("keeps the viewed prayer distinct from the current prayer and describes its time", () => {
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("asr")}
        language="en"
        direction="ltr"
        records={[]}
        dayKey="2026-09-05"
        onToggle={vi.fn()}
        onOpen={vi.fn()}
        summaryOnly
        selectedPrayer="fajr"
      />,
    );
    expect(screen.getByTestId("prayer-card-fajr")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("prayer-card-fajr")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("prayer-card-asr")).toHaveAttribute("aria-current", "step");
    expect(screen.getByTestId("prayer-card-maghrib")).toHaveClass("border-primary", "bg-primary/15");
    expect(screen.getByTestId("prayer-card-fajr")).not.toHaveTextContent("Viewing");
    expect(screen.getByRole("button", { name: /Open Fajr/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("prayer-card-maghrib")).not.toHaveTextContent("Opens 30m before");
    expect(screen.getByRole("button", { name: "Open Maghrib" })).toBeDisabled();
    expect(screen.getByTestId("prayer-card-fajr")).not.toHaveClass("border-primary");
    expect(screen.getByRole("button", { name: /Open Fajr/i })).toHaveAccessibleDescription(/4:52 AM/);
    expect(screen.getByTestId("prayer-card-asr")).toHaveTextContent("Now");
    expect(screen.getByTestId("prayer-card-maghrib")).toHaveTextContent("Next");
  });
  it("renders all five cards unconditionally", () => {
    expect(renderRow("fajr")).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
  });

  it("shows sunrise as Fajr context without creating a sixth prayer card", () => {
    renderRow("fajr");

    expect(screen.getByTestId("prayer-card-fajr")).toHaveTextContent("Sunrise: 6:18 AM");
    expect(screen.queryByTestId("prayer-card-shrouk")).toBeNull();
    expect(screen.getAllByTestId(/^prayer-card-/)).toHaveLength(5);
  });

  it("keeps a summary row navigable without duplicating tracking controls", () => {
    const onOpen = vi.fn();
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("fajr")}
        language="en"
        direction="ltr"
        records={[]}
        dayKey="2026-08-19"
        onToggle={() => undefined}
        onOpen={onOpen}
        summaryOnly
      />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    expect(screen.getByTestId("prayer-card-fajr")).toHaveAttribute("data-density", "summary");
    fireEvent.click(screen.getByRole("button", { name: /Open Fajr/i }));
    expect(onOpen).toHaveBeenCalledWith("fajr");
  });

  it("keeps long English prayer names visible instead of ellipsizing them", () => {
    renderRow("asr");

    const heading = screen.getByRole("heading", { name: "Maghrib" });
    expect(heading).toHaveClass("whitespace-nowrap");
    expect(heading).not.toHaveClass("truncate");
  });
});

/**
 * The card became a door when tapping it started opening the prayer screen.
 * These hold the two things that changed with it: that it says where it goes,
 * and that it no longer contradicts the screen it opens.
 */
describe("the card as a way into the prayer", () => {
  afterEach(() => vi.unstubAllGlobals());

  function renderRow(records: PrayerTrackingRecord[], onOpen = vi.fn()) {
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("fajr")}
        language="en"
        direction="ltr"
        records={records}
        dayKey="2026-09-05"
        onToggle={() => undefined}
        onOpen={onOpen}
      />,
    );
    return onOpen;
  }

  it("names the prayer it opens, not the adhkar it used to", () => {
    const onOpen = renderRow([]);
    const card = screen.getByRole("button", { name: /Open Fajr/i });
    fireEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith("fajr");
  });

  it("counts a prayer recorded at home as prayed", () => {
    // The row only knew `mosque`, so a prayer recorded at home on the prayer
    // screen showed here as an empty box — which reads as "not recorded".
    renderRow([{ dayKey: "2026-09-05", prayer: "fajr", mosque: false, adhkar: false, location: "home" }]);
    const prayed = screen.getAllByRole("checkbox", { name: /Prayed/i })[0]!;
    expect(prayed).toBeChecked();
    expect(screen.getByText("At home")).toBeInTheDocument();
  });

  it("still reads a mosque record made before the place existed", () => {
    renderRow([{ dayKey: "2026-09-05", prayer: "fajr", mosque: true, adhkar: false }]);
    expect(screen.getAllByRole("checkbox", { name: /Prayed/i })[0]!).toBeChecked();
    expect(screen.getByText("At the mosque")).toBeInTheDocument();
  });

  it("leaves an unrecorded prayer unticked and unnamed", () => {
    renderRow([]);
    expect(screen.getAllByRole("checkbox", { name: /Prayed/i })[0]!).not.toBeChecked();
    expect(screen.queryByText("At home")).toBeNull();
  });
});
