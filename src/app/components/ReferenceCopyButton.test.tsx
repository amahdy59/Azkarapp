import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReferenceCopyButton } from "./ReferenceCopyButton";

describe("ReferenceCopyButton", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("copies exact text and announces success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ReferenceCopyButton text="Reviewed reference" language="en" />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("Copied to clipboard")).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("Reviewed reference");
    expect(screen.getByRole("status")).toHaveTextContent("Copied to clipboard");
    expect(screen.getByRole("button")).toHaveAccessibleName("Copied to clipboard");
  });

  it("guards repeated activation while copying and preserves focus", async () => {
    let finish!: () => void;
    const writeText = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ReferenceCopyButton text="Reviewed reference" language="en" />);
    const button = screen.getByRole("button");
    button.focus();
    fireEvent.click(button);
    fireEvent.click(button);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAccessibleName("Copying text…");
    await act(async () => finish());
    expect(button).toHaveFocus();
    expect(button).toHaveAccessibleName("Copied to clipboard");
    expect(button).toHaveAttribute("aria-busy", "false");
  });

  it("shows a recoverable error and clears it on successful retry", async () => {
    const writeText = vi.fn().mockRejectedValueOnce(new Error("denied")).mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    render(<ReferenceCopyButton text="Reviewed reference" language="en" />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Check clipboard permission and try again");
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Copied to clipboard");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
