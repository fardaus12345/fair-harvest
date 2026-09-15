"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Search } from "lucide-react";
import { getAdminProducts, updateProduct, archiveProduct } from "../../../lib/api.js";
import ProductImage from "../../../components/products/ProductImage.js";
import ProductImageUploader from "../../../components/products/ProductImageUploader.js";

const CATEGORIES = ["vegetable", "fruit", "grain", "herb"];
const STATUSES = ["active", "out_of_stock", "archived"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", status: "" });
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getAdminProducts(filters)
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  // Typing in the search box is debounced so it does not fire a request per
  // keystroke, but the first load runs straight away: making the page wait
  // 250ms before it even asks for data just delays the table for no reason.
  const firstLoad = useRef(true);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      load();
      return;
    }
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  function startEdit(product) {
    setEditingId(product.product_id);
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
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProduct(editingId, draft);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message || "Could not save the product");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(product, status) {
    setError("");
    try {
      await updateProduct(product.product_id, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function archive(product) {
    setError("");
    try {
      await archiveProduct(product.product_id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="toolPanel">
      <div className="splitLine">
        <h2>Product management</h2>
        <span className="muted">{products.length} product{products.length === 1 ? "" : "s"}</span>
      </div>

      <div className="marketToolbar">
        <label className="searchBox">
          <Search size={18} />
          <input
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            placeholder="Search by product, description or farmer"
          />
        </label>
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </div>

      {error ? <p className="errorText">{error}</p> : null}
      {loading ? <div className="skeletonCard tall" /> : null}
      {!loading && products.length === 0 ? <div className="emptyState">No products match these filters.</div> : null}

      {!loading ? (
        <div className="dataTable">
          {products.map((product) =>
            editingId === product.product_id ? (
              <form className="toolPanel productEditForm" key={product.product_id} onSubmit={save}>
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

                <div className="formActions">
                  <button className="commandButton" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
                  <button className="ghostButton" type="button" onClick={() => setEditingId(null)} disabled={saving}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="productRow" key={product.product_id}>
                <ProductImage src={product.image_url} alt={product.name} category={product.category} size="thumb" />
                <span>{product.name}</span>
                <span className="muted">{product.farmer_name || "Unknown farmer"}</span>
                <span>{product.category}</span>
                <span>{product.price_bdt} BDT</span>
                <span className={product.status === "active" ? "badge good" : "badge"}>{product.status}</span>
                <button type="button" onClick={() => startEdit(product)}><Pencil size={14} /> Edit</button>
                {product.status === "archived" ? (
                  <button type="button" onClick={() => setStatus(product, "active")}>Restore</button>
                ) : (
                  <button type="button" onClick={() => archive(product)}>Archive</button>
                )}
              </div>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}
