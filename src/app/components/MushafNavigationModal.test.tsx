import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MushafNavigationModal } from "./MushafNavigationModal";

describe("MushafNavigationModal", () => {
  it("renders tabs and surah list when opened", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={1}
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
        bookmarks={[1, 293]}
      />,
    );

    expect(screen.getByRole("heading", { name: "فهرس المصحف الشريف" })).toBeInTheDocument();
    expect(screen.getByText("السور")).toBeInTheDocument();
    expect(screen.getByText("الأجزاء")).toBeInTheDocument();
    expect(screen.getByText("صفحة")).toBeInTheDocument();
    expect(screen.getByText("العلامات")).toBeInTheDocument();

    // Verify first surah
    expect(screen.getByText("الفاتحة")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /السور/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(/السور/);
  });

  it("navigates to and highlights a bookmarked verse", () => {
    const handleSelectPage = vi.fn();
    const handleSelectVerseBookmark = vi.fn();
    const handleClose = vi.fn();
    const bookmark = { verseKey: "2:255", page: 42 };

    render(
      <MushafNavigationModal
        isOpen
        onClose={handleClose}
        currentPage={1}
        onSelectPage={handleSelectPage}
        onSelectVerseBookmark={handleSelectVerseBookmark}
        language="en"
        direction="ltr"
        verseBookmarks={[bookmark]}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: /Bookmarks/ }));
    fireEvent.click(screen.getByRole("button", { name: /Al-Baqarah.*255/ }));

    expect(handleSelectVerseBookmark).toHaveBeenCalledWith(bookmark);
    expect(handleSelectPage).toHaveBeenCalledWith(42);
    expect(handleClose).toHaveBeenCalled();
  });

  it("filters surahs by search query", () => {
    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={vi.fn()}
        currentPage={1}
        onSelectPage={vi.fn()}
        language="ar"
        direction="rtl"
      />,
    );

    const searchInput = screen.getByPlaceholderText("ابحث عن سورة بالاسم أو الرقم...");
    fireEvent.change(searchInput, { target: { value: "الكهف" } });

    expect(screen.getByText("الكهف")).toBeInTheDocument();
    expect(screen.queryByText("الفاتحة")).not.toBeInTheDocument();
  });

  it("selects a surah and navigates to its starting page", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={1}
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
      />,
    );

    const fatihahBtn = screen.getByText("الفاتحة").closest("button");
    expect(fatihahBtn).toBeInTheDocument();
    fireEvent.click(fatihahBtn!);

    expect(handleSelectPage).toHaveBeenCalledWith(1);
    expect(handleClose).toHaveBeenCalled();
  });

  it("switches to Ajza tab and allows jumping to a Juz", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={1}
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
      />,
    );

    const juzTabBtn = screen.getByText("الأجزاء");
    fireEvent.click(juzTabBtn);

    const juz30Btn = screen.getByText("الجزء الثلاثون").closest("button");
    expect(juz30Btn).toBeInTheDocument();
    fireEvent.click(juz30Btn!);

    expect(handleSelectPage).toHaveBeenCalledWith(582);
    expect(handleClose).toHaveBeenCalled();
  });

  it("renders bookmarks and allows jumping to a bookmarked page", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={1}
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
        bookmarks={[293]}
      />,
    );

    const bookmarksTabBtn = screen.getByText("العلامات");
    fireEvent.click(bookmarksTabBtn);

    const bookmarkBtn = screen.getByText("صفحة ٢٩٣").closest("button");
    expect(bookmarkBtn).toBeInTheDocument();
    fireEvent.click(bookmarkBtn!);

    expect(handleSelectPage).toHaveBeenCalledWith(293);
    expect(handleClose).toHaveBeenCalled();
  });

  it("allows selecting a page number directly from the Page tab grid using multiples of 15", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={562}
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
        initialTab="jump"
      />,
    );

    // Keep shortcuts alongside the exact current page.
    const page1Btn = screen.getByRole("button", { name: "١" });
    const page15Btn = screen.getByRole("button", { name: "١٥" });
    const page570Btn = screen.getByRole("button", { name: "٥٧٠" });
    const page604Btn = screen.getByRole("button", { name: "٦٠٤" });

    expect(page1Btn).toBeInTheDocument();
    expect(page15Btn).toBeInTheDocument();
    expect(page570Btn).toBeInTheDocument();
    expect(page604Btn).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "٥٦٢" })).toHaveAttribute("aria-current", "page");

    // Verify 565 is no longer in the grid (which was multiples of 5), but 570 is
    expect(screen.queryByRole("button", { name: "٥٦٥" })).not.toBeInTheDocument();

    fireEvent.click(page570Btn);
    expect(handleSelectPage).toHaveBeenCalledWith(570);
    expect(handleClose).toHaveBeenCalled();
  });

  it.each([1, 9, 562, 604])("marks exact page %i in the English page grid without duplicate buttons", (currentPage) => {
    render(
      <MushafNavigationModal
        isOpen
        onClose={vi.fn()}
        currentPage={currentPage}
        onSelectPage={vi.fn()}
        language="en"
        direction="ltr"
        initialTab="jump"
      />,
    );
    expect(screen.getAllByRole("button", { name: String(currentPage), exact: true })).toHaveLength(1);
    expect(screen.getByRole("button", { name: String(currentPage), exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("scales quick jump step when viewing a constrained pageRange", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={10}
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
        initialTab="jump"
        pageRange={{ first: 2, last: 49 }}
      />,
    );

    // For a 48-page surah, step scales down to 5: 2, 5, 10, ..., 45, 49
    expect(screen.getByRole("button", { name: "٢" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "٥" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "٤٩" })).toBeInTheDocument();
  });

  it("renders surahs in a 2-column grid with compact page tags", () => {
    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={vi.fn()}
        currentPage={1}
        onSelectPage={vi.fn()}
        language="ar"
        direction="rtl"
      />,
    );

    const fatihahBtn = screen.getByText("الفاتحة").closest("button");
    expect(fatihahBtn).toBeInTheDocument();
    expect(fatihahBtn?.parentElement).toHaveClass("grid-cols-2");
    // Verify compact page tag
    expect(screen.getByText("ص ١")).toBeInTheDocument();
    expect(screen.getByText("ص ٢")).toBeInTheDocument();
  });

  it("expands current juz by default, displays hizbs/quarters and navigates to quarter page", () => {
    const handleSelectPage = vi.fn();
    const handleClose = vi.fn();

    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={handleClose}
        currentPage={1} // Juz 1
        onSelectPage={handleSelectPage}
        language="ar"
        direction="rtl"
        initialTab="juzs"
      />,
    );

    // Juz 1 is active and expanded by default
    expect(screen.getByText("الحزب ١")).toBeInTheDocument();
    expect(screen.getByText("الحزب ٢")).toBeInTheDocument();

    // Quarters within Hizb 1 (pages 1, 5, 7, 9) include their first words
    expect(screen.getByText("الحمد لله")).toBeInTheDocument();
    expect(screen.getByText("إِنَّ اللَّهَ")).toBeInTheDocument();
    expect(screen.getByTitle(/الربع ١.*الحمد لله.*صفحة ١/)).toBeInTheDocument();
    const q2Btn = screen.getByTitle(/الربع ٢.*إِنَّ اللَّهَ.*صفحة ٥/);
    expect(q2Btn).toBeInTheDocument();

    // Clicking a quarter jumps to its page and closes modal
    fireEvent.click(q2Btn);
    expect(handleSelectPage).toHaveBeenCalledWith(5);
    expect(handleClose).toHaveBeenCalled();
  });

  it("collapses and re-expands a juz accordion on toggle", () => {
    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={vi.fn()}
        currentPage={1} // Juz 1
        onSelectPage={vi.fn()}
        language="ar"
        direction="rtl"
        initialTab="juzs"
      />,
    );

    expect(screen.getByText("الحزب ١")).toBeInTheDocument();

    // Toggle button for Juz 1
    const toggleBtn = screen.getByRole("button", { name: /عرض أرباع الحزب - الجزء الأول/ });
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");

    // Click to collapse
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("الحزب ١")).not.toBeInTheDocument();

    // Click to re-expand
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("الحزب ١")).toBeInTheDocument();
  });

  it("enforces 44px minimum target sizes for close button", () => {
    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={vi.fn()}
        currentPage={1}
        onSelectPage={vi.fn()}
        language="ar"
        direction="rtl"
      />,
    );

    const closeBtn = screen.getByTestId("modal-close-button");
    expect(closeBtn).toHaveClass("min-h-[44px]", "min-w-[44px]");
  });

  it("enforces 44px minimum target sizes for search clear button", () => {
    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={vi.fn()}
        currentPage={1}
        onSelectPage={vi.fn()}
        language="ar"
        direction="rtl"
        initialTab="surahs"
      />,
    );

    const searchInput = screen.getByPlaceholderText(/ابحث عن سورة/);
    fireEvent.change(searchInput, { target: { value: "البقرة" } });

    const clearBtn = screen.getByRole("button", { name: "مسح" });
    expect(clearBtn).toHaveClass("min-h-[44px]", "min-w-[44px]");
  });

  it("marks the current juz header with aria-current='true'", () => {
    render(
      <MushafNavigationModal
        isOpen={true}
        onClose={vi.fn()}
        currentPage={562} // Juz 29
        onSelectPage={vi.fn()}
        language="ar"
        direction="rtl"
        initialTab="juzs"
      />,
    );

    const juz29Btn = screen.getByTitle("صفحة ٥٦٢");
    expect(juz29Btn).toHaveAttribute("aria-current", "true");
    expect(juz29Btn).toHaveTextContent("الجزء التاسع والعشرون");
  });
});
