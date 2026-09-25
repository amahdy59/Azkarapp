import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readFridaySalawatProgress } from "../fridayProgress";
import { FridaySalawatScreen } from "./FridaySalawatScreen";

describe("FridaySalawatScreen", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("counts across the devotional canvas, supports targets, and resets via the More Options menu", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 100 });
    await user.click(screen.getByTestId("counter-target-filter"));
    await user.click(screen.getByRole("menuitemradio", { name: "10" }));
    const counter = screen.getByTestId("salawat-counter");
    expect(counter).toHaveAttribute("data-counter-shape", "rectangle");
    for (let count = 0; count < 10; count += 1) fireEvent.click(counter);

    expect(counter).toHaveAccessibleName("Completed 10 / 10");
    expect(readFridaySalawatProgress()).toEqual({ count: 10, target: 10 });

    // Open More Options Menu
    await user.click(screen.getByRole("button", { name: "More options" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Reset counter" }));
    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 10 });
  });

  it("supports an arbitrary target without offering an open-ended Friday goal", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    await user.click(screen.getByTestId("counter-target-filter"));
    expect(screen.queryByRole("menuitemradio", { name: "Open" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Custom" }));
    const input = screen.getByRole("spinbutton", { name: /^Target:?$/ });
    fireEvent.change(input, { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: /Apply Target/i }));

    expect(readFridaySalawatProgress()).toEqual({ count: 0, target: 250 });
    expect(screen.getByTestId("salawat-counter")).toHaveAccessibleName(/0 \/ 250/);
  });

  it("opens both authentic hadith references from the header benefits action", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    await user.click(screen.getByRole("button", { name: "Authentic benefits" }));
    expect(screen.getByRole("link", { name: /Sahih Muslim 408/ })).toHaveAttribute(
      "href",
      "https://sunnah.com/muslim:408",
    );
    expect(screen.getByRole("link", { name: /Sunan Abi Dawud 1047/ })).toHaveAttribute(
      "href",
      "https://sunnah.com/abudawud:1047",
    );
  });

  it("counts from the devotional reader-card while protecting controls", async () => {
    const user = userEvent.setup();
    render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    const card = screen.getByTestId("reader-card");
    const counter = screen.getByTestId("salawat-counter");
    fireEvent.click(card);
    expect(counter).toHaveAccessibleName(/1 \/ 100/);

    // Clicking target picker does not increment
    await user.click(screen.getByTestId("counter-target-filter"));
    expect(counter).toHaveAccessibleName(/1 \/ 100/);
  });

  it("follows the reader look and feel with Lightbulb benefit button, Uthmanic typography, and bilingual support", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<FridaySalawatScreen language="en" direction="ltr" onBack={() => undefined} />);

    // Benefit pill label
    const benefitButton = screen.getByRole("button", { name: "Authentic benefits" });
    expect(benefitButton).toBeInTheDocument();
    expect(benefitButton).toHaveTextContent("Benefit");

    // Arabic text is primary and styled with Uthmanic font
    const zikrText = screen.getByText("اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ");
    expect(zikrText).toHaveClass("zikr-text", "font-medium");
    expect(zikrText).toHaveStyle({ fontFamily: "var(--font-zikr)" });

    // English transliteration is rendered below it
    expect(screen.getByText("Allahumma salli wa sallim ‘ala Nabiyyina Muhammad")).toBeInTheDocument();

    // Modal has Lightbulb icon
    await user.click(benefitButton);
    expect(screen.getByRole("dialog", { name: "Authentic benefits" })).toBeInTheDocument();

    unmount();

    // Arabic mode
    render(<FridaySalawatScreen language="ar" direction="rtl" onBack={() => undefined} />);
    const arBenefitBtn = screen.getByRole("button", { name: "فضائل ثابتة بأحاديث صحيحة" });
    expect(arBenefitBtn).toHaveTextContent("الفائدة");
    expect(screen.getByText("اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ")).toBeInTheDocument();
  });
});
