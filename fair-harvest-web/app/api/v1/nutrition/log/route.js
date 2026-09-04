import { z } from "zod";
import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";

const schema = z.object({
  meal_type: z.string().min(1),
  food_items: z.array(z.string()).optional(),
  date: z.string().optional()
});

export async function POST(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    const body = await request.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid meal log", 422);

    await prisma.rewardsLedger.create({ data: { userId: session.userId, points: 8, reason: "Meal log" } });

    return ok({ logged: true, meal_type: parsed.data.meal_type }, { message: "Meal logged" });
  });
}
