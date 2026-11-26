import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { COUNTER_SOUND_STORAGE_KEY } from "../hooks/useCounterClickFeedback";
import { AUTHENTIC_AZKAR_COLLECTION } from "../content/authenticAzkar";
import { CustomCounterScreen } from "./CustomCounterScreen";

async function options(user: ReturnType<typeof userEvent.setup>, more = false) {
  await user.click(screen.getByTestId("masbaha-settings-trigger"));
  if (more) await user.click(screen.getByText(/^(More options|المزيد من الخيارات)$/u, { selector: "summary" }));
}
async function choose(user: ReturnType<typeof userEvent.setup>, id: string) {
  await user.click(screen.getByTestId("counter-zikr-filter"));
  await user.click(screen.getByTestId(`zikr-option-${id}`));
  await user.click(screen.getByRole("button", { name: /^(Continue|متابعة)$/u, exact: true }));
}
function swipe(canvas: HTMLElement) {
  fireEvent.touchStart(canvas, { touches: [{ clientX: 200, clientY: 100 }] });
  fireEvent.touchMove(canvas, { touches: [{ clientX: 100, clientY: 100 }] });
  fireEvent.touchEnd(canvas, { changedTouches: [{ clientX: 100, clientY: 100 }] });
}
describe("CustomCounterScreen", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it("shows one reviewed dhikr and one tally without instructional or duplicate goal copy", () => {
    render(<CustomCounterScreen isArabic direction="rtl" onBack={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "المسبحة" })).toBeInTheDocument();
    expect(screen.getAllByText(AUTHENTIC_AZKAR_COLLECTION[0]!.textAr)).toHaveLength(1);
    expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("٠ / ١٠٠"));
    expect(screen.queryByText(/اضغط|بقي|الهدف:/u)).not.toBeInTheDocument();
    expect(screen.queryByTestId("custom-counter-next-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("custom-counter-prev-btn")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("masbaha-support-actions")).getAllByRole("button")).toHaveLength(3);
  });
  it("keeps the existing saved tally on initial render", () => {
    render(
      <CustomCounterScreen
        isArabic={false}
        direction="ltr"
        onBack={vi.fn()}
        initialMasbahaState={{ count: 12, target: 100, laps: 0 }}
      />,
    );
    expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("12 / 100"));
    expect(screen.queryByRole("button", { name: "Read guided after-prayer azkar" })).not.toBeInTheDocument();
  });
  it("increments, undoes precisely one count, saves the corrected tally and disables Undo at zero", async () => {
    const user = userEvent.setup(),
      save = vi.fn();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} onSaveMasbahaState={save} />);
    const counter = screen.getByTestId("custom-counter-surface"),
      undo = screen.getByRole("button", { name: "Undo one count" });
    expect(undo).toBeDisabled();
    fireEvent.click(counter);
    fireEvent.click(counter);
    await user.click(undo);
    expect(counter).toHaveAccessibleName(expect.stringContaining("1 / 100"));
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ count: 1, target: 100 }));
    await user.click(undo);
    expect(undo).toBeDisabled();
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ count: 0, items: undefined }));
  });
  it("counts from non-interactive canvas space and never from option controls", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("custom-counter-content"));
    const counter = screen.getByTestId("custom-counter-surface");
    expect(counter).toHaveAccessibleName(expect.stringContaining("1 / 100"));
    await options(user);
    expect(counter).toHaveAttribute("aria-label", expect.stringContaining("1 / 100"));
    await user.click(screen.getByRole("radio", { name: "33", exact: true }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(counter).toHaveAccessibleName(expect.stringContaining("1 / 100"));
  });
  it("does not count the synthetic click after swiping to another zikr", () => {
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    const canvas = screen.getByTestId("custom-counter-content");
    swipe(canvas);
    fireEvent.click(canvas);
    expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("0 / 100"));
  });
  it.each(["scroll", "two-finger"])(
    "does not count a synthesized click after a %s gesture and permits the next tap",
    (gesture) => {
      render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
      const canvas = screen.getByTestId("reader-card");
      const first = { clientX: 100, clientY: 100 };
      fireEvent.touchStart(canvas, {
        touches: gesture === "scroll" ? [first] : [first, { clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(canvas, {
        touches: gesture === "scroll" ? [{ clientX: 100, clientY: 160 }] : [first, { clientX: 240, clientY: 100 }],
      });
      fireEvent.touchEnd(canvas, { touches: [], changedTouches: [{ clientX: 100, clientY: 160 }] });
      fireEvent.click(canvas);
      expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("0 / 100"));
      fireEvent.touchStart(canvas, { touches: [first] });
      fireEvent.touchEnd(canvas, { touches: [], changedTouches: [first] });
      fireEvent.click(canvas);
      expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("1 / 100"));
    },
  );
  it("stages a searchable dhikr choice and closes without changing the selected reading", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    await user.click(screen.getByTestId("counter-zikr-filter"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByTestId("zikr-option-auth_la_hawla_wala_quwwata"));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByText(AUTHENTIC_AZKAR_COLLECTION[0]!.textAr)).toBeVisible();
  });
  it("offers every reviewed Arabic dhikr including complete long text", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic direction="rtl" onBack={vi.fn()} />);
    await user.click(screen.getByTestId("counter-zikr-filter"));
    expect(screen.getAllByRole("radio")).toHaveLength(AUTHENTIC_AZKAR_COLLECTION.length);
    for (const item of AUTHENTIC_AZKAR_COLLECTION)
      expect(screen.getByTestId(`zikr-option-${item.id}`)).toHaveTextContent(item.textAr);
    await user.click(screen.getByTestId("zikr-option-auth_sayyid_al_istighfar"));
    await user.click(screen.getByRole("button", { name: "متابعة" }));
    expect(
      screen.getByText(AUTHENTIC_AZKAR_COLLECTION.find((item) => item.id === "auth_sayyid_al_istighfar")!.textAr),
    ).toBeVisible();
  });
  it("changes a finite target without resetting the current count", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("custom-counter-surface"));
    await options(user);
    expect(screen.queryByRole("radio", { name: "Open", exact: true })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "33", exact: true }));
    await user.click(screen.getByRole("button", { name: "Save", exact: true }));
    expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("1 / 33"));
  });
  it("saves counts across dhikr changes and resumes the original count without destructive prompts", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    const counter = screen.getByTestId("custom-counter-surface");
    fireEvent.click(counter);
    fireEvent.click(counter);
    fireEvent.click(counter);
    await choose(user, "auth_la_hawla_wala_quwwata");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(counter).toHaveAccessibleName(expect.stringContaining("0 / 100"));
    fireEvent.click(counter);
    fireEvent.click(counter);
    await user.click(screen.getByTestId("counter-zikr-filter"));
    expect(screen.getByText("3 / 100")).toBeVisible();
    await user.click(screen.getByTestId("zikr-option-auth_subhanallah_wabihamdihi"));
    await user.click(screen.getByRole("button", { name: "Continue", exact: true }));
    expect(counter).toHaveAccessibleName(expect.stringContaining("3 / 100"));
    await choose(user, "auth_la_hawla_wala_quwwata");
    expect(counter).toHaveAccessibleName(expect.stringContaining("2 / 100"));
  });
  it("retains save/reset protection on legacy swipes with active progress", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("custom-counter-surface"));
    swipe(screen.getByTestId("custom-counter-content"));
    expect(screen.getByRole("dialog", { name: "Change the selected dhikr?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save & switch" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("keeps reset protected and removes the reset counter's record after confirmation", async () => {
    const user = userEvent.setup(),
      save = vi.fn();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} onSaveMasbahaState={save} />);
    fireEvent.click(screen.getByTestId("custom-counter-surface"));
    await options(user, true);
    await user.click(screen.getByRole("button", { name: "Reset Counter", exact: true }));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Cancel", exact: true }));
    expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("1 / 100"));
    await options(user, true);
    await user.click(screen.getByRole("button", { name: "Reset Counter", exact: true }));
    await user.click(screen.getByRole("button", { name: "Reset Counter to 0", exact: true }));
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ count: 0, items: undefined }));
  });
  it("does not restore a previous devotional day's tally", () => {
    render(
      <CustomCounterScreen
        isArabic={false}
        direction="ltr"
        onBack={vi.fn()}
        initialMasbahaState={{ count: 40, target: 100, laps: 2, dayKey: "2000-01-01" }}
      />,
    );
    expect(screen.getByTestId("custom-counter-surface")).toHaveAccessibleName(expect.stringContaining("0 / 100"));
  });
  it("keeps completed counters focusable and acknowledges completion inline", () => {
    render(
      <CustomCounterScreen
        isArabic={false}
        direction="ltr"
        onBack={vi.fn()}
        initialMasbahaState={{ count: 1, target: 1, laps: 0, selectedZikrId: "auth_sayyid_al_istighfar" }}
      />,
    );
    const counter = screen.getByTestId("custom-counter-surface");
    expect(counter).not.toBeDisabled();
    fireEvent.click(counter);
    expect(screen.getByTestId("masbaha-completion")).toHaveTextContent("Target reached");
  });
  it("plays the Web Audio click when an enabled counter is tapped", () => {
    const oscillator = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const gain = {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const context = {
      state: "running",
      currentTime: 1,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => oscillator),
      createGain: vi.fn(() => gain),
    };
    vi.stubGlobal(
      "AudioContext",
      vi.fn(function AudioContextMock() {
        return context;
      }),
    );

    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId("custom-counter-surface"));

    expect(oscillator.start).toHaveBeenCalledWith(1);
    // The bead cue layers two wooden partials with different decays.
    expect(oscillator.stop).toHaveBeenCalledWith(1.07);
    expect(oscillator.stop).toHaveBeenCalledWith(1.045);
  });

  it("opens the unchanged reviewed reference through Options, retaining full hadith and source", async () => {
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic direction="rtl" onBack={vi.fn()} />);
    const text = screen.getByText(AUTHENTIC_AZKAR_COLLECTION[0]!.textAr);
    expect(text).toHaveClass("zikr-text", "font-medium");
    expect(text).toHaveStyle({ fontFamily: "var(--font-zikr)" });
    await options(user, true);
    await user.click(screen.getByTestId("custom-counter-benefit-dock-button"));
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByTestId("masbaha-virtue-text")).toHaveTextContent(AUTHENTIC_AZKAR_COLLECTION[0]!.virtueAr);
    expect(screen.getByTestId("masbaha-hadith-text")).toHaveTextContent(AUTHENTIC_AZKAR_COLLECTION[0]!.hadithTextAr);
    expect(screen.getByRole("heading", { name: "الفائدة" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "نص الحديث" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /صحيح البخاري/u })).toHaveAttribute(
      "href",
      "https://sunnah.com/bukhari:6405",
    );
    expect(screen.getByRole("link", { name: /صحيح البخاري/u })).toHaveAttribute("target", "_blank");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.getByTestId("masbaha-settings-trigger")).toHaveFocus());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("completes inline, allows undo, then finishes with the existing return action", async () => {
    const user = userEvent.setup(),
      back = vi.fn();
    render(
      <CustomCounterScreen
        isArabic={false}
        direction="ltr"
        onBack={back}
        initialMasbahaState={{ count: 32, target: 33, laps: 0 }}
      />,
    );
    const counter = screen.getByTestId("custom-counter-surface");
    fireEvent.click(counter);
    expect(screen.getByTestId("masbaha-completion")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Undo one count" }));
    expect(counter).toHaveAccessibleName(expect.stringContaining("32 / 33"));
    expect(screen.queryByTestId("masbaha-completion")).not.toBeInTheDocument();
    fireEvent.click(counter);
    await user.click(screen.getByTestId("custom-counter-return-btn"));
    expect(back).toHaveBeenCalledOnce();
  });
  it("starts a new round explicitly while preserving the target and round total", async () => {
    const user = userEvent.setup(),
      save = vi.fn();
    render(
      <CustomCounterScreen
        isArabic={false}
        direction="ltr"
        onBack={vi.fn()}
        onSaveMasbahaState={save}
        initialMasbahaState={{ count: 32, target: 33, laps: 1 }}
      />,
    );
    fireEvent.click(screen.getByTestId("custom-counter-surface"));
    await user.click(screen.getByRole("button", { name: "New round" }));
    expect(save).toHaveBeenLastCalledWith(expect.objectContaining({ count: 0, target: 33, laps: 2 }));
  });
  it("opens real sharing through Options without leaving two panels open", async () => {
    await import("../components/CollectionShareModal");
    const user = userEvent.setup();
    render(<CustomCounterScreen isArabic direction="rtl" onBack={vi.fn()} />);
    await options(user, true);
    await user.click(screen.getByTestId("counter-share-button"));
    await waitFor(() => expect(screen.getAllByRole("dialog")).toHaveLength(1));
    expect(screen.queryByTestId("masbaha-settings-sheet")).not.toBeInTheDocument();
    expect(await screen.findByTestId("collection-share-modal")).toBeInTheDocument();
  });
  it("stages typography and sound until Save and remembers the sound choice", async () => {
    const user = userEvent.setup(),
      resize = vi.fn();
    render(<CustomCounterScreen isArabic={false} direction="ltr" onBack={vi.fn()} onTextSizeChange={resize} />);
    await options(user, true);
    await user.click(screen.getByRole("radio", { name: "Large" }));
    await user.click(screen.getByRole("switch", { name: "Counter sound" }));
    expect(resize).not.toHaveBeenCalled();
    expect(localStorage.getItem(COUNTER_SOUND_STORAGE_KEY)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Save", exact: true }));
    expect(resize).toHaveBeenCalledWith("large");
    expect(localStorage.getItem(COUNTER_SOUND_STORAGE_KEY)).toBe("false");
  });
});
