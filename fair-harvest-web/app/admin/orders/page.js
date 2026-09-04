"use client";

import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "../../../lib/api.js";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    getAdminOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function changeStatus(orderId, status) {
    await updateOrderStatus(orderId, { status });
    load();
  }

  if (loading) return <div className="skeletonCard tall" />;

  return (
    <section className="toolPanel">
      <div className="dataTable">
        {orders.map((order) => (
          <div key={order.order_id}>
            <span>{order.customer_name}</span>
            <span>{order.items.length} item{order.items.length === 1 ? "" : "s"}</span>
            <span>{order.total_bdt} BDT</span>
            <span className={order.payment_status === "paid" ? "badge good" : "badge warn"}>{order.payment_status}</span>
            <select value={order.status} onChange={(event) => changeStatus(order.order_id, event.target.value)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <a className="ghostButton" href={`/orders/${order.order_id}`}>View</a>
          </div>
        ))}
      </div>
    </section>
  );
}
