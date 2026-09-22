import { put, del } from "@vercel/blob";

// Production object storage, backed by Vercel Blob.
//
// It returns the same shape as localDiskProvider.js, so switching
// STORAGE_PROVIDER changes where bytes live without touching the upload route,
// the Product schema or any frontend component. The database only ever stores
// the URL this returns.
//
// Serverless filesystems are read-only outside /tmp and are discarded between
// invocations, so the local provider cannot be used in a deployed environment;
// this is what replaces it.

function requireToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    const error = new Error(
      "STORAGE_PROVIDER=object but BLOB_READ_WRITE_TOKEN is not set. Add the Vercel Blob " +
        "store to the project (it injects the token automatically), or set STORAGE_PROVIDER=local " +
        "for development."
    );
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }
  return token;
}

export async function putObject({ key, buffer, contentType }) {
  const blob = await put(key, buffer, {
    access: "public",
    contentType,
    token: requireToken(),
    // The key already ends in a random UUID from buildStorageKey, so the
    // suffix Vercel would otherwise append is redundant and would make the
    // stored URL no longer derivable from the key.
    addRandomSuffix: false
  });
  return { key, url: blob.url };
}

export async function getObject() {
  // Blobs are served to the browser straight from the Vercel CDN using the
  // absolute URL stored on the product, so nothing is streamed back through
  // our own route. servesLocalFiles = false makes that route return 404.
  return null;
}

export async function deleteObject(key) {
  const base = publicBaseUrl();
  if (!base) return false;
  try {
    await del(`${base}/${key}`, { token: requireToken() });
    return true;
  } catch {
    // Already gone, or never existed - removing an absent object is not an error.
    return false;
  }
}

/**
 * Public base URL of the blob store, without a trailing slash.
 *
 * Deleting a blob needs its URL rather than its key, and a product row may
 * have been written by an earlier deployment, so the base is configured
 * explicitly rather than remembered per upload.
 */
export function publicBaseUrl() {
  const configured = process.env.BLOB_PUBLIC_BASE_URL;
  return configured ? configured.replace(/\/$/, "") : null;
}

// A real provider hands out absolute CDN URLs, so the local download route
// does not apply to it.
export const servesLocalFiles = false;
