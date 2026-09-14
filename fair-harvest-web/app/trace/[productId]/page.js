import { BadgeCheck, Clipboard, Sprout } from "lucide-react";
import { getTrace } from "../../../lib/api.js";
import FarmerTraceControls from "../../../components/trace/FarmerTraceControls.js";

export default async function TracePage({ params }) {
  const { productId } = await params;
  let trace = null;
  let loadError = null;
  try {
    trace = await getTrace(productId);
  } catch (err) {
    loadError = err.message || "Could not load traceability data";
  }

  if (!trace) {
    return (
      <main className="appPage">
        <header className="traceHero">
          <div>
            <p className="eyebrow">QR trace</p>
            <h1>{productId}</h1>
          </div>
        </header>
        <section className="toolPanel">
          <p className="muted">This product&apos;s traceability record could not be loaded. {loadError}</p>
        </section>
      </main>
    );
  }

  const events = trace.trace_events || [];
  const completedCount = events.filter((event) => event.completed).length;

  return (
    <main className="appPage">
      <header className="traceHero">
        <div>
          <p className="eyebrow">QR trace</p>
          <h1>{trace.product_id}</h1>
          <span className="chainChip"><Clipboard size={16} /> {completedCount}/{events.length} stages recorded</span>
        </div>
        <div className="donut" style={{ "--score": `${events.length ? Math.round((completedCount / events.length) * 100) : 0}%` }}>
          <span>{completedCount}/{events.length}</span>
        </div>
      </header>

      <section className="metricGrid compact">
        <article className="metric"><span>Freshness window</span><strong>{trace.current_freshness_days || "n/a"} days</strong></article>
        <article className="metric"><span>Stages logged</span><strong>{completedCount}</strong></article>
      </section>

      <section className="traceGrid">
        <article className="toolPanel">
          <h2>Supply Chain</h2>
          <ol className="supplyTimeline">
            {events.map((event, index) => (
              <li key={event.stage} className={event.completed ? "" : "pending"}>
                <span>{index + 1}</span>
                <div>
                  <strong>{event.label}</strong>
                  <p>{event.completed ? new Date(event.timestamp).toLocaleString() : "Pending"}</p>
                  {event.note && <p className="muted">{event.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="toolPanel">
          <h2><BadgeCheck size={20} /> Farmer</h2>
          <p className="strong">{trace.farmer?.name || "Pending farmer"}</p>
          <p className="muted">Location: {trace.farm_gps_location?.lat ?? "n/a"}, {trace.farm_gps_location?.lng ?? "n/a"}</p>
          <div className="tagList">{(trace.farmer?.certifications || []).map((cert) => <span key={cert}>{cert}</span>)}</div>
        </article>

        <article className="toolPanel">
          <h2><Sprout size={20} /> Record source</h2>
          <p className="strong">{trace.qr_code}</p>
          <p className="muted">{trace.verification_note}</p>
        </article>

        <FarmerTraceControls productId={productId} />
      </section>
    </main>
  );
}
