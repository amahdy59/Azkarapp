import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SourcesPanel } from "./SourcesPanel";
import { QURAN_WORD_MEANING_SOURCE } from "../../content/quranWordMeanings";

describe("SourcesPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Quran Word Meanings attribution in Arabic with link to King Fahd Complex", () => {
    const onBack = vi.fn();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<SourcesPanel language="ar" onBack={onBack} />);

    expect(screen.getByText("الميسر في غريب القرآن")).toBeInTheDocument();
    expect(
      screen.getByText(/تعتمد معاني الكلمات الغريبة الواردة في الآيات على «الميسر في غريب القرآن»/),
    ).toBeInTheDocument();

    const complexBtn = screen.getByRole("button", { name: /زيارة مجمع الملك فهد/ });
    expect(complexBtn).toBeInTheDocument();

    fireEvent.click(complexBtn);
    expect(openSpy).toHaveBeenCalledWith(QURAN_WORD_MEANING_SOURCE.url, "_blank", "noopener,noreferrer");
  });

  it("renders Quran Word Meanings attribution in English", () => {
    const onBack = vi.fn();
    render(<SourcesPanel language="en" onBack={onBack} />);

    expect(screen.getByText("Al-Muyassar fi Ghareeb Al-Qur'an")).toBeInTheDocument();
    expect(screen.getByText(/Unfamiliar Qur'anic word meanings are faithfully sourced/)).toBeInTheDocument();

    const complexBtn = screen.getByRole("button", { name: /Visit King Fahd Complex/ });
    expect(complexBtn).toBeInTheDocument();
  });
});
