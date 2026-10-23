import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SharingCaption } from "./SharingCaption";

const props = {
  language: "en" as const,
  included: false,
  onIncludedChange: vi.fn(),
  text: "Complete reading\nhttps://wa-zaker.com/",
  readingLink: "https://wa-zaker.com/#/azkar/morning/4",
  busy: false,
  canCopy: true,
  onCopy: vi.fn(async () => true),
};
describe("SharingCaption", () => {
  it("keeps the caption opt-in while copy text and an exact link stay available", async () => {
    const copy = vi.fn(async () => true);
    const change = vi.fn();
    render(<SharingCaption {...props} onCopy={copy} onIncludedChange={change} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "Include text with image" }));
    expect(change).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Copy text" }));
    await waitFor(() => expect(copy).toHaveBeenCalledWith(props.text));
    await waitFor(() => expect(screen.getByRole("button", { name: "Copy reading link" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Copy reading link" }));
    await waitFor(() => expect(copy).toHaveBeenCalledWith(props.readingLink));
  });
  it.each(["unavailable", "denied", "rejected"])(
    "offers focused selectable text when copying is %s",
    async (reason) => {
      const copy = reason === "rejected" ? vi.fn().mockRejectedValue(new Error("denied")) : vi.fn(async () => false);
      render(<SharingCaption {...props} canCopy={reason !== "unavailable"} onCopy={copy} />);
      fireEvent.click(screen.getByRole("button", { name: "Copy text" }));
      const field = await screen.findByRole("textbox", { name: "Caption preview" });
      expect(field).toHaveValue(props.text);
      expect(field).toHaveFocus();
      expect((field as HTMLTextAreaElement).selectionEnd).toBe(props.text.length);
      expect(screen.getByRole("status")).toHaveTextContent("Select the text");
    },
  );
  it("keeps the caption preview intact while a link needs manual copying", async () => {
    render(<SharingCaption {...props} included canCopy={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy reading link" }));
    expect(await screen.findByRole("textbox", { name: "Reading link" })).toHaveValue(props.readingLink);
    expect(screen.getByRole("textbox", { name: "Caption preview" })).toHaveValue(props.text);
  });
  it("omits unavailable links, keeps the exact preview and supports text saving", () => {
    const save = vi.fn();
    render(<SharingCaption {...props} readingLink={undefined} included onSaveText={save} artwork />);
    expect(screen.queryByRole("button", { name: "Copy reading link" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue(props.text);
    expect(screen.getByText(/For approved artwork/)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Save text" }));
    expect(save).toHaveBeenCalledWith(props.text);
  });
  it("prevents concurrent copies without losing the recovery action", async () => {
    let finish!: (copied: boolean) => void;
    const copy = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    render(<SharingCaption {...props} onCopy={copy} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy text" }));
    expect(screen.getByRole("button", { name: "Copy reading link" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Copy text" }));
    expect(copy).toHaveBeenCalledOnce();
    finish(true);
    await waitFor(() => expect(screen.getByRole("button", { name: "Copy text" })).toBeEnabled());
  });
});
