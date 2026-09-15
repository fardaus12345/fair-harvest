"use client";

import { useEffect, useState } from "react";
import { useSession } from "../../../components/auth/useSession.js";
import StatusTimeline from "../../../components/orders/StatusTimeline.js";
import { getOrderDetail } from "../../../lib/api.js";
import ProductImage from "../../../components/products/ProductImage.js";

export default function OrderDetailPage({ params }) {
  const { user, loading: sessionLoading } = useSession();
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolved) => setOrderId(resolved.orderId));
  }, [params]);

  useEffect(() => {
    if (sessionLoading || !user || !orderId) return;
    getOrderDetail(orderId)
      .then((data) => setOrder(data.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionLoading, user, orderId]);

  if (sessionLoading || (loading && orderId)) {
    return (
      <main className="appPage">
        <div className="skeletonCard tall" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="appPage">
        <div className="toolPanel">
          <p className="muted">Log in to view this order.</p>
          <a className="commandButton" href="/auth/customer">Go to login</a>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="appPage">
        <div className="emptyState">{error || "Order not found."}</div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader">
        <div>
          <p className="eyebrow">Order {order.order_id.slice(0, 10)}...</p>
          <h1>Status: {order.status}</h1>
        </div>
        <span className={order.payment_status === "paid" ? "badge good" : "badge warn"}>
          Payment: {order.payment_status} ({order.payment_method})
        </span>
      </header>

      <section className="traceGrid">
        <article className="toolPanel">
          <h2>Items</h2>
          <div className="resultStack">
            {order.items.map((item) => (
              <div className="splitLine" key={item.product_id}>
                <span className="orderItemLine">
                  <ProductImage src={item.image_url} alt={item.name} size="thumb" />
                  {item.name} · {item.quantity_kg} kg
                </span>
                <strong>{item.line_total_bdt} BDT</strong>
              </div>
            ))}
            <div className="checkoutLine"><span>Delivery fee</span><strong>{order.delivery_fee_bdt} BDT</strong></div>
            <div className="checkoutLine"><span>Total</span><strong>{order.total_bdt} BDT</strong></div>
          </div>
        </article>

        <article className="toolPanel">
          <h2>Delivery</h2>
          <p className="strong">{order.delivery_address.line1}</p>
          <p className="muted">{order.delivery_address.city}</p>
        </article>

        <article className="toolPanel wide">
          <h2>Tracking</h2>
          <StatusTimeline events={order.status_events} />
        </article>
      </section>
    </main>
  );
}
