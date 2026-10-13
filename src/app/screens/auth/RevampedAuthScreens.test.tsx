import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { t } from "../../i18n";
import { EmailInputScreen, LoginScreen } from "./RevampedAuthScreens";

describe("shared authentication actions", () => {
  it("preserves guest entry when account providers are unavailable", () => {
    const onGuest = vi.fn();
    render(
      <LoginScreen
        language="en"
        providerFlags={{ google: false, email: false, apple: false }}
        onGuest={onGuest}
        onGoogle={vi.fn()}
        onEmail={vi.fn()}
        onApple={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("continue-as-guest"));
    expect(onGuest).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: /Google/ })).not.toBeInTheDocument();
  });

  it("retains email validation and prevents a repeated send while pending", () => {
    const props = {
      language: "en" as const,
      initialEmail: "",
      errorMessage: "",
      isSending: false,
      onSend: vi.fn(),
      onBack: vi.fn(),
      onSkip: vi.fn(),
    };
    const { rerender } = render(<EmailInputScreen {...props} />);
    const send = screen.getByRole("button", { name: t("en", "auth.sendVerificationCode") });
    expect(send).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "reader@example.com" } });
    fireEvent.click(send);
    expect(props.onSend).toHaveBeenCalledWith("reader@example.com");
    rerender(<EmailInputScreen {...props} isSending />);
    const pending = screen.getByRole("button", { name: t("en", "common.sending") });
    expect(pending).toBeDisabled();
    fireEvent.click(pending);
    expect(props.onSend).toHaveBeenCalledOnce();
  });
});
