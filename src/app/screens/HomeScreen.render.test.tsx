import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getAzkarForMode } from "../content/azkar";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";
import * as dailyEvidence from "../dailyEvidence";
import * as maintenance from "../startupMaintenance";
import { CATEGORY_IDS, type CategoryId } from "../types";
import { HomeScreen } from "./HomeScreen";
import { ActiveVisitorPresence } from "../components/VisitorCount";
import * as cloudflare from "../../lib/cloudflareSync";

function emptyProgress() {
  return Object.fromEntries(CATEGORY_IDS.map((id) => [id, new Set<string>()])) as Record<CategoryId, Set<string>>;
}

const routineModes = {
  morning: "complete",
  evening: "complete",
  before_sleep: "complete",
  after_prayer: "complete",
} as const;

describe("HomeScreen quick access", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders the visitor count at the bottom of Home through the shared presence provider", async () => {
    vi.spyOn(cloudflare, "sendActiveVisitorHeartbeat").mockResolvedValue(12);
    render(
      <ActiveVisitorPresence>
        <HomeScreen
          completed={emptyProgress()}
          dailyCompletions={[]}
          quietProgressEnabled={false}
          progressDayStartHour={4}
          language="en"
          direction="ltr"
          onResume={() => undefined}
          routineModes={routineModes}
        />
      </ActiveVisitorPresence>,
    );
    expect(await screen.findByText("Visitors now: 12")).toBeInTheDocument();
    const footer = screen.getByTestId("home-visitor-footer");
    expect(footer).toContainElement(screen.getByText("Visitors now: 12"));
    expect(screen.getByTestId("home-content-grid").lastElementChild).toBe(footer);
    expect(screen.getByTestId("home-sticky-prayers")).not.toContainElement(footer);
  });

  it("does not reload optional reminder evidence on ordinary clock ticks and refreshes for a language change", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    const schedule = vi.spyOn(maintenance, "scheduleIdleAfterPaint").mockReturnValue(() => undefined);
    const props = {
      completed: emptyProgress(),
      dailyCompletions: [],
      quietProgressEnabled: false,
      progressDayStartHour: 4,
      onResume: () => undefined,
      routineModes,
    };
    const view = render(<HomeScreen {...props} language="en" direction="ltr" />);
    expect(schedule).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(60_000));
    expect(schedule).toHaveBeenCalledOnce();
    view.rerender(<HomeScreen {...props} language="ar" direction="rtl" />);
    expect(schedule).toHaveBeenCalledTimes(2);
  });

  it("replaces the sleep routine card with a focused dua card in the last third of the night", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 3, 0));
    const onResume = vi.fn();

    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="ar"
        direction="rtl"
        onResume={onResume}
        routineModes={routineModes}
      />,
    );

    expect(screen.getByRole("heading", { name: "وقت الدعاء" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ يَقُولُ: مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ؟ مَنْ يَسْأَلُنِي فَأُعْطِيَهُ؟ مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ؟",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByText(/دقيقة/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /افتح الأدعية الجامعة/ }));
    expect(onResume).toHaveBeenCalledWith("comprehensive_duas");
  });

  it("keeps date and streak as separate interface controls and removes library cards from Home", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
      />,
    );

    expect(screen.getByTestId("hijri-date")).toBeInTheDocument();
    expect(screen.getByTestId("home-hero")).not.toHaveClass("sm:mt-4");
    expect(screen.getByTestId("home-hero").closest(".app-screen-surface")).toHaveStyle({ paddingTop: "0px" });
    expect(screen.queryByTestId("home-header-stats")).not.toBeInTheDocument();
    expect(screen.queryByText("The full reviewed collection.")).not.toBeInTheDocument();
    expect(screen.getByTestId("home-header-routine-summary")).toBeInTheDocument();
    expect(screen.queryByTestId("home-saved-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("home-benefits-card")).not.toBeInTheDocument();
  });

  it("shows all five prayer summaries without a disclosure", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 15, 45));
    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={true}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
      />,
    );

    expect(screen.queryByRole("button", { name: "Show all prayers" })).not.toBeInTheDocument();
    expect(screen.getAllByTestId(/^prayer-card-/)).toHaveLength(5);
    expect(screen.getByTestId("prayer-card-fajr")).toBeInTheDocument();
    expect(screen.getByTestId("home-sticky-prayers")).toContainElement(screen.getByTestId("home-prayer-strip"));
    expect(screen.getByTestId("home-sticky-prayers")).toHaveClass("sticky", "top-0");
    expect(screen.getByTestId("home-context-grid")).not.toContainElement(screen.getByTestId("home-prayer-strip"));
    expect(screen.getByText(/today.?s wird/i)).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Masbaha" })).not.toBeInTheDocument();
  });

  it("keeps the utility header readable over the image while Home content scrolls", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 15, 45));

    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={true}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
      />,
    );

    fireEvent.scroll(screen.getByRole("region", { name: "Azkar" }), { target: { scrollTop: 12 } });
    expect(screen.getByTestId("home-utility-header")).toHaveAttribute("data-scrolled", "true");
    expect(screen.getByTestId("home-utility-header")).toHaveClass("home-glass-header");
    const scroll = screen.getByRole("region", { name: "Azkar" });
    const sticky = screen.getByTestId("home-sticky-prayers");
    fireEvent.scroll(scroll, { target: { scrollTop: 150 } });
    expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
    fireEvent.scroll(scroll, { target: { scrollTop: 40 } });
    expect(sticky).toHaveAttribute("data-prayer-cards-condensed", "true");
    fireEvent.scroll(scroll, { target: { scrollTop: 0 } });
    expect(sticky).not.toHaveAttribute("data-prayer-cards-condensed");
  });

  it("shows the completion card briefly, without actions, then returns to the normal hero", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    const completed = emptyProgress();
    completed.morning = new Set(getAzkarForMode("morning", "complete").map((zikr) => zikr.id));

    render(
      <HomeScreen
        completed={completed}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="en"
        direction="ltr"
        onResume={() => undefined}
        routineModes={routineModes}
      />,
    );

    const completion = screen.getByRole("status", { name: /completed/i });
    expect(completion).toBeInTheDocument();
    expect(completion).not.toHaveTextContent(/continue|read again/i);
    expect(completion.querySelector("button")).toBeNull();

    act(() => vi.advanceTimersByTime(4_200));
    expect(screen.queryByRole("status", { name: /completed/i })).not.toBeInTheDocument();
    // The rail moved to Progress; what returns here is the ordinary hero.
    expect(screen.queryByTestId("prayer-tracker-cards")).toBeNull();
    expect(screen.getByTestId("home-hero")).toBeInTheDocument();
    expect(screen.queryByTestId("home-primary-cta")).not.toBeInTheDocument();
  });

  it("expands prayer moment across both columns when context stack has no content", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    vi.spyOn(dailyEvidence, "getContextualEvidence").mockReturnValue(null);
    vi.spyOn(dailyEvidence, "selectLibraryEvidence").mockReturnValue(null);
    const completed = emptyProgress();
    completed.morning = new Set(getAzkarForMode("morning", "complete").map((zikr) => zikr.id));

    render(
      <HomeScreen
        completed={completed}
        dailyCompletions={[]}
        quietProgressEnabled={true}
        progressDayStartHour={4}
        language="ar"
        direction="rtl"
        onResume={() => undefined}
        routineModes={routineModes}
      />,
    );

    act(() => vi.advanceTimersByTime(4_200));

    const fajrButton = screen.getByRole("button", { name: /الفجر/i });
    fireEvent.click(fajrButton);

    const expandedPrayer = screen.getByTestId("home-prayer-moment");
    expect(expandedPrayer).toBeInTheDocument();
    expect(expandedPrayer).toHaveClass("md:col-span-2");
    expect(screen.queryByTestId("home-context-stack")).toBeNull();
  });
});

describe("HomeScreen document outline", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("nests each card under the group it belongs to, and names every prayer card", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));

    const { container } = render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled
        progressDayStartHour={4}
        language="ar"
        direction="rtl"
        onResume={vi.fn()}
        routineModes={routineModes}
      />,
    );

    const outline = [...container.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName}:${h.textContent?.trim()}`);

    // Today's wird sits beside the routine card in the hero, not inside it.
    expect(outline).toContain("H2:وردك اليوم");
    expect(outline).not.toContain("H2:مكتبتك");
    // The hero offers one routine and the wird card lists all three. Without a
    // mark, the same routine reads as two separate things to do within one
    // screen; the row says it is the one already on offer above.
    expect(screen.getByRole("button", { name: /أذكار الصباح - ابدأ الآن/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /أذكار المساء - غير مكتملة/ })).toBeInTheDocument();

    // Five identical unnamed articles announced as "article" five times over.
    /* The five prayer cards were the articles here. They are on Progress now,
       so Home may legitimately have none — what still has to hold is that any
       article it does render is named, which is what this was protecting. */
    const articles = [...container.querySelectorAll("article")];
    for (const article of articles) {
      const labelledBy = article.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      expect(container.querySelector(`#${labelledBy}`)?.textContent?.trim()).toBeTruthy();
    }
  });

  it("renders the Friday morning background scene during Friday daytime", () => {
    vi.useFakeTimers();
    // Friday Aug 7, 2026 at 10:00 AM
    vi.setSystemTime(new Date(2026, 7, 7, 10, 0));

    const { container } = render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="ar"
        direction="rtl"
        onResume={vi.fn()}
        routineModes={routineModes}
      />,
    );

    const scene = container.querySelector('[data-testid="time-of-day-scene-window"]');
    expect(scene).toBeInTheDocument();
    const img = scene?.querySelector("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("friday"));
  });

  it("renders devotional tools (Qiblah and Masbaha) and handles clicks", () => {
    const onOpenQibla = vi.fn();
    const onOpenMasbaha = vi.fn();

    render(
      <HomeScreen
        completed={emptyProgress()}
        dailyCompletions={[]}
        quietProgressEnabled={false}
        progressDayStartHour={4}
        language="ar"
        direction="rtl"
        onResume={vi.fn()}
        routineModes={routineModes}
        onOpenQibla={onOpenQibla}
        onOpenMasbaha={onOpenMasbaha}
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "القاهرة",
          countryCode: "EG",
          calculationMethod: "Egypt",
          madhab: "Shafi",
          higherLatitudes: "None",
          timeZone: "Africa/Cairo",
        }}
      />,
    );

    const qiblaBtn = screen.getByTestId("home-tool-qibla");
    expect(qiblaBtn).toBeInTheDocument();
    expect(qiblaBtn).toHaveClass("hero-glass", "home-glass-surface", "text-on-media");
    expect(screen.getByText("القبلة")).toBeInTheDocument();
    fireEvent.click(qiblaBtn);
    expect(onOpenQibla).toHaveBeenCalledTimes(1);

    const masbahaBtn = screen.getByTestId("home-tool-masbaha");
    expect(masbahaBtn).toBeInTheDocument();
    expect(masbahaBtn).toHaveClass("hero-glass", "home-glass-surface", "text-on-media");
    expect(screen.getByText("المسبحة")).toBeInTheDocument();
    fireEvent.click(masbahaBtn);
    expect(onOpenMasbaha).toHaveBeenCalledTimes(1);
  });

  it("renders devotional tools as solid cards when homeVisualEffects is false", () => {
    const onOpenQibla = vi.fn();
    const onOpenMasbaha = vi.fn();

    render(
      <HomeScreen
        completed={emptyProgress()}
        routineModes={routineModes}
        onResume={vi.fn()}
        language="ar"
        direction="rtl"
        dailyCompletions={[]}
        prayerTracking={[]}
        homeVisualEffects={false}
        onOpenQibla={onOpenQibla}
        onOpenMasbaha={onOpenMasbaha}
        locationSettings={{
          latitude: 30.0444,
          longitude: 31.2357,
          cityName: "Cairo",
          countryName: "Egypt",
          calculationMethod: "Egypt",
          madhab: "Shafi",
          higherLatitudes: "None",
          timeZone: "Africa/Cairo",
        }}
      />,
    );

    const qiblaBtn = screen.getByTestId("home-tool-qibla");
    expect(qiblaBtn).toHaveClass("bg-card", "text-foreground");
    expect(qiblaBtn).not.toHaveClass("hero-glass");

    const masbahaBtn = screen.getByTestId("home-tool-masbaha");
    expect(masbahaBtn).toHaveClass("bg-card", "text-foreground");
    expect(masbahaBtn).not.toHaveClass("hero-glass");
  });

  it("cycles evidence with incremented offset when clicking the reminder refresh button", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    const spyContextual = vi.spyOn(dailyEvidence, "getContextualEvidence");

    render(
      <HomeScreen
        completed={emptyProgress()}
        routineModes={routineModes}
        onResume={vi.fn()}
        language="ar"
        direction="rtl"
        dailyCompletions={[]}
        prayerTracking={[]}
      />,
    );

    const refreshBtn = screen.getByTestId("daily-evidence-refresh");
    expect(refreshBtn).toBeInTheDocument();

    const initialOffsetCalls = spyContextual.mock.calls.map((call) => call[3]);
    expect(initialOffsetCalls).toContain(0);

    act(() => {
      fireEvent.click(refreshBtn);
    });

    const afterClickCalls = spyContextual.mock.calls.map((call) => call[3]);
    expect(afterClickCalls).toContain(1);
  });

  it.each([
    {
      label: "regular 30-minute",
      time: "2026-08-07T14:05:00+03:00",
      minutes: 30,
      initialSlot: "-s30-28",
      nextSlot: "-s30-29",
    },
    {
      label: "Duha 45-minute",
      time: "2026-08-07T10:05:00+03:00",
      minutes: 45,
      initialSlot: "-s45-13",
      nextSlot: "-s45-14",
    },
  ])("rotates the $label evidence slot in the selected timezone", ({ time, minutes, initialSlot, nextSlot }) => {
    vi.useFakeTimers();
    // An offset-qualified instant keeps the intended Cairo window identical
    // on UTC CI runners and on a developer's differently zoned device.
    vi.setSystemTime(new Date(time));
    const spyContextual = vi.spyOn(dailyEvidence, "getContextualEvidence");
    render(
      <HomeScreen
        completed={emptyProgress()}
        routineModes={routineModes}
        onResume={vi.fn()}
        language="ar"
        direction="rtl"
        dailyCompletions={[]}
        prayerTracking={[]}
        locationSettings={DEFAULT_LOCATION}
      />,
    );
    const initialKey = spyContextual.mock.calls[0]?.[0];
    expect(initialKey).toContain("2026-08-07" + initialSlot);
    act(() => {
      vi.advanceTimersByTime(minutes * 60 * 1000);
    });
    const latestKey = spyContextual.mock.calls.at(-1)?.[0];
    expect(latestKey).toContain("2026-08-07" + nextSlot);
    expect(latestKey).not.toBe(initialKey);
  });
});
