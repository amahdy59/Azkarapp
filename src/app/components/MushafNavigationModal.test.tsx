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
    expect(screen.getByText("انتقال لصفحة")).toBeInTheDocument();
    expect(screen.getByText("العلامات")).toBeInTheDocument();

    // Verify first surah
    expect(screen.getByText("الفاتحة")).toBeInTheDocument();
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
});
