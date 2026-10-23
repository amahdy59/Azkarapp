import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it } from "vitest";
import { useScrollElevation } from "./useScrollElevation";

function Fixture({ initialTop = 0, enabled = true, sibling = false, progressShell = false, scrollableShell = false }) {
  const header = useRef<HTMLDivElement>(null);
  const scrolled = useScrollElevation(header, enabled);
  const content = (
    <div
      data-testid="viewport"
      data-header-scroll-owner
      ref={(node) => {
        if (node && !node.hasAttribute("data-initial-scroll")) {
          node.setAttribute("data-initial-scroll", "true");
          node.scrollTop = initialTop;
        }
      }}
      style={{ overflowY: "auto" }}
    >
      <div data-testid="horizontal" style={{ overflowX: "auto" }}>
        Tabs
      </div>
      <div data-testid="reading" style={{ overflowY: "auto" }}>
        Reading
      </div>
    </div>
  );
  return (
    <div
      className={progressShell ? "progress-screen-shell" : "app-screen-surface"}
      style={scrollableShell ? { overflowY: "auto" } : undefined}
    >
      {sibling ? (
        <>
          <div>
            <div ref={header} data-testid="header" data-scrolled={scrolled || undefined} />
          </div>
          {content}
        </>
      ) : (
        <div
          style={{ overflowY: "auto" }}
          data-testid="outer"
          ref={(node) => {
            if (node && !node.hasAttribute("data-initial-scroll")) {
              node.setAttribute("data-initial-scroll", "true");
              node.scrollTop = initialTop;
            }
          }}
        >
          <div ref={header} data-testid="header" data-scrolled={scrolled || undefined} />
          {content}
        </div>
      )}
    </div>
  );
}

describe("header scroll ownership", () => {
  it("tracks Progress records across the fixed controls wrapper", () => {
    render(<Fixture initialTop={120} sibling progressShell />);
    expect(screen.getByTestId("header")).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(screen.getByTestId("viewport"), { target: { scrollTop: 0 } });
    expect(screen.getByTestId("header")).not.toHaveAttribute("data-scrolled");
  });

  it("prefers the marked records viewport over a scrollable surrounding shell", () => {
    render(<Fixture initialTop={120} sibling progressShell scrollableShell />);
    expect(screen.getByTestId("header")).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(screen.getByTestId("viewport"), { target: { scrollTop: 0 } });
    expect(screen.getByTestId("header")).not.toHaveAttribute("data-scrolled");
  });

  it.each([false, true])("initializes restored scroll for sibling=%s", (sibling) => {
    render(<Fixture initialTop={120} sibling={sibling} />);
    expect(screen.getByTestId("header")).toHaveAttribute("data-scrolled", "true");
  });

  it("ignores nested chart/reading and horizontal scrolling while the page remains scrolled", () => {
    render(<Fixture initialTop={120} />);
    fireEvent.scroll(screen.getByTestId("horizontal"), { target: { scrollLeft: 80, scrollTop: 0 } });
    fireEvent.scroll(screen.getByTestId("reading"), { target: { scrollTop: 0 } });
    expect(screen.getByTestId("header")).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(screen.getByTestId("outer"), { target: { scrollTop: 0 } });
    expect(screen.getByTestId("header")).not.toHaveAttribute("data-scrolled");
    fireEvent.scroll(screen.getByTestId("reading"), { target: { scrollTop: 80 } });
    expect(screen.getByTestId("header")).not.toHaveAttribute("data-scrolled");
  });

  it("does not flicker between enter and exit thresholds", () => {
    render(<Fixture sibling />);
    const viewport = screen.getByTestId("viewport");
    const header = screen.getByTestId("header");
    fireEvent.scroll(viewport, { target: { scrollTop: 7 } });
    expect(header).not.toHaveAttribute("data-scrolled");
    fireEvent.scroll(viewport, { target: { scrollTop: 9 } });
    expect(header).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(viewport, { target: { scrollTop: 3 } });
    expect(header).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(viewport, { target: { scrollTop: 2 } });
    expect(header).not.toHaveAttribute("data-scrolled");
  });

  it("rebinds when responsive layout changes the viewport", () => {
    render(<Fixture initialTop={120} />);
    const outer = screen.getByTestId("outer");
    outer.style.overflowY = "hidden";
    fireEvent.resize(window);
    fireEvent.scroll(outer, { target: { scrollTop: 0 } });
    expect(screen.getByTestId("header")).toHaveAttribute("data-scrolled", "true");
    fireEvent.scroll(screen.getByTestId("viewport"), { target: { scrollTop: 0 } });
    expect(screen.getByTestId("header")).not.toHaveAttribute("data-scrolled");
  });

  it("clears elevation when disabled", () => {
    const { rerender } = render(<Fixture initialTop={120} />);
    expect(screen.getByTestId("header")).toHaveAttribute("data-scrolled", "true");
    rerender(<Fixture enabled={false} initialTop={120} />);
    expect(screen.getByTestId("header")).not.toHaveAttribute("data-scrolled");
  });
});
