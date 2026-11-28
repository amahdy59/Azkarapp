import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { EnlargedReadingToolbar } from "./EnlargedReadingToolbar";
import { dismissTopOverlay } from "../hooks/useOverlayBack";
import { Modal } from "./ResponsiveSheet";

const defaults = {
  language: "en" as const,
  scale: 150,
  current: 0,
  total: 1,
  ready: true,
  onScale: vi.fn(),
  onPrevious: vi.fn(),
  onNext: vi.fn(),
};

describe("enlarged reading controls", () => {
  it("consumes a nested excerpt Escape before the parent dialog can close", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} language="en" direction="ltr" title="Excerpt">
        <EnlargedReadingToolbar {...defaults} />
      </Modal>,
    );
    const trigger = screen.getByRole("button", { name: "Text size" });
    fireEvent.click(trigger);
    const slider = await screen.findByRole("slider", { name: "Text size" });
    expect(slider).toHaveFocus();
    fireEvent.keyDown(slider, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("slider")).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "Excerpt" })).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("omits irrelevant single-portion navigation and a duplicate modal exit", () => {
    render(<EnlargedReadingToolbar {...defaults} />);
    expect(screen.getByRole("button", { name: "Text size" })).toHaveTextContent("150%");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("keeps inline return and correct start/end navigation availability", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <EnlargedReadingToolbar {...defaults} total={3} onClose={onClose} closeLabel="Return to Mushaf" />,
    );
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(defaults.onNext).toHaveBeenCalledOnce();
    rerender(<EnlargedReadingToolbar {...defaults} total={3} current={2} onClose={onClose} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Return to Mushaf" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("updates labelled size controls and closes only the popup on Back", async () => {
    function Reader() {
      const [scale, setScale] = useState(150);
      return <EnlargedReadingToolbar {...defaults} scale={scale} onScale={setScale} />;
    }
    render(<Reader />);
    const trigger = screen.getByRole("button", { name: "Text size" });
    fireEvent.click(trigger);
    const slider = await screen.findByRole("slider", { name: "Text size" });
    expect(slider).toHaveFocus();
    fireEvent.change(slider, { target: { value: "250" } });
    expect(screen.getByRole("button", { name: "Larger Quran text" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Smaller Quran text" }));
    expect(slider).toHaveValue("225");
    expect(trigger).toHaveTextContent("225%");
    expect(dismissTopOverlay()).toBe(true);
    await waitFor(() => expect(screen.queryByRole("slider")).not.toBeInTheDocument());
    expect(trigger).toBeInTheDocument();
  });
});
