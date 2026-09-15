import { randomUUID } from "node:crypto";
import { prisma } from "../../../../../lib/server/db.js";
import { requireUser } from "../../../../../lib/server/auth.js";
import { ok, handleRoute, ApiError } from "../../../../../lib/server/respond.js";
import { enforceRateLimit } from "../../../../../lib/server/rateLimit.js";
import { putObject } from "../../../../../lib/server/storage/index.js";
import {
  validateImageUpload,
  buildStorageKey,
  MAX_IMAGE_BYTES,
  allowedMimeList
} from "../../../../../lib/server/storage/imageValidation.js";

// Uploads a product image and returns its URL. The URL is not attached to a
// product here: the caller passes it as image_url when creating or updating the
// product, which keeps this usable from the "add product" form where no product
// id exists yet. Ownership of the product is enforced by those routes.
//
// Only a verified farmer or an admin may upload, so an arbitrary logged-in
// customer cannot use the platform as file hosting.
export async function POST(request) {
  return handleRoute(async () => {
    const session = requireUser(request);
    enforceRateLimit(request, "product-image-upload", { max: 20, windowMs: 60_000 });

    if (session.role !== "ADMIN") {
      if (session.role !== "FARMER") {
        throw new ApiError("Only farmers and administrators can upload product images", 403);
      }
      const profile = await prisma.farmerProfile.findUnique({ where: { userId: session.userId } });
      if (!profile) throw new ApiError("Farmer profile not found", 404);
      if (profile.verificationStatus !== "VERIFIED") {
        throw new ApiError("Only verified farmers can upload product images", 403);
      }
    }

    let form;
    try {
      form = await request.formData();
    } catch {
      throw new ApiError("Expected a multipart form upload", 400);
    }

    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new ApiError("No file was provided", 422);
    }

    const verdict = validateImageUpload({ mimeType: file.type, size: file.size });
    if (!verdict.ok) throw new ApiError(verdict.message, 422);

    const buffer = Buffer.from(await file.arrayBuffer());
    // Re-check the real byte length: file.size is client-reported metadata.
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new ApiError("Image must be smaller than 3 MB", 422);
    }

    const key = buildStorageKey({ prefix: "products", id: randomUUID(), extension: verdict.extension });
    const stored = await putObject({ key, buffer, contentType: file.type });

    return ok(
      { image_url: stored.url, key: stored.key, content_type: file.type, bytes: buffer.byteLength },
      { message: "Image uploaded", status: 201 }
    );
  });
}

export async function GET() {
  return handleRoute(async () => {
    return ok({ max_bytes: MAX_IMAGE_BYTES, allowed_types: allowedMimeList() });
  });
}
