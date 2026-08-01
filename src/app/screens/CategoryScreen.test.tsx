import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { registerLazyCollection } from "../content/azkar";
import { COMPREHENSIVE_DUAS } from "../content/comprehensiveDuas";
import { CategoryScreen } from "./CategoryScreen";

describe("CategoryScreen comprehensive-dua session", () => {
  it("uses the standard collection progress and session controls", () => {
    const onZikr = vi.fn();
    registerLazyCollection("comprehensive_duas", COMPREHENSIVE_DUAS);

    render(
      <CategoryScreen
        catId="comprehensive_duas"
        completed={new Set()}
        isArabic={false}
        direction="ltr"
        onZikr={onZikr}
        onReset={() => undefined}
        onRepeat={() => undefined}
        onBack={() => undefined}
      />,
    );

    expect(screen.getByRole("heading", { name: "Comprehensive Duas" })).toBeInTheDocument();
    expect(screen.getByText("0 of 47")).toBeInTheDocument();
    expect(screen.getByText("Collection introduction")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Start Session/ }));
    expect(onZikr).toHaveBeenCalledWith(0);
  });
});
