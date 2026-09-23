import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await cartApi.getCart();
      setCart(res.data || { items: [] });
    } catch {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Note: add/remove endpoints return the cart WITHOUT populated book data,
  // so we re-fetch the populated cart afterwards to keep book details (title, price, images) intact.
  const add = useCallback(async (bookId, quantity = 1) => {
    await cartApi.addToCart(bookId, quantity);
    const res = await cartApi.getCart();
    setCart(res.data);
    return res.data;
  }, []);

  const remove = useCallback(async (bookId) => {
    await cartApi.removeFromCart(bookId);
    const res = await cartApi.getCart();
    setCart(res.data);
    return res.data;
  }, []);

  const clear = useCallback(async () => {
    await cartApi.clearCart();
    setCart({ items: [] });
  }, []);

  const items = cart.items || [];
  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const itemsTotal = items.reduce((sum, i) => sum + (i.book?.price || 0) * (i.quantity || 0), 0);

  const value = { cart, items, itemCount, itemsTotal, loading, refresh, add, remove, clear };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
