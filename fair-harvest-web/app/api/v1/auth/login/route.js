import { z } from "zod";
import { prisma } from "../../../../../lib/server/db.js";
import { verifyPassword, signToken } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { toPublicUser } from "../../../../../lib/server/serializers.js";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required")
});

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message || "Invalid login data", 422);
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email }, include: { farmerProfile: true } });
    if (!user || user.status === "SUSPENDED") throw new ApiError("Invalid email or password", 401);

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) throw new ApiError("Invalid email or password", 401);

    const token = signToken(user);
    return ok({ access_token: token, token, user: toPublicUser(user) }, { message: "Logged in" });
  });
}
