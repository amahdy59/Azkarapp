import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AboutPanel } from "./AboutPanel";

describe("AboutPanel", () => {
  it("renders Quran Word Meanings source row and calls onSources when clicked", () => {
    const onSources = vi.fn();
    const onBack = vi.fn();
    const onHelp = vi.fn();
    const onLegal = vi.fn();
    const onWhatsNew = vi.fn();

    render(
      <AboutPanel
        language="ar"
        onSources={onSources}
        onBack={onBack}
        onHelp={onHelp}
        onLegal={onLegal}
        onWhatsNew={onWhatsNew}
      />,
    );

    const quranRow = screen.getByText("غريب القرآن");
    expect(quranRow).toBeInTheDocument();
    expect(screen.getByText("الميسر في غريب القرآن — مجمع الملك فهد")).toBeInTheDocument();

    fireEvent.click(quranRow);
    expect(onSources).toHaveBeenCalledTimes(1);
  });

  it("renders Quran Word Meanings source row in English", () => {
    const onSources = vi.fn();
    render(
      <AboutPanel
        language="en"
        onSources={onSources}
        onBack={() => undefined}
        onHelp={() => undefined}
        onLegal={() => undefined}
        onWhatsNew={() => undefined}
      />,
    );

    expect(screen.getByText("Qur'an Word Meanings")).toBeInTheDocument();
    expect(screen.getByText("Al-Muyassar fi Ghareeb Al-Qur'an — King Fahd Complex")).toBeInTheDocument();
  });
});
