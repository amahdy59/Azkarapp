import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioContentReviewScreen } from "./AudioContentReviewScreen";

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/?audio-review=1&audio-source=opendua");
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
});

describe("development audio review modal", () => {
  it("selects samples through a protected portal and restores keyboard focus before closing", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AudioContentReviewScreen language="en" onClose={onClose} />);
    expect(screen.getByRole("dialog", { name: "Audio content review" })).toHaveAttribute("data-dropdown-surface");
    const sample = screen.getByRole("combobox", { name: "Choose a sample" });
    await user.click(sample);
    await user.click(screen.getByRole("option", { name: "Forgiveness for every sin" }));
    expect(sample).toHaveTextContent("Forgiveness for every sin");
    await user.click(screen.getByRole("radio", { name: "Muhammad Jumah · OpenDua" }));
    expect(screen.getByLabelText("Review recording player").getAttribute("src")).toContain("OD-046.mp3");
    await user.click(sample);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(sample).toHaveFocus());
    expect(onClose).not.toHaveBeenCalled();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("retains separate checksum-bound notes when changing samples and stops preview on exit", async () => {
    const user = userEvent.setup();
    const mounted = render(<AudioContentReviewScreen language="en" onClose={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Review notes" }), { target: { value: "First sample only" } });
    const sample = screen.getByRole("combobox", { name: "Choose a sample" });
    await user.click(sample);
    await user.click(screen.getByRole("option", { name: "Subhan Allah wa bihamdih" }));
    expect(screen.getByRole("textbox", { name: "Review notes" })).toHaveValue("");
    await user.click(sample);
    await user.click(screen.getByRole("option", { name: "Praise upon waking" }));
    expect(screen.getByRole("textbox", { name: "Review notes" })).toHaveValue("First sample only");
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();
    mounted.unmount();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});
