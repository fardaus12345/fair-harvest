"use client";

import { useEffect, useState } from "react";
import { getAdminProducts, updateProduct } from "../../../lib/api.js";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminProducts()
      .then((data) => setProducts(data.products || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleStatus(product) {
    const next = product.status === "archived" ? "active" : "archived";
    await updateProduct(product.product_id, { status: next });
    load();
  }

  if (loading) return <div className="skeletonCard tall" />;

  return (
    <section className="toolPanel">
      <div className="dataTable">
        {products.map((product) => (
          <div key={product.product_id}>
            <span>{product.name}</span>
            <span>{product.farmer_name}</span>
            <span>{product.category}</span>
            <span>{product.price_bdt} BDT</span>
            <span className={product.status === "active" ? "badge good" : "badge"}>{product.status}</span>
            <button onClick={() => toggleStatus(product)}>{product.status === "archived" ? "Restore" : "Remove"}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
