import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TranquilityCompletionCard } from "./TranquilityCompletionCard";

describe("TranquilityCompletionCard", () => {
  it("renders a centered, button-free completion message", () => {
    render(<TranquilityCompletionCard categoryId="morning" language="ar" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
