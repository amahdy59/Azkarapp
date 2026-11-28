/* global document, window, getComputedStyle, innerWidth, innerHeight, devicePixelRatio, visualViewport */
(() => {
  const style = getComputedStyle(document.documentElement);
  const bounds = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const css = getComputedStyle(node);
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      padding: [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft],
    };
  };
  return {
    viewport: [innerWidth, innerHeight, devicePixelRatio],
    visualViewport: window.visualViewport
      ? [
          visualViewport.offsetLeft,
          visualViewport.offsetTop,
          visualViewport.width,
          visualViewport.height,
          visualViewport.scale,
        ]
      : null,
    provided: ["top", "right", "bottom", "left"].map((edge) =>
      style.getPropertyValue(`--safe-area-inset-${edge}`).trim(),
    ),
    resolved: ["top", "right", "bottom", "left"].map((edge) =>
      style.getPropertyValue(`--app-safe-area-${edge}`).trim(),
    ),
    shell: bounds(".app-shell"),
    header: bounds(".home-page-header, .shared-screen-header, .mushaf-control-band--top"),
    navigation: bounds(".bottom-nav"),
    immersiveFooter: bounds(".mushaf-control-band--bottom, .screen-chrome-footer"),
  };
})();
