import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import en from "./i18n/en";
import ar from "./i18n/ar";

/**
 * The app's name has now been changed twice, and both times it was left behind
 * somewhere: the first rename missed `document.title`, so every browser tab and
 * bookmark still read "Azkar" long after no screen did, and the second had to
 * correct the spelling across four files by hand.
 *
 * The name lives in places a grep of `src` does not reach — the HTML shell and
 * the PWA manifest in the Vite config — which is exactly why it keeps being
 * missed. This asserts they all agree, so the next rename is one edit and a
 * failing test rather than a hunt.
 */
const ENGLISH_NAME = "wa-zaker";

/** Spellings this name has previously had, which must not survive a rename. */
const SUPERSEDED = ["wa-ziker", "WA-ZIKER"];

const indexHtml = readFileSync("index.html", "utf8");
const viteConfig = readFileSync("vite.config.ts", "utf8");
const brandComponent = readFileSync("src/app/screens/onboarding/OnboardingBrand.tsx", "utf8");

describe("the app's name", () => {
  it("is the same in the interface as in the HTML shell", () => {
    expect(en.common.appName).toBe(ENGLISH_NAME);
    expect(indexHtml).toContain(`<title>${ENGLISH_NAME}</title>`);
    expect(indexHtml).toContain(`content="${ENGLISH_NAME}"`);
  });

  it("is the same in the installed app as in the browser", () => {
    // The manifest is what an installed PWA shows under its icon. It is in the
    // Vite config, which no amount of grepping `src` will surface.
    expect(viteConfig).toContain(`name: "${ENGLISH_NAME}"`);
    expect(viteConfig).toContain(`short_name: "${ENGLISH_NAME}"`);
  });

  it("is the same on the onboarding brand mark", () => {
    expect(brandComponent).toContain(ENGLISH_NAME);
    expect(brandComponent).toContain(ENGLISH_NAME.toUpperCase());
  });

  it("keeps its tashkeel in Arabic", () => {
    /* The Arabic name is vocalised deliberately — وَذَكِّرْ, not وذكر. Stripping
       the harakat changes how it reads aloud, and it is the app's name.

       Asserted by skeleton and by the presence of harakat rather than against a
       literal: two spellings that look identical can order their diacritics
       differently, and a test that fails with "expected X to be X" teaches
       nobody anything. */
    const name = ar.common.appName;
    expect(name.replace(/[ً-ْ]/g, "")).toBe("وذكر");
    expect(name).toMatch(/[ً-ْ]/);
  });

  it("leaves no superseded spelling behind", () => {
    for (const old of SUPERSEDED) {
      expect(indexHtml, `index.html still says ${old}`).not.toContain(old);
      expect(viteConfig, `vite.config.ts still says ${old}`).not.toContain(old);
      expect(brandComponent, `OnboardingBrand still says ${old}`).not.toContain(old);
      expect(JSON.stringify(en), `the English bundle still says ${old}`).not.toContain(old);
    }
  });
});
