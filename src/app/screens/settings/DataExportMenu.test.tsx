import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataExportMenu } from "./DataExportMenu";

function setup(onProgress = vi.fn().mockResolvedValue(undefined)) {
  const onBackup = vi.fn();
  render(<DataExportMenu open onClose={vi.fn()} language="en" onBackup={onBackup} onProgress={onProgress} />);
  return { onProgress, onBackup };
}
function range(start = "2024-02-01", end = "2024-02-29") {
  fireEvent.change(screen.getByLabelText("Start date"), { target: { value: start } });
  fireEvent.change(screen.getByLabelText("End date"), { target: { value: end } });
}
describe("Settings data export menu", () => {
  it("keeps full backup and dated progress exports distinct", () => {
    const { onBackup, onProgress } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Download data" }));
    expect(onBackup).toHaveBeenCalledOnce();
    expect(onProgress).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Progress data" })).toBeInTheDocument();
  });
  it("keeps one export in flight, freezes its scope and reports the exact saved filename", async () => {
    let finish!: () => void;
    const onProgress = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    setup(onProgress);
    range();
    const button = screen.getByRole("button", { name: "Export JSON" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(onProgress).toHaveBeenCalledExactlyOnceWith({ startKey: "2024-02-01", endKey: "2024-02-29" });
    expect(screen.getByLabelText("Start date")).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button.closest("form")).toHaveAttribute("aria-busy", "true");
    await act(async () => finish());
    expect(await screen.findByText("progress-2024-02-01-2024-02-29.json")).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button.closest("form")).toHaveAttribute("aria-busy", "false");
  });
  it("reports save errors and allows recovery", async () => {
    const onProgress = vi.fn().mockRejectedValueOnce(new Error("cancelled")).mockResolvedValue(undefined);
    setup(onProgress);
    range();
    const button = screen.getByRole("button", { name: "Export JSON" });
    fireEvent.click(button);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save");
    expect(screen.getByLabelText("Start date")).toHaveAttribute("aria-invalid", "false");
    fireEvent.click(button);
    expect(await screen.findByText("Selected-period data saved.")).toBeInTheDocument();
    expect(onProgress).toHaveBeenCalledTimes(2);
  });
  it("does not announce an old export as the newly selected dates' success", async () => {
    setup();
    range();
    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));
    await screen.findByText("Selected-period data saved.");
    range("2024-01-01", "2024-01-31");
    expect(screen.queryByText("Selected-period data saved.")).not.toBeInTheDocument();
    expect(screen.queryByText("progress-2024-02-01-2024-02-29.json")).not.toBeInTheDocument();
  });
  it.each([
    ["2024-02-29", "2024-02-01", "End date must be on or after start date."],
    ["", "2024-02-29", "Enter two valid dates."],
    ["2099-01-01", "2099-01-02", "Choose dates through today; future days are not records."],
  ])("rejects invalid scope %s – %s", (start, end, error) => {
    const { onProgress } = setup();
    range(start, end);
    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));
    expect(screen.getByRole("alert")).toHaveTextContent(error);
    expect(screen.getByLabelText("Start date")).toHaveAttribute("aria-invalid", "true");
    expect(onProgress).not.toHaveBeenCalled();
  });
});
