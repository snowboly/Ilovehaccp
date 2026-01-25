// src/lib/builder/utils/withTimeoutFetch.ts
// A small helper to ensure fetch never hangs indefinitely.
// Works in both browser and Node runtimes (no `window.*` usage).

export type TimeoutFetchResult = {
  response: Response;
  didTimeout: boolean;
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 12_000
): Promise<TimeoutFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return { response, didTimeout: false };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      // Surface as a timeout so callers can set clean UI error state.
      return Promise.reject(Object.assign(new Error("FetchTimeout"), { name: "FetchTimeout" }));
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

