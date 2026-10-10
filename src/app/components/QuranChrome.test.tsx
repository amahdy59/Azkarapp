import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { ALL_AZKAR } from "../content/azkar";
import { BASMALAH_ARABIC, QuranPrelude } from "./QuranChrome";

it("does not add basmalah to an excerpt merely because it is Quranic text", () => {
  const ayah = ALL_AZKAR.find((zikr) => zikr.id === "m-hm-75")!;
  render(<QuranPrelude zikr={{ ...ayah, quranText: true }} />);
  expect(screen.queryByText(BASMALAH_ARABIC)).not.toBeInTheDocument();
});

it("retains basmalah for content with an explicit reviewed prelude flag", () => {
  const surah = ALL_AZKAR.find((zikr) => zikr.hasBasmalah)!;
  render(<QuranPrelude zikr={surah} />);
  expect(screen.getByText(BASMALAH_ARABIC)).toBeInTheDocument();
});
