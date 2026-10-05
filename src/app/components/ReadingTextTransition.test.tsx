import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ReadingTextTransition } from "./ReadingTextTransition";

describe("ReadingTextTransition", () => {
  it("cancels outgoing text immediately when reduced motion is enabled during exit", () => {
    const view = (entryId: string, index: number, reduceMotion: boolean) => (
      <ReadingTextTransition entryId={entryId} index={index} direction="ltr" reduceMotion={reduceMotion}>
        {entryId}
      </ReadingTextTransition>
    );
    const { rerender } = render(view("first", 0, false));
    rerender(view("second", 1, false));
    expect(screen.getByText("first")).toHaveAttribute("inert");
    rerender(view("second", 1, true));
    expect(screen.queryByText("first")).not.toBeInTheDocument();
    expect(screen.getByText("second")).not.toHaveAttribute("inert");
  });
  it("resets entry-local reading controls while keeping reduced-motion text immediate", () => {
    function EntryControl() {
      const [open, setOpen] = useState(false);
      return <button onClick={() => setOpen(!open)}>{open ? "Open detail" : "Closed detail"}</button>;
    }
    const view = (entryId: string, index: number) => (
      <ReadingTextTransition entryId={entryId} index={index} direction="ltr" reduceMotion>
        <EntryControl />
      </ReadingTextTransition>
    );
    const { rerender } = render(view("first", 0));
    fireEvent.click(screen.getByRole("button", { name: "Closed detail" }));
    expect(screen.getByRole("button", { name: "Open detail" })).toBeInTheDocument();
    rerender(view("second", 1));
    expect(screen.getByRole("button", { name: "Closed detail" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open detail" })).not.toBeInTheDocument();
  });
  for (const direction of ["ltr", "rtl"] as const) {
    it(`settles on the latest entry during an interrupted ${direction} transition`, () => {
      const view = (entryId: string, index: number) => (
        <ReadingTextTransition direction={direction} reduceMotion={false} entryId={entryId} index={index}>
          {entryId}
        </ReadingTextTransition>
      );
      const { rerender } = render(view("first", 0));
      rerender(view("second", 1));
      expect(screen.getByText("first")).toHaveAttribute("inert");
      rerender(view("third", 2));
      expect(screen.queryByText("first")).not.toBeInTheDocument();
      expect(screen.queryByText("second")).not.toBeInTheDocument();
      expect(screen.getByText("third")).not.toHaveAttribute("inert");
      rerender(view("second", 1));
      expect(screen.getByText("second")).not.toHaveAttribute("inert");
      expect(screen.queryByText("third")).not.toBeInTheDocument();
      rerender(view("first", 0));
      expect(screen.getByText("first")).not.toHaveAttribute("inert");
      expect(screen.queryByText("third")).not.toBeInTheDocument();
    });
  }
  it("makes outgoing text inert so its actions cannot affect the next entry", () => {
    const props = { direction: "ltr" as const, reduceMotion: false };
    const { rerender } = render(
      <ReadingTextTransition {...props} entryId="first" index={0}>
        First text
      </ReadingTextTransition>,
    );
    rerender(
      <ReadingTextTransition {...props} entryId="second" index={1}>
        Second text
      </ReadingTextTransition>,
    );
    const outgoing = screen.getByText("First text");
    expect(outgoing).toHaveAttribute("inert");
    expect(outgoing).toHaveAttribute("aria-hidden", "true");
    expect(outgoing).toHaveAttribute("data-prevent-count", "true");
  });
  for (const direction of ["ltr", "rtl"] as const) {
    it(`reverses travel for Previous in ${direction} without duplicating reading text`, async () => {
      const props = { direction, reduceMotion: true };
      const { rerender } = render(
        <ReadingTextTransition {...props} entryId="first" index={0}>
          First text
        </ReadingTextTransition>,
      );
      rerender(
        <ReadingTextTransition {...props} entryId="second" index={1}>
          Second text
        </ReadingTextTransition>,
      );
      await waitFor(() => expect(screen.queryByText("First text")).not.toBeInTheDocument());
      expect(screen.getByText("Second text")).toBeInTheDocument();
      expect(screen.getByTestId("reading-text-transition")).toHaveAttribute(
        "data-direction",
        direction === "rtl" ? "-1" : "1",
      );
      rerender(
        <ReadingTextTransition {...props} entryId="first" index={0}>
          First text
        </ReadingTextTransition>,
      );
      await waitFor(() => expect(screen.queryByText("Second text")).not.toBeInTheDocument());
      expect(screen.getByText("First text")).toBeInTheDocument();
      expect(screen.getByTestId("reading-text-transition")).toHaveAttribute(
        "data-direction",
        direction === "rtl" ? "1" : "-1",
      );
      expect(screen.getByText("First text").parentElement).toHaveStyle({ opacity: "1", transform: "none" });
    });
  }
});
