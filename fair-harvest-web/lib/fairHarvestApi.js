import { FairHarvestClient } from "@fair-harvest/sdk";

// Same-origin by default: this SDK talks to this same Next.js app's own
// /api/v1 routes, not a separate backend service.
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// An empty base leaves every path relative ("/api/v1/..."), which the browser
// resolves against the page origin. On the server there is no origin to
// resolve against, and during `next build` the app's own HTTP routes are not
// listening yet, so such a request cannot be answered.
const hasAbsoluteBase = /^https?:\/\//i.test(baseUrl);
const isServer = typeof window === "undefined";

// A request that never settles would hang static generation until the build
// times out, so cap it. Only the homepage uses this client, and it renders a
// fallback for every call, so a slow module degrades to its preview value
// instead of blocking the page.
const REQUEST_TIMEOUT_MS = 5000;

function fetchWithTimeout(input, init = {}) {
  return fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}

export const fairHarvestApi = new FairHarvestClient({
  baseUrl,
  fetchImpl: fetchWithTimeout
});

export async function safeApi(call, fallback) {
  // Server-side with only a relative base: the app cannot call itself over
  // HTTP, so use the fallback rather than issue a request that cannot resolve.
  // Set NEXT_PUBLIC_API_BASE_URL to a reachable absolute origin to fetch live
  // values during server rendering.
  if (isServer && !hasAbsoluteBase) return fallback;

  try {
    return await call();
  } catch {
    return fallback;
  }
}
