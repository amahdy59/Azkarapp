/** Wide Settings uses an outer scroll pane; phones use the panel's own viewport. */
export function getScrollViewport(element: HTMLElement): HTMLElement {
  for (let current: HTMLElement | null = element; current; current = current.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(current).overflowY) && current.scrollHeight > current.clientHeight) {
      return current;
    }
  }
  return element;
}
