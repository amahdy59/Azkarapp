import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ReaderFooterTools } from "./ReaderFooterTools";

it("renders tools and primary counter without a disclosure toggle", () => {
  render(
    <ReaderFooterTools primary={<button data-testid="counter">Count</button>}>
      <button data-testid="share">Share</button>
    </ReaderFooterTools>,
  );

  expect(screen.getByTestId("share")).toBeVisible();
  expect(screen.getByTestId("counter")).toBeVisible();
  expect(screen.queryByTestId("reader-tools-toggle")).not.toBeInTheDocument();
});
