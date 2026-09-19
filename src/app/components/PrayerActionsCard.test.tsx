import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrayerActionsCard } from "./PrayerActionsCard";
import type { PrayerTrackingRecord } from "../types";

afterEach(cleanup);

const DAY = "2026-09-18";

describe("PrayerActionsCard", () => {
  it("renders Dhuhr with 4 action rows, dynamic heading and more info button", () => {
    const onToggle = vi.fn();
    const onOpenAdhkar = vi.fn();

    render(
      <PrayerActionsCard
        prayer="dhuhr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={onToggle}
        onOpenAdhkar={onOpenAdhkar}
      />,
    );

    // Header
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("أعمال صلاة الظهر");
    const infoButton = screen.getByTestId("prayer-actions-more-info");
    expect(infoButton).toHaveAttribute("aria-label", "معلومات عن سنن صلاة الظهر");

    // Checklist rows (4 for Dhuhr)
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("صليت الظهر جماعة");
    expect(screen.getByTestId("prayer-action-dhuhr-sunnah-before")).toHaveTextContent("أربع ركعات قبل الظهر");
    expect(screen.getByTestId("prayer-action-dhuhr-adhkar")).toHaveTextContent("أذكار بعد الصلاة");
    expect(screen.getByTestId("prayer-action-dhuhr-sunnah-after")).toHaveTextContent("ركعتان بعد الظهر");

    // Checkboxes count
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(4);
  });

  it("renders Fajr with 3 action rows (congregation, sunnah before, adhkar)", () => {
    render(
      <PrayerActionsCard
        prayer="fajr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("أعمال صلاة الفجر");
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("صليت الفجر جماعة");
    expect(screen.getByTestId("prayer-action-fajr-sunnah-before")).toHaveTextContent("ركعتان قبل الفجر");
    expect(screen.getByTestId("prayer-action-fajr-adhkar")).toHaveTextContent("أذكار بعد الصلاة");
    expect(screen.queryByTestId("prayer-action-fajr-sunnah-after")).toBeNull();

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("renders Asr with 3 action rows (congregation, sunnah before, adhkar)", () => {
    render(
      <PrayerActionsCard
        prayer="asr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("أعمال صلاة العصر");
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("صليت العصر جماعة");
    expect(screen.getByTestId("prayer-action-asr-sunnah-before")).toHaveTextContent("أربع ركعات قبل العصر");
    expect(screen.getByTestId("prayer-action-asr-adhkar")).toHaveTextContent("أذكار بعد الصلاة");
    expect(screen.queryByTestId("prayer-action-asr-sunnah-after")).toBeNull();

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("renders Maghrib with 3 action rows (congregation, adhkar, sunnah after)", () => {
    render(
      <PrayerActionsCard
        prayer="maghrib"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("أعمال صلاة المغرب");
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("صليت المغرب جماعة");
    expect(screen.getByTestId("prayer-action-maghrib-adhkar")).toHaveTextContent("أذكار بعد الصلاة");
    expect(screen.getByTestId("prayer-action-maghrib-sunnah-after")).toHaveTextContent("ركعتان بعد المغرب");
    expect(screen.queryByTestId("prayer-action-maghrib-sunnah-before")).toBeNull();

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("renders Isha with 3 action rows (congregation, adhkar, sunnah after)", () => {
    render(
      <PrayerActionsCard
        prayer="isha"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("أعمال صلاة العشاء");
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("صليت العشاء جماعة");
    expect(screen.getByTestId("prayer-action-isha-adhkar")).toHaveTextContent("أذكار بعد الصلاة");
    expect(screen.getByTestId("prayer-action-isha-sunnah-after")).toHaveTextContent("ركعتان بعد العشاء");
    expect(screen.queryByTestId("prayer-action-isha-sunnah-before")).toBeNull();

    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("toggles congregation, sunnah, and adhkar correctly", () => {
    const onToggle = vi.fn();
    render(
      <PrayerActionsCard
        prayer="dhuhr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={onToggle}
        onOpenAdhkar={vi.fn()}
      />,
    );

    // Toggle congregation
    const congregationInput = screen.getByTestId("prayer-action-location").querySelector("input")!;
    fireEvent.click(congregationInput);
    expect(onToggle).toHaveBeenCalledWith("dhuhr", "location", "mosque");

    // Toggle Sunnah before
    const sunnahBeforeInput = screen.getByTestId("prayer-action-dhuhr-sunnah-before").querySelector("input")!;
    fireEvent.click(sunnahBeforeInput);
    expect(onToggle).toHaveBeenCalledWith("dhuhr", "sunnahBefore", true);

    // Toggle Adhkar
    const adhkarInput = screen.getByTestId("prayer-action-dhuhr-adhkar").querySelector("input")!;
    fireEvent.click(adhkarInput);
    expect(onToggle).toHaveBeenCalledWith("dhuhr", "adhkar", true);

    // Toggle Sunnah after
    const sunnahAfterInput = screen.getByTestId("prayer-action-dhuhr-sunnah-after").querySelector("input")!;
    fireEvent.click(sunnahAfterInput);
    expect(onToggle).toHaveBeenCalledWith("dhuhr", "sunnahAfter", true);
  });

  it("clears congregation when clicked again on an existing record", () => {
    const onToggle = vi.fn();
    const records: PrayerTrackingRecord[] = [
      { dayKey: DAY, prayer: "dhuhr", mosque: true, location: "mosque", adhkar: false },
    ];

    render(
      <PrayerActionsCard
        prayer="dhuhr"
        language="ar"
        direction="rtl"
        records={records}
        dayKey={DAY}
        onToggle={onToggle}
        onOpenAdhkar={vi.fn()}
      />,
    );

    const congregationInput = screen.getByTestId("prayer-action-location").querySelector("input")!;
    expect(congregationInput).toBeChecked();
    fireEvent.click(congregationInput);
    expect(onToggle).toHaveBeenCalledWith("dhuhr", "location", null);
  });

  it("disables checklist when canRecord is false", () => {
    const onToggle = vi.fn();
    render(
      <PrayerActionsCard
        prayer="fajr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        canRecord={false}
        onToggle={onToggle}
        onOpenAdhkar={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    for (const box of checkboxes) {
      expect(box).toBeDisabled();
      fireEvent.click(box);
    }
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("opens More Info modal and renders educational Sunnah details with hadith evidence", () => {
    render(
      <PrayerActionsCard
        prayer="dhuhr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("prayer-actions-info-modal")).toBeNull();

    fireEvent.click(screen.getByTestId("prayer-actions-more-info"));

    const modal = screen.getByTestId("prayer-actions-info-modal");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent("سنن صلاة الظهر");

    // Overarching Rawatib Foundation Banner
    const rawatibBanner = screen.getByTestId("rawatib-virtue-banner");
    expect(rawatibBanner).toBeInTheDocument();
    expect(rawatibBanner).toHaveTextContent("فضل السنن الرواتب");
    expect(rawatibBanner).toHaveTextContent(
      "مَنْ صَلَّى اثْنَتَيْ عَشْرَةَ رَكْعَةً فِي يَوْمٍ وَلَيْلَةٍ بُنِيَ لَهُ بِهِنَّ بَيْتٌ فِي الْجَنَّةِ",
    );

    // Individual Sunnah breakdown
    expect(modal).toHaveTextContent("قبل الصلاة");
    expect(modal).toHaveTextContent("أربع ركعات");
    expect(modal).toHaveTextContent("بعد الصلاة");
    expect(modal).toHaveTextContent("ركعتان");
    // Hadith evidence
    expect(modal).toHaveTextContent("مَنْ حَافَظَ عَلَى أَرْبَعِ رَكَعَاتٍ قَبْلَ الظُّهْرِ");
  });

  it("triggers onOpenAdhkar when bottom primary CTA is clicked", () => {
    const onOpenAdhkar = vi.fn();
    render(
      <PrayerActionsCard
        prayer="maghrib"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={onOpenAdhkar}
      />,
    );

    const button = screen.getByTestId("prayer-open-adhkar");
    expect(button).toHaveTextContent("ابدأ الأذكار");
    fireEvent.click(button);
    expect(onOpenAdhkar).toHaveBeenCalledWith("maghrib");
  });

  it("supports English localization and LTR direction", () => {
    render(
      <PrayerActionsCard
        prayer="dhuhr"
        language="en"
        direction="ltr"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Deeds of Dhuhr prayer");
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("Prayed Dhuhr in congregation");
    expect(screen.getByTestId("prayer-action-dhuhr-sunnah-before")).toHaveTextContent("4 rak'ahs before Dhuhr");
    expect(screen.getByTestId("prayer-action-dhuhr-adhkar")).toHaveTextContent("Azkar after prayer");
    expect(screen.getByTestId("prayer-action-dhuhr-sunnah-after")).toHaveTextContent("2 rak'ahs after Dhuhr");
    expect(screen.getByTestId("prayer-open-adhkar")).toHaveTextContent("Start Azkar");
  });

  it("renders with unified frosted sub-surface styling and floating layout when onGlass is true", () => {
    render(
      <PrayerActionsCard
        prayer="dhuhr"
        language="ar"
        direction="rtl"
        records={[]}
        dayKey={DAY}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
        onGlass
      />,
    );

    const section = screen.getByTestId("prayer-actions-card");
    expect(section).toHaveClass("p-0");

    const row = screen.getByTestId("prayer-action-location");
    expect(row).toHaveClass("backdrop-blur-md");
    expect(row).toHaveClass("bg-white/14");

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveClass("text-on-media-accent");

    const cta = screen.getByTestId("prayer-open-adhkar");
    expect(cta).toHaveClass("bg-primary");
  });
});
