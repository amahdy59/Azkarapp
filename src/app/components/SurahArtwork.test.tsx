import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SurahArtwork } from "./SurahArtwork";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("surah cover delivery", () => {
  it("uses the bundled cover without requesting a hosted candidate on phones", () => {
    render(<SurahArtwork name="al-kahf" />);
    const cover = screen.getByTestId("surah-artwork-cover");
    expect(cover).toHaveAttribute("src", "/assets/surah/v1/al-kahf-416.webp");
    expect(cover).not.toHaveAttribute("srcset");
    expect(cover).toHaveAttribute("alt", "");
    fireEvent.load(cover);
    expect(screen.queryByTestId("surah-artwork-detail")).not.toBeInTheDocument();
  });

  it("retains the local cover while an optional desktop detail is pending or fails", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    render(<SurahArtwork name="al-kahf" focus="50% 55%" />);
    const cover = screen.getByTestId("surah-artwork-cover");
    expect(screen.queryByTestId("surah-artwork-detail")).not.toBeInTheDocument();
    fireEvent.load(cover);
    const detail = screen.getByTestId("surah-artwork-detail");
    expect(detail).toHaveStyle({ opacity: "0", objectPosition: "50% 55%" });
    expect(detail).toHaveAttribute("fetchpriority", "low");
    expect(cover).toBeVisible();
    fireEvent.error(detail);
    expect(screen.queryByTestId("surah-artwork-detail")).not.toBeInTheDocument();
    expect(cover).toHaveAttribute("src", "/assets/surah/v1/al-kahf-416.webp");
    expect(cover).toBeVisible();
  });

  it("reveals a successful desktop detail without replacing the local cover", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    );
    render(<SurahArtwork name="as-sajdah" />);
    const cover = screen.getByTestId("surah-artwork-cover");
    fireEvent.load(cover);
    const detail = screen.getByTestId("surah-artwork-detail");
    fireEvent.load(detail);
    expect(detail).toHaveStyle({ opacity: "1" });
    expect(cover).toHaveAttribute("src", "/assets/surah/v1/as-sajdah-416.webp");
  });

  it("recovers a missing named cover to the generic offline artwork", () => {
    render(<SurahArtwork name="al-mulk" />);
    const cover = screen.getByTestId("surah-artwork-cover");
    fireEvent.error(cover);
    expect(cover).toHaveAttribute("src", "/assets/cards/wird-quran-720.webp");
    expect(cover).toHaveAttribute("width", "720");
    expect(cover).toHaveAttribute("height", "540");
    fireEvent.error(cover);
    expect(cover).toHaveAttribute("src", "/assets/cards/wird-quran-720.webp");
  });

  it("uses generic artwork when no reviewed cover is assigned", () => {
    render(<SurahArtwork />);
    expect(screen.getByTestId("surah-artwork-cover")).toHaveAttribute("src", "/assets/cards/wird-quran-720.webp");
  });
});
