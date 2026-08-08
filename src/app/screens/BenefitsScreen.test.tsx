import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BenefitsScreen, buildWhatsAppBenefitUrl } from "./BenefitsScreen";

describe("BenefitsScreen", () => {
  it("orders the evidence as Qur'an, hadith, then 30 derived benefits", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Qur’an (7)", "Hadith (21)", "30 hadith benefits"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Qur’anic foundations" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(7);
  });

  it("shows only authenticated hadith entries in a keyboard-scrollable batch", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    expect(screen.getByTestId("benefits-scroll-region")).toHaveAttribute("tabindex", "0");
    fireEvent.click(screen.getByRole("tab", { name: "Hadith (21)" }));
    expect(screen.getAllByRole("article")).toHaveLength(15);
    expect(screen.getAllByText("Authentic hadith").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    expect(screen.getAllByRole("article")).toHaveLength(21);
  });

  it("groups exactly 30 concise benefits and ties each one to hadith evidence", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    fireEvent.click(screen.getByRole("tab", { name: "30 hadith benefits" }));
    expect(screen.getByRole("heading", { name: "Forgiveness" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Weight and reward" })).toBeVisible();
    expect(screen.getAllByRole("article")).toHaveLength(15);
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    expect(screen.getAllByRole("article")).toHaveLength(30);
    expect(screen.getByRole("heading", { name: "Protection" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Promises connected to Paradise" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Heart and remembrance gatherings" })).toBeVisible();
    expect(screen.getAllByText("Hadith evidence:")).toHaveLength(30);
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
