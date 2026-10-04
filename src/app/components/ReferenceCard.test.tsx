import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReferenceCard } from "./ReferenceCard";

describe("ReferenceCard", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps an English citation English when the narration falls back to Arabic", () => {
    render(
      <ReferenceCard
        body="نص عربي"
        bodyTestId="fallback-body"
        sourceText="Sahih Muslim 408"
        sourceTestId="fallback-source"
        language="en"
        direction="ltr"
        isArabicText
      />,
    );
    expect(screen.getByTestId("fallback-body")).toHaveAttribute("lang", "ar");
    expect(screen.getByTestId("fallback-body")).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("fallback-source")).toHaveAttribute("lang", "en");
    expect(screen.getByTestId("fallback-source")).toHaveAttribute("dir", "ltr");
  });

  it("renders card with title, body, and copy button", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(
      <ReferenceCard
        title="Hadith"
        titleHeadingId="hadith-title"
        body="Whoever sends one blessing upon me..."
        bodyTestId="hadith-body"
        copyable={true}
        language="en"
        direction="ltr"
      />,
    );

    const heading = screen.getByRole("heading", { level: 3, name: "Hadith" });
    expect(heading).toHaveAttribute("id", "hadith-title");
    expect(heading).toHaveClass("text-subtitle", "font-bold", "text-primary");

    const body = screen.getByTestId("hadith-body");
    expect(body).toHaveTextContent("Whoever sends one blessing upon me...");
    expect(body).toHaveClass("text-subtitle", "font-bold", "leading-7");

    const copyBtn = screen.getByRole("button", { name: "Copy hadith text" });
    expect(copyBtn).toHaveClass("size-11");
    fireEvent.click(copyBtn);
    expect(writeText).toHaveBeenCalledWith("Whoever sends one blessing upon me...");
  });

  it("renders without title, placing text and copy button in top row", () => {
    render(<ReferenceCard body="Direct text without title" bodyTestId="direct-body" copyable={true} language="en" />);

    const body = screen.getByTestId("direct-body");
    expect(body).toHaveTextContent("Direct text without title");
    expect(body).toHaveClass("text-subtitle", "font-bold", "leading-7", "flex-1");
    expect(screen.getByRole("button", { name: "Copy hadith text" })).toBeInTheDocument();
  });

  it("renders source link with external link icon when sourceUrl is provided", () => {
    render(
      <ReferenceCard
        body="Text"
        sourceText="Sahih Muslim 408"
        sourceUrl="https://sunnah.com/muslim:408"
        sourceTestId="source-link"
        language="en"
      />,
    );

    const link = screen.getByRole("link", { name: /Sahih Muslim 408/i });
    expect(link).toHaveAttribute("href", "https://sunnah.com/muslim:408");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveClass("min-h-11", "text-label", "font-black", "text-primary");
  });

  it("renders plain source text when no sourceUrl is provided", () => {
    render(
      <ReferenceCard
        body="Text"
        sourceText="Muslim 4/2088"
        sourceTestId="source-plain"
        sourceHeadingId="src-heading"
        language="ar"
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    const source = screen.getByTestId("source-plain");
    expect(source).toHaveTextContent("Muslim 4/2088");
    expect(source).toHaveClass("text-label", "font-black", "text-primary");

    const srHeading = document.getElementById("src-heading");
    expect(srHeading).toHaveClass("sr-only");
  });

  it("applies zikr-text and RTL direction for Arabic text", () => {
    render(
      <ReferenceCard
        body="«مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا»."
        bodyTestId="ar-body"
        language="ar"
        isArabicText={true}
      />,
    );

    const body = screen.getByTestId("ar-body");
    expect(body).toHaveClass("zikr-text");
    expect(body).toHaveAttribute("dir", "rtl");
    expect(body).toHaveAttribute("lang", "ar");
  });
});
