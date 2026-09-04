import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const report = body.soil_report || {};
    const ph = report.ph ?? 6.5;
    const nitrogen = report.nitrogen_ppm ?? 30;
    const iron = report.iron_ppm ?? 5;

    const phScore = 100 - Math.abs(ph - 6.5) * 20;
    const score = Math.max(0, Math.min(100, Math.round((phScore + nitrogen / 2 + iron * 3) / 3)));
    const quality = score >= 80 ? "excellent" : score >= 60 ? "good" : "developing";

    return ok({
      soil_health_score: score,
      consumer_message: `This ${body.crop || "crop"} is grown in ${quality} quality soil.`
    });
  });
}
