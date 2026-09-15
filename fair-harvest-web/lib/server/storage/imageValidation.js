// Pure validation rules for product image uploads. Deliberately dependency-free
// (no Prisma, no next/server, no node:fs) so it can be unit-tested with plain
// `node --test`, in the same way as reputation.js and reviewEligibility.js.

export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB

// Only formats every modern browser can display without a polyfill. SVG is
// deliberately excluded: it can carry script, and we serve uploads from our own
// origin.
export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export function allowedMimeList() {
  return Object.keys(ALLOWED_IMAGE_TYPES);
}

export function extensionForMime(mimeType) {
  return ALLOWED_IMAGE_TYPES[mimeType] || null;
}

/**
 * Decide whether an uploaded file may be stored.
 * Returns { ok: true, extension } or { ok: false, reason, message }.
 */
export function validateImageUpload({ mimeType, size } = {}) {
  if (!mimeType) {
    return { ok: false, reason: "missing_type", message: "No file was received" };
  }

  // A browser may send "image/jpeg; charset=..." — compare the type only.
  const normalized = String(mimeType).split(";")[0].trim().toLowerCase();
  const extension = extensionForMime(normalized);

  if (!extension) {
    return {
      ok: false,
      reason: "unsupported_type",
      message: "Only JPG, PNG and WebP images are supported"
    };
  }

  if (typeof size !== "number" || Number.isNaN(size) || size <= 0) {
    return { ok: false, reason: "empty_file", message: "The selected file is empty" };
  }

  if (size > MAX_IMAGE_BYTES) {
    const mb = (MAX_IMAGE_BYTES / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      reason: "too_large",
      message: `Image must be smaller than ${mb} MB`
    };
  }

  return { ok: true, extension };
}

/**
 * Storage keys are generated server-side, never taken from the client filename,
 * so a crafted name cannot escape the upload directory.
 */
export function buildStorageKey({ prefix = "products", id, extension }) {
  const safePrefix = String(prefix).replace(/[^a-z0-9-]/gi, "");
  return `${safePrefix}/${id}.${extension}`;
}

/**
 * Guard for the download route: a key must be a simple relative path with no
 * traversal segments.
 */
export function isSafeStorageKey(key) {
  if (typeof key !== "string" || key.length === 0 || key.length > 200) return false;
  if (key.includes("..") || key.startsWith("/") || key.includes("\\")) return false;
  return /^[A-Za-z0-9/_-]+\.[A-Za-z0-9]+$/.test(key);
}
