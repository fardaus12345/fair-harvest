import { z } from "zod";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { computeDailyCalories, recommendedFoodsFor, buildWeeklyPlan } from "../../../../../lib/server/heuristics/nutrition.js";

const schema = z.object({
  age: z.coerce.number().positive(),
  weight: z.coerce.number().positive(),
  conditions: z.array(z.string()).optional(),
  goal: z.string().optional()
});

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid nutrition profile", 422);
    const { age, weight, conditions = [], goal = "maintenance" } = parsed.data;

    const dailyCalories = computeDailyCalories({ age, weight, goal });
    const recommendedFoods = recommendedFoodsFor(conditions);
    const weeklyPlan = buildWeeklyPlan();

    return ok({
      daily_calorie_target: dailyCalories,
      calorie_target: dailyCalories,
      recommended_foods: recommendedFoods,
      personalized_food_list: [{ foods: recommendedFoods }],
      weekly_meal_plan: weeklyPlan,
      meal_plan: weeklyPlan
    });
  });
}
