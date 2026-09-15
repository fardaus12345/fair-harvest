// Stub for a production object-storage provider (S3, Cloudinary, Supabase
// Storage or similar). It returns the same shape as localDiskProvider.js, so
// switching STORAGE_PROVIDER changes where bytes live without touching the
// upload route, the Product schema or any frontend component.
//
// This is deliberately NOT implemented against a real provider: no storage
// credentials exist for this project, and inventing them would put a
// non-functional integration in the codebase. Only this file needs to change
// when a real bucket is available - see README for the environment variables
// each provider would need.

function notConfigured(operation) {
  const error = new Error(
    `Object storage provider is selected (STORAGE_PROVIDER=object) but no provider ` +
      `implementation is configured, so "${operation}" cannot run. Set STORAGE_PROVIDER=local ` +
      `for development, or implement lib/server/storage/objectStorageProvider.js against your ` +
      `bucket (see README).`
  );
  error.code = "STORAGE_NOT_CONFIGURED";
  return error;
}

export async function putObject() {
  throw notConfigured("putObject");
}

export async function getObject() {
  throw notConfigured("getObject");
}

export async function deleteObject() {
  throw notConfigured("deleteObject");
}

// A real provider returns absolute CDN URLs, so the local download route does
// not apply to it.
export const servesLocalFiles = false;
