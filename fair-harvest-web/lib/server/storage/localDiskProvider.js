import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";

// Local filesystem storage for development and for the university demo.
// Files are written under UPLOAD_DIR (outside ./public, which is not writable
// at runtime in most deployments) and served back through the
// GET /api/v1/uploads/[...key] route handler.

function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR || "./storage/uploads");
}

function absolutePathFor(key) {
  const root = uploadRoot();
  const resolved = path.resolve(root, key);
  // Defence in depth: isSafeStorageKey already rejects traversal, but a bug
  // there must not become a filesystem escape.
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Resolved upload path escaped the upload directory");
  }
  return resolved;
}

export async function putObject({ key, buffer }) {
  const target = absolutePathFor(key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return { key, url: `/api/v1/uploads/${key}` };
}

export async function getObject(key) {
  try {
    return await readFile(absolutePathFor(key));
  } catch {
    return null;
  }
}

export async function deleteObject(key) {
  try {
    await unlink(absolutePathFor(key));
    return true;
  } catch {
    // Already gone, or never existed - removing an absent object is not an error.
    return false;
  }
}

// The local provider serves bytes through our own route rather than redirecting
// to a third-party CDN, so the download route needs to know it can read files.
export const servesLocalFiles = true;
