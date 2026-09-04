"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./useCart.js";

export default function AddToCartButton({ productId, quantityKg = 1, label = "Add to cart" }) {
  const { addItem } = useCart();
  const [status, setStatus] = useState("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      await addItem(productId, quantityKg);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={status === "loading"}>
      <ShoppingCart size={16} />
      {status === "loading" ? "Adding..." : status === "done" ? "Added" : status === "error" ? "Try again" : label}
    </button>
  );
}
