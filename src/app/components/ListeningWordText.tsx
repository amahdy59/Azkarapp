import type { ListeningWordTiming } from "../audio/listeningTimings";
import { Fragment, useMemo } from "react";

/** Pure presentation: preserves the exact string, direction and inherited Quran font. */
export function ListeningWordText({ text, cue }: { text: string; cue: ListeningWordTiming | null }) {
  const tokens = useMemo(() => [...text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu)], [text]);
  return (
    <>
      {tokens.map((token, index) => {
        const active = cue?.startOffset === token.index && cue.endOffset === token.index + token[0].length;
        const previous = tokens[index - 1];
        return (
          <Fragment key={token.index}>
            {text.slice(previous ? previous.index + previous[0].length : 0, token.index)}
            <span
              aria-current={active ? "true" : undefined}
              data-listening-word={active ? "" : undefined}
              style={
                active
                  ? {
                      textDecoration: "underline",
                      textDecorationThickness: "0.12em",
                      textUnderlineOffset: "0.18em",
                      borderRadius: "0.15em",
                      outline: "1px solid currentColor",
                      outlineOffset: "2px",
                    }
                  : undefined
              }
            >
              {token[0]}
            </span>
          </Fragment>
        );
      })}
      {text.slice(tokens.length ? tokens.at(-1)!.index + tokens.at(-1)![0].length : 0)}
    </>
  );
}
