import { chromium } from "playwright";
import path from "node:path";

async function inspectHeader() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  await page.goto(
    `file://${path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html")}`,
    { waitUntil: "load" },
  );

  const headerInfo = await page.evaluate(() => {
    const p134 = globalThis.document.querySelector("#p-134");
    const header = p134.querySelector(".page-header");
    const bookTitle = p134.querySelector(".header-book-title");
    const chapter = p134.querySelector(".header-chapter");
    const frameInner = p134.querySelector(".page-frame-inner");

    return {
      headerRect: header.getBoundingClientRect(),
      bookTitleRect: bookTitle.getBoundingClientRect(),
      chapterRect: chapter.getBoundingClientRect(),
      frameInnerRect: frameInner.getBoundingClientRect(),
      headerStyle: {
        borderBottom: globalThis.window.getComputedStyle(header).borderBottom,
        paddingBottom: globalThis.window.getComputedStyle(header).paddingBottom,
        marginBottom: globalThis.window.getComputedStyle(header).marginBottom,
        height: globalThis.window.getComputedStyle(header).height,
        lineHeight: globalThis.window.getComputedStyle(header).lineHeight,
      },
      chapterStyle: {
        textDecoration: globalThis.window.getComputedStyle(chapter).textDecoration,
        height: globalThis.window.getComputedStyle(chapter).height,
        lineHeight: globalThis.window.getComputedStyle(chapter).lineHeight,
      },
    };
  });

  console.log(JSON.stringify(headerInfo, null, 2));
  await browser.close();
}

inspectHeader().catch(console.error);
