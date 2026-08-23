import { FairHarvestClient } from "@fair-harvest/sdk";

export const fairHarvestApi = new FairHarvestClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"
});

export async function safeApi(call, fallback) {
  try {
    return await call();
  } catch {
    return fallback;
  }
}
