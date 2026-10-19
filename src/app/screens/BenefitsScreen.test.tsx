import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BenefitsScreen, benefitEvidenceToShareItem, buildWhatsAppBenefitUrl } from "./BenefitsScreen";
import { HADITH_DHIKR_EVIDENCE, QURAN_DHIKR_EVIDENCE } from "../content/zikrBenefits";

describe("BenefitsScreen", () => {
  it.each(["ar", "en"] as const)("makes existing Quran translations available to the %s sharing studio", (language) => {
    for (const item of QURAN_DHIKR_EVIDENCE) {
      const shared = benefitEvidenceToShareItem(item, language);
      expect(shared.arabicText).toBe(item.text.ar);
      expect(shared.translation).toBe(item.text.en);
    }
  });
  it.each(["ar", "en"] as const)("renders and shares complete hadith evidence in %s", (language) => {
    render(
      <BenefitsScreen language={language} direction={language === "ar" ? "rtl" : "ltr"} onBack={() => undefined} />,
    );
    fireEvent.click(screen.getAllByRole("tab")[1]!);
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    for (const item of HADITH_DHIKR_EVIDENCE) {
      const article = screen
        .getAllByRole("article")
        .find((node) => node.querySelector("h2")?.textContent === item.title[language]);
      expect(article?.querySelector("p")?.textContent, item.id).toBe(item.text[language]);
      const shared = benefitEvidenceToShareItem(item, language);
      expect(shared.arabicText).toBe(item.text[language]);
      expect(shared.sourceReference).toBe(item.source[language]);
      expect(shared.readingUrl).toBe(item.sourceUrl);
      expect(shared.translation).toBe(language === "ar" ? item.text.en : undefined);
    }
  });
  it("presents Qur'an and hadith as two side-by-side evidence filters", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Qur’an (7)", "Hadith (21)"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByText("Qur’an", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Surah Ar-Ra'd · 13:28" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(7);
  });

  it("keeps the filter out of the scroll region so cards cannot surface over it", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    const filter = screen.getByTestId("benefits-filter-bar");
    const region = screen.getByTestId("benefits-scroll-region");

    // Sticky-inside-the-scroller is what let cards appear in the strip above
    // the filter and down both gutters beside it. Outside, there is no strip.
    expect(region).not.toContainElement(filter);
    expect(filter.className).not.toMatch(/sticky/);
    expect(filter.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows authenticated hadith entries in a keyboard-scrollable batch", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    expect(screen.getByTestId("benefits-scroll-region")).toHaveAttribute("tabindex", "0");
    fireEvent.click(screen.getByRole("tab", { name: "Hadith (21)" }));
    expect(screen.getAllByRole("article")).toHaveLength(15);
    expect(screen.queryByText("Authentic hadith", { exact: true })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    expect(screen.getAllByRole("article")).toHaveLength(21);
  });

  it("keeps cards focused on primary evidence without redundant related-benefit disclosures", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    fireEvent.click(screen.getByRole("tab", { name: "Hadith (21)" }));
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    expect(screen.queryByText(/related benefits/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(21);
  });

  it("supports Arabic direction, source sharing, and Back", () => {
    const onBack = vi.fn();
    render(<BenefitsScreen language="ar" direction="rtl" onBack={onBack} />);

    expect(screen.getByText("فوائد الذكر")).toBeVisible();
    const shareButtons = screen.getAllByRole("button", { name: /مشاركة فائدة/ });
    expect(shareButtons.length).toBeGreaterThan(0);
    fireEvent.click(shareButtons[0]!);
    expect(screen.getByTestId("share-benefits-collection-button")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "رجوع" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("encodes WhatsApp messages without changing their content", () => {
    const message = "Benefit & source / فائدة";
    expect(decodeURIComponent(buildWhatsAppBenefitUrl(message))).toBe(`https://wa.me/?text=${message}`);
  });
});
