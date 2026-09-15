"use client";

import { useEffect, useState } from "react";
import { getOrders, getRewards, getWishlist } from "../../lib/api.js";
import { useSession } from "../../components/auth/useSession.js";

export default function AccountPage() {
  const { user, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [rewards, setRewards] = useState(null);

  useEffect(() => {
    if (sessionLoading || !user) return;
    getOrders(user.id).then((data) => setOrders(data.orders || [])).catch(() => null);
    getWishlist().then((data) => setWishlistCount(data.count || 0)).catch(() => null);
    getRewards(user.id).then(setRewards).catch(() => null);
  }, [sessionLoading, user]);

  if (sessionLoading) {
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
          <p className="muted">Log in to see your account.</p>
          <a className="commandButton" href="/auth/customer">Go to login</a>
        </div>
      </main>
    );
  }

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Account</p><h1>{user.name}</h1></div></header>

      <section className="metricGrid compact">
        <article className="metric"><span>Total orders</span><strong>{orders.length}</strong></article>
        <article className="metric"><span>Active orders</span><strong>{activeOrders.length}</strong></article>
        <article className="metric"><span>Wishlist items</span><strong>{wishlistCount}</strong></article>
        <article className="metric"><span>Reward points</span><strong>{rewards ? rewards.points : "-"}</strong></article>
      </section>

      <section className="traceGrid">
        <article className="toolPanel">
          <h2>Profile</h2>
          <div className="resultStack">
            <div className="splitLine"><span>Email</span><strong>{user.email}</strong></div>
            <div className="splitLine"><span>Phone</span><strong>{user.phone || "Not set"}</strong></div>
            <div className="splitLine"><span>Role</span><strong>{user.role}</strong></div>
          </div>
        </article>

        <article className="toolPanel">
          <h2>Active orders</h2>
          {activeOrders.length === 0 ? (
            <p className="muted">No active orders right now.</p>
          ) : (
            <div className="dataTable">
              {activeOrders.slice(0, 5).map((order) => (
                <div key={order.order_id}>
                  <span>{order.order_id.slice(0, 10)}...</span>
                  <span className="badge">{order.status}</span>
                  <span>{order.total_bdt} BDT</span>
                  <a className="ghostButton" href={`/orders/${order.order_id}`}>Track</a>
                </div>
              ))}
            </div>
          )}
          <a className="commandButton" href="/orders">View all orders</a>
        </article>

        <article className="toolPanel">
          <h2>Shortcuts</h2>
          <div className="actionRow">
            <a className="ghostButton" href="/wishlist">Wishlist</a>
            <a className="ghostButton" href="/rewards">Rewards</a>
            <a className="ghostButton" href="/cart">Cart</a>
          </div>
        </article>
      </section>
    </main>
  );
}
