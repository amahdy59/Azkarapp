import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReadingTextTransition } from "./ReadingTextTransition";

describe("ReadingTextTransition", () => {
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
