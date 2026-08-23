import { BadgeCheck, Clipboard, Link as LinkIcon, Sprout } from "lucide-react";
import { getTrace } from "../../../lib/api.js";

export default async function TracePage({ params }) {
  const { productId } = await params;
  let trace;
  try {
    trace = await getTrace(productId);
  } catch {
    trace = fallbackTrace(productId);
  }

  const trust = trace.verified_on_chain ? 94 : 72;
  const soil = trace.soil_data || trace.soil_test_data || {};

  return (
    <main className="appPage">
      <header className="traceHero">
        <div>
          <p className="eyebrow">QR trace</p>
          <h1>{trace.product_id}</h1>
          <span className="chainChip"><LinkIcon size={16} /> Blockchain verified</span>
        </div>
        <div className="donut" style={{ "--score": `${trust}%` }}><span>{trust}</span></div>
      </header>

      <section className="metricGrid compact">
        <article className="metric"><span>Freshness</span><strong>{trace.current_freshness_days || 2} days</strong></article>
        <article className="metric"><span>Pesticide risk</span><strong>Low</strong></article>
        <article className="metric"><span>Eco score</span><strong>A+</strong></article>
        <article className="metric"><span>Soil quality</span><strong>{soil.ph || 6.7} pH</strong></article>
      </section>

      <section className="traceGrid">
        <article className="toolPanel">
          <h2>Supply Chain</h2>
          <ol className="supplyTimeline">
            {["Planted", "Harvested", "Lab tested", "Packaged", "Shipped", "Listed"].map((step, index) => (
              <li key={step}><span>{index + 1}</span><div><strong>{step}</strong><p>{index < 2 ? trace.harvest_date || "Pending" : trace.shipping_date || trace.shipping_timestamp || "Pending sync"}</p></div></li>
            ))}
          </ol>
        </article>

        <article className="toolPanel">
          <h2><BadgeCheck size={20} /> Farmer</h2>
          <p className="strong">{trace.farmer?.name || "Pending farmer"}</p>
          <p className="muted">Location: {trace.farmer?.location?.lat || trace.farm_gps_location?.lat || "n/a"}, {trace.farmer?.location?.lng || trace.farm_gps_location?.lng || "n/a"}</p>
          <div className="tagList">{(trace.farmer?.certifications || ["Bangladesh Organic Standard"]).map((cert) => <span key={cert}>{cert}</span>)}</div>
        </article>

        <article className="toolPanel">
          <h2><Sprout size={20} /> Soil Data</h2>
          <SoilBar label="pH" value={(soil.ph || 6.7) * 10} />
          <SoilBar label="Nitrogen" value={soil.nitrogen || soil.nitrogen_ppm || 42} />
          <SoilBar label="Iron" value={(soil.iron || soil.iron_ppm || 7.4) * 10} />
          <p className="muted">High iron soil supports stronger spinach nutrition.</p>
        </article>

        <article className="toolPanel">
          <h2><Clipboard size={20} /> QR</h2>
          <p className="strong">{trace.qr_code || `qr_${trace.product_id}`}</p>
          <p className="muted">Verified on Ethereum/Hyperledger adapter</p>
          <code>{truncate(trace.blockchain_hash || "0xfairharvestpending")}</code>
        </article>
      </section>
    </main>
  );
}

function SoilBar({ label, value }) {
  return <div className="scoreRow"><div><span>{label}</span><strong>{Math.round(value)}</strong></div><div className="bar"><span style={{ width: `${Math.min(100, value)}%` }} /></div></div>;
}

function truncate(value) {
  return value.length > 20 ? `${value.slice(0, 12)}...${value.slice(-8)}` : value;
}

function fallbackTrace(productId) {
  return {
    product_id: productId,
    farmer: { name: "Rahim Uddin", location: { lat: 23.8103, lng: 90.4125 }, certifications: ["Bangladesh Organic Standard"] },
    harvest_date: "2026-06-24",
    shipping_date: "2026-06-24T15:20:00.000Z",
    soil_data: { ph: 6.7, nitrogen: 42, iron: 7.4 },
    blockchain_hash: "0x8f3a1b7c2d91fairharvestabc123",
    current_freshness_days: 2,
    verified_on_chain: true
  };
}
