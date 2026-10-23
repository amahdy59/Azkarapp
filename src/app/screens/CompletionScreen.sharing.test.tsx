import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CollectionShareModalProps } from "../components/CollectionShareModal";
import { CompletionScreen } from "./CompletionScreen";
import { t } from "../i18n";

const { studio } = vi.hoisted(() => ({ studio: vi.fn() }));
vi.mock("../components/CollectionShareModal", () => ({
  CollectionShareModal: (props: CollectionShareModalProps) => {
    studio(props);
    return <button onClick={props.onClose}>Close completion image</button>;
  },
}));

for (const language of ["ar", "en"] as const) {
  describe(`Completion image sharing ${language}`, () => {
    it("opens an image preview on request, preserves the localized existing phrase, and closes back to completion", async () => {
      studio.mockClear();
      const onHome = vi.fn();
      render(
        <CompletionScreen
          catId="morning"
          sessionStart={Date.now() - 60000}
          dailyCompletions={[]}
          growthEvent={null}
          quietProgressEnabled={false}
          progressDayStartHour={0}
          onHome={onHome}
          language={language}
          direction={language === "ar" ? "rtl" : "ltr"}
          reduceMotion
          hapticFeedback={false}
        />,
      );
      expect(studio).not.toHaveBeenCalled();
      const share = screen.getByRole("button", { name: t(language, "completion.share"), exact: true });
      expect(share).toHaveAttribute("aria-haspopup", "dialog");
      fireEvent.click(share);
      const close = await screen.findByRole("button", { name: "Close completion image" });
      const props = studio.mock.lastCall![0] as CollectionShareModalProps;
      expect(props).toMatchObject({ open: true, single: true, initialFormat: "square", language, items: [] });
      expect(props.shareUrl).toContain("#/azkar/morning");
      const english = props.shareItemsByLanguage!.en[0]!;
      const arabic = props.shareItemsByLanguage!.ar[0]!;
      expect(english).toMatchObject({ hideRepetition: true, textDirection: "ltr", language: "en" });
      expect(arabic).toMatchObject({ hideRepetition: true, textDirection: "rtl", language: "ar" });
      expect(english.arabicText).toBe(t("en", "completion.shareText", { category: "Morning Azkar" }));
      expect(arabic.arabicText).toBe(t("ar", "completion.shareText", { category: "أذكار الصباح" }));
      expect(english.repetitionCount).toBeUndefined();
      expect(english.sourceReference).toBeUndefined();
      fireEvent.click(close);
      expect(screen.queryByRole("button", { name: "Close completion image" })).not.toBeInTheDocument();
      expect(share).toBeInTheDocument();
      expect(onHome).not.toHaveBeenCalled();
    });
  });
}
