import { afterEach, expect, it, vi } from "vitest";
const { prefetch } = vi.hoisted(() => ({ prefetch: vi.fn() }));
vi.mock("./qcfMushaf", () => ({ prefetchMushafPage: prefetch }));
import { warmQuranPassages } from "./quranReadiness";

afterEach(() => {
  prefetch.mockClear();
  vi.unstubAllGlobals();
});

it("deduplicates intent warm-up and caps it at two pages", () => {
  warmQuranPassages([
    { canonicalKey: "quran-112" },
    { canonicalKey: "quran-113" },
    { canonicalKey: "quran-003-190-200" },
  ]);
  expect(prefetch.mock.calls).toEqual([[604], [75]]);
});

it("warms both required faces of a multipage quotation before more speculation", () => {
  warmQuranPassages([{ canonicalKey: "quran-003-190-200" }, { canonicalKey: "quran-112" }]);
  expect(prefetch.mock.calls).toEqual([[75], [76]]);
});

it("warms surah opening pages without changing unknown source identities", () => {
  warmQuranPassages([
    { canonicalKey: "unidentified" },
    {
      mushafPages: [
        { page: 293, startAyah: 1, endAyah: 4 },
        { page: 294, startAyah: 5, endAyah: 15 },
      ],
    },
  ]);
  expect(prefetch.mock.calls).toEqual([[293], [294]]);
});

for (const connection of [{ saveData: true }, { effectiveType: "2g" }])
  it(`does not speculate with ${JSON.stringify(connection)}`, () => {
    vi.stubGlobal("navigator", { connection });
    warmQuranPassages([{ canonicalKey: "quran-112" }]);
    expect(prefetch).not.toHaveBeenCalled();
  });

it("does not start hidden-screen speculation", () => {
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  try {
    warmQuranPassages([{ canonicalKey: "quran-112" }]);
    expect(prefetch).not.toHaveBeenCalled();
  } finally {
    hidden.mockRestore();
  }
});
