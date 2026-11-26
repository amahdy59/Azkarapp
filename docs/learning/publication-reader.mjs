/** Embedded in standalone HTML; persistence stays behind the injected adapter. */
export function startPublicationReader(normalize, createStore, storage) {
  const document = globalThis.document;
  const store = createStore(storage());
  let preferences = normalize(store.load());
  const toolbar = document.querySelector(".reader-tools");
  const minus = document.querySelector('[data-size="minus"]');
  const plus = document.querySelector('[data-size="plus"]');
  const download = document.querySelector("#pdf-link");
  const saveStatus = document.querySelector("#preference-status");
  const openers = new Map();

  function update(save = false) {
    preferences = normalize(preferences);
    document.documentElement.dataset.theme = preferences.appearance;
    document.documentElement.style.setProperty("--reading-scale", preferences.size);
    document.querySelector("#size-value").textContent = Math.round(preferences.size * 100) + "%";
    minus.disabled = preferences.size <= 1;
    plus.disabled = preferences.size >= 2;
    for (const input of document.querySelectorAll('[name="theme"]'))
      input.checked = input.value === preferences.appearance;
    download.href = document.body.dataset.publicationId + "-english-" + preferences.appearance + ".pdf";
    download.querySelector("span").textContent =
      "Download " + preferences.appearance[0].toUpperCase() + preferences.appearance.slice(1) + " PDF";
    if (save)
      saveStatus.textContent = store.save(preferences)
        ? "Reading options saved on this device."
        : "Options apply for this visit. Saving on this device is unavailable.";
  }

  function closeDialog(dialog) {
    if (dialog.open) dialog.close();
  }

  for (const opener of document.querySelectorAll("[data-open-dialog]")) {
    opener.addEventListener("click", () => {
      const dialog = document.getElementById(opener.dataset.openDialog);
      openers.set(dialog, opener);
      opener.setAttribute("aria-expanded", "true");
      dialog.showModal();
      dialog.style.setProperty(
        "--dialog-header-height",
        dialog.querySelector(".dialog-heading").getBoundingClientRect().height + "px",
      );
    });
  }
  for (const dialog of document.querySelectorAll("dialog.reader-dialog")) {
    dialog.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const nodes = [
        ...dialog.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]"),
      ].filter(
        (node) =>
          node.tabIndex >= 0 &&
          node.getClientRects().length &&
          !(
            node.type === "radio" &&
            !node.checked &&
            [...dialog.querySelectorAll('input[type="radio"]')].some(
              (radio) => radio.name === node.name && radio.checked,
            )
          ),
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    });
    if (globalThis.ResizeObserver)
      new globalThis.ResizeObserver(() => {
        if (dialog.open)
          dialog.style.setProperty(
            "--dialog-header-height",
            dialog.querySelector(".dialog-heading").getBoundingClientRect().height + "px",
          );
      }).observe(dialog.querySelector(".dialog-heading"));
    dialog.querySelector("[data-close-dialog]").addEventListener("click", () => closeDialog(dialog));
    dialog.addEventListener("close", () => {
      const opener = openers.get(dialog);
      opener?.setAttribute("aria-expanded", "false");
      opener?.focus({ preventScroll: true });
    });
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        closeDialog(dialog);
    });
    for (const link of dialog.querySelectorAll('a[href^="#"]'))
      link.addEventListener("click", (event) => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = document.getElementById(link.hash.slice(1));
        if (!target) return;
        event.preventDefault();
        openers.get(dialog)?.setAttribute("aria-expanded", "false");
        openers.delete(dialog);
        closeDialog(dialog);
        globalThis.history.replaceState(null, "", link.hash);
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start" });
      });
  }
  for (const link of document.querySelectorAll('a[href="#about-this-edition"]'))
    link.addEventListener("click", () => {
      document.getElementById("about-this-edition").open = true;
    });
  minus.addEventListener("click", () => {
    preferences.size = Math.max(1, preferences.size - 0.25);
    update(true);
  });
  plus.addEventListener("click", () => {
    preferences.size = Math.min(2, preferences.size + 0.25);
    update(true);
  });
  for (const radio of document.querySelectorAll('[name="theme"]'))
    radio.addEventListener("change", () => {
      preferences.appearance = radio.value;
      update(true);
    });
  const measureToolbar = () =>
    document.documentElement.style.setProperty(
      "--reader-toolbar-height",
      toolbar.getBoundingClientRect().height + "px",
    );
  if (globalThis.ResizeObserver) new globalThis.ResizeObserver(measureToolbar).observe(toolbar);
  globalThis.addEventListener("resize", measureToolbar);
  document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!target.matches("a,button,input,select,summary") || toolbar.contains(target)) return;
    const dialog = target.closest("dialog[open]");
    if (dialog && dialog.querySelector(".dialog-heading").contains(target)) return;
    const bounds = target.getBoundingClientRect();
    const top = dialog
      ? dialog.querySelector(".dialog-heading").getBoundingClientRect().bottom
      : toolbar.getBoundingClientRect().bottom;
    const bottom = dialog ? dialog.getBoundingClientRect().bottom : globalThis.innerHeight;
    if (bounds.top < top + 4 || bounds.bottom > bottom - 4) target.scrollIntoView({ block: "center" });
  });
  measureToolbar();
  update();
}
