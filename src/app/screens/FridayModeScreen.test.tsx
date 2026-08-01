import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FridayModeScreen } from "./FridayModeScreen";

describe("FridayModeScreen dua collection", () => {
  it("shows both groups and expands a dua's benefit and source", () => {
    render(<FridayModeScreen isArabic={false} direction="ltr" onBack={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Comprehensive Duas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Essential 20" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "27 Additional Duas" })).toBeInTheDocument();

    const detailButtons = screen.getAllByRole("button", { name: "Show benefit and source" });
    expect(detailButtons).toHaveLength(47);
    expect(screen.getByText("Reported count: 100")).toBeInTheDocument();
    fireEvent.click(detailButtons[35]!);

    expect(screen.getByText("Attribution")).toBeInTheDocument();
    expect(screen.getByText("Taught by the Prophet ﷺ")).toBeInTheDocument();
    expect(screen.getByText("Benefit")).toBeInTheDocument();
    expect(screen.getByText("Sahih Muslim 2697b.")).toBeInTheDocument();
  });
});
