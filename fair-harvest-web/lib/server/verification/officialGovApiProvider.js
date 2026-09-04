// Stub for the future official Government Farmer Card API. Returns the same
// normalized shape as demoRegistryProvider.js so the route handler, the
// database schema, and the frontend never need to change when this is
// switched on via VERIFICATION_PROVIDER=official — only this file gets a
// real endpoint and credentials.
export async function verifyWithOfficialGovApi({ cardNumber, nidNumber, name }) {
  const baseUrl = process.env.GOV_API_BASE_URL;

  if (!baseUrl) {
    return { matched: false, confidence: 0, record: null, reason: "official_provider_not_configured" };
  }

  try {
    // TODO: replace with the real Government Farmer Card verification
    // endpoint and request/response shape once it is available.
    const response = await fetch(`${baseUrl}/farmer-cards/${encodeURIComponent(cardNumber)}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GOV_API_KEY || ""}`
      },
      body: JSON.stringify({ nid_number: nidNumber, full_name: name })
    });

    if (!response.ok) {
      return { matched: false, confidence: 0, record: null, reason: "official_provider_error" };
    }

    const payload = await response.json();
    return {
      matched: payload.valid === true,
      confidence: typeof payload.confidence === "number" ? payload.confidence : payload.valid ? 1 : 0,
      record: payload.record || null,
      reason: payload.valid ? "matched" : "details_mismatch"
    };
  } catch {
    return { matched: false, confidence: 0, record: null, reason: "official_provider_unreachable" };
  }
}
