import assert from "node:assert/strict";
import test from "node:test";

import {
  validateImageUpload,
  buildStorageKey,
  isSafeStorageKey,
  extensionForMime,
  MAX_IMAGE_BYTES
} from "../lib/server/storage/imageValidation.js";
import { storageKeyFromUrl } from "../lib/server/storage/index.js";

test("accepts the three supported image types", () => {
  for (const [mime, ext] of [["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]) {
    const result = validateImageUpload({ mimeType: mime, size: 1024 });
    assert.equal(result.ok, true);
    assert.equal(result.extension, ext);
  }
});

test("ignores charset parameters on the content type", () => {
  const result = validateImageUpload({ mimeType: "image/png; charset=binary", size: 1024 });
  assert.equal(result.ok, true);
  assert.equal(result.extension, "png");
});

test("rejects types we do not serve, including SVG", () => {
  for (const mime of ["image/svg+xml", "image/gif", "application/pdf", "text/html"]) {
    const result = validateImageUpload({ mimeType: mime, size: 1024 });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "unsupported_type");
  }
});

test("rejects an empty file and a missing type", () => {
  assert.equal(validateImageUpload({ mimeType: "image/png", size: 0 }).reason, "empty_file");
  assert.equal(validateImageUpload({}).reason, "missing_type");
});

test("rejects a file over the size limit but accepts one exactly at it", () => {
  assert.equal(validateImageUpload({ mimeType: "image/png", size: MAX_IMAGE_BYTES + 1 }).reason, "too_large");
  assert.equal(validateImageUpload({ mimeType: "image/png", size: MAX_IMAGE_BYTES }).ok, true);
});

test("extensionForMime returns null for unknown types", () => {
  assert.equal(extensionForMime("image/tiff"), null);
});

test("storage keys are built from server-side values only", () => {
  const key = buildStorageKey({ prefix: "products", id: "abc-123", extension: "png" });
  assert.equal(key, "products/abc-123.png");
  // A hostile prefix cannot introduce path segments.
  assert.equal(buildStorageKey({ prefix: "../../etc", id: "x", extension: "png" }), "etc/x.png");
});

test("isSafeStorageKey rejects traversal and absolute paths", () => {
  assert.equal(isSafeStorageKey("products/abc.png"), true);
  assert.equal(isSafeStorageKey("../secrets.png"), false);
  assert.equal(isSafeStorageKey("products/../../etc/passwd.png"), false);
  assert.equal(isSafeStorageKey("/etc/passwd.png"), false);
  assert.equal(isSafeStorageKey("products\\abc.png"), false);
  assert.equal(isSafeStorageKey("products/abc"), false);
  assert.equal(isSafeStorageKey(""), false);
  assert.equal(isSafeStorageKey(null), false);
});

test("storageKeyFromUrl recovers keys we issued and ignores foreign URLs", () => {
  assert.equal(storageKeyFromUrl("/api/v1/uploads/products/abc.png"), "products/abc.png");
  assert.equal(storageKeyFromUrl("http://localhost:3000/api/v1/uploads/products/abc.png"), "products/abc.png");
  assert.equal(storageKeyFromUrl("https://cdn.example.com/photo.png"), null);
  assert.equal(storageKeyFromUrl(null), null);
});
