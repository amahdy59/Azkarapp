import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LearningReaderScreen } from "./LearningReaderScreen";
import { LearnScreen } from "./LearnScreen";
import { LearningDownloadsPanel } from "./settings/LearningDownloadsPanel";
import { allLearningEditions, learningCatalogue, resolveLearningResource } from "../learning/catalogue";
import * as library from "../hooks/useLearningLibrary";

vi.mock("../learning/catalogue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../learning/catalogue")>();
  return {
    ...actual,
    allLearningEditions: vi.fn(actual.allLearningEditions),
    learningCatalogue: vi.fn(actual.learningCatalogue),
    resolveLearningResource: vi.fn(actual.resolveLearningResource),
  };
});
vi.mock("../hooks/useLearningLibrary", () => ({
  useLearningState: vi.fn(() => ({})),
  useLearningOffline: vi.fn(() => ({ statuses: {}, job: null, refresh: vi.fn() })),
  useLearningPdf: vi.fn(),
  useLearningPosition: vi.fn(),
}));

beforeEach(() => {
  vi.stubEnv("DEV", false);
  vi.stubGlobal("__LEARNING_REVIEW__", false);
  vi.clearAllMocks();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it.each(["al-mukhtar", "al-wird-an-nabawi"] as const)(
  "recovers a withheld %s link without mounting reader/data hooks or changing saved records",
  (resourceId) => {
    vi.mocked(resolveLearningResource).mockReturnValueOnce(undefined);
    const stored = JSON.stringify({ [resourceId]: { position: { unitId: "p-32", offset: 0.4 }, bookmarks: ["p-32"] } });
    localStorage.setItem("azkar.learning.v1", stored);
    const onBack = vi.fn(),
      onUnitChange = vi.fn(),
      onLanguageChange = vi.fn();
    render(
      <LearningReaderScreen
        language="en"
        direction="ltr"
        resourceId={resourceId}
        contentLanguage="ar"
        unitId="p-32"
        textSize="medium"
        onTextSizeChange={vi.fn()}
        onUnitChange={onUnitChange}
        onLanguageChange={onLanguageChange}
        onBack={onBack}
      />,
    );
    expect(screen.getByRole("heading", { name: "Book unavailable" })).toBeInTheDocument();
    expect(screen.queryByTestId("learning-content")).not.toBeInTheDocument();
    expect(library.useLearningOffline).not.toHaveBeenCalled();
    expect(library.useLearningPdf).not.toHaveBeenCalled();
    expect(library.useLearningPosition).not.toHaveBeenCalled();
    expect(onUnitChange).not.toHaveBeenCalled();
    expect(onLanguageChange).not.toHaveBeenCalled();
    expect(localStorage.getItem("azkar.learning.v1")).toBe(stored);
    fireEvent.click(screen.getByRole("button", { name: "Back to Learn" }));
    expect(onBack).toHaveBeenCalledOnce();
  },
);

it("shows useful empty catalogue and download recovery without save/open actions", () => {
  vi.mocked(learningCatalogue).mockReturnValueOnce([]);
  vi.mocked(allLearningEditions).mockReturnValueOnce([]);
  const open = vi.fn();
  const view = render(<LearnScreen language="en" direction="ltr" onBack={vi.fn()} onOpenResource={open} />);
  expect(screen.getByText("No books are available in this release yet.")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Read book" })).not.toBeInTheDocument();
  expect(open).not.toHaveBeenCalled();
  view.unmount();
  render(<LearningDownloadsPanel language="en" />);
  expect(screen.getByText("No books are available in this release yet.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Check saved files" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "Save offline" })).not.toBeInTheDocument();
});
