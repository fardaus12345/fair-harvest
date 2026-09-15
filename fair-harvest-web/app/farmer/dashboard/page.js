"use client";

import { useEffect, useState } from "react";
import { Mic, Star } from "lucide-react";
import { addTraceEvent, createProduct, getFarmerEarnings, getFarmerOrders, getFarmerScore, getProducts, uploadVoice } from "../../../lib/api.js";
import { useSession } from "../../../components/auth/useSession.js";
import ProductImageUploader from "../../../components/products/ProductImageUploader.js";
import FarmerProductRow from "../../../components/products/FarmerProductRow.js";
import ProductImage from "../../../components/products/ProductImage.js";

export default function FarmerDashboard() {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const user = sessionUser || { name: "Farmer", role: "farmer" };
  const farmerId = sessionUser?.farmer_profile_id || null;
  const isVerified = !sessionUser || sessionUser.farmer_verification_status === "verified";
  // No seeded placeholder score: showing a hardcoded reputation before the real
  // one loads would put a number on screen that the farmer has not earned.
  const [score, setScore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [listedStatus, setListedStatus] = useState({});
  const [voice, setVoice] = useState(null);
  const [draft, setDraft] = useState({ name: "", category: "vegetable", price_bdt: 100, quantity_kg: 10, image_url: null });

  useEffect(() => {
    if (sessionLoading || !farmerId) return;
    getFarmerScore(farmerId).then(setScore).catch(() => null);
    getProducts({ farmer_id: farmerId }).then((data) => setProducts(data.products || [])).catch(() => null);
    if (sessionUser) {
      getFarmerOrders().then((data) => setOrders(data.order_items || [])).catch(() => null);
      getFarmerEarnings().then(setEarnings).catch(() => null);
    }
  }, [sessionLoading, farmerId, sessionUser]);

  function reloadProducts() {
    if (!farmerId) return;
    getProducts({ farmer_id: farmerId }).then((data) => setProducts(data.products || [])).catch(() => null);
  }

  async function addProduct(event) {
    event.preventDefault();
    await createProduct({ farmer_id: farmerId, freshness_window_days: 2, status: "active", ...draft });
    setDraft({ name: "", category: "vegetable", price_bdt: 100, quantity_kg: 10, image_url: null });
    reloadProducts();
  }

  async function markListed(productId) {
    setListedStatus((prev) => ({ ...prev, [productId]: "saving" }));
    try {
      await addTraceEvent(productId, { stage: "LISTED" });
      setListedStatus((prev) => ({ ...prev, [productId]: "done" }));
    } catch {
      setListedStatus((prev) => ({ ...prev, [productId]: "error" }));
    }
  }

  async function sendVoice() {
    const data = await uploadVoice(btoa("farmer voice command"));
    setVoice(data);
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Farmer dashboard</p><h1>Welcome back, {user.name}</h1></div>{score ? <span className="badge good">{score.reputation_score}% · {score.badge}</span> : null}</header>
      <section className="metricGrid compact">
        <article className="metric"><span>Reputation</span><strong>{score ? score.reputation_score : "—"}</strong></article>
        <article className="metric"><span>Active products</span><strong>{products.length}</strong></article>
        <article className="metric"><span>Orders received</span><strong>{orders.length}</strong></article>
        <article className="metric"><span>Average rating</span><strong>{!score ? "—" : score.average_rating != null ? score.average_rating : `No reviews yet (${score.review_count || 0})`}</strong></article>
      </section>
      {!isVerified ? (
        <section className="toolPanel">
          <span className="badge warn">Verification required</span>
          <p className="strong">Verify your Farmer Card to start selling</p>
          <p className="muted">Product listing is locked until your Government Farmer Card is verified.</p>
          <a className="commandButton" href="/farmer/verify">Verify Farmer Card</a>
        </section>
      ) : null}
      <section className="traceGrid">
        <article className="toolPanel wide">
          <div className="splitLine"><h2>My products</h2></div>
          <div className="dataTable">
            {products.map((product) => (
              <FarmerProductRow
                key={product.product_id}
                product={product}
                onChanged={reloadProducts}
                onMarkListed={markListed}
                listedStatus={listedStatus[product.product_id]}
              />
            ))}
            {products.length === 0 && <p className="muted">No products yet — add one to get started.</p>}
          </div>
        </article>
        {isVerified ? (
          <form className="toolPanel" onSubmit={addProduct}>
            <h2>Add product</h2>
            <ProductImageUploader
              value={draft.image_url}
              onChange={(url) => setDraft({ ...draft, image_url: url })}
              category={draft.category}
            />
            <label>Name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option value="vegetable">Vegetable</option><option value="fruit">Fruit</option><option value="grain">Grain</option></select></label>
            <label>Price<input type="number" value={draft.price_bdt} onChange={(event) => setDraft({ ...draft, price_bdt: Number(event.target.value) })} /></label>
            <label>Stock kg<input type="number" value={draft.quantity_kg} onChange={(event) => setDraft({ ...draft, quantity_kg: Number(event.target.value) })} /></label>
            <button className="commandButton" type="submit">Save product</button>
          </form>
        ) : null}

        <article className="toolPanel wide">
          <h2>My orders</h2>
          <div className="dataTable">
            {orders.slice(0, 8).map((item) => (
              <div key={item.order_item_id}>
                <ProductImage src={item.image_url} alt={item.product_name} size="thumb" />
                <span>{item.product_name}</span>
                <span>{item.quantity_kg} kg</span>
                <span>{item.line_total_bdt} BDT</span>
                <span className="badge">{item.order_status}</span>
                <span>{item.customer_name}</span>
              </div>
            ))}
            {orders.length === 0 && <p className="muted">No orders yet.</p>}
          </div>
        </article>

        <article className="toolPanel">
          <h2>Earnings</h2>
          <p className="muted">Reflects order value from your sales, not a confirmed payout — Fair Harvest does not process real farmer payouts yet.</p>
          {earnings ? (
            <div className="dataTable">
              <div><span>Completed sales</span><strong>{earnings.completed_sales_bdt} BDT</strong></div>
              <div><span>In progress</span><strong>{earnings.pending_sales_bdt} BDT</strong></div>
              <div><span>Cancelled items</span><strong>{earnings.cancelled_order_items}</strong></div>
            </div>
          ) : <p className="muted">Sign in as a farmer to see earnings.</p>}
        </article>

        <article className="toolPanel">
          <h2><Mic size={20} /> Voice Upload (Demo)</h2>
          <p className="muted">Demo only — uses a canned transcript, not real speech-to-text, and does not change your product prices.</p>
          <button className="commandButton" onClick={sendVoice}>Hold to record</button>
          {voice ? <p className="muted">Demo transcript: {voice.transcript_english}</p> : null}
        </article>
        <article className="toolPanel">
          <h2><Star size={20} /> Reputation breakdown</h2>
          {Object.entries((score && score.breakdown) || {}).map(([key, value]) => <div className="scoreRow" key={key}><div><span>{key.replace("_", " ")}</span><strong>{value}</strong></div><div className="bar"><span style={{ width: `${value}%` }} /></div></div>)}
        </article>
      </section>
    </main>
  );
}
