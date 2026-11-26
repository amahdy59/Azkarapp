import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { LearningOfflineActions } from "./LearningOfflineActions";

it("does not announce offline readiness before the active verification job finishes", () => {
  const props = {
    language: "en" as const,
    resourceId: "dalil-al-mutamir:en" as const,
    status: { complete: true, available: true, savedFiles: 4, totalFiles: 4 },
    onSave: () => {},
    onCancel: () => {},
  };
  const job = { resourceId: "dalil-al-mutamir:en" as const, phase: "saving" as const, completed: 3, total: 4 };
  const view = render(<LearningOfflineActions {...props} job={job} />);
  expect(screen.queryByText("Available offline")).not.toBeInTheDocument();
  expect(screen.getByText("Saving book…")).toBeInTheDocument();
  view.rerender(<LearningOfflineActions {...props} job={{ ...job, phase: "ready", completed: 4 }} />);
  expect(screen.getByText("Available offline")).toBeInTheDocument();
});
