import { getObject, providerServesLocalFiles } from "../../../../../lib/server/storage/index.js";
import { isSafeStorageKey, extensionForMime, ALLOWED_IMAGE_TYPES } from "../../../../../lib/server/storage/imageValidation.js";

// Serves files held by the local storage provider. Product images are public
// (the marketplace itself is public), so this route does not require a session,
// but it will only ever return a file whose key matches the strict pattern in
// isSafeStorageKey, and only for the extensions we accept on upload.

const CONTENT_TYPE_BY_EXTENSION = Object.entries(ALLOWED_IMAGE_TYPES).reduce(
  (map, [mime, ext]) => ({ ...map, [ext]: mime }),
  {}
);

export async function GET(request, { params }) {
  const { key: segments } = await params;
  const key = Array.isArray(segments) ? segments.join("/") : String(segments || "");

  if (!providerServesLocalFiles()) {
    // A remote provider hands out its own URLs; nothing is served from here.
    return new Response("Not found", { status: 404 });
  }

  if (!isSafeStorageKey(key)) {
    return new Response("Not found", { status: 404 });
  }

  const extension = key.split(".").pop().toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXTENSION[extension];
  if (!contentType || !extensionForMime(contentType)) {
    return new Response("Not found", { status: 404 });
  }

  const body = await getObject(key);
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      // Keys are random UUIDs, so a stored file is immutable once written.
      "X-Content-Type-Options": "nosniff"
    }
  });
}
