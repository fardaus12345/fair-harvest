"use client";

import { useEffect, useState } from "react";
import { getWishlist, removeFromWishlist } from "../../lib/api.js";
import { useSession } from "../../components/auth/useSession.js";

export default function WishlistPage() {
  const { user, loading: sessionLoading } = useSession();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading || !user) {
      setLoading(false);
      return;
    }
    getWishlist().then((data) => setItems(data.items || [])).catch(() => null).finally(() => setLoading(false));
  }, [sessionLoading, user]);

  async function remove(productId) {
    await removeFromWishlist(productId);
    setItems((prev) => prev.filter((item) => item.product.product_id !== productId));
  }

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
          <p className="muted">Log in to see your wishlist.</p>
          <a className="commandButton" href="/auth">Go to login</a>
        </div>
      </main>
    );
  }

  return (
    <main className="appPage">
      <header className="pageHeader"><div><p className="eyebrow">Wishlist</p><h1>Products you&apos;re watching</h1></div></header>
      {items.length === 0 ? (
        <div className="emptyState">Your wishlist is empty. Add products from the marketplace.</div>
      ) : (
        <div className="cardGrid">
          {items.map((item) => (
            <article className="productCard" key={item.wishlist_item_id}>
              <div className="splitLine"><h2><a href={`/marketplace/${item.product.product_id}`}>{item.product.name}</a></h2><span className="badge">{item.product.trust_score}%</span></div>
              <p className="muted">{item.product.farmer_name || "Fair Harvest farmer"}</p>
              <div className="splitLine"><strong>{item.product.price_bdt} BDT/kg</strong><button className="ghostButton" onClick={() => remove(item.product.product_id)}>Remove</button></div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
