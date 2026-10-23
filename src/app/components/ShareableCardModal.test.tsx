import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CollectionShareModalProps } from "./CollectionShareModal";
import { ShareableCardModal } from "./ShareableCardModal";

const { studio } = vi.hoisted(() => ({ studio: vi.fn() }));
vi.mock("./CollectionShareModal", () => ({
  CollectionShareModal: (props: CollectionShareModalProps) => {
    studio(props);
    return <button onClick={props.onClose}>Close image studio</button>;
  },
}));

describe("ShareableCardModal", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    studio.mockClear();
  });

  it("opens the image studio with the exact localized counts and date, without devotional repetitions", () => {
    render(<ShareableCardModal palms={12} golden={2} green={3} dateStr="17 October" language="en" onClose={vi.fn()} />);
    const props = studio.mock.lastCall![0] as CollectionShareModalProps;
    expect(props).toMatchObject({
      open: true,
      single: true,
      language: "en",
      items: [],
      dialogTitle: "Achievement Share Card",
    });
    const item = props.shareItemsByLanguage!.en[0]!;
    expect(item.arabicText).toBe("Palm days: 12\nDaily routines: 2\nAdditional: 3\n17 October");
    expect(item).toMatchObject({ hideRepetition: true, language: "en", textDirection: "ltr" });
    expect(item.repetitionCount).toBeUndefined();
    expect(props.shareItemsByLanguage!.ar[0]!).toMatchObject({
      language: "ar",
      textDirection: "rtl",
      hideRepetition: true,
    });
    expect(props.shareItemsByLanguage!.ar[0]!.arabicText).toContain("أيام النخيل: ١٢");
  });

  it("preserves zero counts and uses the deployed base for the optional link", () => {
    vi.stubEnv("BASE_URL", "/Azkarapp/");
    render(<ShareableCardModal palms={0} golden={0} green={0} dateStr="Date" language="ar" onClose={vi.fn()} />);
    const props = studio.mock.lastCall![0] as CollectionShareModalProps;
    expect(props.shareUrl).toBe(new URL("/Azkarapp/", location.origin).href);
    expect(props.shareItemsByLanguage!.en[0]!.arabicText).toContain("Daily routines: 0");
    expect(props.shareItemsByLanguage!.ar[0]!.arabicText).toContain("إضافية: ٠");
    expect(props.collectionTitleArabic).toBe("تقبل الله منا ومنكم");
    expect(props.collectionTitleEnglish).toBe("May Allah Accept Our Good Deeds");
  });

  it("returns the same close action to the shared dialog without sending anything", () => {
    const onClose = vi.fn();
    render(<ShareableCardModal palms={1} golden={2} green={3} dateStr="Date" language="en" onClose={onClose} />);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Close image studio" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
