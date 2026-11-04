import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { MushafThemeNotice } from "./MushafThemeNotice";

it.each(["light", "dark", "midnight", "oled"] as const)(
  "announces the applied %s paper without exposing a new action",
  (theme) => {
    render(<MushafThemeNotice theme={theme} language="en" />);
    const notice = screen.getByRole("status");
    expect(notice).toHaveAttribute("data-notice-theme", theme);
    expect(notice).toHaveClass(`theme-${theme}`);
    expect(notice).toHaveAttribute("aria-atomic", "true");
    expect(notice).toHaveTextContent(/Warm ivory|Quiet charcoal|Midnight navy|OLED/);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  },
);
