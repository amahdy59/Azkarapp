export async function fetchNativeBinaryResource(url: string, signal?: AbortSignal, init: RequestInit = {}) {
  return fetch(url, { ...init, signal });
}

export const fetchMushafResource = fetchNativeBinaryResource;
