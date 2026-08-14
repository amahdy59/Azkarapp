import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DERIVED_ZIKR_BENEFITS } from "../content/zikrBenefits";
import { BenefitsScreen, buildWhatsAppBenefitUrl } from "./BenefitsScreen";

describe("BenefitsScreen", () => {
  it("presents Qur'an and hadith as two side-by-side evidence filters", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Qur’an (7)", "Hadith (51)"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Qur’anic foundations" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(7);
  });

  it("shows authenticated hadith entries in a keyboard-scrollable batch", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    expect(screen.getByTestId("benefits-scroll-region")).toHaveAttribute("tabindex", "0");
    fireEvent.click(screen.getByRole("tab", { name: "Hadith (51)" }));
    expect(screen.getAllByRole("article")).toHaveLength(15);
    expect(screen.getAllByText("Authentic hadith").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    expect(screen.getAllByRole("article")).toHaveLength(21);
  });

  it("nests all 30 concise benefits with their supporting hadith", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    fireEvent.click(screen.getByRole("tab", { name: "Hadith (51)" }));
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    for (const item of DERIVED_ZIKR_BENEFITS) {
      expect(screen.getAllByText(item.benefit.en).length).toBeGreaterThan(0);
    }
  });

  it("supports Arabic direction, source sharing, and Back", () => {
    const onBack = vi.fn();
    render(<BenefitsScreen language="ar" direction="rtl" onBack={onBack} />);

    expect(screen.getByText("فوائد الذكر")).toBeVisible();
    const share = screen.getAllByRole("link", { name: /مشاركة فائدة .* عبر واتساب/ })[0]!;
    expect(decodeURIComponent(share.getAttribute("href")!)).toContain("القرآن الكريم 13:28");
    fireEvent.click(screen.getByRole("button", { name: "رجوع" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("encodes WhatsApp messages without changing their content", () => {
    const message = "Benefit & source / فائدة";
    expect(decodeURIComponent(buildWhatsAppBenefitUrl(message))).toBe(`https://wa.me/?text=${message}`);
  });
});
