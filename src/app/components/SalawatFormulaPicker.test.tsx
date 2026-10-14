import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SALAWAT_FORMULAS, SalawatFormulaPicker } from "./SalawatFormulaPicker";

describe("SalawatFormulaPicker Component", () => {
  it("renders trigger and allows selecting As-Salat Al-Ibrahimiyyah", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SalawatFormulaPicker
        formulas={SALAWAT_FORMULAS}
        selected={SALAWAT_FORMULAS[0]!}
        language="ar"
        direction="rtl"
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByTestId("salawat-formula-filter");
    expect(trigger).toHaveTextContent("الصيغة المختصرة");

    await user.click(trigger);

    const ibrahimiyyahOption = screen.getByTestId("salawat-formula-option-salawat_ibrahimiyyah");
    expect(ibrahimiyyahOption).toBeInTheDocument();
    await user.click(ibrahimiyyahOption);

    expect(onSelect).toHaveBeenCalledWith(SALAWAT_FORMULAS[1]);
  });

  it("renders English formula names when language is English", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <SalawatFormulaPicker
        formulas={SALAWAT_FORMULAS}
        selected={SALAWAT_FORMULAS[0]!}
        language="en"
        direction="ltr"
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByTestId("salawat-formula-filter");
    expect(trigger).toHaveTextContent("Concise Formula");

    await user.click(trigger);

    expect(screen.getByText("As-Salat Al-Ibrahimiyyah")).toBeInTheDocument();
  });
});
