"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { getProducts } from "../../lib/api.js";
import AddToCartButton from "../../components/cart/AddToCartButton.js";

const fallbackProducts = [
  { product_id: "abc123", name: "Organic Spinach", category: "vegetable", farmer_id: "f001", trust_score: 88, freshness_window_days: 2, price_bdt: 120, status: "active" },
  { product_id: "spinach-001", name: "Iron Rich Spinach", category: "vegetable", farmer_id: "f002", trust_score: 91, freshness_window_days: 3, price_bdt: 135, status: "active" }
];

export default function MarketplacePage() {
  const [filters, setFilters] = useState({ category: "", min_trust: 0, max_price: "", sort_by: "trust" });
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProducts(filters)
      .then((data) => {
        if (!active) return;
        setProducts(data.products || []);
        setLoadError(false);
      })
      .catch(() => {
        if (!active) return;
        setProducts(fallbackProducts);
        setLoadError(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  return (
    <main className="appPage">
      <header className="pageHeader">
        <div>
          <p className="eyebrow">Verified marketplace</p>
          <h1>Shop food with trust scores, freshness windows, and trace links.</h1>
        </div>
        <a className="commandButton" href="/">Dashboard</a>
      </header>

      <div className="marketLayout">
        <aside className="toolPanel filterPanel">
          <FilterControls filters={filters} setFilters={setFilters} />
        </aside>

        <section className="productArea">
          <div className="marketToolbar">
            <label className="searchBox"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search produce" /></label>
            <button className="filterToggle" type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={18} /> Filters</button>
          </div>
          {loadError ? <p className="demoBanner">Could not reach the marketplace API — showing 2 example listings only.</p> : null}
          {loading ? <div className="cardGrid">{Array.from({ length: 6 }).map((_, index) => <div className="skeletonCard" key={index} />)}</div> : null}
          {!loading && visibleProducts.length === 0 ? <div className="emptyState">No products match your filters.</div> : null}
          <div className="cardGrid">
            {visibleProducts.map((product) => (
              <article className="productCard" key={product.product_id}>
                <div className="produceTile">{product.category === "fruit" ? "Fruit" : "Fresh"}</div>
                <div className="splitLine"><h2><a href={`/marketplace/${product.product_id}`}>{product.name}</a></h2><span className={product.trust_score > 80 ? "badge good" : "badge warn"}>{product.trust_score}%</span></div>
                <p className="muted">{product.farmer_name ? `${product.farmer_name} · ${product.farmer_district || "Bangladesh"}` : `Farm ${product.farmer_id} · Dhaka district`}</p>
                <div className="bar"><span style={{ width: `${Math.min(100, product.freshness_window_days * 30)}%` }} /></div>
                <div className="splitLine"><strong>{product.price_bdt} BDT/kg</strong><span className="badge">Eco A</span></div>
                <div className="actionRow"><AddToCartButton productId={product.product_id} label="Add" /><a href={`/trace/${product.product_id}`}>View trace</a></div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {filtersOpen ? (
        <div className="sheetBackdrop" onClick={() => setFiltersOpen(false)}>
          <aside className="filterSheet" onClick={(event) => event.stopPropagation()}>
            <div className="splitLine"><h2>Filters</h2><button onClick={() => setFiltersOpen(false)}>Close</button></div>
            <FilterControls filters={filters} setFilters={setFilters} />
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function FilterControls({ filters, setFilters }) {
  return (
    <>
      <h2><SlidersHorizontal size={20} /> Filters</h2>
      <label>Category
        <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}>
          <option value="">All</option>
          <option value="vegetable">Vegetables</option>
          <option value="fruit">Fruits</option>
          <option value="grain">Grains</option>
          <option value="herb">Herbs</option>
        </select>
      </label>
      <label>Min trust score: {filters.min_trust}
        <input type="range" min="0" max="100" value={filters.min_trust} onChange={(event) => setFilters({ ...filters, min_trust: event.target.value })} />
      </label>
      <label>Max price
        <input type="number" value={filters.max_price} onChange={(event) => setFilters({ ...filters, max_price: event.target.value })} placeholder="BDT/kg" />
      </label>
      <button className="ghostButton" onClick={() => setFilters({ category: "", min_trust: 0, max_price: "", sort_by: "trust" })}>Reset</button>
    </>
  );
}
