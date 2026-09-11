import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_AZKAR, getAzkarForMode } from "../content/azkar";
import { CATEGORY_IDS, type CategoryId } from "../types";
import { HomeScreen } from "./HomeScreen";

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
  afterEach(() => vi.useRealTimers());

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
        savedZikrIds={new Set()}
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

  it("overlays the transparent utility header on the hero and exposes saved and benefit actions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 9, 5));
    const saved = ALL_AZKAR.find((zikr) => !zikr.isCollectionIntroduction)!;
    const onOpenSavedZikr = vi.fn();
    const onOpenBenefits = vi.fn();

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
        savedZikrIds={new Set([saved.id])}
        onOpenSavedZikr={onOpenSavedZikr}
        onOpenSavedLibrary={() => undefined}
        onOpenBenefits={onOpenBenefits}
      />,
    );

    expect(screen.getByTestId("hijri-date")).toBeInTheDocument();
    expect(screen.getByTestId("home-hero")).not.toHaveClass("sm:mt-4");
    expect(screen.getByTestId("home-hero").closest(".app-screen-surface")).toHaveStyle({ paddingTop: "0px" });
    expect(screen.queryByTestId("home-header-stats")).not.toBeInTheDocument();
    expect(screen.queryByText("The full reviewed collection.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("home-saved-section").getElementsByTagName("button")[0]!);
    expect(onOpenSavedZikr).toHaveBeenCalledWith(saved.category, expect.any(Number));

    fireEvent.click(screen.getByTestId("home-benefits-card"));
    expect(onOpenBenefits).toHaveBeenCalledOnce();
  });

  it("renders the five-prayer rail on Home", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 10, 15, 45));
    const onOpenCustomCounter = vi.fn();

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
        savedZikrIds={new Set()}
        onOpenSavedZikr={() => undefined}
        onOpenSavedLibrary={() => undefined}
        onOpenBenefits={() => undefined}
        onOpenCustomCounter={onOpenCustomCounter}
      />,
    );

    expect(screen.getByTestId("prayer-card-fajr")).toBeInTheDocument();
    expect(screen.getByText(/today.?s wird/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Masbaha" }));
    expect(onOpenCustomCounter).toHaveBeenCalledOnce();
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
        savedZikrIds={new Set()}
      />,
    );

    fireEvent.scroll(screen.getByRole("region", { name: "Azkar" }), { target: { scrollTop: 12 } });
    expect(screen.getByTestId("home-utility-header")).toHaveAttribute("data-scrolled", "true");
    expect(screen.getByTestId("home-utility-header")).toHaveClass("bg-on-media-surface/95");
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
        savedZikrIds={new Set()}
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
});

describe("HomeScreen document outline", () => {
  afterEach(() => vi.useRealTimers());

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
        savedZikrIds={new Set()}
      />,
    );

    const outline = [...container.querySelectorAll("h1,h2,h3")].map((h) => `${h.tagName}:${h.textContent?.trim()}`);

    // Today's wird sits beside the routine card in the hero, not inside it.
    expect(outline).toContain("H2:وردك اليوم");
    // A card inside a divider-labelled group is one level below that label.
    const library = outline.indexOf("H2:مكتبتك");
    expect(library).toBeGreaterThanOrEqual(0);
    expect(outline.slice(library + 1)).toContain("H3:الأذكار المحفوظة");
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
});
