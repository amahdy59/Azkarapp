import { useId, type ReactNode } from "react";
import { learningT } from "../i18n/learning";

/** Fixed source-verified geometry, never executable SVG from a content pack. */
export function LearningDiagram({
  kind,
  title,
  description,
  children,
  language = "en",
}: {
  kind: "tawaf" | "sai";
  title: string;
  description: string;
  children: ReactNode;
  language?: "ar" | "en";
}) {
  const id = useId().replaceAll(":", "");
  const marker = `${id}-arrow`;
  return (
    <figure className="learn-diagram" data-diagram={kind}>
      <h3 id={`${id}-title`}>{title}</h3>
      <svg
        viewBox={kind === "tawaf" ? "0 0 400 250" : "0 0 400 310"}
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        focusable="false"
        lang={language}
      >
        <desc id={`${id}-description`}>{description}</desc>
        <defs>
          <marker
            id={marker}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10Z" fill="currentColor" />
          </marker>
        </defs>
        {kind === "tawaf" ? (
          <>
            <path
              className="learn-diagram-route"
              d="M253.74 178.74 A76 76 0 1 0 238 190.82"
              markerEnd={`url(#${marker})`}
            />
            <path className="learn-diagram-house" d="M173 98h54v54h-54Z" />
            <path d="M173 111h54" className="learn-diagram-detail" />
            <circle cx="227" cy="152" r="4" className="learn-diagram-point" />
            <path d="m231 156 26 26" className="learn-diagram-detail" />
            <text x="200" y="136" textAnchor="middle">
              {learningT(language, "diagramKaaba")}
            </text>
            <text x="200" y="23" textAnchor="middle" fontWeight="700">
              {learningT(language, "diagramTawafCount")}
            </text>
            <text x="267" y="196">
              {learningT(language, "diagramStartAt")}
            </text>
            <text x="267" y="216">
              {learningT(language, "diagramBlackStone")}
            </text>
          </>
        ) : (
          <>
            <text x="58" y="24" textAnchor="middle" fontWeight="700">
              {learningT(language, "diagramSafa")}
            </text>
            <text x="342" y="24" textAnchor="middle" fontWeight="700">
              {learningT(language, "diagramMarwah")}
            </text>
            {Array.from({ length: 7 }, (_, index) => {
              const y = 52 + index * 33;
              const forward = index % 2 === 0;
              return (
                <g key={index}>
                  <path
                    className="learn-diagram-route"
                    data-passage={index + 1}
                    d={`M${forward ? 70 : 330} ${y}H${forward ? 330 : 70}`}
                    markerEnd={`url(#${marker})`}
                  />
                  <circle className="learn-diagram-count" cx="200" cy={y} r="13" />
                  <text x="200" y={y + 5} textAnchor="middle">
                    {language === "ar"
                      ? String(index + 1).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]!)
                      : index + 1}
                  </text>
                </g>
              );
            })}
            <text x="58" y="301" textAnchor="middle">
              {learningT(language, "diagramStart")}
            </text>
            <text x="342" y="301" textAnchor="middle">
              {learningT(language, "diagramFinish")}
            </text>
          </>
        )}
      </svg>
      <p className="learn-diagram-description">{description}</p>
      <figcaption>{children}</figcaption>
    </figure>
  );
}
