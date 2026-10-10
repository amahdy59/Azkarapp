import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { QuranVerseText } from "./QuranVerseText";

it("preserves reviewed wording and original markers in accessible text", () => {
  const text = "قُلْ هُوَ ﴿١﴾ اللَّهُ ﴿٢﴾";
  const { container } = render(<QuranVerseText text={text} language="ar" />);
  expect(container.querySelectorAll("svg")).toHaveLength(2);
  expect(container.querySelectorAll(".sr-only")[0]).toHaveTextContent("﴿١﴾");
  expect(container).toHaveTextContent("قُلْ هُوَ");
  expect(container).toHaveTextContent("اللَّهُ");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
it("does not treat enclosing Quran quotation brackets as an ayah number", () => {
  const text = "﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾";
  const { container } = render(<QuranVerseText text={text} language="en" />);
  expect(container.textContent).toBe(text);
  expect(container.querySelector("svg")).toBeNull();
});
