import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getLocalizedZikrBenefit } from "../content/localizedZikr";
import { ALL_AZKAR } from "../content/azkar";
import { BenefitsScreen, buildWhatsAppBenefitUrl } from "./BenefitsScreen";

describe("BenefitsScreen", () => {
  it("renders reviewed repository benefits and an encoded WhatsApp action", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    const expectedBenefit = getLocalizedZikrBenefit(
      ALL_AZKAR.find((zikr) => !zikr.isCollectionIntroduction)!,
      "en",
    );
    expect(screen.getAllByText(expectedBenefit).length).toBeGreaterThan(0);
    const share = screen.getAllByRole("link", { name: /Share .* on WhatsApp/ })[0]!;
    expect(share).toHaveAttribute("href", expect.stringMatching(/^https:\/\/wa\.me\/\?text=/));
    expect(decodeURIComponent(share.getAttribute("href")!)).toContain(expectedBenefit);
  });

  it("supports Arabic direction and Back", () => {
    const onBack = vi.fn();
    render(<BenefitsScreen language="ar" direction="rtl" onBack={onBack} />);

    expect(screen.getByText("فوائد الذكر")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "رجوع" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("renders long collections in keyboard-scrollable batches", () => {
    render(<BenefitsScreen language="en" direction="ltr" onBack={() => undefined} />);

    expect(screen.getByTestId("benefits-scroll-region")).toHaveAttribute("tabindex", "0");
    expect(screen.getByTestId("benefits-list").children).toHaveLength(20);
    fireEvent.click(screen.getByTestId("benefits-load-more"));
    expect(screen.getByTestId("benefits-list").children).toHaveLength(40);
  });

  it("encodes WhatsApp messages without changing their content", () => {
    const message = "Benefit & source / فائدة";
    expect(decodeURIComponent(buildWhatsAppBenefitUrl(message))).toBe(`https://wa.me/?text=${message}`);
  });
});
