import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchScreen } from "./SearchScreen";

describe("SearchScreen", () => {
  it("preserves an initial query and exposes a visible associated label", () => {
    render(
      <SearchScreen
        language="en"
        direction="ltr"
        initialQuery=" query "
        onBack={() => undefined}
        onZikr={() => undefined}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Search adhkar and duas" }) as HTMLInputElement;
    expect(input).toHaveValue("query");
    expect(input).toHaveAttribute("dir", "auto");
    expect(input.labels?.[0]).toBeVisible();
    expect(input.labels?.[0]).toHaveTextContent("Search adhkar and duas");
  });

  it("starts an empty Arabic query in RTL and follows the entered language", () => {
    render(<SearchScreen language="ar" direction="rtl" onBack={() => undefined} onZikr={() => undefined} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("dir", "rtl");
    expect(input).toHaveAttribute("lang", "ar");

    fireEvent.change(input, { target: { value: " " } });
    expect(input).toHaveAttribute("dir", "rtl");

    fireEvent.change(input, { target: { value: "English" } });
    expect(input).toHaveAttribute("dir", "auto");
  });
});
