import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TranquilityCompletionCard } from "./TranquilityCompletionCard";

describe("TranquilityCompletionCard", () => {
  it("renders the centered completion hero actions without the quote card", () => {
    const onContinue = vi.fn();
    const onReview = vi.fn();

    render(
      <TranquilityCompletionCard
        categoryId="morning"
        language="ar"
        direction="rtl"
        onContinue={onContinue}
        onReview={onReview}
      />,
    );

    expect(screen.getByText("أكملت أذكار الصباح")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "تابع وردك" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "إعادة قراءة أذكار الصباح" })).toBeInTheDocument();
    expect(screen.queryByText(/البقرة|الرعد|الأحزاب|البخاري/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "تابع وردك" }));
    fireEvent.click(screen.getByRole("button", { name: "إعادة قراءة أذكار الصباح" }));

    expect(onContinue).toHaveBeenCalledOnce();
    expect(onReview).toHaveBeenCalledWith("morning");
  });
});
