import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BenefitsScreen, buildWhatsAppBenefitUrl } from "./BenefitsScreen";

describe("BenefitsScreen", () => {
  it("presents Qur'an and hadith as two side-by-side evidence filters", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Qur’an (7)", "Hadith (21)"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.queryByText("Qur’an", { exact: true })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Surah Ar-Ra'd · 13:28" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(7);
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
    const share = screen.getAllByRole("link", { name: /مشاركة فائدة .* عبر واتساب/ })[0]!;
    expect(decodeURIComponent(share.getAttribute("href")!)).toContain("سورة الرعد · ١٣:٢٨");
    fireEvent.click(screen.getByRole("button", { name: "رجوع" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("encodes WhatsApp messages without changing their content", () => {
    const message = "Benefit & source / فائدة";
    expect(decodeURIComponent(buildWhatsAppBenefitUrl(message))).toBe(`https://wa.me/?text=${message}`);
  });
});
