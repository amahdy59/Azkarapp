import fs from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LearningDiagram } from "../src/app/components/LearningDiagram.tsx";
import { publicationDiagram } from "./publication-diagrams.mjs";
import visuals from "../docs/learning/visuals/book-visuals.json" with { type: "json" };

describe("source-bound book figures", () => {
  it("provides explicit provenance, learning placement and equivalent text for context images", () => {
    expect(visuals.figures.map((figure) => [figure.book, figure.sourcePage])).toEqual([
      [1, 5],
      [3, 34],
    ]);
    for (const figure of visuals.figures) {
      expect(figure.kind).toBe("generated-context");
      expect(figure.alt.length).toBeGreaterThan(20);
      expect(figure.caption).toContain("مولّدة");
      expect(figure.purpose.length).toBeGreaterThan(40);
      expect(fs.readFileSync(`docs/learning/visuals/${figure.asset}`).byteLength).toBeLessThan(300_000);
    }
  });
  it("keeps Arabic and English physical routes identical across standalone and native figures", () => {
    for (const kind of ["tawaf", "sai"]) {
      const block = visuals.diagrams.find((diagram) => diagram.kind === kind);
      const standalone = new JSDOM(publicationDiagram(block)).window.document;
      const native = new JSDOM(
        renderToStaticMarkup(
          React.createElement(LearningDiagram, {
            kind,
            title: block.title,
            description: block.description,
            language: "ar",
            children: block.caption,
          }),
        ),
      ).window.document;
      const english = new JSDOM(publicationDiagram({ ...block, language: "en" })).window.document;
      const paths = (document) =>
        [...document.querySelectorAll(".diagram-route,.learn-diagram-route")].map((node) => node.getAttribute("d"));
      expect(paths(native)).toEqual(paths(standalone));
      expect(paths(standalone)).toEqual(paths(english));
      expect([...native.querySelectorAll("svg text")].map((node) => node.textContent)).toEqual(
        [...standalone.querySelectorAll("svg text")].map((node) => node.textContent),
      );
      expect(native.querySelector("svg desc").textContent).toBe(block.description);
      expect(native.querySelector(".learn-diagram-description").textContent).toBe(block.description);
      expect(standalone.querySelector(".diagram-description").textContent).toBe(block.description);
      expect(native.querySelector("svg").getAttribute("lang")).toBe("ar");
      if (kind === "sai")
        expect(paths(native)).toEqual(
          Array.from(
            { length: 7 },
            (_, index) => `M${index % 2 ? 330 : 70} ${52 + index * 33}H${index % 2 ? 70 : 330}`,
          ),
        );
    }
  });
  it("keeps functional diagrams exposed after standalone document enhancement", () => {
    for (const theme of ["light", "dark", "navy"]) {
      const doc = new JSDOM(
        fs.readFileSync(`docs/external-sources/book2_dalil_al_mutamir/dalil_al_mutamir_${theme}.html`, "utf8"),
      ).window.document;
      const figures = [...doc.querySelectorAll(".teaching-diagram")];
      expect(figures).toHaveLength(2);
      for (const figure of figures) {
        expect(figure.querySelector("svg").getAttribute("aria-hidden")).not.toBe("true");
        expect(figure.querySelector(".diagram-description").textContent.replace(/\s+/g, " ").trim()).toBe(
          figure.querySelector("desc").textContent.replace(/\s+/g, " ").trim(),
        );
      }
    }
  });
});
