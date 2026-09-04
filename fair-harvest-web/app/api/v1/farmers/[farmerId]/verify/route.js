import { z } from "zod";
import { prisma } from "../../../../../../lib/server/db.js";
import { requireOwnerOrRole } from "../../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../../lib/server/respond.js";
import { toPublicFarmerProfile } from "../../../../../../lib/server/serializers.js";
import { verifyFarmerCard } from "../../../../../../lib/server/verification/index.js";

const verifySchema = z.object({
  farmer_card_number: z.string().min(1, "Farmer Card number is required"),
  nid_number: z.string().min(1, "NID number is required"),
  name: z.string().min(1, "Name is required")
});

export async function POST(request, { params }) {
  return handleRoute(async () => {
    const { farmerId } = await params;
    const profile = await prisma.farmerProfile.findUnique({ where: { id: farmerId }, include: { user: true } });
    if (!profile) throw new ApiError("Farmer profile not found", 404);

    requireOwnerOrRole(request, profile.userId, ["ADMIN"]);

    const body = await request.json().catch(() => ({}));
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) throw new ApiError(parsed.error.issues[0]?.message || "Invalid verification data", 422);
    const { farmer_card_number: cardNumber, nid_number: nidNumber, name } = parsed.data;

    const result = await verifyFarmerCard({ cardNumber, nidNumber, name });

    const updated = await prisma.farmerProfile.update({
      where: { id: farmerId },
      data: {
        farmerCardNumber: cardNumber,
        nidNumber,
        district: result.record?.district ?? profile.district,
        verificationStatus: result.matched ? "VERIFIED" : "PENDING",
        verificationMethod: result.matched ? (result.provider === "official" ? "OFFICIAL_API" : "DEMO_REGISTRY") : "MANUAL",
        verifiedAt: result.matched ? new Date() : null
      },
      include: { user: true }
    });

    return ok(
      { farmer: toPublicFarmerProfile(updated), matched: result.matched, reason: result.reason },
      { message: result.matched ? "Farmer Card verified" : "Submitted for manual review" }
    );
  });
}
