"use client";

import { useState } from "react";
import { Pencil, QrCode } from "lucide-react";
import { updateProduct, archiveProduct } from "../../lib/api.js";
import ProductImage from "./ProductImage.js";
import ProductImageUploader from "./ProductImageUploader.js";

const CATEGORIES = ["vegetable", "fruit", "grain", "herb"];
const STATUSES = ["active", "out_of_stock", "archived"];

/**
 * One row in the farmer's product list, with inline editing.
 *
 * The backend already supported PATCH /products/{id} with an owner check, but
 * there was no farmer-facing UI for it, so a farmer could create a listing and
 * never change it. Ownership is still enforced server-side; this only exposes
 * what the farmer was always allowed to do.
 */
export default function FarmerProductRow({ product, onChanged, onMarkListed, listedStatus }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit() {
    setDraft({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price_bdt: product.price_bdt,
      quantity_kg: product.quantity_kg,
      status: product.status,
      image_url: product.image_url || null
    });
    setError("");
    setEditing(true);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProduct(product.product_id, draft);
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.message || "Could not save the product");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    setSaving(true);
    try {
      await archiveProduct(product.product_id);
      onChanged();
    } catch (err) {
      setError(err.message || "Could not archive the product");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="productRow">
        <ProductImage src={product.image_url} alt={product.name} category={product.category} size="thumb" />
        <span>{product.name}</span>
        <span>{product.category}</span>
        <span>{product.price_bdt} BDT</span>
        <span>{product.quantity_kg} kg</span>
        <span className={product.status === "active" ? "badge good" : "badge"}>{product.status}</span>
        <button type="button" onClick={startEdit}><Pencil size={14} /> Edit</button>
        <button
          type="button"
          onClick={() => onMarkListed(product.product_id)}
          disabled={listedStatus === "saving"}
        >
          <QrCode size={14} />{" "}
          {listedStatus === "done" ? "Marked listed" : listedStatus === "error" ? "Try again" : "Mark as listed"}
        </button>
      </div>
    );
  }

  return (
    <form className="toolPanel productEditForm" onSubmit={save}>
      <h3>Edit {product.name}</h3>

      <ProductImageUploader
        value={draft.image_url}
        onChange={(url) => setDraft({ ...draft, image_url: url })}
        category={draft.category}
      />

      <label>Name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label>
      <label>Category
        <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label>Description<input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
      <label>Price (BDT/kg)<input type="number" min="1" value={draft.price_bdt} onChange={(e) => setDraft({ ...draft, price_bdt: Number(e.target.value) })} /></label>
      <label>Stock (kg)<input type="number" min="0" value={draft.quantity_kg} onChange={(e) => setDraft({ ...draft, quantity_kg: Number(e.target.value) })} /></label>
      <label>Status
        <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </label>

      {error ? <p className="errorText">{error}</p> : null}

      <div className="formActions">
        <button className="commandButton" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
        <button className="ghostButton" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
        {product.status !== "archived" ? (
          <button className="ghostButton" type="button" onClick={archive} disabled={saving}>Archive listing</button>
        ) : null}
      </div>
    </form>
  );
}
