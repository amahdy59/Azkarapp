import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppearanceMenu } from "./AppearanceMenu";

describe("AppearanceMenu Component", () => {
  it("renders trigger and switches text size on selection", async () => {
    const user = userEvent.setup();
    const onTextSizeChange = vi.fn();

    render(
      <AppearanceMenu
        triggerClass="test-trigger"
        textSize="medium"
        onTextSizeChange={onTextSizeChange}
        language="ar"
        direction="rtl"
        testIdPrefix="masbaha"
      />,
    );

    const trigger = screen.getByTestId("masbaha-settings-button");
    expect(trigger).toHaveTextContent("Aa");

    await user.click(trigger);

    expect(screen.getByTestId("masbaha-appearance-menu")).toBeInTheDocument();
    const largeOption = screen.getByTestId("masbaha-display-text-size-large");
    await user.click(largeOption);

    expect(onTextSizeChange).toHaveBeenCalledWith("large");
  });

  it("displays routine mode options when isRoutine is enabled", async () => {
    const user = userEvent.setup();
    const onRoutineModeChange = vi.fn();

    render(
      <AppearanceMenu
        triggerClass="test-trigger"
        textSize="medium"
        onTextSizeChange={vi.fn()}
        language="en"
        direction="ltr"
        isRoutine={true}
        routineMode="core"
        onRoutineModeChange={onRoutineModeChange}
        testIdPrefix="reader"
      />,
    );

    await user.click(screen.getByTestId("reader-settings-button"));

    expect(screen.getByText("Azkar list")).toBeInTheDocument();
    const completeOption = screen.getByRole("menuitemradio", { name: "Complete" });
    await user.click(completeOption);

    expect(onRoutineModeChange).toHaveBeenCalledWith("complete");
  });
});
