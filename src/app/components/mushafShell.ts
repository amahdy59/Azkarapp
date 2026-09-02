/**
 * The shape of a Mushaf reading surface, and the gates that depend on it.
 *
 * Extracted from the Khatmah reader so the surah reader can present the same
 * Mushaf: the same spread rule, the same rail rule, the same page pairing. Two
 * copies of these thresholds would be two Mushafs that disagree about when a
 * spread fits, which is exactly the drift the surah view already had.
 */
import { useEffect, useState } from "react";

/**
 * A spread is only worth showing when both pages still read comfortably.
 *
 * A Mushaf page is about two thirds as wide as it is tall, so two of them plus
 * a gutter need roughly 1.4x the height in width. Below that the pair would be
 * narrower than a single page is now, which trades legibility for novelty.
 */
export function fitsTwoPages(width: number, height: number) {
  return width >= 1024 && width / height >= 1.4;
}

/** The height the rail's controls occupy. Below this it would scroll, and a
 *  toolbar you have to scroll to reach is worse than one that fits. */
export const RAIL_CONTENT_HEIGHT = 530;

/**
 * Roughly the proportion of a printed Mushaf page, width over height.
 *
 * It decides which dimension the type is fitted to, and therefore whether the
 * reading type size can do anything at all. A reading area narrower than this
 * is *width-bound*: the line already runs margin to margin, so the only way to
 * set it larger would be fewer words per line — and the words on a line are
 * page data. Wider than this and the fit is height-bound, where the size
 * choice has room to act.
 */
export const PAPER_ASPECT = 0.62;

/** Height the two horizontal chrome bars take when they are the chrome. */
export const BARS_HEIGHT = 112;

/**
 * The shape of the reading surface, measured once so the gates that depend on
 * it cannot disagree mid-resize.
 */
export function measureShell() {
  if (typeof window === "undefined") {
    return { spreadRoom: false, rail: false, railCompact: false, pageAspect: 1 };
  }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const rail = fitsToolRail(width, height);
  const spreadRoom = fitsTwoPages(width, height);
  // What one page actually gets: the viewport less whichever chrome is showing,
  // halved when two pages share the width.
  const pageWidth = (width - (rail ? 72 : 0)) / (spreadRoom ? 2 : 1);
  const pageHeight = Math.max(1, height - (rail ? 0 : BARS_HEIGHT));
  return {
    spreadRoom,
    rail,
    railCompact: width < 1200,
    pageAspect: Number((pageWidth / pageHeight).toFixed(3)),
  };
}

/**
 * Where the tools stand.
 *
 * On a landscape screen the scarce dimension is height: the two horizontal
 * chrome bars cost 112px of it and need no width at all. Standing them in a
 * rail beside the paper returns that height to the page. Portrait screens keep
 * the bars, because there width is what is short.
 *
 * The width floor is the tablet breakpoint rather than a desktop one, but the
 * height floor is what actually decides it: a phone held sideways would need
 * the rail most and can hold it least, so it keeps the bars, where every
 * control is visible at once.
 */
export function fitsToolRail(width: number, height: number) {
  return width >= 768 && width > height && height >= RAIL_CONTENT_HEIGHT;
}

/** The right-hand page of a spread is the odd one: the Mushaf opens with page 1
 *  on the right, so pairs run (1,2), (3,4) and so on. */
export function spreadStart(page: number) {
  return page % 2 === 1 ? page : page - 1;
}

/**
 * One measurement driving both physical gates, shared by every Mushaf surface.
 *
 * Measuring once keeps the spread gate and the rail gate from disagreeing
 * mid-resize, and the identity comparison stops a resize storm from
 * re-rendering a page that has not actually changed shape.
 */
export function useMushafShell() {
  const [shell, setShell] = useState(() => measureShell());

  useEffect(() => {
    const measure = () =>
      setShell((current) => {
        const next = measureShell();
        return current.spreadRoom === next.spreadRoom &&
          current.rail === next.rail &&
          current.railCompact === next.railCompact &&
          current.pageAspect === next.pageAspect
          ? current
          : next;
      });
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  return shell;
}
