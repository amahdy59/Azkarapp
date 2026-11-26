import { createElement, type ReactNode } from "react";
import type { LearningNode } from "../learning/types";
import { UmrahStageArtwork } from "./UmrahStageArtwork";
import { LearningDiagram } from "./LearningDiagram";

/** Renders validated publication data as native, selectable HTML. */
export function LearningContent({
  nodes,
  images,
  linkFor,
  onNavigate,
}: {
  nodes: LearningNode[];
  images: Record<string, string>;
  linkFor: (unitId: string) => string;
  onNavigate: (unitId: string) => void;
}) {
  const render = (node: LearningNode, key: number): ReactNode => {
    if (typeof node === "string") return node;
    const children = node.children.map(render);
    const className = node.className ? `learn-${node.className}` : undefined;
    if (node.tag === "diagram")
      return (
        <LearningDiagram key={key} kind={node.diagram!} title={node.label!} description={node.alt!}>
          {children}
        </LearningDiagram>
      );
    if (node.tag === "illustration") return <UmrahStageArtwork key={key} stage={node.artwork!} />;
    if (node.tag === "img")
      return images[node.asset!] ? (
        <img key={key} src={images[node.asset!]} alt={node.alt || ""} />
      ) : (
        <div key={key} className="learn-photo-placeholder" role="img" aria-label={node.alt || undefined} />
      );
    if (node.tag === "a")
      return node.target || node.href ? (
        <a
          key={key}
          className={`learn-source-link${className ? ` ${className}` : ""}`}
          href={node.target ? linkFor(node.target) : node.href}
          onClick={(event) => {
            if (!node.target || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
              return;
            event.preventDefault();
            onNavigate(node.target!);
          }}
        >
          {children}
        </a>
      ) : (
        <span key={key}>{children}</span>
      );
    return createElement(
      node.tag,
      {
        key,
        className,
        lang: node.lang,
        dir: node.dir,
        ...(node.tag === "ol" && node.className === "steps" ? { role: "list" } : {}),
      },
      node.tag === "br" ? undefined : children,
    );
  };
  return <>{nodes.map(render)}</>;
}
