import { Fragment } from "react";
import type { AppLanguage } from "../types";
import { AyahMarker } from "./AyahMarker";

/** Only explicit reviewed numeric verse markers become ornaments; text stays exact. */
export function QuranVerseText({ text, language }: { text: string; language: AppLanguage }) {
  const markers = [...text.matchAll(/﴿([٠-٩0-9]+)﴾/gu)];
  let offset = 0;
  return (
    <>
      {markers.map((marker) => {
        const before = text.slice(offset, marker.index);
        offset = marker.index + marker[0].length;
        const number = marker[1]!.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
        return (
          <Fragment key={marker.index}>
            {before}
            <span aria-hidden="true">
              <AyahMarker number={number} language={language} />
            </span>
            <span className="sr-only">{marker[0]}</span>
          </Fragment>
        );
      })}
      {text.slice(offset)}
    </>
  );
}
