import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FridayModeScreen } from "./FridayModeScreen";

describe("FridayModeScreen dua collection", () => {
  it("shows both groups and expands a dua's benefit and source", () => {
    render(<FridayModeScreen isArabic={false} direction="ltr" onBack={() => undefined} />);

    expect(screen.getByRole("heading", { name: "Friday Dua Collection" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Essential 20" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "15 Additional Duas" })).toBeInTheDocument();

    const detailButtons = screen.getAllByRole("button", { name: "Show benefit and source" });
    expect(detailButtons).toHaveLength(35);
    fireEvent.click(detailButtons[0]!);

    expect(screen.getByText("Benefit")).toBeInTheDocument();
    expect(screen.getByText("Sahih al-Bukhari 3370; Sunan Abu Dawud 1047.")).toBeInTheDocument();
  });
});
