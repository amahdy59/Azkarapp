import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MushafDownloadSelection } from "./MushafDownloadSelection";

it("submits only a valid page range and leaves cancellation reachable during a transfer", () => {
  const download = vi.fn(),
    cancel = vi.fn();
  const view = render(
    <MushafDownloadSelection language="en" disabled={false} active={false} onDownload={download} onCancel={cancel} />,
  );
  fireEvent.click(screen.getByText("Download selected pages", { selector: "summary" }));
  fireEvent.click(screen.getByRole("combobox", { name: "Juz" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Juz" }), { target: { value: "Juz 2" } });
  fireEvent.click(within(screen.getByRole("listbox")).getByRole("option", { name: "Juz 2", exact: true }));
  expect(screen.getByLabelText("First page")).toHaveValue(22);
  expect(screen.getByLabelText("Last page")).toHaveValue(41);
  fireEvent.change(screen.getByLabelText("First page"), { target: { value: "42" } });
  fireEvent.change(screen.getByLabelText("Last page"), { target: { value: "43" } });
  fireEvent.submit(view.container.querySelector("form")!);
  expect(download).toHaveBeenCalledWith(42, 43);
  fireEvent.change(screen.getByLabelText("Last page"), { target: { value: "2" } });
  fireEvent.submit(view.container.querySelector("form")!);
  expect(download).toHaveBeenCalledOnce();
  view.rerender(<MushafDownloadSelection language="en" disabled active onDownload={download} onCancel={cancel} />);
  fireEvent.click(screen.getByRole("button", { name: "Cancel download" }));
  expect(cancel).toHaveBeenCalledOnce();
});
