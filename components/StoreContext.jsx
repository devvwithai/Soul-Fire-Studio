"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = guest
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState("");

  const refreshUser = useCallback(async () => {
    try {
      const r = await fetch("/api/me");
      const d = await r.json();
      setUser(d.user || null);
    } catch { setUser(null); }
  }, []);

  useEffect(() => {
    refreshUser();
    try { setCart(JSON.parse(localStorage.getItem("sf_cart") || "[]")); } catch {}
  }, [refreshUser]);

  useEffect(() => {
    try { localStorage.setItem("sf_cart", JSON.stringify(cart)); } catch {}
  }, [cart]);

  const say = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  const addToCart = (item) => {
    if (!item.productId || !(item.price > 0)) { say("That product is still loading — try again in a second"); return; }
    setCart((c) => {
      const key = (x) => [x.productId, x.option, x.customText, x.designId, x.designName].join("|");
      const ex = c.find((x) => key(x) === key(item));
      if (ex) return c.map((x) => (key(x) === key(item) ? { ...x, qty: Math.min(100, x.qty + item.qty) } : x));
      return [...c, item];
    });
    say("Added to cart 🔥");
  };

  const updateQty = (idx, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((_, i) => i !== idx) : c.map((x, i) => (i === idx ? { ...x, qty } : x))));
  const removeItem = (idx) => setCart((c) => c.filter((_, i) => i !== idx));
  const clearCart = () => setCart([]);

  const toggleWish = async (productId) => {
    if (!user) { say("Login to save to wishlist"); return false; }
    const r = await fetch("/api/me/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const d = await r.json();
    if (d.user) setUser(d.user);
    return true;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    say("Logged out");
  };

  const value = useMemo(() => ({
    user, setUser, refreshUser, cart, addToCart, updateQty, removeItem, clearCart,
    cartCount: cart.reduce((s, x) => s + x.qty, 0),
    toggleWish, logout, say, toast,
  }), [user, cart, toast]);

  return <StoreCtx.Provider value={value}>{children}{toast ? <div className="toast">{toast}</div> : null}</StoreCtx.Provider>;
}
