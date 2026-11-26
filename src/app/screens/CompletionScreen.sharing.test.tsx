import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CollectionShareModalProps } from "../components/CollectionShareModal";
import { CompletionScreen } from "./CompletionScreen";
import { t } from "../i18n";
import { getAzkarForMode, getAzkarForPrayer } from "../content/azkarCore";
import { getCompletionReflection } from "../completionReflection";
import type { ComponentProps } from "react";

const { studio } = vi.hoisted(() => ({ studio: vi.fn() }));
vi.mock("../components/CollectionShareModal", () => ({
  CollectionShareModal: (props: CollectionShareModalProps) => {
    studio(props);
    return <button onClick={props.onClose}>Close completion image</button>;
  },
}));

const props: ComponentProps<typeof CompletionScreen> = {
  catId: "morning",
  sessionStart: 0,
  dailyCompletions: [],
  growthEvent: null,
  quietProgressEnabled: false,
  progressDayStartHour: 0,
  onHome: vi.fn(),
  language: "en",
  direction: "ltr",
  reduceMotion: true,
  hapticFeedback: false,
};

afterEach(() => vi.useRealTimers());

for (const language of ["ar", "en"] as const) {
  describe(`Completion collection sharing ${language}`, () => {
    it("opens the actual collection on request with balanced cards and all-card scope, then returns to completion", async () => {
      studio.mockClear();
      const onHome = vi.fn();
      render(
        <CompletionScreen
          catId="morning"
          sessionStart={Date.now() - 60000}
          dailyCompletions={[]}
          growthEvent={null}
          quietProgressEnabled={false}
          progressDayStartHour={0}
          onHome={onHome}
          language={language}
          direction={language === "ar" ? "rtl" : "ltr"}
          reduceMotion
          hapticFeedback={false}
        />,
      );
      expect(studio).not.toHaveBeenCalled();
      const category = language === "ar" ? "أذكار الصباح" : "Morning Azkar";
      const share = screen.getByRole("button", {
        name: t(language, "completion.shareCollection", { category }),
        exact: true,
      });
      expect(share).toHaveAttribute("aria-haspopup", "dialog");
      fireEvent.click(share);
      const close = await screen.findByRole("button", { name: "Close completion image" });
      const props = studio.mock.lastCall![0] as CollectionShareModalProps;
      expect(props).toMatchObject({
        open: true,
        categoryId: "morning",
        initialFormat: "square",
        initialScope: "all",
        contentAlignment: "balanced",
        routineMode: "complete",
        language,
      });
      expect(props.single).toBeUndefined();
      expect(props.items).toEqual(getAzkarForMode("morning", "complete"));
      expect(props.collectionTitle).toBe(category);
      expect(props.items.every((item) => item.arabicText && item.sourceReference && item.repetitionCount > 0)).toBe(
        true,
      );
      expect(props.shareItemsByLanguage).toBeUndefined();
      expect(props).not.toHaveProperty("sessionStart");
      expect(props).not.toHaveProperty("dailyCompletions");
      fireEvent.click(close);
      expect(screen.queryByRole("button", { name: "Close completion image" })).not.toBeInTheDocument();
      expect(share).toBeInTheDocument();
      expect(onHome).not.toHaveBeenCalled();
    });
  });
}

it.each(["fajr", "dhuhr"] as const)(
  "shares only the current %s prayer's abbreviated azkar with their mode",
  async (prayer) => {
    render(
      <CompletionScreen {...props} catId="after_prayer" prayer={prayer} completionLevel="core" themeMode="midnight" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Share After Prayer", exact: true }));
    await screen.findByRole("button", { name: "Close completion image" });
    const studioProps = studio.mock.lastCall![0] as CollectionShareModalProps;
    expect(studioProps).toMatchObject({
      categoryId: "after_prayer",
      routineMode: "core",
      prayer,
      themeMode: "midnight",
    });
    expect(studioProps.items).toEqual(getAzkarForPrayer(prayer, "core"));
  },
);

it("keeps the exact evidence and finished elapsed time stable across details and sharing", async () => {
  const now = new Date("2026-11-25T10:00:00Z");
  vi.setSystemTime(now);
  const sessionStart = now.getTime() - 60_000;
  render(<CompletionScreen {...props} sessionStart={sessionStart} />);
  const evidence = getCompletionReflection(sessionStart);
  expect(screen.getByTestId("completion-reflection-text")).toHaveTextContent(evidence.text.en);
  expect(screen.getByTestId("completion-session-details")).not.toBeVisible();
  fireEvent.click(screen.getByText("Session details"));
  expect(screen.getByText("Elapsed time: 1 min")).toBeVisible();
  vi.setSystemTime(new Date(now.getTime() + 10 * 60_000));
  fireEvent.click(screen.getByRole("button", { name: "Share Morning Azkar" }));
  fireEvent.click(await screen.findByRole("button", { name: "Close completion image" }));
  expect(screen.getByText("Elapsed time: 1 min")).toBeVisible();
  expect(screen.getByTestId("completion-reflection")).toHaveAttribute("data-evidence-id", evidence.id);
  expect(screen.getByTestId("completion-reflection-text")).toHaveTextContent(evidence.text.en);
});

it("shows Quran in Arabic beside its reviewed English meaning and lets the reader explore benefits", async () => {
  const onOpenBenefits = vi.fn();
  render(<CompletionScreen {...props} sessionStart={1000} onOpenBenefits={onOpenBenefits} />);
  const evidence = getCompletionReflection(1000);
  await waitFor(() => expect(screen.getByTestId("completion-reflection-text")).toHaveTextContent(evidence.text.ar));
  expect(screen.getByTestId("completion-reflection-text")).toHaveAttribute("lang", "ar");
  expect(screen.getByText(evidence.text.en)).toBeVisible();
  expect(screen.getByTestId("completion-reflection-source")).toHaveAttribute("href", evidence.sourceUrl);
  fireEvent.click(screen.getByRole("button", { name: "More about the benefits of dhikr" }));
  expect(onOpenBenefits).toHaveBeenCalledOnce();
});

it("uses the saved finish timestamp when returning from Benefits later", () => {
  const completedAt = new Date("2026-11-25T10:00:00Z").getTime();
  vi.setSystemTime(completedAt + 60 * 60_000);
  render(<CompletionScreen {...props} sessionStart={completedAt - 60_000} completedAt={completedAt} />);
  fireEvent.click(screen.getByText("Session details"));
  expect(screen.getByText("Elapsed time: 1 min")).toBeVisible();
});

it("keeps extra-azkar continuation primary, and never invents a streak when there are no records", () => {
  const onContinueComplete = vi.fn();
  render(
    <CompletionScreen {...props} completionLevel="core" onContinueComplete={onContinueComplete} quietProgressEnabled />,
  );
  const continuation = screen.getByRole("button", { name: /Continue with/ });
  expect(continuation).toHaveAttribute("data-variant", "default");
  expect(screen.getByRole("button", { name: "Home", exact: true })).toHaveAttribute("data-variant", "outline");
  expect(screen.queryByText(/You kept up/)).not.toBeInTheDocument();
  fireEvent.click(continuation);
  expect(onContinueComplete).toHaveBeenCalledOnce();
  expect(screen.getByTestId("completion-count")).toHaveTextContent(String(getAzkarForMode("morning", "core").length));
});
