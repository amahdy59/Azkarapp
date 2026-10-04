import { useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";

/** Slide the reading text like a light sheet, without moving its surrounding controls. */
export function ReadingTextTransition({
  entryId,
  index,
  direction,
  reduceMotion,
  className,
  children,
}: {
  entryId: string;
  index: number;
  direction: "ltr" | "rtl";
  reduceMotion: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [position, setPosition] = useState({ entryId, index, sign: 1 });
  if (position.entryId !== entryId) {
    setPosition({ entryId, index, sign: (index >= position.index ? 1 : -1) * (direction === "rtl" ? -1 : 1) });
  }

  return (
    <div className={className} data-testid="reading-text-transition" data-direction={position.sign}>
      <AnimatePresence initial={false} mode="wait" custom={position.sign}>
        <ReadingTextFrame key={entryId} sign={position.sign} reduceMotion={reduceMotion}>
          {children}
        </ReadingTextFrame>
      </AnimatePresence>
    </div>
  );
}

function ReadingTextFrame({
  sign,
  reduceMotion,
  children,
}: {
  sign: number;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      custom={sign}
      variants={{
        enter: (sign: number) => ({ x: reduceMotion ? 0 : sign * 28, opacity: reduceMotion ? 1 : 0 }),
        visible: { x: 0, opacity: 1, transition: { duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] } },
        exit: (sign: number) => ({
          x: reduceMotion ? 0 : -sign * 20,
          opacity: reduceMotion ? 1 : 0,
          transition: { duration: reduceMotion ? 0 : 0.1, ease: [0.4, 0, 1, 1] },
        }),
      }}
      initial="enter"
      animate="visible"
      exit="exit"
      className="w-full"
      {...(isPresent ? {} : { inert: "", "aria-hidden": true as const, "data-prevent-count": "true" })}
    >
      {children}
    </motion.div>
  );
}
