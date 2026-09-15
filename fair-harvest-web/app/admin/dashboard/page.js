"use client";

import { useEffect, useState } from "react";
import { getAdminMetrics } from "../../../lib/api.js";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getAdminMetrics().then(setMetrics).catch(() => null);
  }, []);

  if (!metrics) return <div className="skeletonCard tall" />;

  return (
    <section className="metricGrid compact">
      <article className="metric"><span>Total users</span><strong>{metrics.total_users}</strong></article>
      <article className="metric"><span>Farmers</span><strong>{metrics.total_farmers}</strong></article>
      <article className="metric"><span>Pending verifications</span><strong>{metrics.pending_verifications}</strong></article>
      <article className="metric"><span>Active products</span><strong>{metrics.active_products}</strong></article>
      <article className="metric"><span>Total orders</span><strong>{metrics.total_orders}</strong></article>
      <article className="metric"><span>Revenue (paid)</span><strong>{metrics.revenue_bdt} BDT</strong></article>
    </section>
  );
}
