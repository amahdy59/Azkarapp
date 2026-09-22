import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VisitorCount } from "./VisitorCount";

describe("VisitorCount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("shows the server aggregate after a successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ total: 123 }), { status: 200 })),
    );
    render(<VisitorCount language="en" />);
    expect(screen.queryByText("Visitors: 123")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Visitors: 123")).toBeInTheDocument());
  });

  it("fails quietly when the analytics endpoint is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    render(<VisitorCount language="ar" />);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });
});
