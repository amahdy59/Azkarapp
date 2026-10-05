import { Fragment, useEffect, useState, type ReactNode } from "react";
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
  const [position, setPosition] = useState({
    entryId,
    index,
    sign: 1,
    moving: false,
    interrupted: false,
    generation: 0,
  });
  if (position.entryId !== entryId) {
    const interrupted = position.moving || position.interrupted;
    setPosition({
      entryId,
      index,
      sign: (index >= position.index ? 1 : -1) * (direction === "rtl" ? -1 : 1),
      moving: !reduceMotion && !interrupted,
      interrupted,
      generation: position.generation + (interrupted ? 1 : 0),
    });
  }

  // Once interrupted, every further choice in the burst is immediate. Resume
  // ordinary motion only after one complete exit/arrival interval without input.
  useEffect(() => {
    if (!position.interrupted) return;
    const timer = window.setTimeout(() => setPosition((current) => ({ ...current, interrupted: false })), 340);
    return () => window.clearTimeout(timer);
  }, [entryId, position.interrupted]);

  return (
    <div className={className} data-testid="reading-text-transition" data-direction={position.sign}>
      <AnimatePresence
        key={reduceMotion ? "reduced" : position.generation}
        initial={false}
        mode="wait"
        custom={position.sign}
      >
        <ReadingTextFrame
          key={reduceMotion ? "stable" : entryId}
          entryId={entryId}
          sign={position.sign}
          reduceMotion={reduceMotion}
          onSettled={() =>
            setPosition((current) =>
              current.entryId === entryId && current.moving ? { ...current, moving: false } : current,
            )
          }
        >
          {children}
        </ReadingTextFrame>
      </AnimatePresence>
    </div>
  );
}

function ReadingTextFrame({
  entryId,
  sign,
  reduceMotion,
  children,
  onSettled,
}: {
  entryId: string;
  sign: number;
  reduceMotion: boolean;
  children: ReactNode;
  onSettled: () => void;
}) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      data-reading-entry={entryId}
      onAnimationComplete={(definition) => {
        if (definition === "visible") onSettled();
      }}
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
      <Fragment key={entryId}>{children}</Fragment>
    </motion.div>
  );
}
