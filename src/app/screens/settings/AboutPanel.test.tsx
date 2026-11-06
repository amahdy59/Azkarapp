import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AboutPanel } from "./AboutPanel";
import { t } from "../../i18n";

describe("AboutPanel", () => {
  it.each(["ar", "en"] as const)("credits both programmers with public contact links in %s", (language) => {
    render(
      <AboutPanel
        language={language}
        onSources={vi.fn()}
        onBack={vi.fn()}
        onHelp={vi.fn()}
        onLegal={vi.fn()}
        onWhatsNew={vi.fn()}
      />,
    );
    for (const nameKey of ["ahmedMahdy", "mohamedHussien"] as const) {
      expect(screen.getByRole("heading", { name: t(language, `about.${nameKey}`) })).toBeVisible();
    }
    expect(
      screen.getByRole("link", {
        name: t(language, "about.emailProgrammer", { name: t(language, "about.ahmedMahdy") }),
      }),
    ).toHaveAttribute("href", "mailto:amahdy59@yahoo.com");
    expect(
      screen.getByRole("link", {
        name: t(language, "about.emailProgrammer", { name: t(language, "about.mohamedHussien") }),
      }),
    ).toHaveAttribute("href", "mailto:m.hussien.m44@gmail.com");
    for (const [nameKey, url] of [
      ["ahmedMahdy", "https://www.linkedin.com/in/creativemahdy"],
      ["mohamedHussien", "https://www.linkedin.com/in/mohamed-hussien-a5608613b/"],
    ] as const) {
      const linkedin = screen.getByRole("link", {
        name: t(language, "about.linkedinProfile", { name: t(language, `about.${nameKey}`) }),
      });
      expect(linkedin).toHaveAttribute("href", url);
      expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    }
    for (const key of ["ahmedRole", "mohamedRole", "ahmedBio", "mohamedBio"] as const) {
      expect(screen.getByText(t(language, `about.${key}`))).toBeVisible();
    }
    for (const kind of ["reportBug", "suggestFeature"] as const) {
      const href = screen.getByRole("link", { name: t(language, `about.${kind}`) }).getAttribute("href")!;
      expect(href.split("?")[0]).toBe("mailto:amahdy59@yahoo.com,m.hussien.m44@gmail.com");
      expect(new URLSearchParams(href.split("?")[1]).get("subject")).toBe(t(language, `about.${kind}Subject`));
    }
  });
  it("offers manual review of a deferred update without applying it", () => {
    const onReviewUpdate = vi.fn();
    render(
      <AboutPanel
        language="en"
        onReviewUpdate={onReviewUpdate}
        onSources={() => undefined}
        onBack={() => undefined}
        onHelp={() => undefined}
        onLegal={() => undefined}
        onWhatsNew={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Review available update" }));
    expect(onReviewUpdate).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Review available update" })).toHaveFocus();
  });
  it("renders Quran Word Meanings source row and calls onSources when clicked", () => {
    const onSources = vi.fn();
    const onBack = vi.fn();
    const onHelp = vi.fn();
    const onLegal = vi.fn();
    const onWhatsNew = vi.fn();

    render(
      <AboutPanel
        language="ar"
        onSources={onSources}
        onBack={onBack}
        onHelp={onHelp}
        onLegal={onLegal}
        onWhatsNew={onWhatsNew}
      />,
    );

    const quranRow = screen.getByText("غريب القرآن");
    expect(quranRow).toBeInTheDocument();
    expect(screen.getByText("الميسر في غريب القرآن — مجمع الملك فهد")).toBeInTheDocument();

    fireEvent.click(quranRow);
    expect(onSources).toHaveBeenCalledTimes(1);
  });

  it("renders Quran Word Meanings source row in English", () => {
    const onSources = vi.fn();
    render(
      <AboutPanel
        language="en"
        onSources={onSources}
        onBack={() => undefined}
        onHelp={() => undefined}
        onLegal={() => undefined}
        onWhatsNew={() => undefined}
      />,
    );

    expect(screen.getByText("Qur'an Word Meanings")).toBeInTheDocument();
    expect(screen.getByText("Al-Muyassar fi Ghareeb Al-Qur'an — King Fahd Complex")).toBeInTheDocument();
  });
});
