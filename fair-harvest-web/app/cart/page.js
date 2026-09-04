"use client";

import { Trash2 } from "lucide-react";
import { useCart } from "../../components/cart/useCart.js";
import { useSession } from "../../components/auth/useSession.js";

export default function CartPage() {
  const { user, loading: sessionLoading } = useSession();
  const { cart, loading, updateItem, removeItem, clear } = useCart();

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
          <p className="muted">Log in to view your cart.</p>
          <a className="commandButton" href="/auth">Go to login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader">
        <div>
          <p className="eyebrow">Your cart</p>
          <h1>{cart.item_count} item{cart.item_count === 1 ? "" : "s"} ready for checkout</h1>
        </div>
        <a className="commandButton" href="/marketplace">Continue shopping</a>
      </header>

      {cart.items.length === 0 ? (
        <div className="emptyState">Your cart is empty. Browse the marketplace to add fresh produce.</div>
      ) : (
        <section className="toolPanel">
          <div className="dataTable">
            {cart.items.map((item) => (
              <div key={item.cart_item_id}>
                <span>{item.name}</span>
                <span>{item.price_bdt} BDT/kg</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={item.quantity_kg}
                  onChange={(event) => updateItem(item.cart_item_id, Number(event.target.value))}
                />
                <span>{item.line_total_bdt} BDT</span>
                <span className="badge">{item.source}</span>
                <button onClick={() => removeItem(item.cart_item_id)}><Trash2 size={14} /> Remove</button>
              </div>
            ))}
          </div>

          <div className="checkoutLine">
            <span>Subtotal</span>
            <strong>{cart.subtotal_bdt} BDT</strong>
          </div>

          <div className="formActions">
            <a className="commandButton" href="/checkout">Proceed to checkout</a>
            <button className="ghostButton" type="button" onClick={clear}>Clear cart</button>
          </div>
        </section>
      )}
    </main>
  );
}
