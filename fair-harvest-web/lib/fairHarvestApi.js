import { FairHarvestClient } from "@fair-harvest/sdk";

// Same-origin by default: this SDK talks to this same Next.js app's own
// /api/v1 routes, not a separate backend service.
export const fairHarvestApi = new FairHarvestClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || ""
});

export async function safeApi(call, fallback) {
  try {
    return await call();
  } catch {
    return fallback;
  }
}
