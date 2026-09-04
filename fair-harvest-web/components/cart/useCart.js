"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "../auth/useSession.js";
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart as clearCartRequest } from "../../lib/api.js";

const EMPTY_CART = { items: [], subtotal_bdt: 0, item_count: 0 };

export function useCart() {
  const { user, loading: sessionLoading } = useSession();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!user) {
      setCart(EMPTY_CART);
      setLoading(false);
      return Promise.resolve();
    }
    setLoading(true);
    return getCart(user.id)
      .then(setCart)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (sessionLoading) return;
    refresh();
  }, [sessionLoading, refresh]);

  async function addItem(productId, quantityKg = 1, source = "direct") {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    await addCartItem(user.id, { product_id: productId, quantity_kg: quantityKg, source });
    await refresh();
  }

  async function updateItem(itemId, quantityKg) {
    if (!user) return;
    await updateCartItem(user.id, itemId, { quantity_kg: quantityKg });
    await refresh();
  }

  async function removeItem(itemId) {
    if (!user) return;
    await removeCartItem(user.id, itemId);
    await refresh();
  }

  async function clear() {
    if (!user) return;
    await clearCartRequest(user.id);
    await refresh();
  }

  return { cart, loading, addItem, updateItem, removeItem, clear, refresh, isLoggedIn: Boolean(user) };
}
