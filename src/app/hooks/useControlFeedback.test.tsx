import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useControlFeedback } from "./useControlFeedback";

it("confirms keyboard activation without changing native actions and cleans up cancellation", () => {
  const onClick = vi.fn();
  function Controls() {
    useControlFeedback();
    return (
      <>
        <button onClick={onClick}>Share</button>
        <button disabled>Unavailable</button>
        <input aria-label="Value" />
        <button className="no-press">Reading</button>
        <a href="#reading">Open reading</a>
      </>
    );
  }
  const { unmount } = render(<Controls />);
  const share = screen.getByRole("button", { name: "Share" });
  fireEvent.keyDown(share, { key: "Enter" });
  expect(share).toHaveAttribute("data-key-pressed");
  expect(onClick).not.toHaveBeenCalled();
  fireEvent.keyUp(share, { key: "Enter" });
  expect(share).not.toHaveAttribute("data-key-pressed");
  expect(share).toHaveAttribute("data-key-released");
  fireEvent.pointerDown(share);
  expect(share).not.toHaveAttribute("data-key-released");
  fireEvent.keyDown(share, { key: " ", repeat: true });
  expect(share).not.toHaveAttribute("data-key-pressed");
  for (const control of [
    screen.getByRole("button", { name: "Unavailable" }),
    screen.getByRole("textbox"),
    screen.getByRole("button", { name: "Reading" }),
  ]) {
    fireEvent.keyDown(control, { key: "Enter" });
    expect(control).not.toHaveAttribute("data-key-pressed");
  }
  const link = screen.getByRole("link");
  fireEvent.keyDown(link, { key: " " });
  expect(link).not.toHaveAttribute("data-key-pressed");
  fireEvent.keyDown(link, { key: "Enter" });
  expect(link).toHaveAttribute("data-key-pressed");
  fireEvent.keyUp(link, { key: "Enter" });
  fireEvent.keyDown(share, { key: "Enter", ctrlKey: true });
  expect(share).not.toHaveAttribute("data-key-pressed");
  fireEvent.keyDown(share, { key: " " });
  fireEvent.blur(window);
  expect(share).not.toHaveAttribute("data-key-pressed");
  fireEvent.keyDown(share, { key: "Enter" });
  fireEvent.focusOut(share);
  expect(share).not.toHaveAttribute("data-key-pressed");
  expect(share).toHaveAttribute("data-key-released");
  fireEvent.keyDown(share, { key: "Enter" });
  expect(share).not.toHaveAttribute("data-key-released");
  unmount();
  expect(share).not.toHaveAttribute("data-key-pressed");
  expect(share).not.toHaveAttribute("data-key-released");
});

it("handles disclosures and semantic choices while excluding unavailable and read-only controls", () => {
  function Controls() {
    useControlFeedback();
    return (
      <>
        <details>
          <summary>Details</summary>Text
        </details>
        <button role="menuitemradio" aria-checked="false">
          Choice
        </button>
        <button aria-disabled="true">Unavailable</button>
        <button data-disabled="">Disabled option</button>
        <button role="checkbox" aria-checked="false" aria-readonly="true">
          Read only
        </button>
      </>
    );
  }
  render(<Controls />);
  const summary = screen.getByText("Details");
  fireEvent.keyDown(summary, { key: "Enter" });
  expect(summary).toHaveAttribute("data-key-pressed");
  expect(summary.parentElement).not.toHaveAttribute("open");
  fireEvent.keyUp(summary, { key: "Enter" });
  expect(summary).not.toHaveAttribute("data-key-pressed");
  const choice = screen.getByRole("menuitemradio");
  fireEvent.keyDown(choice, { key: " " });
  expect(choice).toHaveAttribute("data-key-pressed");
  fireEvent.pointerCancel(choice);
  expect(choice).not.toHaveAttribute("data-key-pressed");
  for (const name of ["Unavailable", "Disabled option", "Read only"]) {
    const button = screen.getByRole(name === "Read only" ? "checkbox" : "button", { name });
    fireEvent.keyDown(button, { key: "Enter" });
    expect(button).not.toHaveAttribute("data-key-pressed");
  }
});
