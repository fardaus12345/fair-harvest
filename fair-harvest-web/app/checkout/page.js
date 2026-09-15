"use client";

import { useState } from "react";
import { useCart } from "../../components/cart/useCart.js";
import { useSession } from "../../components/auth/useSession.js";
import { checkout } from "../../lib/api.js";

const DELIVERY_FEE = 60;

export default function CheckoutPage() {
  const { user, loading: sessionLoading } = useSession();
  const { cart, loading: cartLoading } = useCart();
  const [form, setForm] = useState({ line1: "", city: "Dhaka", payment_method: "demo_card" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const data = await checkout(user.id, {
        delivery_address: { line1: form.line1, city: form.city },
        delivery_fee_bdt: DELIVERY_FEE,
        payment_method: form.payment_method
      });
      window.location.href = `/orders/${data.order.order_id}`;
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  if (sessionLoading || cartLoading) {
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
          <p className="muted">Log in to checkout.</p>
          <a className="commandButton" href="/auth/customer">Go to login</a>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="appPage">
        <div className="emptyState">Your cart is empty.</div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Checkout</p><h1>Confirm delivery and payment</h1></div></header>

      <section className="formGrid">
        <form className="toolPanel" onSubmit={submit}>
          <h2>Delivery address</h2>
          <label>Address line
            <input value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} required placeholder="House 12, Green Road" />
          </label>
          <label>City
            <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
          </label>

          <div className="fieldSet">
            <span>Payment (demo)</span>
            <label className="checkLine">
              <input type="radio" name="payment" checked={form.payment_method === "demo_card"} onChange={() => setForm({ ...form, payment_method: "demo_card" })} />
              Demo card (charged instantly)
            </label>
            <label className="checkLine">
              <input type="radio" name="payment" checked={form.payment_method === "cod"} onChange={() => setForm({ ...form, payment_method: "cod" })} />
              Cash on delivery
            </label>
          </div>

          {error ? <p className="errorText">{error}</p> : null}
          <div className="formActions">
            <button className="commandButton" type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Placing order..." : "Place order"}
            </button>
          </div>
        </form>

        <div className="toolPanel">
          <h2>Order summary</h2>
          <div className="resultStack">
            {cart.items.map((item) => (
              <div className="splitLine" key={item.cart_item_id}>
                <span>{item.name} · {item.quantity_kg} kg</span>
                <strong>{item.line_total_bdt} BDT</strong>
              </div>
            ))}
            <div className="splitLine"><span>Delivery fee</span><strong>{DELIVERY_FEE} BDT</strong></div>
            <div className="checkoutLine"><span>Total</span><strong>{cart.subtotal_bdt + DELIVERY_FEE} BDT</strong></div>
          </div>
        </div>
      </section>
    </main>
  );
}
