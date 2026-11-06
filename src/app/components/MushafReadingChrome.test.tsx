import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MushafDesktopFooter, MushafDesktopHeader, MushafFocusButton } from "./MushafReadingChrome";

describe("Mushaf reading chrome", () => {
  it("keeps the visible spread range in numerical order and opens the existing jump action", () => {
    const jump = vi.fn();
    render(<MushafDesktopFooter language="ar" direction="rtl" firstPage={558} secondPage={557} onJump={jump} />);
    const range = screen.getByTestId("mushaf-desktop-page-range");
    expect(range).toHaveTextContent("٥٥٧–٥٥٨");
    expect(range).not.toHaveTextContent("٦٠٤");
    expect(range.querySelector("bdi")).toHaveAttribute("dir", "ltr");
    fireEvent.click(range);
    expect(jump).toHaveBeenCalledOnce();
  });

  it("keeps a single page meaningful without repeating it as a range", () => {
    render(<MushafDesktopFooter language="en" direction="ltr" firstPage={604} onJump={() => undefined} />);
    expect(screen.getByTestId("mushaf-desktop-page-range")).toHaveTextContent("Pages604");
    expect(screen.getByTestId("mushaf-desktop-page-range")).not.toHaveTextContent("604–604");
  });

  it("connects index tabs, search, fullscreen and back to the owning reader", () => {
    const back = vi.fn(),
      fullscreen = vi.fn(),
      surahs = vi.fn(),
      juzs = vi.fn();
    render(
      <MushafDesktopHeader
        language="en"
        direction="ltr"
        toolbarSide="right"
        surahName="Al-Baqarah"
        juzNumber={3}
        isFullscreen={false}
        onBack={back}
        onToggleFullscreen={fullscreen}
        onSurahs={surahs}
        onJuzs={juzs}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Full screen" }));
    fireEvent.click(screen.getByTestId("mushaf-rail-index"));
    fireEvent.click(screen.getByTestId("mushaf-desktop-search"));
    fireEvent.click(screen.getByTestId("mushaf-desktop-juz"));
    expect(back).toHaveBeenCalledOnce();
    expect(fullscreen).toHaveBeenCalledOnce();
    expect(surahs).toHaveBeenCalledTimes(2);
    expect(juzs).toHaveBeenCalledOnce();
  });

  it("offers Focus as a named button", () => {
    const enter = vi.fn();
    render(<MushafFocusButton language="en" onEnter={enter} />);
    fireEvent.click(screen.getByRole("button", { name: "Turn on focus mode" }));
    expect(enter).toHaveBeenCalledOnce();
  });
});
