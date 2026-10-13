import { useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChoiceRadioItem } from "./ChoiceRadioItem";

function Choices({ dir }: { dir: "rtl" | "ltr" }) {
  const [value, setValue] = useState("first");
  return (
    <RadioGroup.Root dir={dir} value={value} onValueChange={setValue} aria-label="Reading choice">
      <ChoiceRadioItem value="first">First</ChoiceRadioItem>
      <ChoiceRadioItem value="second">Second</ChoiceRadioItem>
      <ChoiceRadioItem value="unavailable" disabled>
        Unavailable
      </ChoiceRadioItem>
    </RadioGroup.Root>
  );
}

describe("shared radio choice", () => {
  it.each(["rtl", "ltr"] as const)(
    "retains single selection and direction-aware keyboard behavior in %s",
    async (dir) => {
      const user = userEvent.setup();
      render(<Choices dir={dir} />);
      await user.tab();
      expect(screen.getByRole("radio", { name: "First" })).toHaveFocus();
      await user.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
      await waitFor(() => expect(screen.getByRole("radio", { name: "Second" })).toBeChecked());
      expect(screen.getByRole("radio", { name: "First" })).not.toBeChecked();
      expect(screen.getByRole("radio", { name: "Second" })).toHaveFocus();
      await user.keyboard(dir === "rtl" ? "{ArrowLeft}" : "{ArrowRight}");
      await waitFor(() => expect(screen.getByRole("radio", { name: "First" })).toBeChecked());
      expect(screen.getByRole("radio", { name: "Unavailable" })).toBeDisabled();
    },
  );
});
