import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InformationCard } from "./InformationCard";

describe("InformationCard", () => {
  it("renders title and body without an action button by default", () => {
    render(
      <InformationCard icon={<span aria-hidden="true">*</span>} title="How reading works" body="Some explanation" />,
    );

    expect(screen.getByRole("heading", { name: "How reading works" })).toBeInTheDocument();
    expect(screen.getByText("Some explanation")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("uses an h3 when headingLevel is 3", () => {
    render(
      <InformationCard
        icon={<span aria-hidden="true">*</span>}
        title="Nested section"
        body="Body"
        headingLevel={3}
      />,
    );

    expect(screen.getByRole("heading", { level: 3, name: "Nested section" })).toBeInTheDocument();
  });

  it("renders an action button and fires onAction when both actionLabel and onAction are set", () => {
    const onAction = vi.fn();
    render(
      <InformationCard
        icon={<span aria-hidden="true">*</span>}
        title="Still need help?"
        body="Report an issue"
        actionLabel="Report issue"
        onAction={onAction}
      />,
    );

    const button = screen.getByRole("button", { name: "Report issue" });
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render an action button when only actionLabel is set without onAction", () => {
    render(
      <InformationCard
        icon={<span aria-hidden="true">*</span>}
        title="Title"
        body="Body"
        actionLabel="Report issue"
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
