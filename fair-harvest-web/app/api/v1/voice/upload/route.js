import { ok, handleRoute } from "../../../../../lib/server/respond.js";

// Canned demo transcript - no real speech-to-text integration exists in this
// project; the Bangla Voice Workflow UI has always been a mockup.
export async function POST() {
  return handleRoute(async () =>
    ok({
      transcript_bangla: "আমার পালং শাকের দাম ১২০ টাকা কেজি",
      transcript_english: "My spinach price is 120 taka per kg",
      action_taken: "price_updated"
    })
  );
}
