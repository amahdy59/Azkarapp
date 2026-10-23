import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ShareFormatSelect, SHARE_FORMATS } from "./ShareFormatSelect";
import { t } from "../i18n";

it.each(["ar", "en"] as const)(
  "offers all four common sizes with two localized destination tags in %s",
  async (language) => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<ShareFormatSelect value="story" onChange={change} language={language} />);
    expect(screen.getByTestId("share-format-platforms").children).toHaveLength(2);
    await user.click(screen.getByRole("combobox", { name: t(language, "shareStudio.format") }));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    SHARE_FORMATS.forEach((format, index) => {
      expect(options[index]).toHaveAccessibleName(t(language, `shareStudio.${format}`));
      expect(within(options[index]!).getByTestId("share-format-platforms").children).toHaveLength(2);
    });
    await user.click(screen.getByRole("option", { name: t(language, "shareStudio.tall"), exact: true }));
    expect(change).toHaveBeenCalledWith("tall");
    expect(screen.getByRole("combobox")).toHaveFocus();
  },
);
