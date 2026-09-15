"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { uploadProductImage } from "../../lib/api.js";
import ProductImage from "./ProductImage.js";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 3 * 1024 * 1024;

/**
 * Upload control for a single product image.
 *
 * Deliberately minimal: one button when empty, preview plus Replace/Remove when
 * filled. The caller owns the value, so this works both for a product that does
 * not exist yet (the farmer's "add product" form) and for editing an existing
 * one.
 *
 * value    - current image URL, or null
 * onChange - called with the new URL, or null when removed
 */
export default function ProductImageUploader({ value, onChange, category, disabled = false, label = "Product image" }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const busy = status === "uploading" || disabled;
  const shown = preview || value;

  function pick() {
    setError("");
    inputRef.current?.click();
  }

  async function handleFile(event) {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires a change.
    event.target.value = "";
    if (!file) return;

    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 3 MB. Please choose a smaller one.");
      return;
    }

    // Show the picked file straight away, before the upload finishes.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setError("");
    setStatus("uploading");

    try {
      const data = await uploadProductImage(file);
      onChange(data.image_url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1500);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setStatus("error");
      setPreview(null);
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  }

  function remove() {
    setPreview(null);
    setError("");
    setStatus("idle");
    onChange(null);
  }

  return (
    <div className="imageUploader">
      <span className="imageUploaderLabel">{label}</span>

      <ProductImage src={shown} alt="Product image preview" category={category} className="imageUploaderPreview" />

      {status === "uploading" ? <p className="muted">Uploading…</p> : null}
      {status === "done" ? <p className="muted">Image saved.</p> : null}
      {error ? <p className="errorText">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={handleFile}
        hidden
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className="actionRow">
        <button type="button" className="commandButton" onClick={pick} disabled={busy}>
          {shown ? <RefreshCw size={14} /> : <ImagePlus size={14} />}
          {status === "uploading" ? "Uploading…" : shown ? "Replace" : "Upload image"}
        </button>
        {shown && !busy ? (
          <button type="button" className="ghostButton" onClick={remove}>
            <Trash2 size={14} /> Remove
          </button>
        ) : null}
      </div>

      <p className="muted imageUploaderHint">JPG, PNG or WebP. Up to 3 MB.</p>
    </div>
  );
}
