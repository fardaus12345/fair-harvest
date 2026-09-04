import { z } from "zod";
import { prisma } from "../../../../../lib/server/db.js";
import { hashPassword, signToken } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { toPublicUser } from "../../../../../lib/server/serializers.js";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["consumer", "farmer"]).default("consumer")
});

export async function POST(request) {
  return handleRoute(async () => {
    const body = await request.json().catch(() => ({}));
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(parsed.error.issues[0]?.message || "Invalid registration data", 422);
    }
    const { name, email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError("An account with this email already exists", 409);

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role.toUpperCase(),
        ...(role === "farmer" ? { farmerProfile: { create: {} } } : {})
      },
      include: { farmerProfile: true }
    });

    const token = signToken(user);
    return ok({ access_token: token, token, user: toPublicUser(user) }, { message: "Account created", status: 201 });
  });
}
