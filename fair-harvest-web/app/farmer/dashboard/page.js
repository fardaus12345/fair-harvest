"use client";

import { useEffect, useState } from "react";
import { Mic, Plus, QrCode, Star } from "lucide-react";
import { createProduct, getFarmerScore, getProducts, uploadVoice } from "../../../lib/api.js";
import { useSession } from "../../../components/auth/useSession.js";

export default function FarmerDashboard() {
  const { user: sessionUser, loading: sessionLoading } = useSession();
  const user = sessionUser || { name: "Farmer", role: "farmer" };
  const farmerId = sessionUser?.farmer_profile_id || "f001";
  const isVerified = !sessionUser || sessionUser.farmer_verification_status === "verified";
  const [score, setScore] = useState({ reputation_score: 88, badge: "Trusted Seller", breakdown: {} });
  const [products, setProducts] = useState([]);
  const [voice, setVoice] = useState(null);
  const [draft, setDraft] = useState({ name: "", category: "vegetable", price_bdt: 100, quantity_kg: 10 });

  useEffect(() => {
    if (sessionLoading) return;
    getFarmerScore(farmerId).then(setScore).catch(() => null);
    getProducts({ farmer_id: farmerId }).then((data) => setProducts(data.products || [])).catch(() => null);
  }, [sessionLoading, farmerId]);

  async function addProduct(event) {
    event.preventDefault();
    const product = await createProduct({ product_id: `product-${Date.now()}`, farmer_id: farmerId, freshness_window_days: 2, status: "active", ...draft });
    setProducts([product, ...products]);
  }

  async function sendVoice() {
    const data = await uploadVoice(btoa("farmer voice command"));
    setVoice(data);
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Farmer dashboard</p><h1>Welcome back, {user.name}</h1></div><span className="badge good">{score.reputation_score}% · {score.badge}</span></header>
      <section className="metricGrid compact">
        <article className="metric"><span>Reputation</span><strong>{score.reputation_score}</strong></article>
        <article className="metric"><span>Active products</span><strong>{products.length}</strong></article>
        <article className="metric"><span>Orders this month</span><strong>42</strong></article>
        <article className="metric"><span>Average rating</span><strong>4.8</strong></article>
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
          <div className="splitLine"><h2>My products</h2><button><Plus size={16} /> Add new product</button></div>
          <div className="dataTable">{products.map((product) => <div key={product.product_id}><span>{product.name}</span><span>{product.category}</span><span>{product.price_bdt} BDT</span><span>{product.quantity_kg} kg</span><span>{product.trust_score}%</span><button><QrCode size={14} /> Register QR</button></div>)}</div>
        </article>
        {isVerified ? (
          <form className="toolPanel" onSubmit={addProduct}>
            <h2>Add product</h2>
            <label>Name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label>Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}><option value="vegetable">Vegetable</option><option value="fruit">Fruit</option><option value="grain">Grain</option></select></label>
            <label>Price<input type="number" value={draft.price_bdt} onChange={(event) => setDraft({ ...draft, price_bdt: Number(event.target.value) })} /></label>
            <label>Stock kg<input type="number" value={draft.quantity_kg} onChange={(event) => setDraft({ ...draft, quantity_kg: Number(event.target.value) })} /></label>
            <button className="commandButton" type="submit">Save product</button>
          </form>
        ) : null}
        <article className="toolPanel">
          <h2><Mic size={20} /> Voice Upload</h2>
          <button className="commandButton" onClick={sendVoice}>Hold to record</button>
          {voice ? <p className="muted">{voice.transcript_english} · {voice.action_taken}</p> : null}
        </article>
        <article className="toolPanel">
          <h2><Star size={20} /> Reputation breakdown</h2>
          {Object.entries(score.breakdown || { quality_score: 88, delivery_score: 84, review_score: 90, cert_score: 95 }).map(([key, value]) => <div className="scoreRow" key={key}><div><span>{key.replace("_", " ")}</span><strong>{value}</strong></div><div className="bar"><span style={{ width: `${value}%` }} /></div></div>)}
        </article>
      </section>
    </main>
  );
}
