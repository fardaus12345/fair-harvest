import { ok, handleRoute } from "../../../../../lib/server/respond.js";

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const lab = body.lab_reports || {};
    const glucose = lab.fasting_glucose ?? 90;
    const systolicBp = lab.systolic_bp ?? 118;

    const riskPercent = Math.max(5, Math.min(95, Math.round((glucose - 80) * 0.8 + (systolicBp - 110) * 0.5)));

    return ok({
      risk_indicators: [{ condition: "pre_diabetic_risk", risk_percent: riskPercent }],
      preventive_food_recommendations: ["spinach", "lentils", "oats"],
      doctor_consultation_recommended: riskPercent > 50
    });
  });
}
