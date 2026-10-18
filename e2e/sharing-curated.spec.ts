import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";

function storedZipImages(archive: Buffer) {
  const entries: { name: string; bytes: Buffer }[] = [];
  let offset = 0;
  while (archive.readUInt32LE(offset) === 0x04034b50) {
    expect(archive.readUInt16LE(offset + 8)).toBe(0);
    const size = archive.readUInt32LE(offset + 18);
    const nameSize = archive.readUInt16LE(offset + 26);
    const extraSize = archive.readUInt16LE(offset + 28);
    const name = archive.subarray(offset + 30, offset + 30 + nameSize).toString("utf8");
    const start = offset + 30 + nameSize + extraSize;
    const bytes = archive.subarray(start, start + size);
    expect(bytes.length).toBe(size);
    if (/\.(?:webp|png|jpg)$/u.test(name)) entries.push({ name, bytes });
    offset = start + size;
  }
  return entries;
}

for (const category of ["morning", "evening", "before_sleep"] as const) {
  test(`curated ${category} cards preview and save actual images @cross-browser`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
      localStorage.setItem(
        "azkarapp.state.v1",
        JSON.stringify({ settings: { language: "ar", reduceMotion: true }, profile: { isGuest: true } }),
      );
    });
    await page.goto(`/#/azkar/${category === "before_sleep" ? "before-sleep" : category}`);
    await page.getByTestId("share-collection-button").click();
    const modal = page.getByTestId("collection-share-modal");
    await modal.getByRole("button", { name: "البطاقات المعتمدة", exact: true }).click();
    const extension = category === "before_sleep" ? "jpg" : "webp";
    const image = modal.getByRole("img").first();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", /^blob:/u);
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(900);
    const firstName = await image.getAttribute("alt");
    await modal.getByRole("button", { name: "البطاقة التالية" }).click();
    await expect(image).not.toHaveAttribute("alt", firstName!);
    await expect(image).toHaveAttribute("src", /^blob:/u);
    const preview = await image.evaluate(async (node: HTMLImageElement) => {
      await node.decode();
      const canvas = document.createElement("canvas");
      canvas.width = node.naturalWidth;
      canvas.height = node.naturalHeight;
      canvas.getContext("2d")!.drawImage(node, 0, 0);
      return canvas.toDataURL("image/png");
    });
    const download = page.waitForEvent("download");
    await modal.getByRole("button", { name: "حفظ", exact: true }).click();
    const saved = await download;
    const archive = await readFile((await saved.path())!);
    expect(archive.subarray(0, 2).toString()).toBe("PK");
    const images = storedZipImages(archive);
    expect(images).toHaveLength(category === "morning" ? 3 : 2);
    for (let i = 1; i <= images.length; i++) {
      const original = await readFile(`public/assets/cards/routine-${category}-${i}.${extension}`);
      const imageEvidence = await page.evaluate(
        async ({ original, exported, preview }) => {
          const load = async (src: string) => {
            const image = new Image();
            image.src = src;
            await image.decode();
            return image;
          };
          const source = await load(original);
          const output = await load(exported);
          const canvas = document.createElement("canvas");
          canvas.width = source.naturalWidth;
          canvas.height = source.naturalHeight;
          const context = canvas.getContext("2d")!;
          context.drawImage(source, 0, 0);
          const reference = context.getImageData(0, 0, canvas.width, canvas.height).data;
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(output, 0, 0);
          const actual = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let difference = 0;
          let count = 0;
          let worstTile = 0;
          // Local blocks catch missing/cropped text; allow only normal lossy encoding differences.
          for (let top = 0; top < canvas.height; top += 64) {
            for (let left = 0; left < canvas.width; left += 64) {
              let block = 0;
              let samples = 0;
              for (let y = top; y < Math.min(top + 64, canvas.height); y += 2)
                for (let x = left; x < Math.min(left + 64, canvas.width); x += 2)
                  for (let channel = 0; channel < 3; channel++) {
                    const offset = (y * canvas.width + x) * 4 + channel;
                    block += Math.abs(reference[offset]! - actual[offset]!);
                    samples++;
                  }
              difference += block;
              count += samples;
              worstTile = Math.max(worstTile, block / samples);
            }
          }
          canvas.height = output.naturalHeight;
          context.drawImage(output, 0, 0);
          const footer = context.getImageData(
            0,
            source.naturalHeight,
            canvas.width,
            canvas.height - source.naturalHeight,
          ).data;
          let previewMismatch = 0;
          if (preview) {
            const exportedPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(await load(preview), 0, 0);
            const previewPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let pixel = 0; pixel < previewPixels.length; pixel++)
              if (previewPixels[pixel] !== exportedPixels[pixel]) previewMismatch++;
          }
          let lightGlyphs = 0;
          for (let pixel = 0; pixel < footer.length; pixel += 4)
            if (footer[pixel]! > 210 && footer[pixel + 1]! > 210 && footer[pixel + 2]! > 210) lightGlyphs++;
          return {
            sourceWidth: source.naturalWidth,
            sourceHeight: source.naturalHeight,
            width: output.naturalWidth,
            height: output.naturalHeight,
            meanDifference: difference / count,
            worstTile,
            lightGlyphs,
            previewMismatch,
          };
        },
        {
          original: `data:image/${extension === "jpg" ? "jpeg" : "webp"};base64,${original.toString("base64")}`,
          exported: `data:image/${images[i - 1]!.name.endsWith(".png") ? "png" : "webp"};base64,${images[i - 1]!.bytes.toString("base64")}`,
          preview: i === 2 ? preview : null,
        },
      );
      expect(imageEvidence.width).toBe(imageEvidence.sourceWidth);
      expect(imageEvidence.height).toBe(imageEvidence.sourceHeight + Math.ceil(imageEvidence.sourceWidth * 0.085));
      expect(imageEvidence.meanDifference).toBeLessThan(3);
      expect(imageEvidence.worstTile).toBeLessThan(10);
      expect(imageEvidence.lightGlyphs).toBeGreaterThan(100);
      expect(imageEvidence.previewMismatch).toBe(0);
      await testInfo.attach(`curated-${category}-${i}-pixels.json`, {
        body: JSON.stringify(imageEvidence),
        contentType: "application/json",
      });
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include('[data-testid="collection-share-modal"]')
          .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`curated-${category}.png`) });
  });
}

test("all supplied curated images are available on the first offline visit after install", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Service worker coverage is checked in Chromium.");
  await page.goto("/");
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  try {
    const sizes = await page.evaluate(async () => {
      const paths = [
        "morning-1",
        "morning-2",
        "morning-3",
        "evening-1",
        "evening-2",
        "before_sleep-1",
        "before_sleep-2",
      ];
      return Promise.all(
        paths.map(async (path) => {
          const response = await fetch(
            `assets/cards/routine-${path}.${path.startsWith("before_sleep") ? "jpg" : "webp"}`,
          );
          if (!response.ok) throw new Error("Missing offline image");
          return (await response.blob()).size;
        }),
      );
    });
    expect(sizes).toEqual([53622, 60654, 48974, 51324, 57152, 139375, 150392]);
  } finally {
    await context.setOffline(false);
  }
});
