import * as Popover from "@radix-ui/react-popover";
import { useSafeAreaCollisionPadding } from "../hooks/useSafeAreaCollisionPadding";
import { createPortal } from "react-dom";
import { useLayoutEffect, useState, type ComponentPropsWithoutRef, type MutableRefObject } from "react";

/** The CSS sentinel follows the actual canvas and enlarged rem-based controls. */
export function useAudioOptionsDock(host: HTMLElement | null) {
  const [available, setAvailable] = useState(false);
  useLayoutEffect(() => {
    if (!host || typeof ResizeObserver === "undefined") {
      setAvailable(false);
      return;
    }
    const measure = () => setAvailable(host.getBoundingClientRect().width > 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [host]);
  return available;
}

/** One options body: an ordinary desktop landmark or a protected anchored popup. */
export function AudioOptionsSurface({
  docked,
  panelRef,
  dockHost,
  children,
  collisionPadding = 8,
  ...props
}: ComponentPropsWithoutRef<typeof Popover.Content> & {
  docked: boolean;
  panelRef: MutableRefObject<HTMLElement | null>;
  dockHost?: HTMLElement | null;
}) {
  const safePadding = useSafeAreaCollisionPadding(collisionPadding);
  if (docked) {
    const sidebar = (
      <aside
        ref={(element) => {
          panelRef.current = element;
        }}
        className="audio-options-sidebar audio-options-menu"
        id={props.id}
        aria-label={props["aria-label"]}
        dir={props.dir}
        data-testid="audio-options-sidebar"
        data-dropdown-surface=""
      >
        {children}
      </aside>
    );
    return dockHost ? createPortal(sidebar, dockHost) : sidebar;
  }
  return (
    <Popover.Portal>
      <Popover.Content
        {...props}
        collisionPadding={props.collisionBoundary ? collisionPadding : safePadding}
        ref={(element) => {
          panelRef.current = element;
        }}
      >
        {children}
      </Popover.Content>
    </Popover.Portal>
  );
}
