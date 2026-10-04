import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthenticZikrPicker } from "./AuthenticZikrPicker";
import { AUTHENTIC_AZKAR_COLLECTION } from "../content/authenticAzkar";

describe("AuthenticZikrPicker", () => {
  const defaultItems = AUTHENTIC_AZKAR_COLLECTION;

  it("renders trigger button with short name and accessible legend in Arabic", () => {
    const onSelect = vi.fn();
    render(
      <AuthenticZikrPicker
        items={defaultItems}
        selected={defaultItems[0]!}
        language="ar"
        direction="rtl"
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByRole("button", { name: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("title", defaultItems[0]!.textAr);
    expect(screen.getByText("اختر الذكر")).toHaveClass("sr-only");
  });

  it("opens drop-down menu with menuitemradio items and concise names", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <AuthenticZikrPicker
        items={defaultItems}
        selected={defaultItems[3]!} // Hawqalah
        language="ar"
        direction="rtl"
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByRole("button", { name: "الحوقلة" });
    await user.click(trigger);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    const hawqalahItem = screen.getByRole("menuitemradio", { name: "الحوقلة" });
    expect(hawqalahItem).toHaveAttribute("aria-checked", "true");

    const istighfarItem = screen.getByRole("menuitemradio", { name: "سيد الاستغفار" });
    expect(istighfarItem).toHaveAttribute("aria-checked", "false");
    expect(istighfarItem).toHaveAttribute("title", defaultItems[8]!.textAr);

    // Click to select Sayyid al-Istighfar
    await user.click(istighfarItem);
    expect(onSelect).toHaveBeenCalledWith(defaultItems[8]!);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("renders saved progress indicators within menu items without breaking width", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const savedItems = {
      [defaultItems[0]!.id]: { count: 33, target: 100 },
    };

    render(
      <AuthenticZikrPicker
        items={defaultItems}
        selected={defaultItems[3]!}
        language="ar"
        direction="rtl"
        savedItems={savedItems}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "الحوقلة" }));
    expect(screen.getByText("٣٣ / ١٠٠")).toBeInTheDocument();
  });

  it("renders and selects items properly in English LTR", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <AuthenticZikrPicker
        items={defaultItems}
        selected={defaultItems[0]!}
        language="en"
        direction="ltr"
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Subhanallahi wa bihamdihi" });
    await user.click(trigger);

    expect(screen.getByRole("menuitemradio", { name: "Hawqalah" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Sayyid al-Istighfar" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Al-Baqiyat As-Salihat" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Salawat on the Prophet ﷺ" })).toBeInTheDocument();

    await user.click(screen.getByRole("menuitemradio", { name: "Sayyid al-Istighfar" }));
    expect(onSelect).toHaveBeenCalledWith(defaultItems[8]!);
  });

  it("supports keyboard navigation and closes on Escape", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <AuthenticZikrPicker
        items={defaultItems}
        selected={defaultItems[0]!}
        language="en"
        direction="ltr"
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Subhanallahi wa bihamdihi" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
