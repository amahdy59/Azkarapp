import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KhatmahReaderScreen } from "./KhatmahReaderScreen";

/** Two consecutive pages of the reference layout, with one reviewed difficult
 *  word (2:255 "ٱلۡقَيُّومُ") so the meanings switch has something to reveal. */
function pageFixture(page: number) {
  return [
    {
      k: "2:255",
      w: [
        [1, 1, 0, "ٱلۡقَيُّومُ"],
        [2, 1, 0, `صفحة${page}`],
        [3, 1, 1, "٢٥٥"],
      ],
    },
  ];
}

function renderReader(overrides: Partial<Parameters<typeof KhatmahReaderScreen>[0]> = {}) {
  const setKhatmahPage = vi.fn();
  render(
    <KhatmahReaderScreen
      language="ar"
      direction="rtl"
      onBack={vi.fn()}
      khatmahPage={42}
      setKhatmahPage={setKhatmahPage}
      {...overrides}
    />,
  );
  return { setKhatmahPage };
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const page = Number(String(input).match(/(\d+)\.json$/)?.[1] ?? 1);
      return { ok: true, json: async () => pageFixture(page) };
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KhatmahReaderScreen navigation", () => {
  it("advances with the forward control and retreats with the back one, in Arabic", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader();

    await screen.findByRole("article", { name: "صفحة ٤٢" });

    await user.click(screen.getByRole("button", { name: "التالي" }));
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);

    await user.click(screen.getByRole("button", { name: "السابق" }));
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);
  });

  it("maps the arrow keys the same way, so the key and the button agree", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader();
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    await user.keyboard("{ArrowRight}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(43);

    await user.keyboard("{ArrowLeft}");
    expect(setKhatmahPage).toHaveBeenLastCalledWith(41);
  });

  it("stops at both ends of the Mushaf", async () => {
    const user = userEvent.setup();
    const { setKhatmahPage } = renderReader({ khatmahPage: 1 });
    await screen.findByRole("article", { name: "صفحة ١" });

    expect(screen.getByRole("button", { name: "السابق" })).toBeDisabled();
    await user.keyboard("{ArrowLeft}");
    expect(setKhatmahPage).not.toHaveBeenCalled();
  });
});

describe("KhatmahReaderScreen difficult words", () => {
  it("exposes a switch that reveals the reviewed meanings", async () => {
    const user = userEvent.setup();
    renderReader();
    await screen.findByRole("article", { name: "صفحة ٤٢" });

    const toggle = screen.getByRole("switch", { name: "كلمات صعبة" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("button", { name: /معنى كلمة/ })).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    await waitFor(() => expect(screen.getByRole("button", { name: /معنى كلمة/ })).toBeInTheDocument());

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByRole("button", { name: /معنى كلمة/ })).not.toBeInTheDocument();
  });
});
