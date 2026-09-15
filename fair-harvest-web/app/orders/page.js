"use client";

import { useEffect, useState } from "react";
import { useSession } from "../../components/auth/useSession.js";
import { getOrders } from "../../lib/api.js";

export default function OrdersPage() {
  const { user, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !user) {
      setLoading(false);
      return;
    }
    getOrders(user.id)
      .then((data) => setOrders(data.orders || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [sessionLoading, user]);

  if (sessionLoading || loading) {
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
          <p className="muted">Log in to see your order history.</p>
          <a className="commandButton" href="/auth/customer">Go to login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Orders</p><h1>Your order history</h1></div></header>

      {orders.length === 0 ? (
        <div className="emptyState">You haven&apos;t placed any orders yet.</div>
      ) : (
        <section className="toolPanel">
          <div className="dataTable">
            {orders.map((order) => (
              <div key={order.order_id}>
                <span>{order.order_id.slice(0, 10)}...</span>
                <span className={order.status === "delivered" ? "badge good" : "badge"}>{order.status}</span>
                <span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
                <span>{order.total_bdt} BDT</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
                <a className="ghostButton" href={`/orders/${order.order_id}`}>View</a>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
