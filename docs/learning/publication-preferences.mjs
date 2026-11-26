/** Standalone-document settings only. App readers continue using app state. */
export function normalizePublicationPreferences(value) {
  const appearances = ["light", "dark", "navy"];
  const sizes = [1, 1.25, 1.5, 1.75, 2];
  const source = value && typeof value === "object" && value.schema === 1 ? value : {};
  return {
    schema: 1,
    appearance: appearances.includes(source.appearance) ? source.appearance : "light",
    size: sizes.includes(source.size) ? source.size : 1,
  };
}

export function createPublicationPreferenceStore(storage) {
  const key = "azkar.document-reader.v1";
  return {
    load() {
      try {
        const text = storage?.getItem(key);
        return normalizePublicationPreferences(
          typeof text === "string" && text.length < 1024 ? JSON.parse(text) : null,
        );
      } catch {
        return normalizePublicationPreferences(null);
      }
    },
    save(value) {
      try {
        if (!storage) return false;
        storage.setItem(key, JSON.stringify(normalizePublicationPreferences(value)));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export function publicationStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function applyPublicationPreferences(normalize, createStore, storage) {
  const value = createStore(storage()).load();
  const preferences = normalize(value);
  globalThis.document.documentElement.dataset.theme = preferences.appearance;
  globalThis.document.documentElement.style.setProperty("--reading-scale", preferences.size);
}
