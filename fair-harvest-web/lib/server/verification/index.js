import { verifyWithDemoRegistry } from "./demoRegistryProvider.js";
import { verifyWithOfficialGovApi } from "./officialGovApiProvider.js";

export function getVerificationProviderName() {
  return process.env.VERIFICATION_PROVIDER === "official" ? "official" : "demo";
}

// Single entry point every route handler calls. Swapping VERIFICATION_PROVIDER
// changes which registry backs this without touching the caller, the schema,
// or the frontend.
export async function verifyFarmerCard(input) {
  const provider = getVerificationProviderName();
  const result = provider === "official" ? await verifyWithOfficialGovApi(input) : await verifyWithDemoRegistry(input);
  return { ...result, provider };
}
