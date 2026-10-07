import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CounterGuidance } from "./CounterGuidance";
import { t } from "../i18n";

describe("combined counting guidance", () => {
  beforeEach(() => window.localStorage.clear());

  it.each(["ar", "en"] as const)(
    "keeps keyboard help complete and restores the icon trigger in %s",
    async (language) => {
      render(<CounterGuidance language={language} direction={language === "ar" ? "rtl" : "ltr"} reader />);
      const trigger = screen.getByRole("button", { name: t(language, "reader.keyboardShortcuts") });
      expect(screen.getByText(t(language, "reader.tapAnywhereDesktop"))).toBeInTheDocument();
      trigger.focus();
      fireEvent.click(trigger);
      const dialog = screen.getByRole("dialog");
      for (const key of ["Space", "→", "←", "R", "Esc", "?"]) expect(dialog).toHaveTextContent(key);
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    },
  );
  it("does not advertise Reader navigation for a standalone counter", () => {
    render(<CounterGuidance language="en" direction="ltr" />);
    fireEvent.click(screen.getByRole("button", { name: "Keyboard shortcuts" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Space");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Navigate");
  });

  it("collapses after the first count and can be reopened with the hand button", async () => {
    const view = render(<CounterGuidance language="en" direction="ltr" hasStarted={false} />);
    expect(screen.getByTestId("counter-tap-hint")).toBeInTheDocument();

    view.rerender(<CounterGuidance language="en" direction="ltr" hasStarted />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Show counting guidance" })).toBeInTheDocument());
    expect(window.localStorage.getItem("azkarapp.counter-guidance.v1")).toBe("true");
    expect(screen.getByTestId("counter-tap-hint")).toHaveAttribute("data-expanded", "false");
    expect(screen.getByTestId("counter-tap-hint").parentElement).toHaveStyle({ width: "max-content" });

    fireEvent.click(screen.getByTestId("counter-guidance-reopen"));
    expect(screen.getByRole("button", { name: "Hide counting guidance" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(t("en", "reader.tapAnywhereDesktop"))).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hide counting guidance" }));
    expect(screen.getByRole("button", { name: "Show counting guidance" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Keyboard shortcuts" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps guidance collapsed on return and allows a restored count to reopen it", () => {
    window.localStorage.setItem("azkarapp.counter-guidance.v1", "true");
    render(<CounterGuidance language="en" direction="ltr" hasStarted />);
    const hand = screen.getByRole("button", { name: "Show counting guidance" });
    fireEvent.click(hand);
    expect(hand).toHaveAttribute("aria-expanded", "true");
  });
});
