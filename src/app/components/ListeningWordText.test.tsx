import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ListeningWordText } from "./ListeningWordText";

it("preserves Arabic diacritics, punctuation, spacing and inherited font without live announcements or focus targets", () => {
  const text = "بِسْمِ  اللَّهِ، 🤲";
  const { container, rerender } = render(
    <p dir="rtl" lang="ar" style={{ fontFamily: "var(--font-mushaf)" }}>
      <ListeningWordText text={text} cue={{ startOffset: 0, endOffset: 6, startMs: 0, endMs: 100, occurrence: 0 }} />
    </p>,
  );
  expect(container.textContent).toBe(text);
  expect(screen.getByText("بِسْمِ")).toHaveAttribute("aria-current", "true");
  expect(container.querySelector("[aria-live], [tabindex], button")).toBeNull();
  expect(container.querySelector("[data-listening-word]")).toHaveStyle({ textDecoration: "underline" });
  const originalWord = screen.getByText("بِسْمِ");
  rerender(
    <p dir="rtl" lang="ar" style={{ fontFamily: "var(--font-mushaf)" }}>
      <ListeningWordText text={text} cue={null} />
    </p>,
  );
  expect(container.textContent).toBe(text);
  expect(container.querySelector("[aria-current]")).toBeNull();
  expect(screen.getByText("بِسْمِ")).toBe(originalWord);
});
