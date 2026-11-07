// Older Android WebViews (for example Chromium 91) do not provide
// Array.prototype.at. This file is loaded before the application module graph
// so startup code can safely use the modern API on those devices.
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", {
    configurable: true,
    value(index) {
      const length = this.length >>> 0;
      let position = Math.trunc(Number(index) || 0);
      if (position < 0) position += length;
      return position < 0 || position >= length ? undefined : this[position];
    },
  });
}
