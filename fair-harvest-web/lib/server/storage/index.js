import * as localDisk from "./localDiskProvider.js";
import * as objectStorage from "./objectStorageProvider.js";

// Single entry point every route handler calls, mirroring the pattern already
// used by lib/server/verification/. Swapping STORAGE_PROVIDER changes where
// uploaded files are kept without touching the callers, the database schema or
// the frontend: the database only ever stores the returned URL.

export function getStorageProviderName() {
  return process.env.STORAGE_PROVIDER === "object" ? "object" : "local";
}

function provider() {
  return getStorageProviderName() === "object" ? objectStorage : localDisk;
}

export function providerServesLocalFiles() {
  return provider().servesLocalFiles;
}

export function putObject(input) {
  return provider().putObject(input);
}

export function getObject(key) {
  return provider().getObject(key);
}

export function deleteObject(key) {
  return provider().deleteObject(key);
}

/**
 * Recover the storage key from a URL we previously produced, so an image can be
 * deleted when it is replaced or removed. Returns null for anything we did not
 * store ourselves (an externally hosted URL, for example), which callers treat
 * as "nothing to delete".
 */
export function storageKeyFromUrl(url) {
  if (typeof url !== "string") return null;
  const marker = "/api/v1/uploads/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const key = url.slice(index + marker.length);
  return key.length > 0 ? key : null;
}
