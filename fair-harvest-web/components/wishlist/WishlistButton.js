"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addToWishlist, getWishlistStatus, removeFromWishlist } from "../../lib/api.js";
import { useSession } from "../auth/useSession.js";

export default function WishlistButton({ productId }) {
  const { user, loading: sessionLoading } = useSession();
  const [wishlisted, setWishlisted] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (sessionLoading || !user) return;
    getWishlistStatus(productId).then((data) => setWishlisted(Boolean(data.wishlisted))).catch(() => null);
  }, [sessionLoading, user, productId]);

  if (sessionLoading || !user) return null;

  async function toggle() {
    setStatus("loading");
    try {
      if (wishlisted) {
        await removeFromWishlist(productId);
        setWishlisted(false);
      } else {
        await addToWishlist(productId);
        setWishlisted(true);
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={status === "loading"} className={wishlisted ? "wishlistButton active" : "wishlistButton"}>
      <Heart size={16} fill={wishlisted ? "currentColor" : "none"} /> {wishlisted ? "Wishlisted" : "Wishlist"}
    </button>
  );
}
