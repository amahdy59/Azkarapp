import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuranHomeCard } from "./QuranHomeCard";

const now = new Date(2026, 7, 24, 12);

describe("QuranHomeCard", () => {
  it("offers plan setup for a genuinely first Quran reading", () => {
    const onOverview = vi.fn();
    render(
      <QuranHomeCard
        language="en"
        direction="ltr"
        position={{ page: 1, surahNumber: 1 }}
        plan={{ kind: "daily", dailyPages: 4 }}
        wirdHistory={{}}
        progressDayStartHour={0}
        now={now}
        onContinue={vi.fn()}
        onOverview={onOverview}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Set reading plan" }));
    expect(onOverview).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: /Continue reading/ })).not.toBeInTheDocument();
  });

  it("resumes directly and shows today's quantitative progress for a returning reader", () => {
    const onContinue = vi.fn();
    const onOverview = vi.fn();
    render(
      <QuranHomeCard
        language="en"
        direction="ltr"
        position={{ page: 42, surahNumber: 2 }}
        plan={{ kind: "daily", dailyPages: 4, startedDayKey: "2026-08-24" }}
        wirdHistory={{ "2026-08-24": [40, 41] }}
        progressDayStartHour={0}
        now={now}
        onContinue={onContinue}
        onOverview={onOverview}
      />,
    );

    expect(screen.getByText(/Surah Al-Baqarah · Page 42/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "2 of 4 pages completed today" })).toHaveAttribute(
      "aria-valuenow",
      "2",
    );
    fireEvent.click(screen.getByRole("button", { name: /Continue reading/ }));
    expect(onContinue).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Plan & progress" }));
    expect(onOverview).toHaveBeenCalledOnce();
  });
});
